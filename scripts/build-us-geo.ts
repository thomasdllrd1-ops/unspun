/**
 * Builds the national U.S. states map (used for the Senate overview).
 *
 * Source: U.S. Census Bureau 2024 cartographic boundary file, states, 1:20,000,000
 * (small file, generalized for national maps). Public domain.
 * Projection: Albers USA (Alaska and Hawaii shown as insets).
 *
 * Run with: npm run build:us-geo
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoAlbersUsa, geoPath, geoArea } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';

const SOURCE_URL = 'https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_state_20m.zip';
const RAW = 'data/geo/raw/cb_2024_us_state_20m.zip';
const GEOJSON = 'data/geo/raw/us-states.geojson';
const OUT = 'data/geo/us-states-svg.json';

mkdirSync('data/geo/raw', { recursive: true });
if (!existsSync(RAW)) execFileSync('curl', ['-sSL', '--fail', '-o', RAW, SOURCE_URL], { stdio: 'inherit' });
execFileSync('npx', ['mapshaper', '-i', RAW, '-filter', "Number(STATEFP) <= 56", '-filter-fields', 'STUSPS,NAME',
  '-simplify', '20%', 'keep-shapes', '-o', 'format=geojson', 'precision=0.0001', GEOJSON, 'force'], { stdio: 'inherit' });

type Props = { STUSPS: string; NAME: string };
const geo = JSON.parse(readFileSync(GEOJSON, 'utf8')) as FeatureCollection<Geometry, Props>;
for (const f of geo.features) {
  // d3 expects the opposite ring direction from standard GeoJSON; flip "inside-out" shapes.
  if (geoArea(f) > 2 * Math.PI) {
    const g = f.geometry;
    if (g.type === 'Polygon') g.coordinates = g.coordinates.map((r) => r.reverse());
    if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.map((r) => r.reverse()));
  }
}
const W = 960, H = 600;
const projection = geoAlbersUsa().fitSize([W, H], geo);
const path = geoPath(projection);
const states = geo.features
  .map((f) => {
    const [x, y] = path.centroid(f);
    return { code: f.properties.STUSPS, name: f.properties.NAME, d: path(f) ?? '', label: [Math.round(x), Math.round(y)], area: Math.round(path.area(f)) };
  })
  .filter((s) => s.d)
  .sort((a, b) => a.code.localeCompare(b.code));
if (states.length !== 51) throw new Error(`Expected 50 states + DC, got ${states.length}`);
writeFileSync(OUT, JSON.stringify({ source: SOURCE_URL, sourceName: 'U.S. Census Bureau, 2024 cartographic boundary file, states (1:20,000,000)', viewBox: `0 0 ${W} ${H}`, states }, null, 1));
console.log(`Wrote ${OUT} (${states.length} shapes)`);
