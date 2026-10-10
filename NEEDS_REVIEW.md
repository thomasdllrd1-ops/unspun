# Needs review

Everything here is either **hidden from the public site** until a person checks it, or **left blank** because we couldn't confirm it. Nothing on this list was guessed.

**Fastest way to work through it:** run `npm run dev`, open **http://localhost:4321/review/checklist/**, and use the `npm run verify` commands shown there. When you finish an item below, delete it (git keeps the history).

_Last updated: Oct 9, 2026 (all 192 race ratings checked by Thomas and published)_

---

## Priority 1: Candidate lists we couldn't confirm (browser needed)

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

## Priority 2: Polls that need a human (50 recent polls, 22 races on hold)

A race's average stays **on hold** until every poll from the last 60 days is checked, so these block the scoreboard for 22 races. The checklist page lists each one with its source link and the numbers to confirm. Most come from sites that block automated tools:

- **Google Drive** memos (9), **University of New Hampshire** PDFs (7), **DocumentCloud** (5), **New York Times** (3), **Politico** (2), **Change Research** (1)
- **Abacus Data** (5 polls, one article): the numbers are in a chart. Also, the article says its likely-voter results total 1,507 people across the five states, but Wikipedia's per-state sizes add up to 1,594. Check the sample sizes in the chart.
- **Quantus Insights, Maine** (Sep 14–15) didn't load for us. **Quantus, North Carolina (Sep 22)**: Wikipedia links it to a different pollster's page, so we couldn't find it.
- **Hart Research (Louisiana)** and **Aspect Strategic (Montana)**: the only sources we found were social-media posts, not the pollster's release.

If a poll's numbers differ from what we have, fix `data/polls/poll_results.csv` before running `npm run verify -- poll <id>`.

## Priority 3: Spot-check the AI assistant's work

About 40 polls say "checked by an AI assistant." Pick 5 at random on the checklist page (filter `checked_by = ai` in `data/polls/polls.csv`), open each source, and confirm the numbers. If all 5 match, great. If any don't, tell Claude so it can re-check the rest.

Also spot-check 3 candidate lists against the official links on their race pages (the helpers' work was spot-checked for NJ, ME, WY, TX and FL, and all matched).

## Priority 4: Spot-check candidate positions (new, about 10 minutes per race)

A script already confirmed every quote is word for word on the candidate's site. What it can't judge is whether the AI picked a **fair** passage. For each newly researched race:

1. Open the race's **Side by side** page (e.g. `/races/va-sen/compare/`) and click through to each candidate's site.
2. Ask: is this the passage that most directly says what they'd do on the issue (rule 4 on `/issues/#rules`)? Is "No position found" really true on the pages listed?
3. If a pick looks unfair, tell Claude which one and why.

Researched so far (Sep 28): **VA Senate and all 11 VA House districts; Senate races in OH (special), AK, IA, NH, NC, ME, MI, TX, GA, KS, MN, NE, SC, AL, AR, CO, DE, FL (special), ID, IL, KY, LA, MA, MS, MT, NJ, NM, OK, OR, RI, SD, WV, WY; House: NY-17, WI-03, AZ-01, AZ-06, IA-01, CO-08, MI-07, PA-10, IA-03, PA-07**. A good sample to start with: VA-02 (4 candidates), VA-07 (6 candidates), and NC Senate.

Blocked or broken sites:
- **VA-04, Robert Murray**: his site (murrayforcongress.com) is blocked by a security warning on our network and in your browser (Google's Safe Browsing check says it's clean). He's marked "we couldn't read his website." If it ever loads normally, tell Claude.
- **VA-07, Joshua Ertle**: the site on the state list (www.joshua.vote) showed a security warning, and "page not found" without "www". He's marked "no website found." Recheck in a week.
- **AK Senate, Daniel J. Sullivan Jr.**: the site on Alaska's official list (www.sullivanforsenate.com) didn't load for us. Try it in your browser. Gerald Heikes has no site on the official list.
- **SC Senate, Kasie Whitener**: her menu's "On the Issues" link goes to a list of dated blog posts on her campaign site, not an issues list. We used those posts for her stances (no top 3). Check that this seems fair.
- **SC Senate, Mark Hackett**: no campaign website found (official list and a web search, Oct 8).
- **AL Senate, Everett Wess**: his site has a blog with policy posts, but no issues page. Our rules use issues/About/home pages, so only his home page was used. Should candidate blog posts count? (Same question as Kasie Whitener above, and Curtis Stinnett in OK, whose "Main Ideas" menu link is a list of dated posts; we used them.)
- **CO Senate**: no campaign website found for Christopher Baum or Blake Huber (the state Libertarian Party hosts a flyer for Huber). Adam Withrow's "Platform" page says "My first priority is to raise pay," so that's his #1, followed by the first two platform items.
- **MT Senate, Kurt Alme**: his "Priorities" page was placeholder text (lorem ipsum) on Oct 9, so he has no top 3 yet. Recheck before Election Day.
- **"Number one priority" statements**: Adam Withrow (CO) and Kyle Austin (MT) each say outright what their first priority is, so that's their #1 even though it sits above their issue list. Check that this seems fair.
- **TN Senate, Bill Hagerty (on hold)**: his site (teamhagerty.com) shows a bot check to our tools, and there's no archived copy. The other 9 TN candidates are done; the race goes live after Claude reads his site in your Chrome browser (5 minutes, during the supervised Chrome session).
- **TN Senate, Barcy Whitson**: her site's footer says "Not authorized by any candidate or candidate's committee," which looks like the website builder's default text. The site is written in her voice and is the one a candidate guide links to, so we used it. Worth a glance.
- **TN Senate, Jeremy Dean Hearn**: his one-page site is long and hard to follow. His top 3 are the three "Campaign Priorities" he names; his stances are the sentences under his own "INFLATION" and "IMMIGRATION" headings. Check that the picks seem fair.
- **WI-03, Rustin Provance**: his campaign site (the one Wikipedia links for 2026) says ©2022 and some lines refer to 2022. It's what his site shows today, so we used it.
- **WI-03, Alexander Kent**: his campaign page asks voters to decide every issue in his app, so he has no stances on our 6 issues. His site also lists essays he wrote on some issues (abortion, capitalism); like blog posts, we didn't use them (same open question as Whitener/Wess).
- **AZ-01, Monica Alponte**: her top 3 are the first three items in her "Issues near & dear" list (Fiscal Sanity, Prosperity, Parental Sovereignty), shown as names only. Her site's banner says "End the WARS!", while "PEACE & Non-Intervention" is 9th on her list. Check that this seems fair.
- **AZ-06, Juan Ciscomani**: his site has no issues page, so his top 3 come from his "Results" page (Supporting Veterans, Lower Taxes, Federal Dollars). **Gary Swing**'s platform is a campaign message without headings, so he has no top 3. **Jereme Peters**: no website found. Wikipedia also lists Iman Bah (Arizona Independent Party), but Fox 10's list of the five candidates on the ballot doesn't include him.
- **IA-01, Michael Bridgford**: his Issues page shows only 11 headings to our tools (the text may open when clicked), so his top 3 are headings only; his stances come from his home page. **Mariannette Miller-Meeks**: her site has no issues or stances, only a biography, 2024 news posts and a tour schedule.
- **MI-07, Tom Barrett**: his site has a biography and a district page but no issues or stances, so he shows "no position found" on all 6. **Candidate lists to confirm**: Wikipedia lists Isabelle Harman (independent, PA-10) and Matt Althaus (Libertarian, OH-09), who aren't in our candidate list; PA's and OH's official sites block our tools.
- **IA-03, Sarah Trone Garriott**: her 12 issues appear in alphabetical order (likely her website's default), so her top 3 follow that order (A Higher Standard, Economy, Health care). Same rule as everyone; worth a glance.
- **Other no-website candidates**: Geral Staten (VA-02) and Cooke Harvey (VA-05; he has a YouTube channel, which our rules don't use).

---

## Smaller items

- **LA Senate**: Wikipedia's links list a campaign site for Jamie LaBranche (American Party), but Louisiana's official candidate list (checked Sep 25) has only Davis and Letlow. Worth a 1-minute check at voterportal.sos.la.gov.

- **VA-11 incumbent**: Gerald Connolly won in 2024; the state lists James Walkinshaw as incumbent. Needs an official source (2025 special election results) before we add a note.
- **Mail ballot deadline**: shown as Friday, Nov 6 (the state says "noon on the third day following the election"). Worth confirming a calendar date from an official source.
- **Redistricting notes** for TX-34, FL-14, FL-25, OH-07 and OH-09 cite Wikipedia. Swap in the official map adoption records (Texas Legislature, Florida Legislature, Ohio Redistricting Commission) when convenient.
- **2024 state polling errors** were typed in from the AAPOR report (Appendix I.2, p. 71). AAPOR says a CSV will be posted. Swap it in when available.
- **Campaign website links** are only filled in for Virginia so far (from the state list). Other states: Phase 4.
- **Glossary**: plain-English definitions and "in sports terms" lines were written by us. Worth a skim.
- **Pollster track records**: FiveThirtyEight grades (frozen Sep 2024). Several newer pollsters have none.

## Sites our tools couldn't read (so a person has to)

Cook Political Report, Inside Elections, Sabato's Crystal Ball, VPAP, Virginia Mercury, Politico, New York Times, University of New Hampshire PDFs, Google Drive, and official election sites for NH, RI, AZ, MA (candidate page), PA, NY, WI, GA, KS, AR, OH, TN. We didn't try to get around these blocks.
