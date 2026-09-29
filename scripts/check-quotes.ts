/**
 * Confirms every quote in data/positions/*.json appears word for word on its source page.
 *
 *   npm run check:quotes              checks quotes still marked "pending"
 *   npm run check:quotes -- va-sen    only one race
 *   npm run check:quotes -- --all     re-checks everything (to catch pages that changed); reports only
 *   npm run check:quotes -- --archive also saves a copy of each page to the Internet Archive
 *
 * Found → status "verified", checked_by "script". Not found → stays "pending" (hidden on the
 * public site) and is listed at the end so a person can look.
 * Pages that only load with JavaScript are opened in headless Google Chrome, if it's installed.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const DATA = join(process.cwd(), 'data');
const args = process.argv.slice(2);
const ALL = args.includes('--all');
const ARCHIVE = args.includes('--archive');
const only = args.filter((a) => !a.startsWith('--'));
const today = new Date().toISOString().slice(0, 10);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

type Checked = { status: string; checked_by: string; checked_on: string; quote: string; heading: string; source: string | null };
type Source = { id: string; url: string; archive_url?: string };

const sourcesFile = join(DATA, 'sources.json');
const sources: Source[] = JSON.parse(readFileSync(sourcesFile, 'utf8'));
const sourceById = new Map(sources.map((s) => [s.id, s]));

// ---- turning a web page into comparable text ------------------------------------

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  ndash: '–', mdash: '—', hellip: '…', eacute: 'é', rsaquo: '›', lsaquo: '‹', middot: '·', bull: '•', copy: '©', reg: '®', trade: '™',
};
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()] ?? m,
  );
/** Block tags (paragraphs, list items…) become a space; inline tags (bold, links…) vanish, as a reader sees them. */
const BLOCK = 'address|article|aside|blockquote|br|button|dd|div|dl|dt|figcaption|figure|footer|form|h[1-6]|header|hr|label|li|main|nav|ol|option|p|section|select|table|tbody|td|th|thead|tr|ul';
const htmlToText = (html: string) =>
  decode(
    html
      .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(new RegExp(`<\\/?(?:${BLOCK})\\b[^>]*>`, 'gi'), ' ')
      .replace(/<[^>]+>/g, ''),
  );
/** Same words, ignoring differences a reader can't see: curly vs straight quotes, dash types, spacing. */
export const normalize = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/­|​/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const pageCache = new Map<string, { plain: string; rendered: string | null }>();

async function fetchPlain(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return '';
    return normalize(htmlToText(await res.text()));
  } catch {
    return '';
  }
}
function fetchRendered(url: string): string | null {
  if (!existsSync(CHROME)) return null;
  try {
    const html = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--virtual-time-budget=8000', `--user-agent=${UA}`, '--dump-dom', url], {
      encoding: 'utf8', timeout: 60_000, maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
    return normalize(htmlToText(html));
  } catch {
    return null;
  }
}
async function pageHas(url: string, quote: string, heading: string): Promise<{ ok: boolean; how: string }> {
  let page = pageCache.get(url);
  if (!page) {
    page = { plain: await fetchPlain(url), rendered: null };
    pageCache.set(url, page);
  }
  const q = normalize(quote);
  const h = normalize(heading).toLowerCase();
  const test = (text: string) => text.includes(q) && (!h || text.toLowerCase().includes(h));
  if (page.plain && test(page.plain)) return { ok: true, how: 'page' };
  if (page.rendered === null) page.rendered = fetchRendered(url) ?? '';
  if (page.rendered && test(page.rendered)) return { ok: true, how: 'page (opened in Chrome)' };
  const text = page.rendered || page.plain;
  if (!text) return { ok: false, how: "couldn't open the page" };
  if (!text.includes(q)) return { ok: false, how: 'quote not found on the page' };
  return { ok: false, how: `heading "${heading}" not found on the page` };
}

async function archive(src: Source) {
  try {
    const res = await fetch(`https://web.archive.org/save/${src.url}`, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(120_000) });
    const loc = res.headers.get('content-location');
    const snap = loc ? `https://web.archive.org${loc}` : res.url.includes('/web/') ? res.url : null;
    if (res.ok && snap) {
      src.archive_url = snap;
      console.log(`  archived ${src.id} → ${snap}`);
    } else console.log(`  couldn't archive ${src.id} (HTTP ${res.status})`);
  } catch (e) {
    console.log(`  couldn't archive ${src.id} (${(e as Error).message})`);
  }
}

// ---- main ---------------------------------------------------------------------

const dir = join(DATA, 'positions');
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json') && (!only.length || only.includes(f.replace(/\.json$/, '')))) : [];
if (!files.length) {
  console.log('No positions files to check.');
  process.exit(0);
}

const problems: string[] = [];
let checked = 0;
let passed = 0;
const usedSources = new Set<string>();

for (const f of files) {
  const path = join(dir, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  console.log(`\n${f}`);
  for (const c of data.candidates) {
    c.looked_at.forEach((id: string) => usedSources.add(id));
    const items: [string, Checked][] = [
      ...c.priorities.map((p: Checked & { rank: number }) => [`priority ${p.rank}`, p] as [string, Checked]),
      ...Object.entries(c.stances as Record<string, Checked & { evidence: string }>).filter(([, s]) => s.evidence !== 'no-position'),
    ];
    for (const [label, item] of items) {
      if (!ALL && item.status === 'verified') continue;
      const src = item.source ? sourceById.get(item.source) : undefined;
      if (!src) {
        problems.push(`${f} ${c.candidate} ${label}: unknown source "${item.source}"`);
        continue;
      }
      checked++;
      const r = await pageHas(src.url, item.quote, item.heading);
      if (r.ok) {
        passed++;
        if (item.status !== 'verified') {
          item.status = 'verified';
          item.checked_by = 'script';
          item.checked_on = today;
        }
        console.log(`  ✓ ${c.candidate} ${label} (${r.how})`);
      } else {
        problems.push(`${f} ${c.candidate} ${label}: ${r.how} (${src.url})`);
        console.log(`  ✗ ${c.candidate} ${label}: ${r.how}`);
      }
    }
  }
  if (!ALL) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

if (ARCHIVE) {
  console.log('\nSaving copies to the Internet Archive…');
  for (const id of usedSources) {
    const src = sourceById.get(id);
    if (src && !src.archive_url) await archive(src);
  }
  writeFileSync(sourcesFile, JSON.stringify(sources, null, 1) + '\n');
}

console.log(`\n${passed} of ${checked} quotes found word for word.`);
if (problems.length) {
  console.log(`\nNeeds a person to look (these stay hidden on the public site):\n  - ${problems.join('\n  - ')}`);
  process.exitCode = 1;
}
