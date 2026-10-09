"""Save a campaign site's pages as text for position research.

  python3 scripts/research/site.py <candidate-id> <home-url> [extra-url ...]

Saves .research/sites/<id>/NN-<slug>.txt (home + issue-looking links + extras).
Pages with little text are re-opened in headless Chrome (JavaScript sites).
"""
import html, os, re, subprocess, sys, urllib.parse

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEY = re.compile(r'issue|priorit|platform|plan|agenda|polic|stand|vision|about|meet|values|record', re.I)
SKIP = re.compile(r'donat|volunteer|privacy|terms|shop|store|contact|event|news|press|blog|login|cart|facebook|twitter|x\.com|instagram|youtube|tiktok|linkedin|actblue|winred|anedot|mailto|tel:|cdn-cgi|\.svg|wp-json|feed|\.(jpg|png|pdf|css|js)(\?|$)', re.I)


def to_text(h):
    t = re.sub(r'<(script|style|svg|noscript)[^>]*>.*?</\1>', '', h, flags=re.S | re.I)
    t = re.sub(r'<(h[1-6])[^>]*>', r'\n\n## ', t, flags=re.I)
    t = re.sub(r'<(p|li|br|div|section|article|tr)[^>]*>', '\n', t, flags=re.I)
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    t = re.sub(r'[ \t ]+', ' ', t)
    return re.sub(r'\n\s*\n+', '\n\n', t).strip()


def get(u):
    r = subprocess.run(['curl', '-sSL', '-A', UA, '--max-time', '30', '-w', '\n__FINAL__%{url_effective} %{http_code}', u],
                       capture_output=True, text=True, errors='ignore')
    body, _, meta = r.stdout.rpartition('\n__FINAL__')
    final, code = (meta.split(' ') + [''])[:2]
    txt, how = to_text(body), 'plain'
    if len(txt.split()) < 150 or code != '200' or '{{' in txt:  # {{ }} = JS template not filled in yet
        try:
            r = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-first-run', '--virtual-time-budget=8000',
                                f'--user-agent={UA}', '--dump-dom', u], capture_output=True, text=True, timeout=60, errors='ignore')
            if len(to_text(r.stdout).split()) > len(txt.split()):
                body, txt, how = r.stdout, to_text(r.stdout), 'chrome'
        except Exception:
            pass
    title = (re.search(r'<title[^>]*>([^<]*)', body, re.I) or [None, ''])[1].strip()
    return body, f'URL: {final or u}\nHTTP {code} via {how}\nTITLE: {title}\n\n{txt}', final or u


def slug(url):
    p = urllib.parse.urlparse(url)
    return re.sub(r'[^a-z0-9]+', '-', (p.path + ('-' + p.query if p.query else '')).lower()).strip('-')[:60] or 'page'


cid, home, extras = sys.argv[1], sys.argv[2], sys.argv[3:]
out = os.path.join(ROOT, '.research', 'sites', cid)
os.makedirs(out, exist_ok=True)
body, page, final = get(home)
open(os.path.join(out, '00-home.txt'), 'w').write(page)
host = urllib.parse.urlparse(final).netloc.replace('www.', '')
links = []
for m in re.finditer(r'href="([^"]+)"', body):
    u = urllib.parse.urljoin(final, html.unescape(m.group(1))).split('#')[0]
    p = urllib.parse.urlparse(u)
    if p.netloc.replace('www.', '') == host and not SKIP.search(u) and KEY.search(p.path) and u.rstrip('/') != final.rstrip('/') and u not in links:
        links.append(u)
todo = links[:10] + [u for u in extras if u not in links[:10]]
print(f'{cid}: home ok; {len(todo)} pages')
for i, u in enumerate(todo, 1):
    _, page, f = get(u)
    open(os.path.join(out, f'{i:02d}-{slug(f)}.txt'), 'w').write(page)
    print(f'  {i:02d} {page.split(chr(10))[1]} {len(page.split())}w {f}')
