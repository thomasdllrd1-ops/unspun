import { describe, it, expect } from 'vitest';
import { majorPair, raceById } from '../src/lib/data';
import { summarize } from '../src/lib/summary';

describe('the two "teams" in a race', () => {
  it('picks the leading candidate when a party has several (Alaska: three Republicans)', () => {
    const p = majorPair('ak-sen');
    expect(p.dem?.id).toBe('mary-peltola');
    expect(p.rep?.id).toBe('dan-sullivan');
  });
  it('leaves a side empty when no candidate from that party runs (Nebraska)', () => {
    expect(majorPair('ne-sen').dem).toBeNull();
  });
  it('never falls back to alphabetical order when there are checked polls', () => {
    const teams = summarize(raceById('ak-sen')).teams.map((t) => t.id).sort();
    expect(teams).toEqual(['dan-sullivan', 'mary-peltola']);
  });
});
