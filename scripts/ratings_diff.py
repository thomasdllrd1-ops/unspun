"""Compare data/ratings.csv (Cook, Sabato, Inside) with Wikipedia's current predictions tables. Read-only.
usage: python3 scripts/ratings_diff.py <run_dir>   (run_dir = the folder scripts/polls/fetch_wiki.py filled)
Wikipedia only says where to look: confirm each change on the forecaster's own page before editing ratings.csv.
In the supervised browser, Cook and Inside Elections list every race as text; Sabato's changes are listed at
centerforpolitics.org/crystalball/2026-rating-changes/."""
import csv, glob, os, re, sys
W = sys.argv[1]
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
va = f'{W}/stwiki/Virginia.wiki'  # fetch_wiki.py skips Virginia (its polls are tracked separately)
if not os.path.exists(va): __import__('subprocess').run(['curl', '-sSL', '--max-time', '60', '-A', 'UnspunElectionTracker/1.0 (nonpartisan student election guide)', '-o', va, 'https://en.wikipedia.org/w/index.php?title=2026+United+States+House+of+Representatives+elections+in+Virginia&action=raw'], check=True)
NAMES = {'Alabama':'al','Alaska':'ak','Arkansas':'ar','Arizona':'az','Colorado':'co','Delaware':'de','Florida':'fl','Georgia':'ga','Idaho':'id','Illinois':'il','Iowa':'ia','Kansas':'ks','Kentucky':'ky','Louisiana':'la','Maine':'me','Massachusetts':'ma','Michigan':'mi','Minnesota':'mn','Mississippi':'ms','Montana':'mt','Nebraska':'ne','New_Hampshire':'nh','New_Jersey':'nj','New_Mexico':'nm','New_York':'ny','North_Carolina':'nc','Ohio':'oh','Oklahoma':'ok','Oregon':'or','Pennsylvania':'pa','Rhode_Island':'ri','South_Carolina':'sc','South_Dakota':'sd','Tennessee':'tn','Texas':'tx','Virginia':'va','Washington':'wa','West_Virginia':'wv','Wisconsin':'wi','Wyoming':'wy'}
FC = {'cook': r'Cook Political', 'sabato': r'Sabato', 'inside': r'Inside Elections'}
MON = {m:i for i,m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'],1)}
def val(cell):
    m = re.search(r'\{\{USRaceRating\|([^}]*)\}\}', cell)
    if not m: return None
    parts = [p.strip().lower() for p in m.group(1).split('|')]
    if parts[0] in ('tossup', 'toss-up'): return 'tossup'
    lvl = {'safe': 'solid', 'solid': 'solid', 'likely': 'likely', 'lean': 'lean', 'tilt': 'tilt'}.get(parts[0])
    return f"{lvl}-{parts[1][0]}" if lvl and len(parts) > 1 else '?' + m.group(1)
def iso(s):
    m = re.search(r'([A-Z][a-z]+) (\d{1,2}), (\d{4})', s); return f"{m.group(3)}-{MON[m.group(1)]:02d}-{int(m.group(2)):02d}" if m else s.strip()
def tables(text):  # predictions tables: (section heading, rows of (source, rating, as_of))
    out = []
    for m in re.finditer(r'\n(=+)\s*Predictions\s*\1\s*\n(\{\|.*?\n\|\})', text, re.S):
        head = re.findall(r'\n==\s*(District \d+)\s*==\s*\n', text[:m.start()]) or re.findall(r'\n=+\s*([^=\n]+?)\s*=+\s*\n', text[:m.start()])
        rows = []
        for row in m.group(2).split('\n|-')[1:]:
            cells = [c for c in re.split(r'\n\|', '\n' + row.strip()) if c.strip()]
            if len(cells) >= 3: rows.append((cells[0], val(cells[1]), iso(cells[2])))
        out.append((head[-1] if head else '', rows))
    return out
wiki = {}
for f in glob.glob(f'{W}/wiki/*.wiki'):
    st = NAMES[os.path.basename(f).split('_', 1)[1][:-5]]; race = f"{st}-sen{'-special' if 'sen-special' in f else ''}"
    for _, rows in tables(open(f).read())[:1]:
        for src, v, d in rows:
            for k, pat in FC.items():
                if re.search(pat, src): wiki[(race, k)] = (v, d)
ours = list(csv.DictReader(open(f'{REPO}/data/ratings.csv')))
races = {r['race'] for r in ours}
for f in glob.glob(f'{W}/stwiki/*.wiki'):
    st = NAMES[os.path.basename(f)[:-5]]; t = open(f).read()
    for head, rows in tables(t):
        m = re.search(r'District (\d+)', head)
        if not m: continue
        race = f'{st}-{int(m.group(1)):02d}'
        if race not in races: continue
        for src, v, d in rows:
            for k, pat in FC.items():
                if re.search(pat, src): wiki[(race, k)] = (v, d)
same = diff = missing = 0
for r in ours:
    w = wiki.get((r['race'], r['forecaster']))
    if not w: missing += 1; print(f"NO WIKI  {r['race']:15} {r['forecaster']:7} ours {r['rating']:9} {r['as_of']}"); continue
    if w[0] == r['rating']: same += 1
    else: diff += 1; print(f"CHANGED  {r['race']:15} {r['forecaster']:7} ours {r['rating']:9} {r['as_of']}  ->  wiki {w[0]:9} {w[1]}")
print(f'same {same}, changed {diff}, not found on wikipedia {missing}')
