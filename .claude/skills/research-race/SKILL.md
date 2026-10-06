---
name: research-race
description: Research one Unspun race's candidate positions (top 3 priorities + the 6 issues) from campaign websites, build data/positions/<race>.json, and verify every quote word for word. Use when asked to research, add, or continue candidate positions for a race.
---

# Research a race's candidate positions

The public rules live on `/issues/#rules` (src/pages/issues/index.astro). Follow them exactly. Every candidate in a race is done together.

## Steps

1. **List the candidates**: `node -e 'console.log(require("./data/candidates.json").filter(c=>c.race==="<race>").map(c=>c.id+" "+(c.website||"-")).join("\n"))'`
2. **Find each campaign site** (in this order): the `website` field → the state's official list (check the source; some list websites) → Wikipedia's race article external links (rate-limited: one request every 10 s) → a web search. Confirm ownership by the site's "Paid for by" line or obvious self-identification. No site → `no_site` entry.
3. **Save pages**: `python3 scripts/research/site.py <id> <home> [extra urls...]`. Add the issue pages the menu links to as extras when the helper misses them (accordions, Wix "blank-1" pages, per-issue subpages). In zsh, split a URL list with `${=L}`.
4. **Read only the stances**: `python3 scripts/research/pos.py <id> [topic words]`. Read a full page only when you need exact sentence boundaries.
5. **Write the spec**: `scripts/research/specs/<race>.py` (format in the docstring of `scripts/research/build_positions.py`; `specs/va-04.py` is an example). Give first/last words; never retype quotes.
6. **Build + verify**: `python3 scripts/research/build_positions.py scripts/research/specs/<race>.py && npm run check:quotes -- <race>`. Every quote must pass. Rebuilding resets checks to pending, so re-run check:quotes.
7. **Publish**: `npm run build`, add the race to the "Researched so far" line in NEEDS_REVIEW.md, commit, push.

## Picking passages (the judgment calls)

- **Top 3** = first three items of the issues list linked from the site's main menu (skip intros/bios). No such list → first list of issues on the site. No list at all → `priorities: []` + `priorities_note`. One-line statements or headings with no text under them → heading-only (`first_words` None).
- **Each issue**: the passage (whole sentences or list items, ≤60 words) that most directly answers that issue's key question in `data/issues.json`. Prefer a specific plan/action/vote over a general goal; tie → first on the page.
- **Out of scope** (→ No position found, with a short neutral note): veterans' care for health care; military-family housing for housing; national debt alone for cost of living; Lyme disease/opioids for health care.
- Same sentence may cover two issues when it's the only passage; add a note saying so.
- **Never quote**: social media posts (even embedded), pages about opponents ("what voters need to know"), words written by someone else (letters, quoted experts), template/lorem-ipsum pages.
- Blocked, broken, expired, or security-warned sites: don't get around them. Use `no_site` with a dated note saying what happened.
- Notes are plain and neutral. No editorializing.

## Gotchas

- Over-60-word passages: pick a shorter one and add a note pointing to the full plan.
- A heading must appear on the source page (case-insensitive) or the build fails.
- `/private/tmp` gets wiped after ~3 days. Keep specs in the repo; `.research/` (saved pages) is gitignored and re-fetchable.
