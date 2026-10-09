// REFERENCE ONLY (from the Oct 2026 design handoff). Not run by the site.
// The live maps are built from Census files by scripts/build-us-geo.ts and scripts/build-va-localities.ts.

const fs = require('fs');
const path = require('path');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const round = (s) => s.replace(/(\d+\.\d)\d+/g, '$1');

// ---- U.S. map: states with a 2026 Senate race highlighted ----
const us = require('us-atlas/states-albers-10m.json');
const states = topo.feature(us, us.objects.states).features;
const senate = new Set(['Alabama','Alaska','Arkansas','Colorado','Delaware','Georgia','Idaho','Illinois','Iowa','Kansas','Kentucky','Louisiana','Maine','Massachusetts','Michigan','Minnesota','Mississippi','Montana','Nebraska','New Hampshire','New Jersey','New Mexico','North Carolina','Oklahoma','Oregon','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Virginia','West Virginia','Wyoming','Ohio','Florida']);
const p = d3.geoPath();
let usPaths = '';
for (const f of states) {
  const on = senate.has(f.properties.name);
  const fill = f.properties.name === 'Virginia' ? '#8B1E2D' : on ? '#1B2A47' : '#DCD3BD';
  usPaths += `<path d="${round(p(f))}" fill="${fill}" stroke="#F4EEDF" stroke-width="1"><title>${f.properties.name}</title></path>`;
}
fs.writeFileSync(path.join(out, 'us-senate-2026.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 975 610" role="img" aria-label="Map of the 35 states with a 2026 U.S. Senate race">${usPaths}</svg>`);
console.log('senate states matched:', states.filter(f => senate.has(f.properties.name)).length);

// ---- Virginia map: counties & independent cities, Hampton Roads highlighted ----
const usc = require('us-atlas/counties-albers-10m.json');
const va = topo.feature(usc, usc.objects.counties).features.filter(f => f.id.startsWith('51'));
const hr = new Set(['51810','51710','51550','51740','51800','51650','51700','51093','51095','51199','51830','51735','51073','51115','51175','51620']);
const fc = { type: 'FeatureCollection', features: va };
const vp = d3.geoPath(d3.geoIdentity().reflectY(false).fitExtent([[10, 10], [990, 470]], fc));
let vaPaths = '';
for (const f of va) {
  const fill = hr.has(f.id) ? '#B08D3C' : '#2E4166';
  vaPaths += `<path d="${round(vp(f))}" fill="${fill}" stroke="#1B2A47" stroke-width="0.8"><title>${f.properties.name}</title></path>`;
}
fs.writeFileSync(path.join(out, 'virginia-localities.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" role="img" aria-label="Map of Virginia's counties and independent cities, Hampton Roads highlighted">${vaPaths}</svg>`);
console.log('va localities:', va.length);

// ---- Icons from game-icons.net (CC BY 3.0) ----
const gi = require('@iconify-json/game-icons/icons.json');
const icon = (name, color, file) => {
  const body = gi.icons[name].body.replace(/fill="#fff"/g, `fill="${color}"`).replace(/fill="currentColor"/g, `fill="${color}"`);
  const w = gi.icons[name].width || gi.width || 512, h = gi.icons[name].height || gi.height || 512;
  fs.writeFileSync(path.join(out, file), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g fill="${color}">${body}</g></svg>`);
};
icon('eagle-emblem', '#D4B26A', 'eagle-gold.svg');
icon('stone-bust', '#E8E2D2', 'bust.svg');
icon('capitol', '#D4B26A', 'capitol-gold.svg');
console.log(gi.icons['eagle-emblem'].body.slice(0, 120));
