import re, json, sys
sys.path.insert(0, '.')
exec(open('parse_polls.py').read().split("out = {}")[0])  # reuse helpers
T = {"az-01":("Arizona",1),"az-06":("Arizona",6),"co-08":("Colorado",8),"fl-14":("Florida",14),"fl-25":("Florida",25),"ia-01":("Iowa",1),"ia-03":("Iowa",3),"mi-07":("Michigan",7),"mi-10":("Michigan",10),"ny-17":("New_York",17),"oh-07":("Ohio",7),"oh-09":("Ohio",9),"pa-07":("Pennsylvania",7),"pa-08":("Pennsylvania",8),"pa-10":("Pennsylvania",10),"tx-34":("Texas",34),"wa-03":("Washington",3),"wi-03":("Wisconsin",3)}
out = {}
for race, (st, n) in T.items():
    t = open(f'stwiki/{st}.wiki').read()
    refs = named_refs(t)
    d = re.search(r'\n==\s*District ' + str(n) + r'\s*==\s*\n(.*?)(?=\n==\s*District |\n==[^=]|\Z)', t, re.S)
    if not d: out[race] = {'error': 'district section not found'}; continue
    sec = d.group(1)
    g = re.search(r'\n===\s*General election\s*===\s*\n(.*?)(?=\n===[^=]|\Z)', sec, re.S)
    if not g: out[race] = {'polls': [], 'note': 'no general election subsection'}; continue
    p = re.search(r'\n====+\s*Polling\s*====+\s*\n(.*?)(?=\n====?[^=]|\Z)', g.group(1), re.S)
    if not p: out[race] = {'polls': [], 'note': 'no polling'}; continue
    body = p.group(1).split('{{hidden begin')[0]
    polls = []
    for tb in re.findall(r'\{\|.*?\n\|\}', body, re.S):
        got = parse_table(tb, refs)
        if got is not None: polls = got; break
    out[race] = {'polls': polls}
json.dump(out, open('polls_wiki_house.json', 'w'), indent=1, ensure_ascii=False)
for r, v in out.items():
    ps = v.get('polls', [])
    print(f"{r}: {len(ps)} polls" + (f"  cols={ps[0]['cols']}" if ps else f"  {v.get('note') or v.get('error','')}"))
