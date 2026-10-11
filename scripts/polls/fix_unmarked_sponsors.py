"""One-time repair (Oct 11, 2026): polls whose Wikipedia row names a sponsor in a footnote but has no (D)/(R) marker.
The importer used to keep the sponsor only when there was a marker, so e.g. an independent candidate's campaign poll
showed as unsponsored (and counted in the no-partisan-polls average). Rows that already name a sponsor are left alone.
usage: python3 fix_unmarked_sponsors.py <folder with polls_wiki.json + polls_wiki_house.json, freshly parsed> [--write]"""
import csv, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ns = {'__file__': os.path.join(HERE, 'import_polls.py')}
exec(open(ns['__file__']).read().split('cands = json.load')[0].replace("os.environ.get('POLLRUN') or sys.exit('set POLLRUN to the folder holding poll_checks.json')", "''"), ns)
D = ns['D']; run, write = sys.argv[1], '--write' in sys.argv
MEDIA = r'Florida Politics|Nexstar|WCVB|Detroit News|MIRS|Montana Free Press|Telemundo|WPIX|Talk Business|KOB-TV|CNN|USA Today|Boston Globe|Public Broadcasting'
PARTY = {'democratic': 'D', 'republican': 'R'}
cands = json.load(open(f'{D}/candidates.json'))

def lean_of(race, note):  # the party of the candidate the footnote names ("Alme's campaign", "which supports Bodnar")
    for c in cands:
        if c['race'] == race and re.search(r'\b' + re.escape(c['id'].split('-')[-1]) + r'\b', note, re.I):
            return PARTY.get(c.get('party'), 'unknown')
    return 'unknown'

p = f'{D}/polls/polls.csv'
rows = list(csv.DictReader(open(p))); fields = list(rows[0].keys())
bykey = {f"{ns['slug'](r['pollster'])}-{r['field_end']}-{r['race']}": r for r in rows}
for fn in ('polls_wiki.json', 'polls_wiki_house.json'):
    for k, v in json.load(open(os.path.join(run, fn))).items():
        for w in v.get('polls', []):
            note = re.sub(r'\|name=.*$', '', w.get('sponsor_note', '')).strip()
            if not note or re.search(r'\((D|R)\)\s*$', w['pollster']): continue
            name = re.sub(r'\s*\((D|R|I|L)\)\s*$', '', w['pollster']).strip()
            r = bykey.get(f"{ns['slug'](name)}-{ns['dates'](w['dates'])[1]}-{ns['race_of'](k)}")
            if not r or r['sponsor']: continue
            m = re.search(r'(?:sponsored by|conducted (?:on behalf of|for)|commissioned (?:jointly )?by|on behalf of|for) (?:the )?([^,;.]+)', note, re.I)
            sponsor = (m.group(1).strip() if m else note)[:90]
            if re.search(r'campaign', note, re.I): stype, lean = 'campaign', lean_of(r['race'], note)
            elif re.search(MEDIA, note, re.I): stype, lean = 'media', 'none'  # before "supports": a paper's endorsement stays in the note
            elif re.search(r'which supports', note, re.I): stype, lean = 'partisan-aligned', lean_of(r['race'], note)
            elif re.search(r'\bAARP\b', note): stype, lean = 'independent', 'none'
            else: stype, lean = 'unknown', 'none'  # a named group whose leaning we haven't verified
            print(f"{r['status'][:4]}  {r['id']:55} {stype:16} {lean:7} {sponsor}")
            r['sponsor'], r['sponsor_type'], r['sponsor_lean'] = sponsor, stype, lean
            r['notes'] = (r['notes'] + f' Wikipedia footnote: {note}' + ('' if note.endswith('.') else '.')).strip()
if write:
    w = csv.DictWriter(open(p, 'w', newline=''), fieldnames=fields); w.writeheader(); w.writerows(rows)
    print('written')
