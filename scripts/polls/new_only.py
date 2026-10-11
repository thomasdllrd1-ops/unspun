"""Drop polls we already have from polls_wiki.json / polls_wiki_house.json, so only new ones get source-checked.
usage (inside the run folder): python3 new_only.py"""
import csv, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ns = {'__file__': os.path.join(HERE, 'import_polls.py')}
src = open(ns['__file__']).read().split('cands = json.load')[0]  # the importer's helpers: race_of, dates, slug
exec(src.replace("os.environ.get('POLLRUN') or sys.exit('set POLLRUN to the folder holding poll_checks.json')", "''"), ns)
polls = list(csv.DictReader(open(os.path.join(ns['D'], 'polls', 'polls.csv'))))
have = {p['id'] for p in polls} | {f"{ns['slug'](p['pollster'])}-{p['field_end']}-{p['race']}" for p in polls}

def is_new(key, p):
    name = re.sub(r'\s*\((D|R|I|L)\)\s*$', '', p['pollster']).strip()
    end = ns['dates'](p['dates'])[1]
    return bool(end) and f"{ns['slug'](name)}-{end}-{ns['race_of'](key)}" not in have

total = new = 0
for fn in ('polls_wiki.json', 'polls_wiki_house.json'):
    d = json.load(open(fn))
    for k, v in d.items():
        total += len(v.get('polls', []))
        v['polls'] = [p for p in v.get('polls', []) if is_new(k, p)]
        new += len(v['polls'])
    json.dump(d, open(fn, 'w'), indent=1, ensure_ascii=False)
print(f'{total} polls on Wikipedia, {new} new')
