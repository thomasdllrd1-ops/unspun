/**
 * Helpers for the blind quiz: hide who said what, then count whose words you picked.
 */

export const HIDDEN = '[name hidden]';

/** Every way a candidate's name might appear in their own campaign text: "Mark R. Warner", "Mark Warner", "Warner", "Mark". */
export function nameVariants(ballotName: string, sortName: string): string[] {
  const parts = ballotName.replace(/,?\s+(Jr\.?|Sr\.?|II|III|IV)$/i, '').split(/\s+/).filter(Boolean);
  const first = parts.find((p) => !/^[A-Z]\.$/.test(p) && !/^\(/.test(p)) ?? '';
  const nick = ballotName.match(/[“"(]([^”")]+)[”")]/)?.[1];
  const out = new Set([ballotName, `${first} ${sortName}`, sortName, first, ...(nick ? [nick, `${nick} ${sortName}`] : [])]);
  return [...out].filter((x) => x.trim().length > 1).sort((a, b) => b.length - a.length);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replace any candidate's name with "[name hidden]". Case-sensitive, whole words only, longest names first. */
export function hideNames(text: string, variants: string[]): string {
  const sorted = [...new Set(variants)].sort((a, b) => b.length - a.length);
  if (!sorted.length) return text;
  const re = new RegExp(`(?<![\\p{L}])(?:${sorted.map(escape).join('|')})(?![\\p{L}])`, 'gu');
  return text.replace(re, HIDDEN);
}

/** picks: issue → candidate id, or 'none' / 'skip'. Returns how many times each candidate's words were picked. */
export function tally(picks: Record<string, string>, candidateIds: string[]): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(candidateIds.map((id) => [id, 0]));
  for (const v of Object.values(picks)) if (v in out) out[v] += 1;
  return out;
}
