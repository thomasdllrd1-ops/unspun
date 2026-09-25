"""Parse general-election polling tables from Wikipedia race articles (discovery only).
Every poll found here is a LEAD to verify against the pollster's own release."""
import re, json, glob, sys, html

def strip_refs(s):
    s = re.sub(r'<ref[^>]*/>', '', s)
    return re.sub(r'<ref[^>]*>.*?</ref>', '', s, flags=re.S)

def clean(s):
    s = strip_refs(s)
    s = re.sub(r'\{\{efn[^{}]*(\{\{[^{}]*\}\}[^{}]*)*\}\}', '', s)
    s = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\{\{(?:party shading|Party shading)[^}]*\}\}\|?', '', s)
    s = re.sub(r'\{\{nowrap\|([^}]*)\}\}', r'\1', s)
    s = re.sub(r'\{\{[^{}]*\}\}', '', s)
    s = re.sub(r"'''?", '', s)
    s = s.replace('&nbsp;', ' ').replace('&ndash;', '–')
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    return html.unescape(re.sub(r'\s+', ' ', s)).strip()

def named_refs(t):
    refs = {}
    for m in re.finditer(r'<ref name\s*=\s*"?([^">/]+?)"?\s*>(.*?)</ref>', t, re.S):
        u = re.search(r'url\s*=\s*(https?://[^\s|}]+)', m.group(2)) or re.search(r'\[(https?://[^\s\]]+)', m.group(2))
        if u: refs[m.group(1).strip()] = u.group(1)
    return refs

def ref_urls(cell, refs):
    urls = []
    for m in re.finditer(r'<ref(?: name\s*=\s*"?([^">/]+?)"?)?\s*(/?)>(.*?)(?:</ref>|$)', cell, re.S):
        name, selfclose, body = m.group(1), m.group(2), m.group(3)
        if selfclose and name: urls.append(refs.get(name.strip()))
        else:
            u = re.search(r'url\s*=\s*(https?://[^\s|}]+)', body or '') or re.search(r'\[(https?://[^\s\]]+)', body or '')
            if u: urls.append(u.group(1))
            elif name: urls.append(refs.get(name.strip()))
    return [u for u in urls if u]

def efn_text(cell):
    m = re.search(r'\{\{efn(?:-ua)?\|(?:name=[^|}]*\|)?([^{}]*(?:\{\{[^{}]*\}\}[^{}]*)*)\}\}', cell)
    return clean(m.group(1)) if m else ''

def parse_table(tbl, refs):
    lines = tbl.split('\n')
    def hdr(l):
        h = l.lstrip('!').strip()
        if re.match(r'^(style|rowspan|colspan|class|data-sort-type)\b[^|]*\|', h): h = h.split('|', 1)[1]
        return clean(h)
    header_cells = [hdr(l) for l in lines if l.startswith('!')]
    if not any(h.lower().startswith('poll source') for h in header_cells): return None
    # candidate columns = headers after "Margin of error"
    try: i = next(k for k, h in enumerate(header_cells) if h.lower().startswith('margin'))
    except StopIteration: return None
    cols = header_cells[i + 1:]
    rows = re.split(r'\n\|-[^\n]*\n', tbl)
    polls = []
    for r in rows:
        if 'lightyellow' in r: continue
        cells = [c for c in re.split(r'\n\|', '\n' + r) if c.strip() and not c.startswith('\n!')]
        cells = [c for c in cells if not c.strip().startswith(('{|', '|}', '!'))]
        if len(cells) < 4 + 2: continue
        src_raw = cells[0].split('|', 1)[-1] if 'text-align' in cells[0].split('|', 1)[0] else cells[0]
        pollster = clean(src_raw)
        if not pollster or pollster.lower().startswith('poll source'): continue
        # Continuation rows: another version of the previous poll (e.g. RV after LV), or
        # ranked-choice rounds (Alaska/Maine) — they don't start with a pollster name.
        if re.match(r'^[\d,]+\s*\((LV|RV|A|V)\)$', pollster) or re.match(r'^\d{1,2}$', pollster) or re.match(r'^(Round|First|Final)\b', pollster, re.I):
            if polls: polls[-1]['other_versions'] = polls[-1].get('other_versions', 0) + 1
            continue
        vals = [clean(c.split('|')[-1]) if c.count('|') and ('shading' in c or 'style' in c.split('|')[0]) else clean(c) for c in cells[1:]]
        dates, sample, moe = vals[0], vals[1], vals[2]
        pct = vals[3:3 + len(cols)]
        polls.append({
            'pollster': pollster, 'partisan': (re.search(r'\((D|R|I|L)\)\s*$', pollster) or [None, None])[1],
            'sponsor_note': efn_text(cells[0]), 'dates': dates, 'sample': sample, 'moe': moe,
            'cols': cols, 'pcts': pct, 'urls': ref_urls(cells[0], refs),
        })
    return polls

out = {}
for f in sorted(glob.glob('*.wiki')):
    t = open(f).read()
    refs = named_refs(t)
    g = re.search(r'\n==\s*General election\s*==\s*\n(.*?)(?=\n==[^=]|\Z)', t, re.S)
    if not g: out[f] = {'error': 'no general election section'}; continue
    sec = g.group(1)
    p = re.search(r'\n===+\s*Polling\s*===+\s*\n(.*?)(?=\n===?[^=]|\Z)', sec, re.S)
    if not p: out[f] = {'polls': [], 'note': 'no general-election polling section'}; continue
    body = p.group(1)
    body = body.split('{{hidden begin')[0]  # hypothetical matchups live in hidden boxes; skip them
    tables = re.findall(r'\{\|.*?\n\|\}', body, re.S)
    polls = []
    for tb in tables:  # first table with "Poll source" + "Margin of error" = the actual matchup (skip aggregator averages)
        got = parse_table(tb, refs)
        if got is not None:
            polls = got
            break
    out[f] = {'polls': polls}
json.dump(out, open('../polls_wiki.json', 'w'), indent=1, ensure_ascii=False)
for f, v in out.items():
    ps = v.get('polls', [])
    print(f"{f:<32} {len(ps):>3} polls" + (f"  cols={ps[0]['cols']}" if ps else f"  {v.get('note') or v.get('error','')}"))
