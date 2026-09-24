import { describe, it, expect } from 'vitest';
import { pollingAverage, drMargin, applyMiss, isTossup, missForState, partisanWeight, type AvgPoll } from '../src/lib/average';

const TODAY = '2026-09-24';
const poll = (over: Partial<AvgPoll> & { id: string }): AvgPoll => ({
  pollster: over.id,
  sponsorType: 'independent',
  sponsorLean: 'none',
  population: 'LV',
  sampleSize: 800,
  date: '2026-09-20',
  shares: { d: 48, r: 44 },
  ...over,
});

describe('pollingAverage', () => {
  it('returns the poll itself when there is only one', () => {
    const a = pollingAverage([poll({ id: 'a' })], { today: TODAY })!;
    expect(a.shares.d).toBeCloseTo(48);
    expect(a.used).toHaveLength(1);
  });

  it('halves a poll\'s weight every 14 days', () => {
    const a = pollingAverage(
      [poll({ id: 'new', date: '2026-09-24', shares: { d: 50, r: 40 } }), poll({ id: 'old', date: '2026-09-10', shares: { d: 40, r: 50 } })],
      { today: TODAY },
    )!;
    // same sample size, weights 1 and 0.5 → d = (50×1 + 40×0.5) / 1.5 = 46.67
    expect(a.shares.d).toBeCloseTo(46.667, 2);
  });

  it('weights by the square root of sample size', () => {
    const a = pollingAverage(
      [poll({ id: 'big', sampleSize: 1600, shares: { d: 50, r: 40 } }), poll({ id: 'small', sampleSize: 400, shares: { d: 40, r: 50 } })],
      { today: TODAY },
    )!;
    // √1600 = 40, √400 = 20 → d = (50×40 + 40×20) / 60 = 46.67
    expect(a.shares.d).toBeCloseTo(46.667, 2);
  });

  it('keeps only the most recent poll from each pollster', () => {
    const a = pollingAverage(
      [poll({ id: 'x1', pollster: 'X', date: '2026-09-01' }), poll({ id: 'x2', pollster: 'X', date: '2026-09-15' })],
      { today: TODAY },
    )!;
    expect(a.used.map((u) => u.id)).toEqual(['x2']);
    expect(a.skipped.map((s) => s.id)).toContain('x1');
  });

  it('drops polls outside the window', () => {
    expect(pollingAverage([poll({ id: 'a', date: '2026-06-01' })], { today: TODAY })).toBeNull();
    expect(pollingAverage([poll({ id: 'a', date: '2026-09-01' })], { today: TODAY, windowDays: 14 })).toBeNull();
  });

  it('removes partisan-sponsored polls from BOTH sides when asked', () => {
    const polls = [
      poll({ id: 'camp', sponsorType: 'campaign' }),
      poll({ id: 'party', sponsorType: 'party' }),
      poll({ id: 'pac', sponsorType: 'partisan-aligned' }),
      poll({ id: 'ind', sponsorType: 'independent' }),
    ];
    const a = pollingAverage(polls, { today: TODAY, noPartisan: true })!;
    expect(a.used.map((u) => u.id)).toEqual(['ind']);
  });

  it('can limit to likely voters', () => {
    const a = pollingAverage([poll({ id: 'rv', population: 'RV' }), poll({ id: 'lv' })], { today: TODAY, lvOnly: true })!;
    expect(a.used.map((u) => u.id)).toEqual(['lv']);
  });

  it('treats a missing sample size as the median of the others', () => {
    const a = pollingAverage(
      [poll({ id: 'a', sampleSize: 400 }), poll({ id: 'b', sampleSize: 900 }), poll({ id: 'c', sampleSize: null })],
      { today: TODAY },
    )!;
    const w = Object.fromEntries(a.used.map((u) => [u.id, u.weight]));
    // same date, so only sample size differs: c counts as the median (650) of 400 and 900
    expect(w.c / w.a).toBeCloseTo(Math.sqrt(650) / Math.sqrt(400), 6);
  });
});

describe('partisanWeight', () => {
  it('reports each side\'s share of the weight the same way', () => {
    const polls = [
      poll({ id: 'd', sponsorType: 'campaign', sponsorLean: 'D' }),
      poll({ id: 'r', sponsorType: 'party', sponsorLean: 'R' }),
      poll({ id: 'i' }),
      poll({ id: 'x' }),
    ];
    const w = partisanWeight(pollingAverage(polls, { today: TODAY })!, polls);
    expect(w.D).toBeCloseTo(0.25);
    expect(w.R).toBeCloseTo(0.25);
    expect(w.total).toBeCloseTo(0.5);
  });
});

describe('what-if', () => {
  it('moves the margin toward Republicans when polls overstated Democrats', () => {
    expect(applyMiss(3, 4)).toBe(-1);
  });
  it('moves toward Democrats when polls overstated Republicans', () => {
    expect(applyMiss(-2, -1.2)).toBeCloseTo(-0.8);
  });
  it('mirror applies the same size miss the other way', () => {
    expect(applyMiss(3, 4, true)).toBe(7);
  });
  it('is symmetric: flipping parties flips the result', () => {
    for (const m of [-7, -2, 0, 3.5]) for (const e of [-1.2, 2.6, 4]) expect(applyMiss(-m, -e)).toBeCloseTo(-applyMiss(m, e));
  });
  it('uses a state figure when available, otherwise national', () => {
    const cyc = { cycle: 2020, contest: 'x', national: { signed: 4, polls: 375 }, states: { VA: { signed: 2.3, polls: 9 } } };
    expect(missForState(cyc, 'VA')).toMatchObject({ signed: 2.3, scope: 'state' });
    expect(missForState(cyc, 'WY')).toMatchObject({ signed: 4, scope: 'national' });
  });
  it('toss-up when the typical miss could erase the margin', () => {
    expect(isTossup(4, 4.6)).toBe(true);
    expect(isTossup(-5, 4.6)).toBe(false);
  });
});

describe('drMargin', () => {
  it('is D minus R, or null if either is missing', () => {
    expect(drMargin({ d: 48, r: 44 }, 'd', 'r')).toBe(4);
    expect(drMargin({ d: 48 }, 'd', 'r')).toBeNull();
  });
});
