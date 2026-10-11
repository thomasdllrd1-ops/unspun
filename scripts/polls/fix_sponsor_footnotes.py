"""One-time repair (Oct 10, 2026): polls imported from Wikipedia whose sponsor reads "name=X".
Wikipedia defines a footnote once ({{efn|name=X|text}}) and reuses it as {{efn|name=X}}; the old parser kept
the label instead of the text. This re-reads each race's article (raw wikitext), looks up the footnote text,
and redoes sponsor / sponsor_type / the Wikipedia note with the same rules as import_polls.py.
usage: python3 fix_sponsor_footnotes.py <cache_dir> [--write]"""
import csv, json, os, re, sys, urllib.parse, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_wikipedia_polls import named_efns
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
cache, write = sys.argv[1], '--write' in sys.argv
states = {r['id']: r['state'] for r in json.load(open(f'{D}/races.json'))}
NAMES = {'AL':'Alabama','AK':'Alaska','AR':'Arkansas','AZ':'Arizona','CO':'Colorado','DE':'Delaware','FL':'Florida','GA':'Georgia','ID':'Idaho','IL':'Illinois','IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi','MT':'Montana','NE':'Nebraska','NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NY':'New York','NC':'North Carolina','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','PA':'Pennsylvania','RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee','TX':'Texas','VA':'Virginia','WA':'Washington','WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'}

def article(race):
    st = NAMES[states[race]]
    if race.endswith('-sen-special'): return f'2026 United States Senate special election in {st}'
    if race.endswith('-sen'): return f'2026 United States Senate election in {st}'
    return f'2026 United States House of Representatives elections in {st}'

def wikitext(title):
    f = os.path.join(cache, re.sub(r'\W+', '_', title) + '.wiki')
    if not os.path.exists(f):
        url = 'https://en.wikipedia.org/w/index.php?' + urllib.parse.urlencode({'title': title, 'action': 'raw'})
        subprocess.run(['curl', '-sSL', '--max-time', '60', '-A', 'UnspunBot/1.0 (election tracker; contact via GitHub)', '-o', f, url], check=True)
    return open(f).read()

def sponsor_fields(note, lean):  # same rules as import_polls.py
    stype = 'campaign' if re.search(r'campaign', note, re.I) else 'party' if re.search(r'\b(DSCC|NRSC|DCCC|NRCC|DNC|RNC|Democratic Party|Republican Party)\b', note) else 'partisan-aligned'
    m = re.search(r'(?:sponsored by|conducted (?:on behalf of|for)|commissioned by|on behalf of|for) (?:the )?([^.,;]+)', note, re.I)
    return (m.group(1).strip() if m else note)[:90], stype

p = f'{D}/polls/polls.csv'
rows = list(csv.DictReader(open(p))); fields = list(rows[0].keys())
missing = 0
for r in rows:
    m = re.match(r'^name=\s*(.+)$', r['sponsor'])
    if not m: continue
    label = m.group(1).strip()
    text = named_efns(wikitext(article(r['race']))).get(label)
    if not text:
        missing += 1; print(f"NOT FOUND  {r['id']}  label={label!r}"); continue
    sponsor, stype = sponsor_fields(text, r['sponsor_lean'])
    print(f"{r['status'][:4]}  {r['id']}\n      {label!r} -> {text!r}\n      sponsor={sponsor!r} type={stype}")
    r['sponsor'], r['sponsor_type'] = sponsor, stype
    r['notes'] = r['notes'].replace(f'name={label}', text).replace(f'name= {label}', text)
print(f'{missing} labels not found')
if write:
    w = csv.DictWriter(open(p, 'w', newline=''), fieldnames=fields); w.writeheader(); w.writerows(rows)
    print('written')
