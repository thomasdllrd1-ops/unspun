# Poll import pipeline

Wikipedia's poll tables are a **discovery list only**. Every poll is checked against its original source before it can appear on the site.

1. `parse_wikipedia_polls.py` / `parse_wikipedia_house_polls.py` read Wikipedia race articles (downloaded with the Wikipedia API, `action=raw`) and pull each general-election poll plus the link to its source. Aggregator tables (270toWin, RealClearPolitics, etc.) are skipped.
2. `check_poll_sources.mjs` downloads each source (web page or PDF) and checks that **both leading candidates' numbers appear within 300 characters of their names, and the sample size appears too**. If all of that is found, the poll is marked `verified` with `checked_by = script`. Otherwise it stays `pending` (hidden on the public site) until a person checks it.
3. Sources that block automated tools (paywalls, bot protection) are never worked around. They go to the human review list.

The check is deliberately strict. A poll can fail it even when it's correct (for example, results posted as an image), but it should almost never pass when it's wrong.
