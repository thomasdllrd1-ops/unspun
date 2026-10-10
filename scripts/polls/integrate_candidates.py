"""Merge verified candidate lists + staged races/ratings/results/polls into /data.
Run from anywhere: python3 integrate.py [--dry]"""
import csv, glob, hashlib, json, os, re, sys, unicodedata
S = '/private/tmp/claude-501/-Users-thomasdillard-Documents-unspun/ed9b92f3-1f40-47d4-a497-db20b912688b/scratchpad'
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')  # repo/data, wherever the repo lives
DRY = '--dry' in sys.argv
TODAY = '2026-09-25'

def load(p): return json.load(open(p))
verified = load(f'{S}/official/verified.json')
for g in sorted(glob.glob(f'{S}/official/group*.json')): verified.update(load(g))
races_new = load(f'{S}/races_new.json')
wiki_sen = {x['state'].replace(' (special)', ''): x for x in load(f'{S}/senate_summary.json')}
wiki_house = load(f'{S}/house_candidates_wiki.json')

sources = load(f'{D}/sources.json'); src_ids = {s['id'] for s in sources}
parties = load(f'{D}/parties.json'); party_ids = {p['id'] for p in parties}
candidates = load(f'{D}/candidates.json'); cand_ids = {c['id'] for c in candidates}
races = load(f'{D}/races.json'); race_ids = {r['id'] for r in races}

NAMES = {"AL":"Alabama","AK":"Alaska","AR":"Arkansas","AZ":"Arizona","CO":"Colorado","DE":"Delaware","FL":"Florida","GA":"Georgia","ID":"Idaho","IL":"Illinois","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MT":"Montana","NE":"Nebraska","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","VA":"Virginia"}

# ---- parties ------------------------------------------------------------------
PARTY_ALIASES = {'democrat':'democratic','dem':'democratic','republican-party':'republican','rep':'republican','lib':'libertarian','ind':'independent','no-party':'independent','nonpartisan':'independent','unaffiliated':'independent','no-party-affiliation':'no-party-affiliation','dfl':'democratic-farmer-labor','minnesota-democratic-farmer-labor':'democratic-farmer-labor','democratic-farmer-labor-party':'democratic-farmer-labor','green-party':'green','libertarian-party':'libertarian','socialist-workers-party':'socialist-workers'}
BLOC = {'democratic':'D','democratic-farmer-labor':'D','republican':'R'}
PRETTY = {'democratic-farmer-labor':'Democratic-Farmer-Labor','us-taxpayers':'U.S. Taxpayers','by-petition':'By Petition','legal-marijuana-now':'Legal Marijuana Now','end-the-corruption':'End the Corruption!','party-for-socialism-and-liberation':'Party for Socialism and Liberation','no-party-affiliation':'No Party Affiliation','approval-voting':'Approval Voting','nebraska-working-people':'Nebraska Working People','america-first':'America First','working-class':'Working Class','natural-law':'Natural Law','socialist-workers':'Socialist Workers','pacific-green':'Pacific Green','working-families':'Working Families','forward':'Forward','unity':'Unity','constitution':'Constitution','green':'Green','conservative':'Conservative'}
def party_id(raw):
    p = re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')
    p = PARTY_ALIASES.get(p, p)
    if p not in party_ids:
        name = PRETTY.get(p, p.replace('-', ' ').title())
        parties.append({'id': p, 'name': name, 'abbr': {'democratic-farmer-labor':'D'}.get(p, name[0]), 'color': 'dem' if BLOC.get(p)=='D' else 'rep' if BLOC.get(p)=='R' else 'other', **({'bloc': BLOC[p]} if p in BLOC else {})})
        party_ids.add(p)
    return p

# ---- names ----------------------------------------------------------------------
SUFFIX = r'(,?\s+(Jr\.?|Sr\.?|II|III|IV))$'
def strip_accents(s): return ''.join(ch for ch in unicodedata.normalize('NFD', s) if unicodedata.category(ch) != 'Mn')
SORT_OVERRIDE = {'Taner E. Demirci Lopez':'Demirci Lopez','Christina Bertrand Hines':'Hines','Marie Gluesenkamp Perez':'Gluesenkamp Perez','Sarah Trone Garriott':'Trone Garriott','Ben Ray Luján':'Luján','Shelley Moore Capito':'Capito','Cindy Hyde-Smith':'Hyde-Smith',"N'Kiyla Jasmine Thomas":'Thomas','Debbie Wasserman Schultz':'Wasserman Schultz','Rachel Fetty Anderson':'Fetty Anderson'}
def sort_name(n):
    if n in SORT_OVERRIDE: return SORT_OVERRIDE[n]
    x = re.sub(r'"[^"]*"|“[^”]*”', '', n); x = re.sub(SUFFIX, '', x.strip())
    return x.split()[-1]
def slug(n):
    x = re.sub(r'"[^"]*"|“[^”]*”', '', strip_accents(n)); x = re.sub(SUFFIX, '', x.strip())
    parts = [p for p in x.split() if not re.fullmatch(r'[A-Z]\.', p)]
    return re.sub(r'[^a-z0-9]+', '-', ' '.join(parts).lower()).strip('-')
def unique_id(base, state):
    i = base
    if i in cand_ids: i = f'{base}-{state.lower()}'
    n = 2
    while i in cand_ids: i = f'{base}-{state.lower()}-{n}'; n += 1
    cand_ids.add(i); return i

# ---- incumbents (official: senate.gov class lists, House Clerk member data) ------
SEN_INC = {'AL':'Tuberville','AK':'Sullivan','AR':'Cotton','CO':'Hickenlooper','DE':'Coons','GA':'Ossoff','ID':'Risch','IL':'Durbin','IA':'Ernst','KS':'Marshall','KY':'McConnell','LA':'Cassidy','ME':'Collins','MA':'Markey','MI':'Peters','MN':'Smith','MS':'Hyde-Smith','MT':'Daines','NE':'Ricketts','NH':'Shaheen','NJ':'Booker','NM':'Luján','NC':'Tillis','OK':'Armstrong','OR':'Merkley','RI':'Reed','SC':'Graham','SD':'Rounds','TN':'Hagerty','TX':'Cornyn','WV':'Capito','WY':'Lummis','FL':'Moody','OH':'Husted'}
HOUSE_INC = {'az-01':'Schweikert','az-06':'Ciscomani','co-08':'Evans','fl-14':'Castor','fl-25':'Wasserman Schultz','ia-01':'Miller-Meeks','ia-03':'Nunn','mi-07':'Barrett','mi-10':'James','ny-17':'Lawler','oh-07':'Miller','oh-09':'Kaptur','pa-07':'Mackenzie','pa-08':'Bresnahan','pa-10':'Perry','tx-34':'Gonzalez','wa-03':'Gluesenkamp Perez','wi-03':'Van Orden'}
OTHER_MEMBER = {('fl-25','Moskowitz'): "Currently the U.S. Representative for Florida's 23rd District (House Clerk member list, Sep 2, 2026)."}

NAME_NOTES = {}
for _v in verified.values(): NAME_NOTES.update(_v.get('name_notes', {}))
PRETTY.update({'other-party-candidate': 'Other-party candidate', 'american-center': 'American Center', 'kentucky': 'Kentucky Party', 'progressive': 'Progressive', 'no-party': 'No Party'})

def official_source(st, v):
    sid = f'official-{st.lower()}-2026'
    if sid not in src_ids:
        sources.append({'id': sid, 'title': v.get('source_title') or f'{NAMES[st]} 2026 general election candidate list', 'publisher': v['publisher'], 'url': v['source_url'], 'type': 'official', 'accessed': TODAY})
        src_ids.add(sid)
    return sid

WIKI_SEN_SRC = 'wikipedia-senate-2026'
report = []
def add_cands(race, lst, src, st, inc_last, extra_note=None):
    for item in lst:
        name, party = item[0], item[1]
        flag = item[2] if len(item) > 2 else None
        cid = unique_id(slug(name), st)
        sn = sort_name(name)
        inc = inc_last is not None and strip_accents(sn).lower() == strip_accents(inc_last).lower()
        c = {'id': cid, 'race': race['id'], 'ballot_name': name, 'sort_name': sn, 'party': party_id(party.split('+')[0]), 'incumbent': inc, 'website': None, 'fec_id': None, 'source': src}
        if '+' in party: c['party_lines'] = [party_id(p) for p in party.split('+')]
        note = OTHER_MEMBER.get((race['id'], sn)) or NAME_NOTES.get(name)
        if note: c['note'] = note
        candidates.append(c)

for race in races_new:
    if race['id'] in race_ids: continue
    st = race['state']
    v = verified.get(st, {})
    if race['chamber'] == 'senate':
        inc_last = SEN_INC.get(st)
        if v.get('status') in ('verified', 'partial') and v.get('sen'):
            src = official_source(st, v)
            race['source'] = src
            add_cands(race, v['sen'], src, st, inc_last)
            if v.get('sen_unverified'): add_cands(race, v['sen_unverified'], WIKI_SEN_SRC, st, inc_last)
            report.append(f"{race['id']}: official ({v['status']}), {len(v['sen'])} cands" + (f" + {len(v['sen_unverified'])} unconfirmed" if v.get('sen_unverified') else ''))
        else:
            w = wiki_sen[NAMES[st]]
            race['source'] = WIKI_SEN_SRC
            add_cands(race, [[n, p] for p, n in [(pp, re.sub(r'\s*\([^)]*\)\s*$', '', cc)) for pp, cc in w['candidates']]], WIKI_SEN_SRC, st, inc_last)
            report.append(f"{race['id']}: WIKIPEDIA ONLY ({v.get('status','no result')}), {len(w['candidates'])} cands")
    else:
        inc_last = HOUSE_INC.get(race['id'])
        hv = (v.get('house') or {}).get(race['id'])
        if v.get('status') in ('verified', 'partial') and hv:
            src = official_source(st, v)
            race['source'] = src
            add_cands(race, hv, src, st, inc_last)
            report.append(f"{race['id']}: official, {len(hv)} cands")
        else:
            w = wiki_house.get(race['id']) or {'candidates': []}
            race['source'] = 'wikipedia-house-2026'
            add_cands(race, [[re.sub(r'\s*\([^)]*\)\s*$', '', cc), pp] for pp, cc in w['candidates']], 'wikipedia-house-2026', st, inc_last)
            report.append(f"{race['id']}: WIKIPEDIA ONLY, {len(w['candidates'])} cands")
    races.append(race); race_ids.add(race['id'])

if 'wikipedia-house-2026' not in src_ids:
    sources.append({'id':'wikipedia-house-2026','title':'2026 United States House of Representatives elections','publisher':'Wikipedia (CC BY-SA 4.0)','url':'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections','type':'reference','accessed':TODAY})

# ---- redistricting notes --------------------------------------------------------
REDRAWN = {
 'tx-34': ("Texas adopted a new congressional map in 2025, so this district's lines changed and its 2024 result isn't comparable.", 'wikipedia-tx-house-2026', 'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Texas'),
 'fl-14': ("Florida adopted a new congressional map on April 29, 2026, so this district's lines changed and its 2024 result isn't comparable.", 'wikipedia-fl-house-2026', 'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Florida'),
 'fl-25': ("Florida adopted a new congressional map on April 29, 2026, so this district's lines changed and its 2024 result isn't comparable.", 'wikipedia-fl-house-2026', 'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Florida'),
 'oh-07': ("The Ohio Redistricting Commission adopted a new congressional map on October 31, 2025, so this district's lines changed and its 2024 result isn't comparable.", 'wikipedia-oh-house-2026', 'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Ohio'),
 'oh-09': ("The Ohio Redistricting Commission adopted a new congressional map on October 31, 2025, so this district's lines changed and its 2024 result isn't comparable.", 'wikipedia-oh-house-2026', 'https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Ohio'),
}
for r in races:
    if r['id'] in REDRAWN:
        txt, sid, url = REDRAWN[r['id']]
        r['redistricted'] = txt; r['redistricted_source'] = sid
        if sid not in src_ids:
            st = r['state']
            sources.append({'id': sid, 'title': f"2026 United States House of Representatives elections in {NAMES[st]}", 'publisher': 'Wikipedia (CC BY-SA 4.0)', 'url': url, 'type': 'reference', 'accessed': TODAY}); src_ids.add(sid)

# ---- ratings -------------------------------------------------------------------
rat_rows = list(csv.DictReader(open(f'{D}/ratings.csv')))
fields = list(rat_rows[0].keys())
rat_rows = [r for r in rat_rows if r['race'] != 'va-sen']
for row in csv.reader(open(f'{S}/ratings_new.csv')):
    rat_rows.append(dict(zip(fields, row)))

# ---- past results -----------------------------------------------------------------
pr_rows = list(csv.DictReader(open(f'{D}/past_results.csv')))
pr_fields = list(pr_rows[0].keys())
for row in csv.reader(open(f'{S}/past_results_new.csv')):
    pr_rows.append(dict(zip(pr_fields, [str(x) for x in row])))

if not DRY:
    json.dump(races, open(f'{D}/races.json','w'), indent=2, ensure_ascii=False)
    json.dump(candidates, open(f'{D}/candidates.json','w'), indent=2, ensure_ascii=False)
    json.dump(sources, open(f'{D}/sources.json','w'), indent=2, ensure_ascii=False)
    json.dump(parties, open(f'{D}/parties.json','w'), indent=2, ensure_ascii=False)
    w = csv.DictWriter(open(f'{D}/ratings.csv','w',newline=''), fieldnames=fields); w.writeheader(); w.writerows(rat_rows)
    w = csv.DictWriter(open(f'{D}/past_results.csv','w',newline=''), fieldnames=pr_fields); w.writeheader(); w.writerows(pr_rows)
print('\n'.join(report))
print(f"races={len(races)} candidates={len(candidates)} parties={len(parties)} ratings={len(rat_rows)} past={len(pr_rows)} {'(dry run)' if DRY else ''}")
