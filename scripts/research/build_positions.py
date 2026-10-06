"""Build data/positions/<race>.json from a spec, copying every quote from the saved page text.

  python3 scripts/research/build_positions.py scripts/research/specs/<race>.py

A spec defines RACE, DATE and C = {candidate_id: {...}}:
  'pages': ['00-home', '02-issues']                         every page we checked (files in .research/sites/<id>/)
  'priorities': [(page, heading, first_words, last_words)]   up to 3, in site order; first_words None = heading only
  'priorities_note': ''                                      required if fewer than 3
  'stances': {issue: (page, heading, first_words, last_words) | None}   None = no position found
  'notes': {issue: 'note'}
  'no_site': 'note', 'looked_at': [source ids]               candidate with no readable website
Quotes are never retyped: they're cut from the saved page between first_words and last_words.
Then run: npm run check:quotes -- <race>
"""
import json, os, re, runpy, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITES = os.path.join(ROOT, '.research', 'sites')
ISSUES = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
spec = runpy.run_path(sys.argv[1])
RACE, DATE, C = spec['RACE'], spec['DATE'], spec['C']
cands = {c['id']: c for c in json.load(open(f'{ROOT}/data/candidates.json'))}
sources = json.load(open(f'{ROOT}/data/sources.json'))
sid = {s['id'] for s in sources}
errors = []


def page_file(cid, page):
    d = os.path.join(SITES, cid)
    m = [f for f in os.listdir(d) if f.startswith(page)]
    if len(m) != 1: raise SystemExit(f'{cid}: page {page} -> {m}')
    return os.path.join(d, m[0])


def load(cid, page):
    raw = open(page_file(cid, page), encoding='utf-8').read()
    head, _, body = raw.partition('\n\n')
    url = re.search(r'^URL: (.+)$', head, re.M).group(1).strip()
    title = (re.search(r'^TITLE: (.*)$', head, re.M) or [None, ''])[1].strip()
    return url, title, re.sub(r'\s+', ' ', body)


def page_title(url, html_title):
    path = urllib.parse.urlparse(url).path.strip('/')
    if not path: return 'Home page'
    t = ': '.join(re.sub(r'\.html?$', '', s).replace('-', ' ').replace('_', ' ') for s in path.split('/') if s)
    t = t[0].upper() + t[1:] + ' page'
    first = re.split(r'\s[|–—-]\s', html_title)[0].strip()  # e.g. "VISION | VOTE MAKIBA GAINES" -> "VISION"
    if re.match(r'^(Blank|Copy of|Page|New page|Doku php)\b', t) and first:
        t = first.capitalize() + ' page'
    return t


def source_for(cid, page):
    url, title, _ = load(cid, page)
    slug = 'home' if page.startswith('00') else re.sub(r'^\d+-', '', os.path.basename(page_file(cid, page))[:-4])[:40].strip('-')
    i = f'{cid}-site-{slug}'
    if i not in sid:
        sources.append({'id': i, 'title': page_title(url, title), 'publisher': f"{cands[cid]['ballot_name']} campaign website",
                        'url': url.replace('http://', 'https://', 1), 'type': 'campaign', 'accessed': DATE})
        sid.add(i)
    return i


def grab(cid, page, heading, start, end):
    _, _, t = load(cid, page)
    if heading and heading.lower() not in t.lower(): errors.append(f'{cid}: heading not on page: {heading!r}')
    if start is None: return ''  # heading only
    i = t.find(start)
    if i < 0: errors.append(f'{cid}: start not found: {start!r}'); return ''
    j = t.find(end, i)
    if j < 0: errors.append(f'{cid}: end not found: {end!r}'); return ''
    q = t[i:j + len(end)].strip()
    if len(q.split()) > 60: errors.append(f'{cid}: {len(q.split())} words (max 60): {q[:80]}')
    return q


def none(note=''):
    return {'evidence': 'no-position', 'heading': '', 'quote': '', 'said_on': '', 'source': None,
            'status': 'verified', 'checked_by': 'ai', 'checked_on': DATE, 'note': note}


pend = {'status': 'pending', 'checked_by': '', 'checked_on': ''}
out = []
for cid, c in C.items():
    if cid not in cands or cands[cid]['race'] != RACE: errors.append(f'{cid}: not in {RACE}'); continue
    notes = c.get('notes', {})
    entry = {'candidate': cid, 'researched_on': DATE, 'researched_by': 'ai'}
    if 'no_site' in c:
        out.append({**entry, 'looked_at': c['looked_at'], 'priorities_note': c['no_site'], 'priorities': [],
                    'stances': {k: none(notes.get(k, '')) for k in ISSUES}})
        continue
    pri = [{'rank': n, 'heading': h, 'quote': grab(cid, p, h, a, b), 'source': source_for(cid, p), **pend}
           for n, (p, h, a, b) in enumerate(c['priorities'], 1)]
    st = {}
    for k in ISSUES:
        if k not in c['stances']: errors.append(f'{cid}: no entry for {k}'); continue
        v = c['stances'][k]
        if v is None: st[k] = none(notes.get(k, '')); continue
        p, h, a, b = v
        st[k] = {'evidence': 'website', 'heading': h, 'quote': grab(cid, p, h, a, b), 'said_on': '',
                 'source': source_for(cid, p), **pend, 'note': notes.get(k, '')}
    out.append({**entry, 'looked_at': [source_for(cid, p) for p in c['pages']],
                'priorities_note': c.get('priorities_note', ''), 'priorities': pri, 'stances': st})

missing = [i for i, c in cands.items() if c['race'] == RACE and i not in C]
if missing: errors.append(f'missing candidates: {missing}')
if errors: sys.exit('ERRORS:\n  ' + '\n  '.join(errors))
out.sort(key=lambda e: (cands[e['candidate']]['sort_name'], cands[e['candidate']]['ballot_name']))
with open(f'{ROOT}/data/positions/{RACE}.json', 'w') as f:
    json.dump({'race': RACE, 'candidates': out}, f, indent=2, ensure_ascii=False); f.write('\n')
with open(f'{ROOT}/data/sources.json', 'w') as f:
    json.dump(sources, f, indent=1, ensure_ascii=False); f.write('\n')
for e in out:
    print(e['candidate'], '| priorities', [p['heading'] for p in e['priorities']],
          '| found', [k for k, v in e['stances'].items() if v['evidence'] != 'no-position'])
