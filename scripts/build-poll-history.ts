/**
 * Builds the two datasets behind the poll tools:
 *
 *  1. data/historical_poll_error.json: how far polls missed in 2016, 2020, 2022 and 2024,
 *     nationally and (where there are enough polls) state by state. Used by the
 *     "What if the polls are wrong?" slider.
 *  2. data/pollster_ratings.json: FiveThirtyEight's final pollster grades for the
 *     pollsters in data/pollsters.json.
 *
 * Sources
 *  - AAPOR Task Force on 2024 Pre-Election Polling (Oct 2025): official cycle-level
 *    errors (Appendix I.3) and 2024 state-level presidential errors (Appendix I.2).
 *  - FiveThirtyEight pollster-ratings data on GitHub (CC BY 4.0): every poll since
 *    1998 matched to the actual result. We use it for 2016–2022 state-level errors.
 *
 * Method (state level, 2016–2022): every general-election poll in the state that
 * finished within 14 days of Election Day (AAPOR's "final two weeks" window), in
 * races where the top two finishers were a Democrat and a Republican. Signed error =
 * poll margin (D minus R) minus actual margin. Positive = polls overstated Democrats.
 * Each poll counts equally. States with fewer than 5 such polls use the national figure.
 *
 * Run with: npm run build:polls-history
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import Papa from 'papaparse';

const RAW_DIR = 'data/raw';
const BASE = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/pollster-ratings';
const WINDOW_DAYS = 14;
const MIN_STATE_POLLS = 5;

mkdirSync(RAW_DIR, { recursive: true });
for (const f of ['raw_polls.csv', 'pollster-ratings-combined.csv']) {
  if (!existsSync(`${RAW_DIR}/${f}`)) {
    console.log(`Downloading ${f}`);
    execFileSync('curl', ['-sSL', '--fail', '-o', `${RAW_DIR}/${f}`, `${BASE}/${f}`], { stdio: 'inherit' });
  }
}
const readCsv = (f: string) => Papa.parse<Record<string, string>>(readFileSync(f, 'utf8'), { header: true, skipEmptyLines: true }).data;

// ---- 1. Historical polling error -------------------------------------------
const raw = readCsv(`${RAW_DIR}/raw_polls.csv`);
const round1 = (x: number) => Math.round(x * 10) / 10;

function stateErrors(cycle: string, type: string) {
  const byState = new Map<string, number[]>();
  const all: number[] = [];
  for (const r of raw) {
    if (r.cycle !== cycle || r.type_simple !== type || r.location === 'US') continue;
    if (r.cand1_party !== 'DEM' || r.cand2_party !== 'REP') continue;
    if (Number(r.time_to_election) > WINDOW_DAYS) continue;
    const err = Number(r.margin_poll) - Number(r.margin_actual);
    if (!Number.isFinite(err)) continue;
    all.push(err);
    const st = r.location.slice(0, 2); // House districts look like "VA-02"; group them by state
    if (!byState.has(st)) byState.set(st, []);
    byState.get(st)!.push(err);
  }
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const states: Record<string, { signed: number; polls: number }> = {};
  for (const [st, errs] of [...byState].sort()) {
    if (errs.length >= MIN_STATE_POLLS) states[st] = { signed: round1(mean(errs)), polls: errs.length };
  }
  return { states, check: { polls: all.length, signed: round1(mean(all)), abs: round1(mean(all.map(Math.abs))) } };
}

const e2016 = stateErrors('2016', 'Pres-G');
const e2020 = stateErrors('2020', 'Pres-G');
const e2022 = stateErrors('2022', 'Sen-G');

// AAPOR report, Appendix I.2 (p. 71): 2024 state presidential polls, final two weeks.
const aapor2024States: Record<string, { signed: number; polls: number }> = {
  AZ: { signed: 3.3, polls: 28 }, FL: { signed: 6.4, polls: 10 }, GA: { signed: 0.6, polls: 23 },
  MI: { signed: 2.4, polls: 34 }, NV: { signed: 2.5, polls: 19 }, NC: { signed: 1.8, polls: 22 },
  OH: { signed: 3.6, polls: 11 }, PA: { signed: 1.6, polls: 35 }, WI: { signed: 1.6, polls: 29 },
};

// AAPOR report, Appendix I.3 (p. 71): cycle-level errors, final two weeks.
const cycles = [
  { cycle: 2016, contest: 'President, state polls', national: { signed: 3.3, abs: 5.7, polls: 501 }, ...e2016, states_source: 'fivethirtyeight-pollster-data' },
  { cycle: 2020, contest: 'President, state polls', national: { signed: 4.0, abs: 4.8, polls: 375 }, ...e2020, states_source: 'fivethirtyeight-pollster-data' },
  { cycle: 2022, contest: 'U.S. Senate polls', national: { signed: -1.2, abs: 4.8, polls: 150 }, ...e2022, states_source: 'fivethirtyeight-pollster-data' },
  { cycle: 2024, contest: 'President, state polls', national: { signed: 2.6, abs: 3.0, polls: 291 }, states: aapor2024States, check: null, states_source: 'aapor-2024-report' },
];
const typicalMiss = round1(cycles.reduce((t, c) => t + c.national.abs, 0) / cycles.length);

writeFileSync(
  'data/historical_poll_error.json',
  JSON.stringify(
    {
      built_at: new Date().toISOString().slice(0, 10),
      national_source: 'aapor-2024-report',
      window_days: WINDOW_DAYS,
      min_state_polls: MIN_STATE_POLLS,
      sign_convention: 'Signed error = poll margin (D minus R) minus actual margin. Positive means polls overstated Democrats; negative means polls overstated Republicans.',
      typical_miss: typicalMiss,
      typical_miss_note: `Average of AAPOR's absolute errors for the four cycles below (${cycles.map((c) => c.national.abs).join(', ')}).`,
      cycles,
    },
    null,
    1,
  ) + '\n',
);
console.log(`Wrote data/historical_poll_error.json (typical miss ${typicalMiss} pts)`);
for (const c of cycles) {
  const n = Object.keys(c.states).length;
  console.log(`  ${c.cycle}: AAPOR signed ${c.national.signed > 0 ? '+' : ''}${c.national.signed}` +
    (c.check ? ` | our 538 check ${c.check.signed > 0 ? '+' : ''}${c.check.signed} (${c.check.polls} polls)` : '') + ` | ${n} states with own figure`);
}

// ---- 2. Pollster ratings ------------------------------------------------------
type Pollster = { name: string; fte_id?: number | null };
const pollsters: Pollster[] = JSON.parse(readFileSync('data/pollsters.json', 'utf8'));
const ratings = readCsv(`${RAW_DIR}/pollster-ratings-combined.csv`);
const out: Record<string, unknown> = {};
for (const p of pollsters) {
  if (p.fte_id == null) continue;
  const r = ratings.find((x) => Number(x.pollster_rating_id) === p.fte_id);
  if (!r) throw new Error(`No FiveThirtyEight rating with id ${p.fte_id} (for ${p.name})`);
  out[p.name] = {
    fte_id: p.fte_id,
    fte_name: r.pollster,
    grade: r.numeric_grade === 'NA' ? null : Number(r.numeric_grade),
    polls_analyzed: Number(r.number_polls_pollster_total),
    percent_partisan_work: Number(r.percent_partisan_work),
    inactive: r.inactive === 'TRUE',
  };
}
writeFileSync('data/pollster_ratings.json', JSON.stringify({ source: 'fivethirtyeight-pollster-data', scale: '0 to 3 (3 is best)', ratings: out }, null, 1) + '\n');
console.log(`Wrote data/pollster_ratings.json (${Object.keys(out).length} pollsters rated)`);
