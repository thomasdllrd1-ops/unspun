"""Add a poll we checked against its source by hand (e.g. one Wikipedia cites only with a tweet).
usage: python3 add_poll.py '<json>'
json: {"race", "pollster", "field_start", "field_end", "population", "sample_size", "moe", "method", "method_detail",
       "sponsor", "sponsor_type", "sponsor_lean", "released", "notes",
       "source": {"url", "title", "publisher", "type"}, "results": [[candidate_id_or_label, pct], ...]}
Any polls.csv column left out is blank (or 'unknown'/'none' for the tag columns). The poll is saved as checked by the AI."""
import csv, datetime, hashlib, json, os, re, sys
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
a = json.loads(sys.argv[1]); today = datetime.date.today().isoformat()
p = f'{D}/polls/polls.csv'; rows = list(csv.DictReader(open(p))); fields = list(rows[0].keys())
import unicodedata  # same id scheme as import_polls.py, so a later Wikipedia import sees this poll as already added
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()).strip('-')[:40]
pid = f"{slug(a['pollster'])}-{a['field_end']}-{a['race']}"
if any(r['id'] == pid for r in rows): sys.exit(f'{pid} already exists')
allc = json.load(open(f'{D}/candidates.json')); cands = {c['id'] for c in allc if c['race'] == a['race']}
names = {w for c in allc if c['race'] == a['race'] for w in c['id'].split('-')}
for who, _ in a['results']:  # same checks as record_poll_check.py
    if re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)+', who) and who not in cands: sys.exit(f'Not a candidate in {a["race"]}: {who}')
    if who not in cands and who.lower() in names: sys.exit(f'"{who}" is a candidate in this race: use their id')
S = json.load(open(f'{D}/sources.json')); src = a['source']
sid = 'poll-' + hashlib.sha1(src['url'].encode()).hexdigest()[:10]
if not any(x['id'] == sid for x in S): S.append({'id': sid, 'title': src['title'], 'publisher': src['publisher'], 'url': src['url'], 'type': src.get('type', 'pollster'), 'accessed': today})
row = {k: '' for k in fields} | {'sponsor_type': 'unknown', 'sponsor_lean': 'none', 'population': 'unknown', 'method': 'unknown'}
row |= {k: str(v) for k, v in a.items() if k in fields} | {'id': pid, 'source': sid, 'status': 'verified', 'checked_by': 'ai', 'checked_on': today}
rows.append(row)
rp = f'{D}/polls/poll_results.csv'; rr = list(csv.DictReader(open(rp))); rf = list(rr[0].keys())
rr += [{'poll': pid, 'candidate': w if w in cands else '', 'label': '' if w in cands else w, 'pct': str(v)} for w, v in a['results']]
w = csv.DictWriter(open(p, 'w', newline=''), fieldnames=fields); w.writeheader(); w.writerows(rows)
w = csv.DictWriter(open(rp, 'w', newline=''), fieldnames=rf); w.writeheader(); w.writerows(rr)
with open(f'{D}/sources.json', 'w') as f: json.dump(S, f, indent=1, ensure_ascii=False); f.write('\n')
print('added:', pid)
