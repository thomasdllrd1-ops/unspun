"""Point a poll's source at a new URL (when the original link moved). usage: set_source_url.py <poll_id> <url>"""
import csv, json, os, sys, datetime
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
pid, url = sys.argv[1], sys.argv[2]
sid = next(r['source'] for r in csv.DictReader(open(f'{D}/polls/polls.csv')) if r['id'] == pid)
users = [r['id'] for r in csv.DictReader(open(f'{D}/polls/polls.csv')) if r['source'] == sid]
S = json.load(open(f'{D}/sources.json'))
s = next(x for x in S if x['id'] == sid)
if len(users) > 1: sys.exit(f'source {sid} is shared by {users}; not changing it')
print(s['url'], '->', url)
s['url'], s['accessed'] = url, datetime.date.today().isoformat()
with open(f'{D}/sources.json', 'w') as f: json.dump(S, f, indent=1, ensure_ascii=False); f.write('\n')
