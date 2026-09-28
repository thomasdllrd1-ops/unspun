import { describe, it, expect } from 'vitest';
import { nameVariants, hideNames, tally, HIDDEN } from '../src/lib/quiz';

describe('nameVariants', () => {
  it('covers full name, first + last, last, and first', () => {
    const v = nameVariants('Mark R. Warner', 'Warner');
    expect(v).toEqual(expect.arrayContaining(['Mark R. Warner', 'Mark Warner', 'Warner', 'Mark']));
    expect(v[0]).toBe('Mark R. Warner'); // longest first
  });
  it('drops suffixes and picks up nicknames', () => {
    const v = nameVariants('Daniel J. Sullivan Jr.', 'Sullivan');
    expect(v).toEqual(expect.arrayContaining(['Daniel Sullivan', 'Sullivan', 'Daniel']));
    expect(nameVariants('Robert "Bobby" Scott', 'Scott')).toEqual(expect.arrayContaining(['Bobby', 'Bobby Scott']));
  });
});

describe('hideNames', () => {
  const v = [...nameVariants('Mark R. Warner', 'Warner'), ...nameVariants('Bert Mizusawa', 'Mizusawa')];
  it('hides every candidate name, including possessives', () => {
    expect(hideNames('Mark helped write it. Mark’s plan beats Bert Mizusawa’s.', v)).toBe(
      `${HIDDEN} helped write it. ${HIDDEN}’s plan beats ${HIDDEN}’s.`,
    );
  });
  it('leaves other words alone (whole words, case-sensitive)', () => {
    expect(hideNames('Markets and the benchmark rose; mark my words.', v)).toBe('Markets and the benchmark rose; mark my words.');
  });
});

describe('tally', () => {
  it('counts picks per candidate and ignores none/skip', () => {
    expect(tally({ housing: 'a', health: 'b', jobs: 'a', climate: 'none', war: 'skip' }, ['a', 'b', 'c'])).toEqual({ a: 2, b: 1, c: 0 });
  });
});
