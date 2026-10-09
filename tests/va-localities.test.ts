import { describe, expect, it } from 'vitest';
import geo from '../data/geo/va-localities-svg.json';

const districtsOf = (name: string) => geo.localities.find((l) => l.name === name)?.districts.map((d) => d.n).sort((a, b) => a - b);

describe('Virginia find-your-district data', () => {
  it('has every county and independent city', () => {
    expect(geo.localities).toHaveLength(133);
  });
  it('splits known split localities the way the Census relationship file does', () => {
    expect(districtsOf('Fairfax County')).toEqual([8, 10, 11]);
    expect(districtsOf('Chesterfield County')).toEqual([1, 4]);
    expect(districtsOf('Henrico County')).toEqual([1, 4]);
    expect(districtsOf('Richmond city')).toEqual([4]);
  });
  it('maps ZIPs to districts', () => {
    expect(geo.zips['23220']).toEqual([4]);
    expect(Object.keys(geo.zips).length).toBeGreaterThan(800);
  });
});
