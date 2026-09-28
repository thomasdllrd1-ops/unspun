// Fetch each poll's cited source and check that the numbers really appear there.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const CACHE = 'pollcache';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const sen = JSON.parse(readFileSync('polls_wiki.json', 'utf8'));
const house = JSON.parse(readFileSync('polls_wiki_house.json', 'utf8'));
const all = [];
for (const [k, v] of Object.entries(sen)) for (const p of v.polls ?? []) all.push({ race: k, ...p });
for (const [k, v] of Object.entries(house)) for (const p of v.polls ?? []) all.push({ race: k, ...p });

const hash = (u) => createHash('sha1').update(u).digest('hex').slice(0, 16);
function fetchText(url) {
  const f = `${CACHE}/${hash(url)}`;
  if (existsSync(`${f}.txt`)) return readFileSync(`${f}.txt`, 'utf8');
  if (existsSync(`${f}.fail`)) return null;
  try {
    const out = execFileSync('curl', ['-sSL', '-A', UA, '--max-time', '25', '-o', `${f}.bin`, '-w', '%{http_code} %{content_type}', url], { encoding: 'utf8' });
    const [code, type] = out.split(' ');
    if (!code.startsWith('2')) { writeFileSync(`${f}.fail`, out); return null; }
    let text;
    const buf = readFileSync(`${f}.bin`);
    if ((type || '').includes('pdf') || buf.subarray(0, 4).toString() === '%PDF') {
      execFileSync('pdftotext', ['-layout', `${f}.bin`, `${f}.pdftxt`]);
      text = readFileSync(`${f}.pdftxt`, 'utf8');
    } else {
      text = buf.toString('utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, "'").replace(/&amp;/g, '&');
    }
    text = text.replace(/\s+/g, ' ');
    writeFileSync(`${f}.txt`, text);
    return text;
  } catch (e) { writeFileSync(`${f}.fail`, String(e)); return null; }
}
const num = (s) => { const m = String(s || '').match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : null; };
const lastName = (col) => col.replace(/\s*\([^)]*\)\s*$/, '').replace(/^width=\S+\|\s*/, '').replace(/,? Jr\.?$/, '').trim().split(' ').at(-1);
function nearby(text, name, value) {
  if (value == null) return false;
  const v = String(value).replace(/\.0$/, '');
  const re = new RegExp(`(?<![\\d.])${v.replace('.', '\\.')}(?:\\.0)?\\s*(?:%|percent|pct)?(?![\\d])`, 'g');
  const lower = text.toLowerCase(); const ln = name.toLowerCase();
  let i = lower.indexOf(ln);
  while (i !== -1) {
    // the number must come right after the name (tables, "Name ... 48%") or just before it ("48% Name")
    const after = text.slice(i + ln.length, i + ln.length + 200);
    const before = text.slice(Math.max(0, i - 30), i);
    re.lastIndex = 0; if (re.test(after)) return true;
    re.lastIndex = 0; if (re.test(before)) return true;
    i = lower.indexOf(ln, i + 1);
  }
  return false;
}
const results = [];
let n = 0;
for (const p of all) {
  n++;
  const cands = p.cols.map((c, i) => ({ col: c, pct: num(p.pcts[i]) })).filter((c) => !/^(other|undecided|margin)/i.test(c.col) && c.pct != null);
  const top2 = [...cands].sort((a, b) => b.pct - a.pct).slice(0, 2);
  const sampleN = num((p.sample || '').replace(/,/g, ''));
  let status = 'no-source', detail = '';
  for (const url of p.urls) {
    const text = fetchText(url);
    if (!text) { status = status === 'no-source' ? 'unreachable' : status; detail = url; continue; }
    const pctOk = top2.length === 2 && top2.every((c) => nearby(text, lastName(c.col), c.pct));
    const nOk = sampleN ? new RegExp(`(?<![\\d,])${sampleN.toLocaleString('en-US').replace(/,/g, ',?')}(?![\\d])`).test(text) : false;
    if (pctOk && nOk) { status = 'script-verified'; detail = url; break; }
    status = pctOk ? 'numbers-found-sample-missing' : 'numbers-not-found'; detail = url;
  }
  results.push({ ...p, check: status, check_url: detail, top2: top2.map((c) => [lastName(c.col), c.pct]) });
  if (n % 25 === 0) console.error(`${n}/${all.length}`);
}
writeFileSync('poll_checks.json', JSON.stringify(results, null, 1));
const tally = results.reduce((t, r) => ((t[r.check] = (t[r.check] || 0) + 1), t), {});
console.log('total', results.length, tally);
