"""Print the position-taking sentences on saved pages, so you read candidates' stances, not whole pages.

  python3 scripts/research/pos.py <candidate-id> [word ...]   (words = optional topic filter, e.g. housing rent)
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VERB = re.compile(r"\b(I will|I'll|I’ll|I support|I oppose|I believe|I would|will|supports?|opposes?|believes?|fights?|fought|voted|introduced|sponsored|co-?sponsored|passed|led|must|should)\b")
cid, words = sys.argv[1], sys.argv[2:]
topic = re.compile('|'.join(map(re.escape, words)), re.I) if words else None
for f in sorted(glob.glob(os.path.join(ROOT, '.research', 'sites', cid, '*.txt'))):
    head, _, body = open(f, encoding='utf-8').read().partition('\n\n')
    print(f'### {os.path.basename(f)[:-4]}')
    heading = ''
    for line in body.split('\n'):
        line = line.strip()
        if line.startswith('## '): heading = line[3:].strip(); continue
        for s in re.split(r'(?<=[.!?])\s+', line):
            if 5 <= len(s.split()) <= 70 and VERB.search(s) and (not topic or topic.search(s + heading)):
                print(f'  [{heading[:50]}] {s[:300]}')
