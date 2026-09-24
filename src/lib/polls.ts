/**
 * Poll math. Every formula here is also explained in plain English on the
 * "Show our work" page. Tests: tests/polls.test.ts
 */

const Z95 = 1.96; // 95% confidence

/**
 * Margin of error on the LEAD (candidate A minus candidate B), in points.
 *
 * The gap between two candidates is less certain than either number alone.
 * With the sample size, we use the standard formula for the difference of two
 * shares from the same poll:  1.96 × √((p1 + p2 − (p1 − p2)²) / n)
 *
 * Pollsters' own margins usually include a "design effect" from weighting.
 * If the poll reports its margin, we scale our number by the same factor
 * (reported margin ÷ textbook margin at 50%), so we never claim more
 * precision than the pollster does.
 *
 * With no sample size, we fall back to 2 × the reported margin (a common,
 * slightly cautious rule of thumb). With neither, we return null.
 */
export function moeOfLead(pctA: number, pctB: number, n: number | null, reportedMoe: number | null): number | null {
  if (n && n > 0) {
    const p1 = pctA / 100;
    const p2 = pctB / 100;
    const base = Z95 * Math.sqrt((p1 + p2 - (p1 - p2) ** 2) / n) * 100;
    const textbookMoe = Z95 * Math.sqrt(0.25 / n) * 100;
    const designFactor = reportedMoe ? Math.max(1, reportedMoe / textbookMoe) : 1;
    return base * designFactor;
  }
  if (reportedMoe) return 2 * reportedMoe;
  return null;
}

export type LeadRange = { lead: number; low: number; high: number; tossup: boolean };

/** Lead of A over B with its range. If the range includes 0, it's a statistical toss-up. */
export function leadRange(pctA: number, pctB: number, n: number | null, reportedMoe: number | null): LeadRange | null {
  const moe = moeOfLead(pctA, pctB, n, reportedMoe);
  if (moe == null) return null;
  const lead = pctA - pctB;
  const low = lead - moe;
  const high = lead + moe;
  return { lead, low, high, tossup: low <= 0 && high >= 0 };
}

export const RECENT_DAYS = 60;

const DAY = 24 * 60 * 60 * 1000;
export const daysBetween = (fromIso: string, to: Date) => Math.floor((to.getTime() - Date.parse(fromIso)) / DAY);

/** The date we treat as "when the poll was taken": last field day, else release date. */
export const pollDate = (p: { field_end: string; released: string }) => p.field_end || p.released;

export type Confidence = 'lots' | 'few' | 'none';

/**
 * Confidence badge for a race, based on polls in the last 60 days.
 *   lots = 5+ polls from 3+ different pollsters
 *   few  = at least 1 poll
 *   none = no recent polls
 */
export function confidence(polls: { pollster: string; field_end: string; released: string }[], today: Date): Confidence {
  const recent = polls.filter((p) => daysBetween(pollDate(p), today) <= RECENT_DAYS);
  const pollsters = new Set(recent.map((p) => p.pollster));
  if (recent.length >= 5 && pollsters.size >= 3) return 'lots';
  if (recent.length >= 1) return 'few';
  return 'none';
}
