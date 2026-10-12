# Poll import pipeline

Wikipedia's poll tables are a **discovery list only**. Every poll is checked against its original source before it can appear on the site.

1. `parse_wikipedia_polls.py` / `parse_wikipedia_house_polls.py` read Wikipedia race articles (downloaded with the Wikipedia API, `action=raw`) and pull each general-election poll plus the link to its source. Aggregator tables (270toWin, RealClearPolitics, etc.) are skipped.
2. `check_poll_sources.mjs` downloads each source (web page or PDF) and checks that **both leading candidates' numbers appear within 300 characters of their names, and the sample size appears too**. If all of that is found, the poll is marked `verified` with `checked_by = script`. Otherwise it stays `pending` (hidden on the public site) until a person checks it.
3. Sources that block automated tools (paywalls, bot protection) are never worked around. They go to the human review list.

The check is deliberately strict. A poll can fail it even when it's correct (for example, results posted as an image), but it should almost never pass when it's wrong.

**Known limits (found Oct 11–12, 2026).** The script checks only the two leading candidates, so it can pass a poll whose minor candidates were lumped into "Other" by Wikipedia, or whose page shows a rounded headline while the exact toplines are an image. It doesn't check field dates (Wikipedia once had a poll's dates wrong by two months). A pollster page that's reused for each new poll (Rasmussen) can match the wrong poll; `import_polls.py` warns when a new poll shares a link with an older one in the same race.

## Running a refresh

Use a scratch folder `R` (not the repo): `fetch_wiki.py R` → `cd R/wiki && python3 …/parse_wikipedia_polls.py` → `cd R && python3 …/parse_wikipedia_house_polls.py` → `python3 …/new_only.py` → `node …/check_poll_sources.mjs` → `POLLRUN=R python3 import_polls.py --dry`, then without `--dry`. Then `npm run build:polls-history` if validate asks for it.

## Checking by hand

- `held_polls.py [id]` lists polls waiting for a check, newest first, with source links and numbers.
- `record_poll_check.py <id> '<json>'` marks a poll checked (optionally fixing fields and results; `hold: true` keeps it hidden with a note). Results use candidate ids; it refuses unknown columns and candidate names used as labels.
- `set_source_url.py <id> <url>` repoints a poll's source (splits off a new source if the old one is shared).
- `add_poll.py '<json>'` adds a poll Wikipedia cites only with a social-media post, after checking it against the pollster's own post or release.
- `../ratings_diff.py R` compares our expert ratings with Wikipedia's current tables (then confirm each change on the forecaster's page).
