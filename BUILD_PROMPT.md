# Build Prompt — 2026 Midterm Tracker (working name: "Unspun")

Paste this into Claude Code as your first message, in **plan mode**.

---

I want to build a mobile-first website that helps college students and young adults (18–25) understand the 2026 U.S. midterm elections without spin. Election Day is November 3, 2026, so speed matters: I want a solid v1 live within ~2 weeks, then keep improving it.

## Core principle: radical transparency
No data is truly neutral — so we don't pretend to be. We show all the data, label every source and its possible biases, explain every choice we make, and treat every candidate and party with the exact same template. Every factual claim on the site links to its source. When we don't know something, we say so.

## Audience & tone
- Beginners. Assume they've never read a poll.
- Minimal text. Every card leads with ONE sentence + a visual. Details are tap-to-expand.
- Three layers of depth: (1) headline, (2) chart, (3) full methodology. Most users stop at layer 1.
- Modern, clean, young — closer to a sports/scores app than a news site. Neutral color palette (avoid heavy red/blue; use a distinct, colorblind-safe palette). Dark mode.
- Hover/tap glossary on every jargon term (margin of error, likely voters, house effect, weighting, herding, super PAC, etc.).

## Scope
1. **All 2026 U.S. Senate races** (33 regular + special elections — verify the full list).
2. **10 nationally high-profile U.S. House races.** Pick them using transparent criteria (e.g., rated Toss-up by multiple forecasters, highest total spending, most national media attention), show the criteria on the site, and propose the list to me for approval before building.
3. **Virginia deep-dive:** an interactive, clickable map of Virginia's 11 congressional districts (current map in effect for 2026). Tapping a district shows the candidates, race rating, polls (if any), money, and past results. Include Virginia's U.S. Senate race. Include a short visual explainer on the 2026 Virginia redistricting fight (April referendum → blocked by the VA Supreme Court → U.S. Supreme Court declined to reinstate).

## Polls (as much data as possible, all labeled)
- Collect every public poll available for in-scope races from as many sources as possible (e.g., Wikipedia poll tables, RealClearPolling, Silver Bulletin, VoteHub, Decision Desk HQ, 270toWin, pollster releases). Respect each site's terms of service; prefer official releases and open data.
- Every poll gets tags: sponsor (independent / campaign / party / partisan-aligned group — flag both sides equally), voter screen (likely vs registered vs adults), method (phone / online panel / text / IVR / mixed), sample size, field dates, margin of error, and the pollster's historical track record where available.
- Races with few or no polls: say so plainly and show other signals instead — past results, fundraising, and race ratings from Cook Political Report, Sabato's Crystal Ball, and Inside Elections.

## Standout features
- **"What if the polls are wrong?" slider** — apply the actual historical polling miss from 2016, 2020, 2022, or 2024 (researched and cited, state-level where possible) to all current races and watch the map/ratings change.
- **Margin of error as ranges**, not single numbers. If the range crosses zero, it's labeled a toss-up.
- **Build-your-own average** — toggles like "remove partisan-sponsored polls," "likely voters only," "last 2 weeks only," so users see how much the average moves.
- **Poll Decoder** — tap any poll for a plain-English, one-screen breakdown with bias tags.
- **Our polling average** — a simple, published formula (e.g., recency + sample-size weighting). No secret sauce; the formula is on the methodology page.
- **Confidence badge** per race: lots of polls / a few / none.

## Candidate pages (same template for everyone, including third-party candidates on the ballot)
- **Top 3 policies in their own words**, each linked to the source (campaign site, speech, vote record). No paraphrasing that changes meaning.
- **Money (FEC data):** small vs large donors, in-state vs out-of-state, top PAC/interest-group contributors, and outside spending (super PACs) for and against them.
- **Interest-group tracking applied equally to every candidate** — AIPAC, NRA, labor unions, crypto PACs, EMILY's List, Club for Growth, etc. — ranked by dollars, never spotlighting one group.

## Issues
- 6 core issues chosen based on what young voters rank as top concerns in recent polling — show the reasoning and source on the site. Candidate pool: cost of living/housing, economy/jobs, healthcare, climate/energy, education/student debt, immigration, abortion, guns, democracy/elections.
- **Compare view:** Venn diagram for 2–3 candidates; grid for more.
- **Evidence tag on every stance:** 🗳️ voted on it · 💬 said it publicly · 🌐 on their website · ❓ no stated position.
- **"Who matches me?" quiz** — 6 quick questions → which candidates align with you, with sources.

## Also include
- **How to vote** (Virginia first, then link out for other states): registration, early voting, absentee voting for students away at college, finding your polling place. Verify all dates against official sources (elections.virginia.gov, vote.gov).
- **Shareable cards** — story-sized (9:16) images, e.g., "Where the money comes from in [race]."
- **"Show our work" page** — every source, every choice we made and why, and what the data can't tell you. Each page has a small "Limits of this data" note and a "last updated" timestamp.
- **Open data** — a "Download our full dataset" button (CSV/JSON).
- **Corrections** — a simple way to report an error, and a public corrections log.

## Technical approach (suggest improvements if you have better ideas)
- Static-first site (e.g., Next.js or Astro), deployed free on Vercel or Netlify, code on GitHub.
- All data stored as JSON/CSV files in the repo, so it's auditable and versioned.
- Scripts to refresh data: FEC API (free key from api.data.gov) for money; a poll-ingestion script + a simple form or CSV I can use to add polls manually.
- Later: a scheduled job (e.g., GitHub Action) that refreshes FEC data nightly.
- Virginia district map from Census TIGER/Line congressional district boundaries.
- Fast, accessible (WCAG AA), works great on phones.

## How I want you to work
1. **Start in plan mode.** Propose the architecture, data sources, file structure, and phased plan. Ask me any questions before writing code.
2. **Build in phases**, each ending with something I can see working:
   - Phase 1: data structure + Virginia map + Virginia Senate race page, end-to-end.
   - Phase 2: poll features (tags, ranges, averages, decoder, what-if slider).
   - Phase 3: all Senate races + the 10 House races.
   - Phase 4: candidate pages, money, issues, compare view, quiz.
   - Phase 5: how to vote, share cards, methodology, corrections, polish, deploy.
   - Phase 6: automated data refresh.
3. **Accuracy over speed on facts.** Never invent a poll, number, quote, or position. If you can't verify something, leave it blank and flag it for me. Keep a `NEEDS_REVIEW.md` list.
4. I'm a beginner developer — explain what you're doing briefly, and tell me exactly what I need to do myself (accounts, API keys, deploy steps).
