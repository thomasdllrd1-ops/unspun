"""Turn poll_checks.json (Wikipedia leads + automatic source check) into data/polls rows."""
import json, csv, re, hashlib, sys, unicodedata
from urllib.parse import urlparse
S = '/private/tmp/claude-501/-Users-thomasdillard-Documents-unspun/ed9b92f3-1f40-47d4-a497-db20b912688b/scratchpad'
D = '/Users/thomasdillard/Documents/unspun/data'
DRY = '--dry' in sys.argv
TODAY = '2026-09-25'
AB = {"Alabama":"al","Alaska":"ak","Arkansas":"ar","Colorado":"co","Delaware":"de","Florida":"fl","Georgia":"ga","Idaho":"id","Illinois":"il","Iowa":"ia","Kansas":"ks","Kentucky":"ky","Louisiana":"la","Maine":"me","Massachusetts":"ma","Michigan":"mi","Minnesota":"mn","Mississippi":"ms","Montana":"mt","Nebraska":"ne","New_Hampshire":"nh","New_Jersey":"nj","New_Mexico":"nm","North_Carolina":"nc","Ohio":"oh","Oklahoma":"ok","Oregon":"or","Rhode_Island":"ri","South_Carolina":"sc","South_Dakota":"sd","Tennessee":"tn","Texas":"tx","West_Virginia":"wv","Wyoming":"wy"}
MONTHS = {m: i for i, m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'], 1)}
def race_of(key):
    if key.endswith('.wiki'):
        kind, st = key[:-5].split('_', 1)
        return f"{AB[st]}-sen" + ('-special' if kind == 'sen-special' else '')
    return key
def dates(s):
    s = s.replace('–', '-').replace('—', '-').replace(' - ', '-')
    m = re.match(r'^([A-Z][a-z]+) (\d{1,2})(?:-(?:([A-Z][a-z]+) )?(\d{1,2}))?, (\d{4})$', s.strip())
    if not m: return '', ''
    m1, d1, m2, d2, y = m.groups()
    if m1 not in MONTHS or (m2 and m2 not in MONTHS): return '', ''
    start = f"{y}-{MONTHS[m1]:02d}-{int(d1):02d}"
    end = f"{y}-{MONTHS[m2 or m1]:02d}-{int(d2 or d1):02d}"
    return start, end
def sample(s):
    m = re.match(r'^([\d,]+)?\s*\((LV|RV|A|V)\)', s.strip())
    if not m: return None, 'unknown'
    n = int(m.group(1).replace(',', '')) if m.group(1) else None
    return n, {'V': 'unknown'}.get(m.group(2), m.group(2))
def moe(s):
    m = re.search(r'(\d+(?:\.\d+)?)', s or ''); return float(m.group(1)) if m and '±' in (s or '') else None
def strip_accents(s): return ''.join(ch for ch in unicodedata.normalize('NFD', s) if unicodedata.category(ch) != 'Mn')
def slug(s): return re.sub(r'[^a-z0-9]+', '-', strip_accents(s).lower()).strip('-')[:40]

cands = json.load(open(f'{D}/candidates.json'))
by_race = {}
for c in cands: by_race.setdefault(c['race'], []).append(c)
sources = json.load(open(f'{D}/sources.json')); src_ids = {s['id'] for s in sources}
pollsters = json.load(open(f'{D}/pollsters.json')); pollster_names = {p['name'] for p in pollsters}
fte = list(csv.DictReader(open('/Users/thomasdillard/Documents/unspun/data/raw/pollster-ratings-combined.csv')))
fte_by = {r['pollster'].lower(): int(r['pollster_rating_id']) for r in fte}
polls_f = list(csv.DictReader(open(f'{D}/polls/polls.csv'))); fields = list(polls_f[0].keys())
res_f = list(csv.DictReader(open(f'{D}/polls/poll_results.csv'))); rfields = list(res_f[0].keys())
existing = {p['id'] for p in polls_f}
NEWS = ('nytimes','politico','washingtonpost','wsj','cnn','foxnews','nbcnews','abcnews','cbsnews','apnews','axios','thehill','punchbowl','detroitnews','carolinajournal','nbc4i','jamesmagazinega','reuters','bloomberg','usatoday','newsweek')
checks = json.load(open(f'{S}/poll_checks.json'))
added = pending = verified = skipped = 0
for p in checks:
    race = race_of(p['race'])
    if race not in by_race or race == 'va-sen': skipped += 1; continue
    marker = p.get('partisan')
    name = re.sub(r'\s*\((D|R|I|L)\)\s*$', '', p['pollster']).strip()
    start, end = dates(p['dates'])
    n, pop = sample(p['sample'])
    if not end: skipped += 1; continue
    pid = f"{slug(name)}-{end}-{race}"
    k = 2
    while pid in existing: pid = f"{slug(name)}-{end}-{race}-{k}"; k += 1
    existing.add(pid)
    url = (p['check_url'] if p['check'] == 'script-verified' else (p['urls'][0] if p['urls'] else None))
    if not url: skipped += 1; continue
    if url.startswith('http://'):
        # upgrade to https when the secure version works; otherwise skip (we only link https sources)
        import subprocess
        alt = 'https://' + url[len('http://'):]
        code = subprocess.run(['curl', '-sSL', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', '-A', 'Mozilla/5.0', alt], capture_output=True, text=True).stdout
        if code.startswith('2'): url = alt
        else: skipped += 1; continue
    sid = 'poll-' + hashlib.sha1(url.encode()).hexdigest()[:10]
    if sid not in src_ids:
        host = urlparse(url).netloc.replace('www.', '')
        sources.append({'id': sid, 'title': f"{name} poll, {p['dates']}", 'publisher': host, 'url': url, 'type': 'news' if any(x in host for x in NEWS) else 'pollster', 'accessed': TODAY})
        src_ids.add(sid)
    note = p.get('sponsor_note', '')
    sponsor, stype, lean = '', 'unknown', 'none'
    if marker in ('D', 'R'):
        lean = marker
        stype = 'campaign' if re.search(r'campaign', note, re.I) else 'party' if re.search(r'\b(DSCC|NRSC|DCCC|NRCC|DNC|RNC|Democratic Party|Republican Party)\b', note) else 'partisan-aligned'
        m = re.search(r'(?:sponsored by|conducted (?:on behalf of|for)|commissioned by|on behalf of|for) (?:the )?([^.,;]+)', note, re.I)
        sponsor = (m.group(1).strip() if m else note)[:90]
    elif marker == 'I':
        stype, lean = 'campaign', 'unknown'
    ok = p['check'] == 'script-verified'
    notes = []
    if marker: notes.append(f"Wikipedia marks this as a {'Democratic' if marker=='D' else 'Republican' if marker=='R' else 'third-party'}-sponsored poll{': ' + note if note else '.'}")
    if p.get('other_versions'): notes.append('The pollster also reported other versions (for example registered voters); we show the first one listed.')
    if not ok: notes.append('Found via Wikipedia. Not yet checked against the original source.')
    row = {'id': pid, 'race': race, 'pollster': name, 'sponsor': sponsor, 'sponsor_type': stype, 'sponsor_lean': lean, 'population': pop,
           'sample_size': n or '', 'moe': moe(p['moe']) or '', 'method': 'unknown', 'method_detail': '', 'field_start': start, 'field_end': end,
           'released': '', 'source': sid, 'status': 'verified' if ok else 'pending', 'checked_by': 'script' if ok else '', 'checked_on': TODAY if ok else '',
           'notes': ' '.join(notes)}
    polls_f.append(row); added += 1; verified += ok; pending += (not ok)
    if name not in pollster_names:
        fid = fte_by.get(name.lower())
        pollsters.append({'id': slug(name), 'name': name, 'url': None, 'fte_id': fid, 'track_record': None, 'track_record_note': '' if fid else 'No FiveThirtyEight grade found under this exact name.'})
        pollster_names.add(name)
    rc = by_race[race]
    for col, pct in zip(p['cols'], p['pcts']):
        v = re.search(r'(\d+(?:\.\d+)?)', pct or '')
        if not v: continue
        label = re.sub(r'\s*\([^)]*\)\s*$', '', re.sub(r'^width=\S+\|\s*', '', col)).strip()
        if re.match(r'(?i)margin', label): continue
        ALIAS = {'Dan S. Sullivan': 'dan-sullivan', 'Dan J. Sullivan': 'daniel-sullivan', 'Mike Bouchard Jr.': 'michael-bouchard'}
        base = re.sub(r',?\s+(Jr\.?|Sr\.?|II|III|IV)$', '', label)
        last = strip_accents(base.split()[-1]).lower() if base else ''
        if label in ALIAS: hit = [c for c in rc if c['id'] == ALIAS[label]]
        elif re.match(r'(?i)^(other|undecided)', label): hit = []
        else: hit = [c for c in rc if strip_accents(c['sort_name'].split()[-1]).lower() == last]
        res_f.append({'poll': pid, 'candidate': hit[0]['id'] if len(hit) == 1 else '', 'label': '' if len(hit) == 1 else label, 'pct': v.group(1)})
if not DRY:
    w = csv.DictWriter(open(f'{D}/polls/polls.csv','w',newline=''), fieldnames=fields); w.writeheader(); w.writerows(polls_f)
    w = csv.DictWriter(open(f'{D}/polls/poll_results.csv','w',newline=''), fieldnames=rfields); w.writeheader(); w.writerows(res_f)
    json.dump(sources, open(f'{D}/sources.json','w'), indent=2, ensure_ascii=False)
    json.dump(pollsters, open(f'{D}/pollsters.json','w'), indent=2, ensure_ascii=False)
print(f"added {added} polls ({verified} verified by script, {pending} pending), skipped {skipped}", '(dry run)' if DRY else '')
