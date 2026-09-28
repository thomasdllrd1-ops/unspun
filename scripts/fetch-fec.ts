/**
 * Pulls campaign finance totals from the Federal Election Commission (OpenFEC API)
 * for every candidate in data/candidates.json that has an FEC ID.
 *
 * Writes: data/money/fec-totals.json
 * Run with: npm run fetch:fec
 *
 * API key: put FEC_API_KEY=your_key in a .env file (free at https://api.data.gov/signup/).
 * Without a key it uses DEMO_KEY, which only allows a few requests per hour.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

try {
  process.loadEnvFile('.env');
} catch {
  // no .env file yet — fine, we fall back to DEMO_KEY
}

const API = 'https://api.open.fec.gov/v1';
const KEY = process.env.FEC_API_KEY || 'DEMO_KEY';
const CYCLE = 2026;

type Candidate = { id: string; race: string; ballot_name: string; fec_id: string | null; fec_checked?: boolean };
const candidates: Candidate[] = JSON.parse(readFileSync('data/candidates.json', 'utf8'));

const withIds = [...new Set(candidates.flatMap((c) => (c.fec_id ? [c.fec_id] : [])))];
const publicUrl = `${API}/candidates/totals/?election_year=${CYCLE}&election_full=true&candidate_id=…`; // saved without the key
const all: Record<string, unknown>[] = [];
// Ask for 50 candidates at a time (keeps URLs short), following every page.
for (let i = 0; i < withIds.length; i += 50) {
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ election_year: String(CYCLE), election_full: 'true', per_page: '100', page: String(page), api_key: KEY });
    for (const id of withIds.slice(i, i + 50)) params.append('candidate_id', id);
    const res = await fetch(`${API}/candidates/totals/?${params}`);
    if (!res.ok) throw new Error(`FEC API error ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as { results: Record<string, unknown>[]; pagination: { pages: number } };
    all.push(...body.results);
    if (page >= body.pagination.pages) break;
  }
}
const byFecId = new Map(all.map((r) => [r.candidate_id as string, r]));
// The FEC sends some amounts as numbers and some as text (e.g. "16114725.24").
const num = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

const out: Record<string, unknown> = {};
for (const c of candidates) {
  if (!c.fec_id) {
    out[c.id] = {
      fec_id: null,
      status: 'not-registered',
      note: 'We found no FEC registration for this candidate (searched by name). Candidates only have to register once they raise or spend more than $5,000.',
    };
    continue;
  }
  const r = byFecId.get(c.fec_id);
  if (!r) {
    out[c.id] = { fec_id: c.fec_id, status: 'no-totals', note: 'The FEC has no 2026 totals for this candidate yet.' };
    continue;
  }
  if (!r.coverage_end_date) {
    // Registered, but no financial report on file yet. Showing "$0" would mislead.
    out[c.id] = {
      fec_id: c.fec_id,
      fec_name: r.name,
      status: 'no-reports',
      note: 'Registered with the FEC, but no financial reports on file yet.',
      fec_url: `https://www.fec.gov/data/candidate/${c.fec_id}/?cycle=${CYCLE}&election_full=true`,
    };
    continue;
  }
  out[c.id] = {
    fec_id: c.fec_id,
    fec_name: r.name,
    status: 'ok',
    receipts: num(r.receipts),
    disbursements: num(r.disbursements),
    cash_on_hand: num(r.cash_on_hand_end_period),
    individual_itemized: num(r.individual_itemized_contributions),
    from_other_committees: num(r.other_political_committee_contributions),
    coverage_start: r.coverage_start_date ?? null,
    coverage_end: r.coverage_end_date ?? null,
    fec_url: `https://www.fec.gov/data/candidate/${c.fec_id}/?cycle=${CYCLE}&election_full=true`,
  };
}

mkdirSync('data/money', { recursive: true });
writeFileSync(
  'data/money/fec-totals.json',
  JSON.stringify(
    { fetched_at: new Date().toISOString(), cycle: CYCLE, api_url: publicUrl, candidates: out },
    null,
    2,
  ) + '\n',
);

const ok = Object.values(out).filter((v: any) => v.status === 'ok').length;
console.log(`Saved FEC totals for ${ok} of ${candidates.length} candidates → data/money/fec-totals.json`);
if (KEY === 'DEMO_KEY') console.log('Tip: add FEC_API_KEY to .env for a higher rate limit.');
