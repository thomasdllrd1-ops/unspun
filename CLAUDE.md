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
- Mobile-first, light + dark (follows the phone's setting), fast, WCAG AA.
- **Sports-scoreboard look and metaphor** (decided Sep 28, 2026): use sports ideas everyone knows to explain polling — average = the score, within the margin = too close to call, unchecked polls = under review, number of polls = games played, recent polls = form guide, forecaster ratings = expert picks. Always "leading," never "winning"; poll averages are never presented as results.
- **Party colors: blue = Democratic, red = Republican, teal = every other party/independent** (Thomas's decision, Sep 28, 2026; replaces the earlier neutral palette). Checked with the color-blindness validator; party names are always written out too, so color never carries meaning alone.
- UI accent is scoreboard yellow — never red or blue — so site chrome never looks partisan.
- Fonts are self-hosted (no third-party font requests).

## Data
- All data lives in `/data` as JSON/CSV, versioned in git.
- Money: FEC API. Ratings: Cook, Sabato, Inside Elections. Polls: as many public sources as possible, each tagged (sponsor, screen, method, n, dates, MoE, track record).
- Respect source sites' terms of service.

## Working with Thomas
- He's a beginner developer: brief explanations, and clear steps for anything he must do himself.
- Build in phases; each phase ends with something he can see working.
- Ask before changing scope (race list, issue list, methodology).
