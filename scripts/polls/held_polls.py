"""List polls waiting on a check, newest first, with their source link and the numbers to confirm.
usage: python3 scripts/polls/held_polls.py [poll_id]"""
import csv, json, os, sys
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
src = {s['id']: s['url'] for s in json.load(open(f'{D}/sources.json'))}
names = {c['id']: c['sort_name'] for c in json.load(open(f'{D}/candidates.json'))}
res = {}
for r in csv.DictReader(open(f'{D}/polls/poll_results.csv')):
    res.setdefault(r['poll'], []).append(f"{names.get(r['candidate'], r['label'])} {r['pct']}")
rows = [r for r in csv.DictReader(open(f'{D}/polls/polls.csv')) if r['status'] != 'verified']
if len(sys.argv) > 1: rows = [r for r in rows if r['id'] == sys.argv[1]]
for r in sorted(rows, key=lambda r: r['field_end'], reverse=True):
    print(f"{r['id']} | {r['race']} | {r['pollster']} | {r['field_start']}..{r['field_end']} | n={r['sample_size']} {r['population']} moe={r['moe']}")
    print(f"   {src.get(r['source'], r['source'])}")
    print(f"   {', '.join(res.get(r['id'], []))}")
