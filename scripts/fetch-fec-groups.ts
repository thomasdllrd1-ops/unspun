/**
 * Who funds each candidate, from the Federal Election Commission (OpenFEC API).
 *
 *  - Direct PAC money: every committee that gave to the candidate's main campaign committee,
 *    totaled per giving committee (FEC "Schedule B by recipient": the giver's own reports).
 *    Senate: the full 6-year cycle (2021–2026); House: 2025–2026.
 *  - Outside spending: independent expenditures for or against the candidate, totaled per
 *    spender (FEC "Schedule E by candidate"), 2025–2026. Processed filings only: the newest
 *    24/48-hour notices can take days to appear.
 *  - Each giving/spending committee's type (corporate PAC, union PAC, super PAC, party,
 *    joint fundraising, leadership PAC…) and connected organization, from the FEC.
 *
 * Writes: data/money/groups.json. Interest-group tags live separately in data/interest_groups.json.
 * Run with: npm run fetch:fec-groups   (resumable: finished candidates are cached in .research/fec/cache)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

try { process.loadEnvFile('.env'); } catch { /* falls back to DEMO_KEY */ }
const API = 'https://api.open.fec.gov/v1';
const KEY = process.env.FEC_API_KEY || 'DEMO_KEY';
const CACHE = '.research/fec/cache';
mkdirSync(CACHE, { recursive: true });

type Row = Record<string, unknown>;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function get(path: string, params: Record<string, string | string[]>): Promise<{ results: Row[]; pagination: { pages: number } }> {
  const u = new URL(API + path);
  for (const [k, v] of Object.entries(params)) for (const x of [v].flat()) u.searchParams.append(k, x);
  u.searchParams.set('api_key', KEY);
  for (let attempt = 0; ; attempt++) {
    await wait(350); // stay well under 1,000 requests/hour bursts
    const res = await fetch(u);
    if (res.ok) return res.json() as never;
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { await wait(2000 * 2 ** attempt); continue; }
    throw new Error(`FEC ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  }
}
async function all(path: string, params: Record<string, string | string[]>) {
  const out: Row[] = [];
  for (let page = 1; ; page++) {
    const body = await get(path, { ...params, per_page: '100', page: String(page) });
    out.push(...body.results);
    if (page >= body.pagination.pages) return out;
  }
}
const num = (v: unknown) => Math.round(Number(v) * 100) / 100;

type Candidate = { id: string; race: string; fec_id: string | null };
const candidates: Candidate[] = JSON.parse(readFileSync('data/candidates.json', 'utf8'));
const totals = JSON.parse(readFileSync('data/money/fec-totals.json', 'utf8')).candidates as Record<string, { status: string }>;
const races = new Map((JSON.parse(readFileSync('data/races.json', 'utf8')) as { id: string; chamber: string }[]).map((r) => [r.id, r]));

const perCandidate: Record<string, unknown> = {};
for (const c of candidates) {
  if (!c.fec_id || totals[c.id]?.status !== 'ok') continue;
  const cacheFile = `${CACHE}/${c.id}.json`;
  if (existsSync(cacheFile)) { perCandidate[c.id] = JSON.parse(readFileSync(cacheFile, 'utf8')); continue; }

  const senate = races.get(c.race)?.chamber === 'senate';
  const cycles = senate ? ['2022', '2024', '2026'] : ['2026'];
  const principal = (await get(`/candidate/${c.fec_id}/committees/`, { designation: 'P', cycle: '2026' })).results[0]?.committee_id as string | undefined;

  const given = new Map<string, number>();
  if (principal) {
    for (const cycle of cycles) {
      for (const r of await all('/schedules/schedule_b/by_recipient_id/', { recipient_id: principal, cycle })) {
        const id = r.committee_id as string;
        if (id && id !== principal) given.set(id, (given.get(id) ?? 0) + num(r.total));
      }
    }
  }
  const outside = new Map<string, { support: number; oppose: number }>();
  for (const r of await all('/schedules/schedule_e/by_candidate/', { candidate_id: c.fec_id, cycle: '2026' })) {
    const id = r.committee_id as string;
    const e = outside.get(id) ?? { support: 0, oppose: 0 };
    if (r.support_oppose_indicator === 'S') e.support += num(r.total); else if (r.support_oppose_indicator === 'O') e.oppose += num(r.total);
    outside.set(id, e);
  }
  const entry = {
    fec_id: c.fec_id,
    principal_committee: principal ?? null,
    cycles,
    given: [...given].map(([id, total]) => ({ id, total: Math.round(total * 100) / 100 })).filter((g) => g.total > 0).sort((a, b) => b.total - a.total),
    outside: [...outside].map(([id, e]) => ({ id, support: Math.round(e.support * 100) / 100, oppose: Math.round(e.oppose * 100) / 100 })).sort((a, b) => b.support + b.oppose - (a.support + a.oppose)),
  };
  writeFileSync(cacheFile, JSON.stringify(entry));
  perCandidate[c.id] = entry;
  console.log(`${c.id}: ${entry.given.length} givers, ${entry.outside.length} outside spenders`);
}

// ---- describe every committee that appears (type, designation, connected organization) ----
const ids = [...new Set(Object.values(perCandidate).flatMap((e) => {
  const x = e as { given: { id: string }[]; outside: { id: string }[] };
  return [...x.given.map((g) => g.id), ...x.outside.map((o) => o.id)];
}))].sort();
const committeeCache = `${CACHE}/_committees.json`;
const committees: Record<string, unknown> = existsSync(committeeCache) ? JSON.parse(readFileSync(committeeCache, 'utf8')) : {};
const missing = ids.filter((id) => !committees[id]);
for (let i = 0; i < missing.length; i += 50) {
  for (const r of await all('/committees/', { committee_id: missing.slice(i, i + 50) })) {
    committees[r.committee_id as string] = {
      name: r.name, type: r.committee_type, type_full: r.committee_type_full,
      designation: r.designation, designation_full: r.designation_full,
      org_type: r.organization_type ?? null, org_type_full: r.organization_type_full ?? null,
      connected_org: r.affiliated_committee_name && r.affiliated_committee_name !== 'NONE' ? r.affiliated_committee_name : null,
      party: r.party ?? null,
    };
  }
  writeFileSync(committeeCache, JSON.stringify(committees));
  console.log(`committees: ${Object.keys(committees).length}/${ids.length}`);
}

writeFileSync('data/money/groups.json', JSON.stringify({
  fetched_at: new Date().toISOString(),
  method: 'FEC Schedule B by recipient (giving committees, Senate 2021–2026 / House 2025–2026) and Schedule E by candidate (independent expenditures, 2025–2026). Processed filings only.',
  source_urls: {
    given: 'https://api.open.fec.gov/v1/schedules/schedule_b/by_recipient_id/?recipient_id=<campaign committee>&cycle=<cycle>',
    outside: 'https://api.open.fec.gov/v1/schedules/schedule_e/by_candidate/?candidate_id=<FEC candidate id>&cycle=2026',
  },
  candidates: perCandidate,
  committees: Object.fromEntries(ids.map((id) => [id, committees[id] ?? null])),
}, null, 1) + '\n');
console.log(`Wrote data/money/groups.json: ${Object.keys(perCandidate).length} candidates, ${ids.length} committees`);
