"""Print campaign-website links Wikipedia lists for given House districts.
  python3 scripts/research/house_sites.py NY-17 WI-03 ...
Reads each state's "2026 United States House of Representatives elections in <State>" page (raw wikitext),
section "Official campaign websites for Nth district candidates". 10 s between requests (Wikipedia's ask)."""
import re, subprocess, sys, time, urllib.parse
NAMES = {'NY': 'New York', 'WI': 'Wisconsin', 'AZ': 'Arizona', 'IA': 'Iowa', 'CO': 'Colorado', 'MI': 'Michigan',
         'PA': 'Pennsylvania', 'FL': 'Florida', 'TX': 'Texas', 'WA': 'Washington', 'OH': 'Ohio', 'VA': 'Virginia'}
UA = 'UnspunResearch/1.0 (student project; github.com/thomasdllrd1-ops/unspun)'
want = {}
for d in sys.argv[1:]:
    st, n = d.upper().split('-'); want.setdefault(st, []).append(int(n))
ord_ = lambda n: f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
for i, (st, ns) in enumerate(want.items()):
    if i: time.sleep(10)
    title = f'2026 United States House of Representatives elections in {NAMES[st]}'
    url = 'https://en.wikipedia.org/w/index.php?' + urllib.parse.urlencode({'title': title, 'action': 'raw'})
    txt = subprocess.run(['curl', '-sfL', '-A', UA, url], capture_output=True, text=True, check=True).stdout  # curl: this Python has no CA bundle
    for n in sorted(ns):
        m = re.search(rf"Official campaign websites for {ord_(n)} district candidates'''\s*\n((?:\*.*\n?)+)", txt)
        print(f'{st}-{n:02d}:', *(re.findall(r'\[(https?://\S+) ([^\]]+)\]', m.group(1)) if m else ['(no list found)']), sep='\n  ')
