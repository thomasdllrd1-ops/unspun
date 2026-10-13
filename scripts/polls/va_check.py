"""List Virginia polls on Wikipedia that we don't have (Virginia is added by hand, not by import_polls.py, because
our Virginia polls were entered with the pollsters' own names and would come in twice). Read-only.
usage: python3 va_check.py <run_dir>   (fetches the two Virginia articles into run_dir if missing)
A poll counts as ours when we have one in the same race ending the same day (so a poll we keep without dates,
like TPSI's June Virginia Senate poll, is always listed). Check each one listed against its
source, then add it with add_poll.py."""
import csv, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_wikipedia_polls import named_refs, named_efns, parse_table
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'import_polls.py')).read().split('cands = json.load')[0]
     .replace("os.environ.get('POLLRUN') or sys.exit('set POLLRUN to the folder holding poll_checks.json')", "''"))  # dates(), D
run = sys.argv[1]
ARTICLES = {'va-sen': '2026 United States Senate election in Virginia', 'house': '2026 United States House of Representatives elections in Virginia'}
have = {(p['race'], p['field_end']) for p in csv.DictReader(open(f'{D}/polls/polls.csv'))}
for key, title in ARTICLES.items():
    f = f'{run}/va-{key}.wiki'
    if not os.path.exists(f):
        subprocess.run(['curl', '-sSL', '--max-time', '60', '-A', 'UnspunElectionTracker/1.0 (nonpartisan student election guide)', '-o', f,
                        'https://en.wikipedia.org/w/index.php?title=' + title.replace(' ', '+') + '&action=raw'], check=True)
    t = open(f).read(); refs, efns = named_refs(t), named_efns(t)
    g = re.search(r'\n==\s*General election\s*==\s*\n(.*?)(?=\n==[^=]|\Z)', t, re.S)  # skip primary polls
    parts = [('va-sen', g.group(1) if g else '')] if key == 'va-sen' else [(f'va-{int(n):02d}', body) for n, body in re.findall(r'\n==District (\d+)==\n(.*?)(?=\n==District|\Z)', t, re.S)]
    for race, body in parts:
        for sec in re.findall(r'\n=+\s*Polling\s*=+\s*\n(.*?)(?=\n==[^=]|\n===[^=]|\Z)', body, re.S):
            for tb in re.findall(r'\{\|.*?\n\|\}', sec.split('{{hidden begin')[0], re.S):
                for p in parse_table(tb, refs, efns) or []:
                    end = dates(p['dates'])[1]
                    if end and (race, end) not in have:
                        print(f"MISSING {race} | {p['pollster']} | {p['dates']} | {p.get('sample')} | {(p.get('urls') or [''])[0]}")
print('done')
