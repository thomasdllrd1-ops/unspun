/**
 * Loads every file in /data, checks it against the rules in schema.ts, and
 * cross-checks the links between files (every source ID exists, every
 * candidate belongs to a real race, and so on).
 *
 * If anything is wrong, this throws, which stops the build. Bad data can't ship.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';
import { z } from 'zod';
import {
  SourceSchema, PartySchema, RaceSchema, CandidateSchema, RatingSchema, PollSchema, PollResultSchema,
  PastResultSchema, PollsterSchema, GlossarySchema, RedistrictingSchema, HowToVoteSchema, MoneySchema, CorrectionSchema,
  type Rating, type Poll,
} from './schema';

const DATA = join(process.cwd(), 'data');

/** Pending (not yet human-checked) items appear only on your own computer, never on the public site. */
export const SHOW_PENDING =
  process.env.SHOW_PENDING === '1' || (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(DATA, file), 'utf8'));
}
function readCsv(file: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, string>>(readFileSync(join(DATA, file), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) throw new Error(`${file}: ${parsed.errors.map((e) => `row ${e.row}: ${e.message}`).join('; ')}`);
  return parsed.data;
}
function parseList<T extends z.ZodType>(file: string, schema: T, rows: unknown[]): z.infer<T>[] {
  return rows.map((row, i) => {
    const r = schema.safeParse(row);
    if (!r.success) {
      const issues = r.error.issues.map((x) => `${x.path.join('.') || '(row)'}: ${x.message}`).join('; ');
      throw new Error(`${file}, row ${i + 1}: ${issues}`);
    }
    return r.data;
  });
}
function parseOne<T extends z.ZodType>(file: string, schema: T, value: unknown): z.infer<T> {
  const r = schema.safeParse(value);
  if (!r.success) throw new Error(`${file}: ${r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`);
  return r.data;
}

function load() {
  const sources = parseList('sources.json', SourceSchema, readJson('sources.json') as unknown[]);
  const parties = parseList('parties.json', PartySchema, readJson('parties.json') as unknown[]);
  const races = parseList('races.json', RaceSchema, readJson('races.json') as unknown[]);
  const candidates = parseList('candidates.json', CandidateSchema, readJson('candidates.json') as unknown[]);
  const ratings = parseList('ratings.csv', RatingSchema, readCsv('ratings.csv'));
  const polls = parseList('polls/polls.csv', PollSchema, readCsv('polls/polls.csv'));
  const pollResults = parseList('polls/poll_results.csv', PollResultSchema, readCsv('polls/poll_results.csv'));
  const pollsters = parseList('pollsters.json', PollsterSchema, readJson('pollsters.json') as unknown[]);
  const pastResults = parseList('past_results.csv', PastResultSchema, readCsv('past_results.csv'));
  const glossary = parseList('glossary.json', GlossarySchema, readJson('glossary.json') as unknown[]);
  const corrections = parseList('corrections.json', CorrectionSchema, readJson('corrections.json') as unknown[]);
  const redistricting = parseOne('virginia/redistricting.json', RedistrictingSchema, readJson('virginia/redistricting.json'));
  const howToVoteVA = parseOne('how_to_vote/virginia.json', HowToVoteSchema, readJson('how_to_vote/virginia.json'));
  const money = parseOne('money/fec-totals.json', MoneySchema, readJson('money/fec-totals.json'));

  // ---- cross-checks -------------------------------------------------------
  const errors: string[] = [];
  const sourceIds = new Set(sources.map((s) => s.id));
  const raceIds = new Set(races.map((r) => r.id));
  const partyIds = new Set(parties.map((p) => p.id));
  const candidateById = new Map(candidates.map((c) => [c.id, c]));
  const pollById = new Map(polls.map((p) => [p.id, p]));

  const needSource = (where: string, id: string | null | undefined) => {
    if (id && !sourceIds.has(id)) errors.push(`${where}: unknown source "${id}" (add it to data/sources.json)`);
  };
  const dupes = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label}: duplicate id "${id}"`);
      seen.add(id);
    }
  };
  dupes('sources.json', sources.map((s) => s.id));
  dupes('races.json', races.map((r) => r.id));
  dupes('candidates.json', candidates.map((c) => c.id));
  dupes('polls.csv', polls.map((p) => p.id));
  dupes('ratings.csv', ratings.map((r) => `${r.race}/${r.forecaster}`));

  for (const r of races) needSource(`race ${r.id}`, r.source);
  for (const c of candidates) {
    needSource(`candidate ${c.id}`, c.source);
    if (!raceIds.has(c.race)) errors.push(`candidate ${c.id}: unknown race "${c.race}"`);
    if (!partyIds.has(c.party)) errors.push(`candidate ${c.id}: unknown party "${c.party}"`);
    if (!(c.id in money.candidates)) errors.push(`candidate ${c.id}: missing from money/fec-totals.json (run npm run fetch:fec)`);
  }
  for (const r of races) {
    if (!candidates.some((c) => c.race === r.id)) errors.push(`race ${r.id}: has no candidates`);
  }
  for (const r of ratings) {
    needSource(`rating ${r.race}/${r.forecaster}`, r.source);
    if (!raceIds.has(r.race)) errors.push(`rating: unknown race "${r.race}"`);
    if (r.status === 'verified' && (!r.verified_by || !r.verified_on))
      errors.push(`rating ${r.race}/${r.forecaster}: verified ratings need verified_by and verified_on`);
  }
  for (const p of polls) {
    needSource(`poll ${p.id}`, p.source);
    if (!raceIds.has(p.race)) errors.push(`poll ${p.id}: unknown race "${p.race}"`);
    if (p.field_start && p.field_end && p.field_start > p.field_end) errors.push(`poll ${p.id}: field_start after field_end`);
    if (!pollResults.some((r) => r.poll === p.id)) errors.push(`poll ${p.id}: has no results in poll_results.csv`);
    if (!pollsters.some((x) => x.name === p.pollster)) errors.push(`poll ${p.id}: pollster "${p.pollster}" is missing from pollsters.json`);
  }
  for (const r of pollResults) {
    const poll = pollById.get(r.poll);
    if (!poll) {
      errors.push(`poll_results: unknown poll "${r.poll}"`);
      continue;
    }
    if (r.candidate) {
      const c = candidateById.get(r.candidate);
      if (!c) errors.push(`poll_results ${r.poll}: unknown candidate "${r.candidate}"`);
      else if (c.race !== poll.race) errors.push(`poll_results ${r.poll}: ${r.candidate} is not in race ${poll.race}`);
    }
  }
  for (const r of pastResults) {
    needSource(`past result ${r.race} ${r.year}`, r.source);
    if (!raceIds.has(r.race)) errors.push(`past result: unknown race "${r.race}"`);
  }
  for (const s of redistricting.steps) s.sources.forEach((id) => needSource(`redistricting ${s.date}`, id));
  for (const d of howToVoteVA.deadlines) needSource(`how-to-vote ${d.label}`, d.source);
  for (const s of howToVoteVA.students) needSource(`how-to-vote "${s.q}"`, s.source);
  for (const l of howToVoteVA.links) needSource(`how-to-vote link ${l.label}`, l.source);
  needSource('how-to-vote on_ballot', howToVoteVA.on_ballot_source);
  for (const c of corrections) needSource(`correction ${c.date}`, c.source);

  if (errors.length) {
    throw new Error(`Data check failed (${errors.length} problem${errors.length > 1 ? 's' : ''}):\n  - ${errors.join('\n  - ')}`);
  }

  return {
    sources, parties, races, candidates, ratings, polls, pollResults, pollsters, pastResults, glossary, corrections,
    redistricting, howToVoteVA, money,
  };
}

export const db = load();

// ---- helpers the pages use ---------------------------------------------------

export const sourceById = (id: string) => {
  const s = db.sources.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown source ${id}`);
  return s;
};
export const partyById = (id: string) => db.parties.find((p) => p.id === id)!;
export const raceById = (id: string) => db.races.find((r) => r.id === id)!;

/** Candidates in a race, always alphabetical by last name (never by party or poll standing). */
export const candidatesInRace = (raceId: string) =>
  db.candidates
    .filter((c) => c.race === raceId)
    .sort((a, b) => a.sort_name.localeCompare(b.sort_name) || a.ballot_name.localeCompare(b.ballot_name));

const visible = <T extends { status: 'pending' | 'verified' }>(x: T) => x.status === 'verified' || SHOW_PENDING;

export const ratingsForRace = (raceId: string): Rating[] =>
  db.ratings.filter((r) => r.race === raceId && visible(r));

export const pollsForRace = (raceId: string): Poll[] =>
  db.polls
    .filter((p) => p.race === raceId && visible(p))
    .sort((a, b) => (b.field_end || b.released).localeCompare(a.field_end || a.released));

export const resultsForPoll = (pollId: string) => db.pollResults.filter((r) => r.poll === pollId);
export const pastResultsForRace = (raceId: string) => db.pastResults.filter((r) => r.race === raceId);
export const moneyFor = (candidateId: string) => db.money.candidates[candidateId];

/** The newest "accessed" date among a set of sources — our "last checked" timestamp. */
export const lastChecked = (sourceIds: (string | null | undefined)[]) =>
  sourceIds
    .filter((x): x is string => !!x)
    .map((id) => sourceById(id).accessed)
    .sort()
    .at(-1) ?? null;
