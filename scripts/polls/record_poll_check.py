"""Mark a poll as checked by the AI assistant, optionally correcting fields/results to match the source.
usage: python3 upd.py <poll_id> '<json>'   json keys: fields{...}, results[[candidate_id_or_label, pct], ...], note"""
import csv, json, os, sys
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')  # repo/data, wherever the repo lives
pid, ch = sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
p=f'{D}/polls/polls.csv'; rows=list(csv.DictReader(open(p))); f=list(rows[0].keys())
row=next(r for r in rows if r['id']==pid)
for k,v in ch.get('fields',{}).items(): row[k]=str(v)
row['status']='verified'; row['checked_by']='ai'; row['checked_on']='2026-09-27'
notes=[n for n in row['notes'].split('  ') if 'Not yet checked against the original source' not in n]
row['notes']=' '.join(x.replace('Found via Wikipedia. Not yet checked against the original source.','').strip() for x in notes).strip()
if ch.get('note'): row['notes']=(row['notes']+' '+ch['note']).strip()
w=csv.DictWriter(open(p,'w',newline=''),fieldnames=f); w.writeheader(); w.writerows(rows)
if 'results' in ch:
    rp=f'{D}/polls/poll_results.csv'; rr=list(csv.DictReader(open(rp))); rf=list(rr[0].keys())
    cands={c['id'] for c in json.load(open(f'{D}/candidates.json'))}
    rr=[r for r in rr if r['poll']!=pid]
    import re as _re
    for who,pct in ch['results']:
        # anything that looks like a candidate id (lowercase-with-dashes) must exist, so typos can't slip in as labels
        if _re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)+', who) and who not in cands:
            raise SystemExit(f'Unknown candidate id: {who}')
        rr.append({'poll':pid,'candidate':who if who in cands else '','label':'' if who in cands else who,'pct':str(pct)})
    w=csv.DictWriter(open(rp,'w',newline=''),fieldnames=rf); w.writeheader(); w.writerows(rr)
print('checked:', pid)
