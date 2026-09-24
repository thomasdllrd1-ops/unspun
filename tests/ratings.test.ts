import { describe, it, expect } from 'vitest';
import { ratingsHeadline, consensus, ratingLabel } from '../src/lib/ratings';
import type { Rating } from '../src/lib/schema';

const r = (forecaster: Rating['forecaster'], rating: Rating['rating']): Rating => ({
  race: 'x', forecaster, rating, as_of: '2026-09-01', source: 's', found_via: '', status: 'verified', verified_by: 't', verified_on: '2026-09-24', notes: '',
});

describe('ratingsHeadline', () => {
  it('says so when ratings are hidden', () => {
    expect(ratingsHeadline([])).toMatch(/double-checked/);
  });
  it('reports agreement', () => {
    expect(ratingsHeadline([r('cook', 'tossup'), r('inside', 'tossup'), r('sabato', 'tossup')])).toBe('All three forecasters call this race a toss-up.');
  });
  it('reports a range when forecasters disagree, in D→R order either way', () => {
    expect(ratingsHeadline([r('cook', 'solid-r'), r('inside', 'solid-r'), r('sabato', 'likely-r')])).toBe(
      'Forecasters rate this race between Likely Republican and Solid Republican.',
    );
  });
});

describe('consensus', () => {
  it('averages symmetrically for both parties', () => {
    expect(consensus([r('cook', 'lean-d'), r('inside', 'likely-d'), r('sabato', 'likely-d')])).toBe('likely-d');
    expect(consensus([r('cook', 'lean-r'), r('inside', 'likely-r'), r('sabato', 'likely-r')])).toBe('likely-r');
  });
});

describe('consensus fairness', () => {
  it('rounds a half-step the same distance for each party', () => {
    // one Lean D + one Toss-up must mirror one Lean R + one Toss-up
    expect(consensus([r('cook', 'lean-d'), r('inside', 'tossup')])).toBe('lean-d');
    expect(consensus([r('cook', 'lean-r'), r('inside', 'tossup')])).toBe('lean-r');
  });
  it('is a mirror image for every pair of ratings', () => {
    const vals = ['solid-d', 'likely-d', 'lean-d', 'tossup', 'lean-r', 'likely-r', 'solid-r'] as const;
    const flip = (v: (typeof vals)[number]) => vals[6 - vals.indexOf(v)];
    for (const a of vals) for (const b of vals) for (const c of vals) {
      const got = consensus([r('cook', a), r('inside', b), r('sabato', c)])!;
      const mirrored = consensus([r('cook', flip(a)), r('inside', flip(b)), r('sabato', flip(c))])!;
      expect(mirrored).toBe(flip(got));
    }
  });
});

describe('ratingLabel', () => {
  it("uses Sabato's own word for the top category", () => {
    expect(ratingLabel('solid-d', 'sabato')).toBe('Safe Democratic');
    expect(ratingLabel('solid-r', 'cook')).toBe('Solid Republican');
  });
});
