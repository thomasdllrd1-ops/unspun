/**
 * Loads every file in /data, checks it against the rules in schema.ts, and
 * cross-checks the links between files (every source ID exists, every
 * candidate belongs to a real race, and so on).
 *
 * If anything is wrong, this throws, which stops the build. Bad data can't ship.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';
import { z } from 'zod';
import {
  SourceSchema, PartySchema, RaceSchema, CandidateSchema, RatingSchema, PollSchema, PollResultSchema,
  PastResultSchema, PollsterSchema, PollHistorySchema, PollsterRatingsSchema, GlossarySchema, RedistrictingSchema, HowToVoteSchema, MoneySchema, CorrectionSchema,
  IssuesSchema, PositionsFileSchema,
  type Rating, type Poll, type CandidatePositions,
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
  const pollHistory = parseOne('historical_poll_error.json', PollHistorySchema, readJson('historical_poll_error.json'));
  const pollsterRatings = parseOne('pollster_ratings.json', PollsterRatingsSchema, readJson('pollster_ratings.json'));
  const issues = parseOne('issues.json', IssuesSchema, readJson('issues.json'));
  const posDir = join(DATA, 'positions');
  const positions = existsSync(posDir)
    ? readdirSync(posDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => ({ file: f, ...parseOne(`positions/${f}`, PositionsFileSchema, readJson(`positions/${f}`)) }))
    : [];

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

  for (const r of races) {
    needSource(`race ${r.id}`, r.source);
    needSource(`race ${r.id} redistricting`, r.redistricted_source);
    if (r.redistricted && !r.redistricted_source) errors.push(`race ${r.id}: redistricted note needs redistricted_source`);
  }
  for (const c of candidates) {
    needSource(`candidate ${c.id}`, c.source);
    if (!raceIds.has(c.race)) errors.push(`candidate ${c.id}: unknown race "${c.race}"`);
    if (!partyIds.has(c.party)) errors.push(`candidate ${c.id}: unknown party "${c.party}"`);
    for (const pl of c.party_lines ?? []) if (!partyIds.has(pl)) errors.push(`candidate ${c.id}: unknown party line "${pl}"`);
    if (!(c.id in money.candidates)) errors.push(`candidate ${c.id}: missing from money/fec-totals.json (run npm run fetch:fec)`);
  }
  for (const r of races) {
    if (!candidates.some((c) => c.race === r.id)) errors.push(`race ${r.id}: has no candidates`);
    const inc = candidates.filter((c) => c.race === r.id && c.incumbent);
    if (inc.length > 1) errors.push(`race ${r.id}: more than one incumbent (${inc.map((c) => c.id).join(', ')})`);
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
  needSource('historical_poll_error.json', pollHistory.national_source);
  for (const c of pollHistory.cycles) needSource(`historical_poll_error ${c.cycle}`, c.states_source);
  needSource('pollster_ratings.json', pollsterRatings.source);
  for (const p of pollsters) {
    if (p.fte_id != null && !pollsterRatings.ratings[p.name])
      errors.push(`pollster ${p.name}: has fte_id but no rating in pollster_ratings.json (run npm run build:polls-history)`);
  }

  // Issues and positions: every candidate in a race is researched together, on the same 6 issues.
  const issueIds = issues.issues.map((i) => i.id);
  for (const i of issues.issues) i.why.forEach((w) => needSource(`issue ${i.id}`, w.source));
  for (const l of issues.left_out) needSource(`issues.json left_out ${l.name}`, l.source);
  dupes('positions', positions.map((p) => p.race));
  for (const file of positions) {
    const where = `positions/${file.file}`;
    if (file.file !== `${file.race}.json`) errors.push(`${where}: file name must be ${file.race}.json`);
    if (!raceIds.has(file.race)) { errors.push(`${where}: unknown race "${file.race}"`); continue; }
    const inRace = candidates.filter((c) => c.race === file.race).map((c) => c.id);
    const listed = file.candidates.map((c) => c.candidate);
    dupes(where, listed);
    for (const id of inRace)
      if (!listed.includes(id)) errors.push(`${where}: missing ${id}. Every candidate in a race is researched together.`);
    for (const cp of file.candidates) {
      const w = `${where} ${cp.candidate}`;
      if (!inRace.includes(cp.candidate)) errors.push(`${w}: not a candidate in ${file.race}`);
      cp.looked_at.forEach((id) => needSource(`${w} looked_at`, id));
      cp.priorities.forEach((p, i) => {
        needSource(`${w} priority ${p.rank}`, p.source);
        if (p.rank !== i + 1) errors.push(`${w}: priorities must be ranked 1, 2, 3 in order`);
      });
      if (cp.priorities.length < 3 && !cp.priorities_note) errors.push(`${w}: fewer than 3 priorities, so priorities_note must say why`);
      const got = Object.keys(cp.stances);
      for (const id of issueIds) if (!got.includes(id)) errors.push(`${w}: missing a stance on "${id}" (use no-position if none was found)`);
      for (const id of got) if (!issueIds.includes(id)) errors.push(`${w}: unknown issue "${id}"`);
      for (const [id, st] of Object.entries(cp.stances)) needSource(`${w} ${id}`, st.source);
    }
  }

  if (errors.length) {
    throw new Error(`Data check failed (${errors.length} problem${errors.length > 1 ? 's' : ''}):\n  - ${errors.join('\n  - ')}`);
  }

  return {
    sources, parties, races, candidates, ratings, polls, pollResults, pollsters, pastResults, glossary, corrections,
    redistricting, howToVoteVA, money, pollHistory, pollsterRatings, issues, positions,
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

/** The single Democratic-side and Republican-side candidate in a race (null if none or more than one). */
export function majorPair(raceId: string) {
  const inRace = db.candidates.filter((c) => c.race === raceId);
  const one = (bloc: 'D' | 'R') => {
    const xs = inRace.filter((c) => partyById(c.party).bloc === bloc);
    return xs.length === 1 ? xs[0] : null;
  };
  return { dem: one('D'), rep: one('R') };
}
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

/**
 * Recent polls (last `days` days) in a race that nobody has checked yet. While any exist, we don't
 * publish an average: which polls happen to be checked first would otherwise tilt the number.
 */
export const pendingRecentPolls = (raceId: string, today: Date, days = 60) =>
  SHOW_PENDING
    ? []
    : db.polls.filter((p) => {
        if (p.race !== raceId || p.status !== 'pending') return false;
        const d = p.field_end || p.released;
        return (today.getTime() - Date.parse(d)) / 86_400_000 <= days;
      });

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

// ---- issues and positions ------------------------------------------------------

export const issueList = db.issues.issues;
export const issueById = (id: string) => issueList.find((i) => i.id === id)!;

export type ResearchStatus = 'published' | 'in-progress' | 'not-started';

/**
 * A race's positions go public all at once: only when every candidate in it has been researched
 * and every quote checked. Until then, the public site says "not yet researched" for all of them.
 */
export function raceResearch(raceId: string) {
  const file = db.positions.find((p) => p.race === raceId);
  if (!file) return { status: 'not-started' as ResearchStatus, shown: false, pending: 0, byCandidate: new Map<string, CandidatePositions>() };
  const items = file.candidates.flatMap((c) => [...c.priorities, ...Object.values(c.stances)]);
  const pending = items.filter((x) => x.status !== 'verified').length;
  const status: ResearchStatus = pending === 0 ? 'published' : 'in-progress';
  const byCandidate = new Map<string, CandidatePositions>(file.candidates.map((c) => [c.candidate, c]));
  return { status, shown: status === 'published' || SHOW_PENDING, pending, byCandidate };
}

/** One candidate's research. The data check guarantees every candidate in a researched race has an entry. */
export function positionsOf(research: ReturnType<typeof raceResearch>, candidateId: string): CandidatePositions {
  const cp = research.byCandidate.get(candidateId);
  if (!cp) throw new Error(`No positions for ${candidateId}`);
  return cp;
}
