# CLAUDE.md — Unspun (2026 Midterm Tracker)

Standing rules for every session in this project. Read before any work.

## Mission
Help 18–25 year olds understand the 2026 midterms without spin. Radical transparency: no data is neutral, so show all of it, label every source and bias, and explain our choices.

## Non-negotiables
- **Never fabricate** a poll, number, quote, date, or policy position. Unverified → leave blank, add to `NEEDS_REVIEW.md`.
- **Every factual claim has a source link** stored alongside the data.
- **Same template for every candidate and party.** Bias tags apply to both sides equally. Interest groups are all tracked the same way, ranked by dollars.
- **Candidate positions in their own words**, with source + evidence tag (voted / said / website / no position).
- **Label uncertainty** — margin of error as ranges, confidence badges, "Limits of this data" notes, "last updated" timestamps.

## Writing style on the site
- One-sentence headline + visual first; details behind tap-to-expand.
- Plain English at a ~9th-grade reading level. Jargon gets a glossary tooltip.
- No adjectives that editorialize ("extreme," "radical," "common-sense," etc.).

## Design
- Mobile-first, dark mode, fast, WCAG AA.
- Neutral, colorblind-safe palette — avoid defaulting to red/blue for parties.
- Feels like a scores app, not a news site.

## Data
- All data lives in `/data` as JSON/CSV, versioned in git.
- Money: FEC API. Ratings: Cook, Sabato, Inside Elections. Polls: as many public sources as possible, each tagged (sponsor, screen, method, n, dates, MoE, track record).
- Respect source sites' terms of service.

## Working with Thomas
- He's a beginner developer: brief explanations, and clear steps for anything he must do himself.
- Build in phases; each phase ends with something he can see working.
- Ask before changing scope (race list, issue list, methodology).
