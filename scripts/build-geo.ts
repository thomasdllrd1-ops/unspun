/**
 * Builds the Virginia congressional district map.
 *
 * Source: U.S. Census Bureau cartographic boundary file, 119th Congress
 * districts (the map in effect for the 2026 election). Public domain.
 *
 * Steps: download → keep Virginia only → simplify for phones →
 * save GeoJSON (open data) → project to SVG paths the site draws directly.
 *
 * Run with: npm run build:geo
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoConicConformal, geoPath, geoCentroid, geoArea } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';

const SOURCE_URL = 'https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_cd119_500k.zip';
const RAW = 'data/geo/raw/cb_2025_us_cd119_500k.zip';
const GEOJSON_OUT = 'data/geo/va-cd119.geojson';
const SVG_OUT = 'data/geo/va-districts-svg.json';
const VIRGINIA_FIPS = '51';

mkdirSync('data/geo/raw', { recursive: true });

if (!existsSync(RAW)) {
  console.log(`Downloading ${SOURCE_URL}`);
  execFileSync('curl', ['-sSL', '--fail', '-o', RAW, SOURCE_URL], { stdio: 'inherit' });
}

// mapshaper: filter to Virginia, simplify (keeps small districts), write GeoJSON
execFileSync(
  'npx',
  [
    'mapshaper', '-i', RAW,
    '-filter', `STATEFP == '${VIRGINIA_FIPS}'`,
    '-filter-fields', 'CD119FP,GEOID,NAMELSAD',
    '-simplify', '12%', 'keep-shapes',
    '-o', 'format=geojson', 'precision=0.00001', GEOJSON_OUT, 'force',
  ],
  { stdio: 'inherit' },
);

type Props = { CD119FP: string; GEOID: string; NAMELSAD: string };
const geo = JSON.parse(readFileSync(GEOJSON_OUT, 'utf8')) as FeatureCollection<Geometry, Props>;

// d3-geo draws polygons on a sphere and expects outer rings in the opposite
// direction from standard GeoJSON. If a shape comes out "inside out"
// (bigger than half the globe), flip its rings.
for (const f of geo.features) {
  if (geoArea(f) > 2 * Math.PI) {
    const g = f.geometry;
    if (g.type === 'Polygon') g.coordinates = g.coordinates.map((ring) => ring.reverse());
    if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((poly) => poly.map((ring) => ring.reverse()));
  }
}

// Lambert conformal conic fitted to Virginia (the projection Virginia's own
// state plane system uses), sized to a 1000-wide viewBox.
const WIDTH = 1000;
const HEIGHT = 520;
const projection = geoConicConformal().parallels([37, 39.5]).rotate([79, 0]).fitSize([WIDTH, HEIGHT], geo);
const path = geoPath(projection);

// Hand-placed labels where the automatic center falls in water or the district
// is too small to label (viewBox coordinates). "callout" draws a line to the district.
const LABEL_OVERRIDES: Record<number, { at: [number, number]; callout?: boolean }> = {
  2: { at: [905, 442] },
  3: { at: [842, 505], callout: true },
  8: { at: [850, 138], callout: true },
  11: { at: [805, 72], callout: true },
};

const districts = geo.features
  .map((f) => {
    const number = Number(f.properties.CD119FP);
    const [lx, ly] = projection(geoCentroid(f)) ?? path.centroid(f);
    const anchor: [number, number] = [Math.round(lx), Math.round(ly)];
    const override = LABEL_OVERRIDES[number];
    return {
      number,
      geoid: f.properties.GEOID,
      d: path(f) ?? '',
      label: override?.at ?? anchor,
      anchor: override?.callout ? anchor : null,
      area: Math.round(path.area(f)),
    };
  })
  .sort((a, b) => a.number - b.number);

if (districts.length !== 11) throw new Error(`Expected 11 Virginia districts, got ${districts.length}`);

writeFileSync(
  SVG_OUT,
  JSON.stringify(
    {
      source: SOURCE_URL,
      sourceName: 'U.S. Census Bureau, 2025 cartographic boundary file, 119th Congress districts',
      builtAt: new Date().toISOString(),
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      districts,
    },
    null,
    1,
  ),
);
console.log(`Wrote ${GEOJSON_OUT} and ${SVG_OUT} (${districts.length} districts)`);
