import type { Rating } from './schema';
import { RATING_VALUES } from './schema';

export const FORECASTER_NAMES: Record<Rating['forecaster'], string> = {
  cook: 'Cook Political Report',
  inside: 'Inside Elections',
  sabato: "Sabato's Crystal Ball",
};

/** Each forecaster's own words for the same category (Sabato says "Safe" where others say "Solid"). */
export function ratingLabel(r: Rating['rating'], forecaster?: Rating['forecaster']): string {
  const solid = forecaster === 'sabato' ? 'Safe' : 'Solid';
  const map: Record<Rating['rating'], string> = {
    'solid-d': `${solid} Democratic`,
    'likely-d': 'Likely Democratic',
    'lean-d': 'Lean Democratic',
    tossup: 'Toss-up',
    'lean-r': 'Lean Republican',
    'likely-r': 'Likely Republican',
    'solid-r': `${solid} Republican`,
  };
  return map[r];
}

/** −3 (Solid D) … 0 (Toss-up) … +3 (Solid R). Used only to place markers and average. */
export const ratingScore = (r: Rating['rating']) => RATING_VALUES.indexOf(r) - 3;
// Round away from zero the same way for both sides. (Math.round(-0.5) is 0 but
// Math.round(0.5) is 1, which would quietly favor one party in a tie.)
const roundSymmetric = (x: number) => Math.sign(x) * Math.round(Math.abs(x));
export const ratingFromScore = (s: number) => RATING_VALUES[Math.max(0, Math.min(6, roundSymmetric(s) + 3))];

/** Which party color a rating leans toward, and how strongly (0–1). */
export function ratingTint(r: Rating['rating']): { side: 'dem' | 'rep' | 'neutral'; strength: number } {
  const s = ratingScore(r);
  if (s === 0) return { side: 'neutral', strength: 0 };
  return { side: s < 0 ? 'dem' : 'rep', strength: Math.abs(s) / 3 };
}

/** CSS color for a rating: party color mixed toward neutral gray by strength. */
export function ratingColor(r: Rating['rating']): string {
  const { side, strength } = ratingTint(r);
  if (side === 'neutral') return 'var(--neutral)';
  const p = [0, 45, 72, 100][Math.round(strength * 3)];
  return `color-mix(in oklab, var(--${side}) ${p}%, var(--neutral))`;
}

/** One neutral sentence summarizing the forecasters. */
export function ratingsHeadline(ratings: Rating[]): string {
  if (ratings.length === 0) return 'Race ratings are being double-checked before we show them.';
  const cats = [...new Set(ratings.map((r) => r.rating))];
  const n = ratings.length;
  const who = n === 3 ? 'All three forecasters' : n === 2 ? 'Both forecasters' : 'One forecaster';
  if (cats.length === 1) {
    return cats[0] === 'tossup' ? `${who} call this race a toss-up.` : `${who} rate this race ${ratingLabel(cats[0])}.`;
  }
  const sorted = [...cats].sort((a, b) => ratingScore(a) - ratingScore(b));
  return `Forecasters rate this race between ${ratingLabel(sorted[0])} and ${ratingLabel(sorted.at(-1)!)}.`;
}

/** Average of the visible forecasters, as a category (used for map color only). */
export function consensus(ratings: Rating[]): Rating['rating'] | null {
  if (!ratings.length) return null;
  return ratingFromScore(ratings.reduce((t, r) => t + ratingScore(r.rating), 0) / ratings.length);
}
