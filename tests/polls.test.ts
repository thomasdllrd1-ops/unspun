import { describe, it, expect } from 'vitest';
import { moeOfLead, leadRange, confidence } from '../src/lib/polls';

describe('moeOfLead', () => {
  it('matches the textbook formula when the poll reports no margin', () => {
    // 50% vs 40%, n=1000: 1.96 × √((0.9 − 0.01)/1000) = 5.847 points
    expect(moeOfLead(50, 40, 1000, null)).toBeCloseTo(5.847, 2);
  });

  it("scales up by the pollster's design effect", () => {
    // n=1000 textbook margin is 3.099; a reported ±3.7 means factor 1.194
    const plain = moeOfLead(50, 40, 1000, null)!;
    expect(moeOfLead(50, 40, 1000, 3.7)!).toBeCloseTo(plain * (3.7 / 3.099), 1);
  });

  it('never makes the margin smaller than the textbook one', () => {
    expect(moeOfLead(50, 40, 1000, 1)).toBeCloseTo(moeOfLead(50, 40, 1000, null)!, 6);
  });

  it('falls back to 2 × reported margin without a sample size', () => {
    expect(moeOfLead(50, 40, null, 3)).toBe(6);
  });

  it('returns null with nothing to go on', () => {
    expect(moeOfLead(50, 40, null, null)).toBeNull();
  });

  it('matches a hand-worked real example (TPSI, May 2026)', () => {
    // 54.6 vs 28.8, n=1047, ±3.7 → about ±6.5 on the lead
    expect(moeOfLead(54.6, 28.8, 1047, 3.7)).toBeCloseTo(6.5, 1);
  });
});

describe('leadRange', () => {
  it('flags a toss-up when the range includes zero', () => {
    const r = leadRange(48, 45, 600, 4)!;
    expect(r.lead).toBe(3);
    expect(r.tossup).toBe(true);
  });
  it('does not flag a clear lead', () => {
    expect(leadRange(55, 30, 1000, 3)!.tossup).toBe(false);
  });
});

describe('confidence', () => {
  const today = new Date('2026-09-24');
  const p = (pollster: string, date: string) => ({ pollster, field_end: date, released: date });

  it('is "none" when every poll is older than 60 days', () => {
    expect(confidence([p('A', '2026-06-16'), p('B', '2026-05-05')], today)).toBe('none');
  });
  it('is "few" with one recent poll', () => {
    expect(confidence([p('A', '2026-09-01')], today)).toBe('few');
  });
  it('is "lots" with 5 recent polls from 3 pollsters', () => {
    const polls = ['A', 'A', 'B', 'B', 'C'].map((x) => p(x, '2026-09-10'));
    expect(confidence(polls, today)).toBe('lots');
  });
  it('stays "few" when 5 polls come from only 2 pollsters', () => {
    const polls = ['A', 'A', 'A', 'B', 'B'].map((x) => p(x, '2026-09-10'));
    expect(confidence(polls, today)).toBe('few');
  });
});
