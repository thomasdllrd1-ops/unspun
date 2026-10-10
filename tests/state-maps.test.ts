import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import races from '../data/races.json';
import zips from '../public/geo/zip-races.json';

type County = { fips: string; name: string; districts: { n: number; share: number }[] };
const state = (code: string) => JSON.parse(readFileSync(`data/geo/states/${code}.json`, 'utf8')) as { counties: County[]; outlines: { n: number }[]; lines: { map: string } | null };
const inDistricts = (code: string, name: string) =>
  state(code).counties.find((c) => c.name === name)?.districts.map((d) => d.n).sort((a, b) => a - b);

describe('tap-where-you-live maps', () => {
  it('has a map for every state with a race, and an outline for every House district we cover', () => {
    const files = readdirSync('data/geo/states').map((f) => f.replace('.json', '').toUpperCase());
    expect(files.sort()).toEqual([...new Set(races.map((r) => r.state))].sort());
    for (const r of races.filter((x) => x.chamber === 'house')) {
      expect(state(r.state.toLowerCase()).outlines.map((o) => o.n), r.id).toContain(r.district);
    }
  });

  it('Virginia: all 133 counties and cities, split the way the Census relationship file splits them', () => {
    expect(state('va').counties).toHaveLength(133);
    expect(inDistricts('va', 'Fairfax County')).toEqual([8, 10, 11]);
    expect(inDistricts('va', 'Chesterfield County')).toEqual([1, 4]);
    expect(inDistricts('va', 'Henrico County')).toEqual([1, 4]);
    expect(inDistricts('va', 'Richmond city')).toEqual([4]);
  });

  it('puts well-known places in the districts we cover', () => {
    expect(inDistricts('ny', 'Rockland County')).toEqual([17]);
    expect(inDistricts('mi', 'Ingham County')).toContain(7);
    expect(inDistricts('mi', 'Macomb County')).toContain(10);
    expect(inDistricts('ia', 'Polk County')).toEqual([3]);
    expect(inDistricts('ia', 'Scott County')).toEqual([1]);
    expect(inDistricts('wa', 'Clark County')).toEqual([3]);
    expect(inDistricts('wi', 'La Crosse County')).toEqual([3]);
    expect(inDistricts('pa', 'Dauphin County')).toEqual([10]);
    expect(inDistricts('pa', 'Lehigh County')).toEqual([7]);
    expect(inDistricts('pa', 'Lackawanna County')).toEqual([8]);
  });

  it('uses the new 2026 maps in Texas, Florida and Ohio', () => {
    for (const s of ['tx', 'fl', 'oh']) expect(state(s).lines?.map, s).toBe('2026');
    expect(inDistricts('tx', 'Cameron County')).toEqual([34]); // Brownsville
    expect(inDistricts('fl', 'Hillsborough County')).toContain(14); // Tampa
    expect(inDistricts('oh', 'Lucas County')).toEqual([9]); // Toledo
  });

  it('ZIP lookup: state plus any district we cover', () => {
    const z = zips as Record<string, string>;
    expect(z['23220']).toBe('VA4'); // Richmond
    expect(z['10901']).toBe('NY17'); // Suffern
    expect(z['78520']).toBe('TX34'); // Brownsville
    expect(z['43604']).toBe('OH9'); // Toledo
    expect(z['90210']).toBe('CA'); // a state with no race we cover
    expect(Object.keys(z).length).toBeGreaterThan(33000);
  });
});
