"""Download the Wikipedia race articles (raw wikitext) that the poll parsers read.
usage: python3 fetch_wiki.py <run_dir>
Writes <run_dir>/wiki/sen_<State>.wiki (and sen-special_<State>.wiki) for every Senate race we cover,
and <run_dir>/stwiki/<State>.wiki for the states of the House races parse_wikipedia_house_polls.py reads.
One request a second, with a descriptive User-Agent (Wikipedia's API etiquette)."""
import json, os, subprocess, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')
run = sys.argv[1]
NAMES = {'AL':'Alabama','AK':'Alaska','AR':'Arkansas','AZ':'Arizona','CO':'Colorado','DE':'Delaware','FL':'Florida','GA':'Georgia','ID':'Idaho','IL':'Illinois','IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota','MS':'Mississippi','MT':'Montana','NE':'Nebraska','NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NY':'New York','NC':'North Carolina','OH':'Ohio','OK':'Oklahoma','OR':'Oregon','PA':'Pennsylvania','RI':'Rhode Island','SC':'South Carolina','SD':'South Dakota','TN':'Tennessee','TX':'Texas','VA':'Virginia','WA':'Washington','WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming'}
UA = 'UnspunElectionTracker/1.0 (nonpartisan student election guide; poll discovery only)'

def get(title, out):
    url = 'https://en.wikipedia.org/w/index.php?' + urllib.parse.urlencode({'title': title, 'action': 'raw'})
    subprocess.run(['curl', '-sSL', '--max-time', '60', '-A', UA, '-o', out, url], check=True)
    time.sleep(1)

races = json.load(open(f'{D}/races.json'))
os.makedirs(f'{run}/wiki', exist_ok=True); os.makedirs(f'{run}/stwiki', exist_ok=True)
for r in races:
    if r['chamber'] != 'senate' or r['state'] == 'VA': continue  # Virginia polls are tracked separately
    st = NAMES[r['state']]
    special = r['id'].endswith('-special')
    title = f"2026 United States Senate {'special ' if special else ''}election in {st}"
    get(title, f"{run}/wiki/{'sen-special' if special else 'sen'}_{st.replace(' ', '_')}.wiki")
from_house = {'Arizona','Colorado','Florida','Iowa','Michigan','New_York','Ohio','Pennsylvania','Texas','Washington','Wisconsin'}
for st in sorted(from_house):
    get(f"2026 United States House of Representatives elections in {st.replace('_', ' ')}", f'{run}/stwiki/{st}.wiki')
print('fetched', len(os.listdir(f'{run}/wiki')), 'Senate and', len(os.listdir(f'{run}/stwiki')), 'House articles')
