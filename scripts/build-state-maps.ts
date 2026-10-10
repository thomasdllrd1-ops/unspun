/**
 * "Tap where you live" maps for every state with a race we cover, plus a national ZIP lookup.
 *
 * For each state: county shapes (what you tap), which U.S. House district(s) each county is in
 * (states with a House race we cover), and outlines of the districts we cover.
 * Nationally: ZIP → state and covered House district(s), for the homepage ZIP box.
 *
 * Sources (all public):
 *  - County shapes: U.S. Census Bureau 2024 cartographic boundary file (1:500,000).
 *  - Most states vote in 2026 on the 119th-Congress map: Census 2020 relationship files
 *    (county → district and ZIP → district, measured by land area) and Census district outlines.
 *  - Three states with a House race we cover adopted new maps for 2026, so we use each state's
 *    official plan and measure the overlap ourselves:
 *      TX  PLANC2333 shapefile, Texas Legislative Council (in effect for 2026 under the U.S. Supreme
 *          Court's Dec 4, 2025 stay)
 *      FL  EOGPCRP2026 shapefile, Florida Office of Economic and Demographic Research (signed May 4, 2026)
 *      OH  Ohio Redistricting Commission block assignment file (adopted Oct 31, 2025), applied to
 *          2020 Census blocks
 *    ZIP areas for those states: Census 2020 ZIP Code Tabulation Area shapes.
 *
 * A county or ZIP counts as "in" a district if at least 0.5% of it is; smaller slivers are
 * mapping noise along borders.
 *
 * Writes data/geo/states/<code>.json and public/geo/zip-races.json.
 * Run with: npm run build:state-maps   (downloads are cached in data/geo/raw)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { geoConicConformal, geoPath, geoArea, geoBounds } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { STATE_NAMES } from '../src/lib/states';

const FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10', DC: '11', FL: '12', GA: '13',
  HI: '15', ID: '16', IL: '17', IN: '18', IA: '19', KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25',
  MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35', NY: '36',
  NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47', TX: '48',
  UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55', WY: '56',
};
const CB = 'https://www2.census.gov/geo';
const COUNTIES = `${CB}/tiger/GENZ2024/shp/cb_2024_us_county_500k.zip`;
const CD119 = `${CB}/tiger/GENZ2025/shp/cb_2025_us_cd119_500k.zip`;
const ZCTAS = `${CB}/tiger/GENZ2020/shp/cb_2020_us_zcta520_500k.zip`;
const REL = (kind: 'county20' | 'zcta520', fips: string) => `${CB}/docs/maps-data/data/rel2020/cd-sld/tab20_cd11920_${kind}_st${fips}.txt`;
const REDRAWN: Record<string, { plan: string; field: string; source: string; sourceName: string; countyCsv?: string }> = {
  TX: {
    plan: 'data/geo/raw/2026maps/tx-planc2333.zip', field: 'District',
    source: 'https://data.capitol.texas.gov/dataset/planc2333',
    sourceName: 'Texas Legislative Council, PLANC2333 (2025 congressional plan, in effect for 2026)',
  },
  FL: {
    plan: 'data/geo/raw/2026maps/fl-EOGPCRP2026.zip', field: 'DISTRICT',
    source: 'https://www.edr.state.fl.us/Content/redistricting/2026redistricting/index.cfm',
    sourceName: 'Florida Office of Economic and Demographic Research, EOGPCRP2026 (2026 congressional plan)',
  },
  OH: {
    plan: 'data/geo/raw/2026maps/oh-cd2025.geojson', field: 'District',
    countyCsv: 'data/geo/raw/2026maps/oh-county-district.csv',
    source: 'https://redistricting.ohio.gov/maps',
    sourceName: 'Ohio Redistricting Commission, congressional plan adopted Oct 31, 2025 (block assignment file, with 2020 Census blocks)',
  },
};
const RAW = 'data/geo/raw';
const TMP = `${RAW}/tmp`;
const OUT = 'data/geo/states';
const MIN_SHARE = 0.005;
const W = 800;
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });
mkdirSync('public/geo', { recursive: true });

const fetchOnce = (url: string) => {
  const file = `${RAW}/${url.split('/').pop()}`;
  if (!existsSync(file)) execFileSync('curl', ['-sSL', '--fail', '-o', file, url], { stdio: 'inherit' });
  return file;
};
const mapshaper = (...args: string[]) => execFileSync('node_modules/.bin/mapshaper', [...args, '-quiet'], { stdio: 'inherit' });
const readGeo = (f: string) => JSON.parse(readFileSync(f, 'utf8')) as FeatureCollection<Geometry, Record<string, any>>;
/** d3 wants clockwise rings; GeoJSON from mapshaper is counter-clockwise. Flip any shape that came out "inside out". */
function fixWinding(fc: FeatureCollection) {
  for (const f of fc.features) {
    if (geoArea(f) > 2 * Math.PI) {
      const g = f.geometry;
      if (g.type === 'Polygon') g.coordinates = g.coordinates.map((r) => r.reverse());
      if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.map((r) => r.reverse()));
    }
  }
  return fc;
}
type Share = { n: number; share: number };
const addShare = (m: Map<string, Share[]>, key: string, n: number, share: number) => {
  if (!(share >= MIN_SHARE)) return;
  const list = m.get(key) ?? [];
  const hit = list.find((x) => x.n === n);
  if (hit) hit.share += share; else list.push({ n, share });
  m.set(key, list);
};
const tidy = (m: Map<string, Share[]>) => {
  for (const list of m.values()) {
    for (const x of list) x.share = Math.round(Math.min(1, x.share) * 1000) / 1000;
    list.sort((a, b) => b.share - a.share);
  }
  return m;
};

/** Census relationship file → key → districts (by land area). */
function relationship(file: string, keyCol: string, areaCol: string) {
  const [head, ...rows] = readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split('\n').map((l) => l.split('|'));
  const col = (name: string) => head.indexOf(name);
  const [k, cd, part, whole] = [col(keyCol), col('GEOID_CD119_20'), col('AREALAND_PART'), col(areaCol)];
  const out = new Map<string, Share[]>();
  for (const r of rows) {
    if (!r[k] || !r[cd]) continue; // water-only rows
    addShare(out, r[k], Number(r[cd].slice(2)), Number(r[part]) / Number(r[whole]));
  }
  return tidy(out);
}

/** Overlap of a polygon layer with a plan's districts, as each feature's share of its own area. */
function overlap(layerFile: string, keyField: string, districtsFile: string, districtField: string) {
  const csv = `${TMP}/overlap.csv`;
  mapshaper('-i', layerFile, districtsFile, 'combine-files', '-union', 'target=*', `fields=${keyField},${districtField}`,
    '-each', 'a=this.area', '-o', csv, 'format=csv');
  const [head, ...rows] = readFileSync(csv, 'utf8').trim().split('\n').map((l) => l.split(','));
  const [k, d, a] = [head.indexOf(keyField), head.indexOf(districtField), head.indexOf('a')];
  const totals = new Map<string, number>();
  for (const r of rows) if (r[k]) totals.set(r[k], (totals.get(r[k]) ?? 0) + Number(r[a]));
  const out = new Map<string, Share[]>();
  for (const r of rows) if (r[k] && r[d]) addShare(out, r[k], Number(r[d]), Number(r[a]) / totals.get(r[k])!);
  return tidy(out);
}

// ---- which states, which House districts we cover ----
const races = JSON.parse(readFileSync('data/races.json', 'utf8')) as { id: string; state: string; chamber: string; district?: number }[];
const raceStates = [...new Set(races.map((r) => r.state))].sort();
const covered = new Map<string, number[]>();
for (const r of races) if (r.chamber === 'house') covered.set(r.state, [...(covered.get(r.state) ?? []), r.district!]);

// ---- county shapes for every state with a race (simplified for drawing) ----
const countyZip = fetchOnce(COUNTIES);
const fipsList = JSON.stringify(raceStates.map((s) => FIPS[s]));
mapshaper('-i', countyZip, '-filter', `${fipsList}.indexOf(STATEFP) > -1`, '-filter-fields', 'GEOID,NAMELSAD,STATEFP',
  '-simplify', '8%', 'keep-shapes', '-o', 'format=geojson', 'precision=0.00001', `${TMP}/counties.geojson`, 'force');
const allCounties = fixWinding(readGeo(`${TMP}/counties.geojson`));

// ---- covered-district outlines on the 119th-Congress map ----
const cdZip = fetchOnce(CD119);
mapshaper('-i', cdZip, '-filter-fields', 'GEOID,STATEFP,CD119FP', '-simplify', '8%', 'keep-shapes',
  '-o', 'format=geojson', 'precision=0.00001', `${TMP}/cd119.geojson`, 'force');
const cd119 = fixWinding(readGeo(`${TMP}/cd119.geojson`));

const zctaZip = fetchOnce(ZCTAS);
const round = (d: string | null) => (d ?? '').replace(/(\d+\.\d)\d+/g, '$1');
const zipIndex = new Map<string, { st: string; n: number; share: number }[]>();

for (const st of raceStates) {
  const fips = FIPS[st];
  const counties = allCounties.features.filter((f) => f.properties.STATEFP === fips);
  const houseDistricts = covered.get(st) ?? [];
  const redrawn = houseDistricts.length ? REDRAWN[st] : undefined;

  // which district(s) each county is in — only needed where we cover a House race
  let byCounty = new Map<string, Share[]>();
  let planDistricts: FeatureCollection<Geometry, Record<string, any>> | undefined;
  if (houseDistricts.length && !redrawn) {
    byCounty = relationship(fetchOnce(REL('county20', fips)), 'GEOID_COUNTY_20', 'AREALAND_COUNTY_20');
  } else if (redrawn) {
    // plan districts in longitude/latitude, full detail for measuring
    mapshaper('-i', redrawn.plan, '-proj', 'wgs84', '-each', `District=Number(${redrawn.field})`, '-filter-fields', 'District',
      '-o', 'format=geojson', `${TMP}/${st}-plan.geojson`, 'force');
    if (redrawn.countyCsv) {
      // Ohio: exact land area per county and district from the commission's block assignments
      const [, ...rows] = readFileSync(redrawn.countyCsv, 'utf8').trim().split('\n').map((l) => l.split(','));
      const totals = new Map<string, number>();
      for (const [aland, county] of rows) totals.set(county, (totals.get(county) ?? 0) + Number(aland));
      for (const [aland, county, d] of rows) addShare(byCounty, county, Number(d), Number(aland) / totals.get(county)!);
      tidy(byCounty);
    } else {
      mapshaper('-i', countyZip, '-filter', `STATEFP == '${fips}'`, '-filter-fields', 'GEOID',
        '-o', 'format=geojson', `${TMP}/${st}-counties-full.geojson`, 'force');
      byCounty = overlap(`${TMP}/${st}-counties-full.geojson`, 'GEOID', `${TMP}/${st}-plan.geojson`, 'District');
    }
    mapshaper('-i', `${TMP}/${st}-plan.geojson`, '-simplify', '8%', 'keep-shapes', '-o', 'format=geojson',
      'precision=0.00001', `${TMP}/${st}-plan-simple.geojson`, 'force');
    planDistricts = fixWinding(readGeo(`${TMP}/${st}-plan-simple.geojson`));
  }

  // ZIPs in this state, and which district(s) each is in
  const zipRel = relationship(fetchOnce(REL('zcta520', fips)), 'GEOID_ZCTA5_20', 'AREALAND_ZCTA5_20');
  let zipDistricts = zipRel;
  if (redrawn) {
    const zips = JSON.stringify([...zipRel.keys()]);
    mapshaper('-i', zctaZip, '-filter', `${zips}.indexOf(ZCTA5CE20) > -1`, '-filter-fields', 'ZCTA5CE20',
      '-o', 'format=geojson', `${TMP}/${st}-zctas.geojson`, 'force');
    zipDistricts = overlap(`${TMP}/${st}-zctas.geojson`, 'ZCTA5CE20', `${TMP}/${st}-plan.geojson`, 'District');
  }
  for (const [zip, list] of zipRel) {
    // Shares are fractions of the whole ZIP (a few ZIPs cross state lines)
    const statePart = list.reduce((s, x) => s + x.share, 0);
    const parts = zipIndex.get(zip) ?? [];
    const inCovered = (zipDistricts.get(zip) ?? []).filter((x) => houseDistricts.includes(x.n));
    for (const x of inCovered) parts.push({ st, n: x.n, share: x.share });
    const rest = statePart - inCovered.reduce((s, x) => s + x.share, 0);
    if (rest >= MIN_SHARE) parts.push({ st, n: 0, share: Math.round(rest * 1000) / 1000 });
    zipIndex.set(zip, parts);
  }

  // ---- draw: one projection per state, fitted to its counties ----
  const fc: FeatureCollection = { type: 'FeatureCollection', features: counties as Feature[] };
  const [[x0, y0], [x1, y1]] = geoBounds(fc);
  const lon0 = st === 'AK' ? -152 : (x0 + x1) / 2;
  const projection = geoConicConformal().parallels([y0 + (y1 - y0) / 6, y1 - (y1 - y0) / 6]).rotate([-lon0, 0]).fitWidth(W, fc);
  const path = geoPath(projection);
  const H = Math.ceil(path.bounds(fc)[1][1]);

  const countyOut = counties.map((f) => {
    const districts = byCounty.get(f.properties.GEOID) ?? [];
    if (houseDistricts.length && !districts.length) throw new Error(`${st}: no district for ${f.properties.NAMELSAD} (${f.properties.GEOID})`);
    return { fips: f.properties.GEOID as string, name: f.properties.NAMELSAD as string, d: round(path(f)), districts };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const outlines = houseDistricts.map((n) => {
    const f = redrawn
      ? planDistricts!.features.find((x) => x.properties.District === n)
      : cd119.features.find((x) => x.properties.STATEFP === fips && Number(x.properties.CD119FP) === n);
    if (!f) throw new Error(`${st}-${n}: no district outline`);
    const [cx, cy] = path.centroid(f);
    return { n, d: round(path(f)), x: Math.round(cx), y: Math.round(cy) };
  });

  writeFileSync(`${OUT}/${st.toLowerCase()}.json`, JSON.stringify({
    code: st, name: STATE_NAMES[st], viewBox: `0 0 ${W} ${H}`, minShare: MIN_SHARE,
    lines: houseDistricts.length ? (redrawn ? { map: '2026', source: redrawn.source, sourceName: redrawn.sourceName }
      : { map: '119th Congress', source: REL('county20', fips), sourceName: 'U.S. Census Bureau, 2020 relationship files, 119th Congress districts' }) : null,
    countySource: COUNTIES,
    counties: countyOut,
    outlines,
  }));
  console.log(`${st}: ${countyOut.length} counties${houseDistricts.length ? `, districts ${houseDistricts.join(', ')}${redrawn ? ' (2026 map)' : ''}` : ''}`);
}

// ---- national ZIP index: every state's ZIPs (to say "no race we cover here" too) ----
for (const [st, fips] of Object.entries(FIPS)) {
  if (raceStates.includes(st)) continue;
  for (const [zip, list] of relationship(fetchOnce(REL('zcta520', fips)), 'GEOID_ZCTA5_20', 'AREALAND_ZCTA5_20')) {
    const share = list.reduce((s, x) => s + x.share, 0);
    if (share >= MIN_SHARE) zipIndex.set(zip, [...(zipIndex.get(zip) ?? []), { st, n: 0, share: Math.round(share * 1000) / 1000 }]);
  }
}
// "MI7:0.7 MI:0.3" = 70% in MI-07 (a district we cover), 30% elsewhere in Michigan. No ":share" = all of it.
const encode = (parts: { st: string; n: number; share: number }[]) =>
  parts.sort((a, b) => b.share - a.share).map((p) => `${p.st}${p.n || ''}${p.share >= 0.995 ? '' : `:${p.share}`}`).join(' ');
const zipsOut = Object.fromEntries([...zipIndex].sort(([a], [b]) => a.localeCompare(b)).map(([z, parts]) => [z, encode(parts)]));
writeFileSync('public/geo/zip-races.json', JSON.stringify(zipsOut));
console.log(`Wrote public/geo/zip-races.json: ${Object.keys(zipsOut).length} ZIPs`);
