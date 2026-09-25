/**
 * Mark items as checked by a person, after you've compared them with the original source.
 *
 *   npm run verify -- ratings cook             all pending Cook ratings
 *   npm run verify -- ratings sabato va-02     one race
 *   npm run verify -- poll tulchin-2026-07-va-02
 *
 * Only do this after the checklist page (npm run dev → /review/checklist/) shows the
 * values match the source. If something differs, fix the CSV first.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import Papa from 'papaparse';

const [kind, a, b] = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);
let who = 'Thomas';
try { who = execSync('git config user.name', { encoding: 'utf8' }).trim().split(' ')[0] || who; } catch { /* default */ }

function edit(file: string, match: (r: Record<string, string>) => boolean, apply: (r: Record<string, string>) => void) {
  const parsed = Papa.parse<Record<string, string>>(readFileSync(file, 'utf8'), { header: true, skipEmptyLines: true });
  let n = 0;
  for (const r of parsed.data) if (match(r)) { apply(r); n++; }
  writeFileSync(file, Papa.unparse(parsed.data, { columns: parsed.meta.fields }) + '\n');
  return n;
}

if (kind === 'ratings' && a) {
  const n = edit('data/ratings.csv', (r) => r.forecaster === a && r.status === 'pending' && (!b || r.race === b),
    (r) => { r.status = 'verified'; r.verified_by = who; r.verified_on = today; });
  console.log(`Marked ${n} ${a} rating(s) verified by ${who}.`);
} else if (kind === 'poll' && a) {
  const n = edit('data/polls/polls.csv', (r) => r.id === a,
    (r) => { r.status = 'verified'; r.checked_by = who; r.checked_on = today; });
  console.log(n ? `Marked poll ${a} verified by ${who}.` : `No poll with id ${a}.`);
} else {
  console.log('Usage: npm run verify -- ratings <cook|inside|sabato> [race-id]   |   npm run verify -- poll <poll-id>');
  process.exit(1);
}
console.log('Now run: npm run validate');
