# Needs review

Everything here is either **hidden from the public site** until a person checks it, or **left blank** because we couldn't confirm it. Nothing on this list was guessed.

**Fastest way to work through it:** run `npm run dev`, open **http://localhost:4321/review/checklist/**, and use the `npm run verify` commands shown there. When you finish an item below, delete it (git keeps the history).

_Last updated: Sep 28, 2026 (Phase 4 started: issues + candidate positions)_

---

## Priority 1: Race ratings (192), about 20 minutes

The forecasters' sites block automated tools, so ratings came from Wikipedia's cited tables. **They're all hidden on the public site**, which is why every scoreboard says "Picks under review" and the Senate map's "Forecasters" view is blank.

1. Open the checklist page (above). Ratings are grouped by forecaster, with links:
   - Cook: [Senate](https://www.cookpolitical.com/ratings/senate-race-ratings) · [House](https://www.cookpolitical.com/ratings/house-race-ratings)
   - Inside Elections: [Senate](https://insideelections.com/ratings/senate) · [House](https://insideelections.com/ratings/house)
   - Sabato's Crystal Ball: [Senate](https://centerforpolitics.org/crystalball/2026-senate/) · [House](https://centerforpolitics.org/crystalball/2026-house/)
2. If a forecaster's page matches every row: `npm run verify -- ratings cook` (or `inside`, `sabato`).
3. If one row differs, fix that row in `data/ratings.csv` first (values: `solid-d`, `likely-d`, `lean-d`, `tilt-d`, `tossup`, `tilt-r`, `lean-r`, `likely-r`, `solid-r`; Sabato's "Safe" = `solid`), then verify.
4. Run `npm run validate`, then tell Claude to publish.

## Priority 2: Candidate lists we couldn't confirm (browser needed)

These states' official sites block automated tools. The race page shows a "not confirmed" banner until you check.

| Race | Open this in your browser | What to check |
|---|---|---|
| **New Hampshire Senate** | sos.nh.gov → 2026 general election candidates | Full ballot. A Rasmussen release lists 4 independents we don't have: Aaron Day, Tim Harris, Christine Lopez, Jeanne Logan Morrow. Our list is Pappas, Sununu, LaPlante. |
| **Rhode Island Senate** | vote.sos.ri.gov → Candidates | Full ballot (we have Reed, McKay, Bahry from Wikipedia) |
| **AZ-01 and AZ-06** | azsos.gov → 2026 general election candidates | Full ballots (from Wikipedia: AZ-01 Feely, Shah, Alponte; AZ-06 Ciscomani, Mendoza, Peters, Swing). Is AZ-01 an open seat? |
| **Massachusetts Senate** | sec.state.ma.us → 2026 state election candidates | Confirm the two non-major candidates: Shiva Ayyadurai (Independent) and Joe Tache (Socialism and Liberation) |
| **Mississippi Senate** | sos.ms.gov → Candidate Qualifying | Confirm Hyde-Smith, Colom, Pinkins are the full general-election ballot |

To fix a list: tell Claude what the official page shows, and the source link will be switched to the official one.

Other candidate notes:
- **OH-09**: Libertarian Matthew Althaus isn't on printed county ballots (Erie, Fulton), but Fulton's filing notice still lists him. We left him off. A quick call to the Fulton County Board of Elections would settle it.
- **Bob Chew (Colorado)** has two FEC registrations (S6CO00556 and S6CO00549). We use the more recent one.

## Priority 3: Polls that need a human (50 recent polls, 22 races on hold)

A race's average stays **on hold** until every poll from the last 60 days is checked, so these block the scoreboard for 22 races. The checklist page lists each one with its source link and the numbers to confirm. Most come from sites that block automated tools:

- **Google Drive** memos (9), **University of New Hampshire** PDFs (7), **DocumentCloud** (5), **New York Times** (3), **Politico** (2), **Change Research** (1)
- **Abacus Data** (5 polls, one article): the numbers are in a chart. Also, the article says its likely-voter results total 1,507 people across the five states, but Wikipedia's per-state sizes add up to 1,594. Check the sample sizes in the chart.
- **Quantus Insights, Maine** (Sep 14–15) didn't load for us. **Quantus, North Carolina (Sep 22)**: Wikipedia links it to a different pollster's page, so we couldn't find it.
- **Hart Research (Louisiana)** and **Aspect Strategic (Montana)**: the only sources we found were social-media posts, not the pollster's release.

If a poll's numbers differ from what we have, fix `data/polls/poll_results.csv` before running `npm run verify -- poll <id>`.

## Priority 4: Spot-check the AI assistant's work

About 40 polls say "checked by an AI assistant." Pick 5 at random on the checklist page (filter `checked_by = ai` in `data/polls/polls.csv`), open each source, and confirm the numbers. If all 5 match, great. If any don't, tell Claude so it can re-check the rest.

Also spot-check 3 candidate lists against the official links on their race pages (the helpers' work was spot-checked for NJ, ME, WY, TX and FL, and all matched).

## Priority 5: Spot-check candidate positions (new, about 10 minutes per race)

A script already confirmed every quote is word for word on the candidate's site. What it can't judge is whether the AI picked a **fair** passage. For each newly researched race:

1. Open the race's **Side by side** page (e.g. `/races/va-sen/compare/`) and click through to each candidate's site.
2. Ask: is this the passage that most directly says what they'd do on the issue (rule 4 on `/issues/#rules`)? Is "No position found" really true on the pages listed?
3. If a pick looks unfair, tell Claude which one and why.

Researched so far (Sep 28): **VA Senate and VA-01, 02, 03, 05, 06, 07, 08, 09, 10, 11; Senate races in OH (special), AK, IA, NH, NC, ME, MI, TX, GA, KS**. A good sample to start with: VA-02 (4 candidates), VA-07 (6 candidates), and NC Senate.

Blocked or broken sites:
- **VA-04 is on hold**: Robert Murray's site (murrayforcongress.com, from the state list) is blocked by a safety filter on our network. It shows a "safebrowse.io" warning page. Before opening it yourself, you could check the address with Google's Safe Browsing site status tool (transparencyreport.google.com/safe-browsing/search). If it's safe, tell Claude, and VA-04 (McClellan and Bell are already researched) can be finished.
- **VA-07, Joshua Ertle**: the site on the state list (www.joshua.vote) showed a security warning, and "page not found" without "www". He's marked "no website found." Recheck in a week.
- **AK Senate, Daniel J. Sullivan Jr.**: the site on Alaska's official list (www.sullivanforsenate.com) didn't load for us. Try it in your browser. Gerald Heikes has no site on the official list.
- **Other no-website candidates**: Geral Staten (VA-02) and Cooke Harvey (VA-05; he has a YouTube channel, which our rules don't use).

---

## Smaller items

- **VA-11 incumbent**: Gerald Connolly won in 2024; the state lists James Walkinshaw as incumbent. Needs an official source (2025 special election results) before we add a note.
- **Mail ballot deadline**: shown as Friday, Nov 6 (the state says "noon on the third day following the election"). Worth confirming a calendar date from an official source.
- **Redistricting notes** for TX-34, FL-14, FL-25, OH-07 and OH-09 cite Wikipedia. Swap in the official map adoption records (Texas Legislature, Florida Legislature, Ohio Redistricting Commission) when convenient.
- **2024 state polling errors** were typed in from the AAPOR report (Appendix I.2, p. 71). AAPOR says a CSV will be posted. Swap it in when available.
- **Campaign website links** are only filled in for Virginia so far (from the state list). Other states: Phase 4.
- **Glossary**: plain-English definitions and "in sports terms" lines were written by us. Worth a skim.
- **Pollster track records**: FiveThirtyEight grades (frozen Sep 2024). Several newer pollsters have none.

## Sites our tools couldn't read (so a person has to)

Cook Political Report, Inside Elections, Sabato's Crystal Ball, VPAP, Virginia Mercury, Politico, New York Times, University of New Hampshire PDFs, Google Drive, and official election sites for NH, RI, AZ, MA (candidate page), PA, NY, WI, GA, KS, AR, OH, TN. We didn't try to get around these blocks.
