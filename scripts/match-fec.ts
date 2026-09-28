/**
 * Suggests FEC candidate IDs for candidates that don't have one yet.
 * A match is only applied when exactly ONE 2026 FEC candidate in the same
 * state/office(/district) has the same last name. Everything else is listed for a human.
 *
 * Run: npm run match:fec            (dry run: prints suggestions)
 *      npm run match:fec -- --apply (writes the unique matches into data/candidates.json)
 */
import { readFileSync, writeFileSync } from 'node:fs';

try { process.loadEnvFile('.env'); } catch { /* optional */ }
const KEY = process.env.FEC_API_KEY || 'DEMO_KEY';
const APPLY = process.argv.includes('--apply');

type Candidate = { id: string; race: string; ballot_name: string; sort_name: string; party: string; fec_id: string | null; fec_checked?: boolean };
type Race = { id: string; state: string; chamber: 'senate' | 'house'; district: number | null };
const candidates: Candidate[] = JSON.parse(readFileSync('data/candidates.json', 'utf8'));
const races: Race[] = JSON.parse(readFileSync('data/races.json', 'utf8'));
const raceById = new Map(races.map((r) => [r.id, r]));

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fecCandidates(race: Race) {
  const q = new URLSearchParams({ election_year: '2026', office: race.chamber === 'senate' ? 'S' : 'H', state: race.state, per_page: '100', api_key: KEY });
  if (race.district) q.set('district', String(race.district).padStart(2, '0'));
  const r = await fetch(`https://api.open.fec.gov/v1/candidates/?${q}`);
  if (r.status === 429) { await sleep(60_000); return fecCandidates(race); }
  if (!r.ok) throw new Error(`FEC ${r.status}`);
  return ((await r.json()) as { results: { candidate_id: string; name: string; party: string }[] }).results;
}

const todo = candidates.filter((c) => !c.fec_id && !c.fec_checked);
const byRace = Object.groupBy(todo, (c) => c.race);
const report: string[] = [];
let applied = 0;
for (const [raceId, cands] of Object.entries(byRace)) {
  const race = raceById.get(raceId)!;
  const fec = await fecCandidates(race);
  for (const c of cands!) {
    // Compare the FEC last name with our full sort name ("Van Orden", "Trone Garriott") and with its last word.
    const full = norm(c.sort_name);
    const lastWord = norm(c.sort_name.split(' ').at(-1)!);
    const hits = fec.filter((f) => {
      const fl = norm(f.name.split(',')[0]);
      return fl === full || fl === lastWord || fl.endsWith(full);
    });
    if (hits.length === 1) {
      report.push(`MATCH  ${raceId} ${c.ballot_name} → ${hits[0].candidate_id} ${hits[0].name} (${hits[0].party})`);
      if (APPLY) { c.fec_id = hits[0].candidate_id; applied++; }
    } else if (hits.length > 1) {
      report.push(`CHECK  ${raceId} ${c.ballot_name}: ${hits.length} FEC records → ${hits.map((h) => `${h.candidate_id} ${h.name}`).join('; ')}`);
    } else {
      report.push(`NONE   ${raceId} ${c.ballot_name}: no 2026 FEC record with that last name`);
      if (APPLY) c.fec_checked = true; // remember we looked, so fetch-fec can say "not registered"
    }
  }
  await sleep(250);
}
console.log(report.join('\n'));
if (APPLY) {
  writeFileSync('data/candidates.json', JSON.stringify(candidates, null, 2) + '\n');
  console.log(`\nApplied ${applied} unique matches.`);
}
