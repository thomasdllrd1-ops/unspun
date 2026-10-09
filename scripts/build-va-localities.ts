/**
 * Builds the Virginia "find your district" map: all 133 counties and independent cities,
 * each tagged with the U.S. House district(s) it falls in, plus a ZIP lookup.
 *
 * Sources (U.S. Census Bureau, public domain):
 *  - shapes: 2024 cartographic boundary file, counties (1:500,000)
 *  - county → district and ZIP → district: 2020 relationship files for the 119th Congress
 *    (the district map in effect for 2026)
 *
 * A county counts as "in" a district if at least 0.5% of its land is; smaller slivers
 * are mapping noise along shared borders. Same rule for ZIP Code Tabulation Areas.
 *
 * Run with: npm run build:va-localities
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoConicConformal, geoPath, geoArea } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';

const BASE = 'https://www2.census.gov/geo';
const SHAPES = `${BASE}/tiger/GENZ2024/shp/cb_2024_us_county_500k.zip`;
const REL_COUNTY = `${BASE}/docs/maps-data/data/rel2020/cd-sld/tab20_cd11920_county20_st51.txt`;
const REL_ZCTA = `${BASE}/docs/maps-data/data/rel2020/cd-sld/tab20_cd11920_zcta520_st51.txt`;
const RAW = 'data/geo/raw';
const GEOJSON = `${RAW}/va-counties.geojson`;
const OUT = 'data/geo/va-localities-svg.json';
const MIN_SHARE = 0.005;

mkdirSync(RAW, { recursive: true });
const fetchOnce = (url: string) => {
  const file = `${RAW}/${url.split('/').pop()}`;
  if (!existsSync(file)) execFileSync('curl', ['-sSL', '--fail', '-o', file, url], { stdio: 'inherit' });
  return file;
};

execFileSync('npx', ['mapshaper', '-i', fetchOnce(SHAPES), '-filter', "STATEFP == '51'", '-filter-fields', 'GEOID,NAMELSAD',
  '-simplify', '10%', 'keep-shapes', '-o', 'format=geojson', 'precision=0.00001', GEOJSON, 'force'], { stdio: 'inherit' });

// ---- "which districts is this place in" from a Census relationship file ----
function relationship(file: string, keyCol: string, areaCol: string) {
  const [head, ...rows] = readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split('\n').map((l) => l.split('|'));
  const col = (name: string) => head.indexOf(name);
  const [k, cd, part, whole] = [col(keyCol), col('GEOID_CD119_20'), col('AREALAND_PART'), col(areaCol)];
  const out = new Map<string, { n: number; share: number }[]>();
  for (const r of rows) {
    if (!r[k] || !r[cd]) continue; // water-only rows have no place
    const share = Number(r[part]) / Number(r[whole]);
    if (!(share >= MIN_SHARE)) continue;
    const list = out.get(r[k]) ?? [];
    list.push({ n: Number(r[cd].slice(2)), share: Math.round(share * 1000) / 1000 });
    out.set(r[k], list);
  }
  for (const list of out.values()) list.sort((a, b) => b.share - a.share);
  return out;
}
const byCounty = relationship(fetchOnce(REL_COUNTY), 'GEOID_COUNTY_20', 'AREALAND_COUNTY_20');
const byZip = relationship(fetchOnce(REL_ZCTA), 'GEOID_ZCTA5_20', 'AREALAND_ZCTA5_20');

// ---- shapes, drawn with the same projection as the district map (scripts/build-geo.ts) ----
type Props = { GEOID: string; NAMELSAD: string };
const geo = JSON.parse(readFileSync(GEOJSON, 'utf8')) as FeatureCollection<Geometry, Props>;
for (const f of geo.features) {
  if (geoArea(f) > 2 * Math.PI) {
    const g = f.geometry;
    if (g.type === 'Polygon') g.coordinates = g.coordinates.map((r) => r.reverse());
    if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.map((r) => r.reverse()));
  }
}
const WIDTH = 1000, HEIGHT = 520;
const projection = geoConicConformal().parallels([37, 39.5]).rotate([79, 0]).fitSize([WIDTH, HEIGHT], geo);
const path = geoPath(projection);
const round = (d: string) => d.replace(/(\d+\.\d)\d+/g, '$1');

const localities = geo.features
  .map((f) => {
    const districts = byCounty.get(f.properties.GEOID);
    if (!districts?.length) throw new Error(`No district found for ${f.properties.NAMELSAD} (${f.properties.GEOID})`);
    return { fips: f.properties.GEOID, name: f.properties.NAMELSAD, d: round(path(f) ?? ''), districts };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
if (localities.length !== 133) throw new Error(`Expected 133 Virginia counties and cities, got ${localities.length}`);

const zips = Object.fromEntries([...byZip].sort().map(([z, list]) => [z, list.map((x) => x.n)]));
writeFileSync(OUT, JSON.stringify({
  source: SHAPES,
  sourceName: 'U.S. Census Bureau, 2024 cartographic boundary file, counties (1:500,000)',
  relSources: [REL_COUNTY, REL_ZCTA],
  relSourceName: 'U.S. Census Bureau, 2020 relationship files, 119th Congress districts to counties and to ZIP Code Tabulation Areas',
  minShare: MIN_SHARE,
  viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  localities,
  zips,
}));
console.log(`Wrote ${OUT}: ${localities.length} localities, ${Object.keys(zips).length} ZIPs`);
