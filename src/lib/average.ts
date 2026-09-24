/**
 * Our polling average, the build-your-own toggles, and the "what if the polls
 * are wrong?" adjustment. Pure functions, used both when the site is built and
 * in the browser, so the numbers you see can never disagree.
 *
 * The formula (also printed on the Show Our Work page):
 *   1. Take polls whose last field day is within the window (60 days by default).
 *   2. Keep only the most recent poll from each pollster, so one busy pollster can't drown out the rest.
 *   3. Weight each poll by recency × sample size:
 *        weight = 0.5 ^ (age in days ÷ 14) × √(sample size)
 *      A poll loses half its weight every 14 days. A poll with no published
 *      sample size counts as the median sample size of the other polls (or 600).
 *   4. Each candidate's average = weighted mean of their share in the polls that include them.
 * Tests: tests/average.test.ts
 */

export const HALF_LIFE_DAYS = 14;
export const DEFAULT_WINDOW_DAYS = 60;
export const SHORT_WINDOW_DAYS = 14;
export const FALLBACK_SAMPLE = 600;
export const PARTISAN_SPONSORS = ['campaign', 'party', 'partisan-aligned'] as const;

export type AvgPoll = {
  id: string;
  pollster: string;
  sponsorType: string;
  sponsorLean: string; // D | R | none | unknown
  population: string; // LV | RV | A | unknown
  sampleSize: number | null;
  date: string; // YYYY-MM-DD, last field day (or release date)
  shares: Record<string, number>; // candidate id → percent
};

export type AvgOptions = {
  today: string; // YYYY-MM-DD
  windowDays?: number;
  noPartisan?: boolean;
  lvOnly?: boolean;
};

export type AvgResult = {
  shares: Record<string, number>;
  used: { id: string; pollster: string; date: string; weight: number; share: number }[];
  skipped: { id: string; pollster: string; reason: string }[];
};

const DAY = 86_400_000;
export const ageInDays = (date: string, today: string) => Math.round((Date.parse(today) - Date.parse(date)) / DAY);

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function pollingAverage(polls: AvgPoll[], opts: AvgOptions): AvgResult | null {
  const windowDays = opts.windowDays ?? DEFAULT_WINDOW_DAYS;
  const skipped: AvgResult['skipped'] = [];

  const eligible = polls.filter((p) => {
    const age = ageInDays(p.date, opts.today);
    if (age < 0 || age > windowDays) return skipped.push({ id: p.id, pollster: p.pollster, reason: `older than ${windowDays} days` }), false;
    if (opts.noPartisan && (PARTISAN_SPONSORS as readonly string[]).includes(p.sponsorType))
      return skipped.push({ id: p.id, pollster: p.pollster, reason: 'partisan sponsor' }), false;
    if (opts.lvOnly && p.population !== 'LV') return skipped.push({ id: p.id, pollster: p.pollster, reason: 'not likely voters' }), false;
    return true;
  });

  // Most recent poll per pollster (ties: bigger sample, then id, so the result is always the same).
  const latest = new Map<string, AvgPoll>();
  for (const p of eligible) {
    const cur = latest.get(p.pollster);
    const newer =
      !cur ||
      p.date > cur.date ||
      (p.date === cur.date && (p.sampleSize ?? 0) > (cur.sampleSize ?? 0)) ||
      (p.date === cur.date && (p.sampleSize ?? 0) === (cur.sampleSize ?? 0) && p.id > cur.id);
    if (newer) {
      if (cur) skipped.push({ id: cur.id, pollster: cur.pollster, reason: 'newer poll from same pollster' });
      latest.set(p.pollster, p);
    } else skipped.push({ id: p.id, pollster: p.pollster, reason: 'newer poll from same pollster' });
  }
  const chosen = [...latest.values()];
  if (!chosen.length) return null;

  const fallbackN = median(chosen.flatMap((p) => (p.sampleSize ? [p.sampleSize] : []))) ?? FALLBACK_SAMPLE;
  const raw = chosen.map((p) => ({
    p,
    w: 0.5 ** (ageInDays(p.date, opts.today) / HALF_LIFE_DAYS) * Math.sqrt(p.sampleSize ?? fallbackN),
  }));
  const total = raw.reduce((t, r) => t + r.w, 0);

  const candidates = [...new Set(chosen.flatMap((p) => Object.keys(p.shares)))];
  const shares: Record<string, number> = {};
  for (const c of candidates) {
    const withC = raw.filter((r) => c in r.p.shares);
    const wsum = withC.reduce((t, r) => t + r.w, 0);
    shares[c] = withC.reduce((t, r) => t + r.w * r.p.shares[c], 0) / wsum;
  }

  return {
    shares,
    used: raw
      .map((r) => ({ id: r.p.id, pollster: r.p.pollster, date: r.p.date, weight: r.w, share: r.w / total }))
      .sort((a, b) => b.share - a.share),
    skipped,
  };
}

/** How much of an average's weight comes from partisan-sponsored polls, split by the sponsor's side. */
export function partisanWeight(result: AvgResult, polls: AvgPoll[]): { total: number; D: number; R: number; other: number } {
  const byId = new Map(polls.map((p) => [p.id, p]));
  const out = { total: 0, D: 0, R: 0, other: 0 };
  for (const u of result.used) {
    const p = byId.get(u.id);
    if (!p || !(PARTISAN_SPONSORS as readonly string[]).includes(p.sponsorType)) continue;
    out.total += u.share;
    if (p.sponsorLean === 'D') out.D += u.share;
    else if (p.sponsorLean === 'R') out.R += u.share;
    else out.other += u.share;
  }
  return out;
}

/** Democrat-minus-Republican margin from a set of shares (null if either is missing). */
export function drMargin(shares: Record<string, number>, demId: string | null, repId: string | null): number | null {
  if (!demId || !repId || !(demId in shares) || !(repId in shares)) return null;
  return shares[demId] - shares[repId];
}

/**
 * Apply a past polling miss to today's margin.
 * signedError > 0 means polls overstated Democrats that year, so we move the
 * margin toward Republicans by that amount (and the other way if negative).
 * mirror = true applies the same size miss in the opposite direction.
 */
export function applyMiss(drMarginNow: number, signedError: number, mirror = false): number {
  return drMarginNow - (mirror ? -signedError : signedError);
}

/** A margin is a toss-up if the typical polling miss could erase it. */
export const isTossup = (margin: number, typicalMiss: number) => Math.abs(margin) < typicalMiss;

export type CycleMiss = { cycle: number; signed: number; polls: number; scope: 'state' | 'national'; contest: string };

/** The miss to use for a state in a given cycle: its own figure if it had enough polls, otherwise the national one. */
export function missForState(
  cycle: { cycle: number; contest: string; national: { signed: number; polls: number }; states: Record<string, { signed: number; polls: number }> },
  state: string,
): CycleMiss {
  const s = cycle.states[state];
  return s
    ? { cycle: cycle.cycle, signed: s.signed, polls: s.polls, scope: 'state', contest: cycle.contest }
    : { cycle: cycle.cycle, signed: cycle.national.signed, polls: cycle.national.polls, scope: 'national', contest: cycle.contest };
}
