"""Point a poll's source at a new URL (when the original link moved; a source shared with other polls is split off). usage: set_source_url.py <poll_id> <url>"""
import csv, json, os, sys, datetime, hashlib
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
pid, url = sys.argv[1], sys.argv[2]
sid = next(r['source'] for r in csv.DictReader(open(f'{D}/polls/polls.csv')) if r['id'] == pid)
users = [r['id'] for r in csv.DictReader(open(f'{D}/polls/polls.csv')) if r['source'] == sid]
S = json.load(open(f'{D}/sources.json'))
s = next(x for x in S if x['id'] == sid)
today = datetime.date.today().isoformat()
if len(users) > 1:  # shared by other polls: give this poll its own source entry (same id scheme as import_polls.py)
    nid = 'poll-' + hashlib.sha1(url.encode()).hexdigest()[:10]
    if not any(x['id'] == nid for x in S): S.append({**s, 'id': nid, 'url': url, 'accessed': today})
    rows = list(csv.DictReader(open(f'{D}/polls/polls.csv'))); f = list(rows[0].keys())
    for r in rows:
        if r['id'] == pid: r['source'] = nid
    w = csv.DictWriter(open(f'{D}/polls/polls.csv', 'w', newline=''), fieldnames=f); w.writeheader(); w.writerows(rows)
    print(f'{pid}: new source {nid} (old {sid} still used by {[u for u in users if u != pid]})', '->', url)
else:
    print(s['url'], '->', url)
    s['url'], s['accessed'] = url, today
with open(f'{D}/sources.json', 'w') as f: json.dump(S, f, indent=1, ensure_ascii=False); f.write('\n')
