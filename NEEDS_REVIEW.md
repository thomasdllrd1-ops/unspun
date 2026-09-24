# Needs review

Everything here is either **hidden from the public site** until a person checks it, or **left blank** because we couldn't confirm it. Nothing on this list was guessed.

When you finish an item, delete it from this file (git keeps the history).

_Last updated: Sep 24, 2026 (Phase 2)_

---

## 1. Race ratings: 36 ratings waiting for your check (≈10 min)

The forecasters' sites block automated tools, so these came from Wikipedia's cited tables. They're **hidden on the public site** until verified. Several Wikipedia "as of" dates for House races are from April/May 2026, so some may be out of date.

**How to check:**
1. Open each page in your browser:
   - Cook: [Senate](https://www.cookpolitical.com/ratings/senate-race-ratings) · [House](https://www.cookpolitical.com/ratings/house-race-ratings)
   - Inside Elections: [Senate](https://insideelections.com/ratings/senate) · [House](https://insideelections.com/ratings/house)
   - Sabato's Crystal Ball: [Senate](https://centerforpolitics.org/crystalball/2026-senate/) · [House](https://centerforpolitics.org/crystalball/2026-house/)
2. For each Virginia row in `data/ratings.csv`, compare the `rating` column with what the site says. Use one of: `solid-d`, `likely-d`, `lean-d`, `tossup`, `lean-r`, `likely-r`, `solid-r` (Sabato's "Safe" = `solid`).
3. If it matches, set `status` to `verified`, `verified_by` to `Thomas`, `verified_on` to today's date (`2026-09-25`). If the forecaster shows a date for the rating, put it in `as_of`.
4. If it doesn't match, fix `rating` and `as_of` first, then mark it verified.
5. Run `npm run validate`.

## 2. Polls waiting for your check (2)

Both are **hidden on the public site**. Numbers came from Wikipedia. The original memos are on sites our tools can't open.

| Poll | Open this | Confirm |
|---|---|---|
| `tulchin-2026-07-va-02` (Tulchin Research for House Majority PAC, VA-2) | [Memo on Politico](https://www.politico.com/f/?id=0000019f-918b-d49c-ad9f-9fbb88d00000) | Dates Jul 9–13, 2026 · 700 likely voters · margin of error (blank now) · method · Kiggans 47 / Luria 47 / undecided 6 |
| `expedition-2026-08-va-05` (Expedition Strategies for Perriello campaign, VA-5) | [Google Drive memo](https://drive.google.com/file/d/1EkjffKo5q9TcJ4GLK9LS-00iPmeBhGS5/view) | Dates Jul 29–Aug 1, 2026 · 602 likely voters · ±3.99 · method · release date (blank now) · McGuire 47 / Perriello 44 / undecided 9 |

Edit `data/polls/polls.csv` (and `poll_results.csv` if numbers differ), then set `status` to `verified`.

## 3. Poll details we left blank or flagged

- **TPSI June poll (`tpsi-2026-06-va-sen`)**: the release doesn't give field dates. Wikipedia says June 12–16, 2026. Left blank.
- **TPSI May poll (`tpsi-2026-05-va-sen`)**: the release says "May 1–5, **2025**." We treat that as a typo for 2026 (it was published May 5, 2026 and asks about the 2026 race). The note on the site says so.
- **"The Virginia Project"** (sponsor of the TPSI May poll): Wikipedia labels it Republican-aligned. The poll release doesn't say. Tagged "leaning not verified" until we find a source.
- **PPP / House Majority PAC poll of VA-1 (`ppp-2025-08-va-01`)**: The Downballot confirms pollster, sponsor, dates, and 41–40. Wikipedia also lists 541 registered voters, ±4.2%, and 19% undecided. Those are unconfirmed and left blank.
- **DCCC poll of VA-1 (`dccc-2026-09-va-01`)**: survey method isn't in the news report. The full memo isn't public.

## 4. Facts still to source

- **VA-11 incumbent**: Gerald Connolly won in 2024, but the state lists James Walkinshaw as the incumbent. We need an official source (e.g. 2025 special election results) before adding a note explaining how the seat changed hands.
- **Mail ballot deadline date**: the state says mailed ballots must arrive "by noon on the third day following the election." We show that as **Friday, Nov 6**. Worth confirming with an official source that states the calendar date.

## 5. FEC matches to double-check

Candidates were matched to FEC records by name + district + party. These are the least certain:
- **J. Matt Baker** (VA-2) → FEC `H6VA02263` "BAKER, MATTHEW"
- **Makiba A. Gaines** (VA-3) → FEC `H6VA02248` (ID prefix says district 2, but FEC lists district 3)
- **Dianne L. Blais** (VA-11) → FEC `H4VA10154` (ID from an earlier run in district 10)
- **Taner E. Demirci Lopez** (VA-7) and **Shelly M. Arnoldi** (VA-8): no FEC registration found by name search. Site says so.

## 6. Other checks

- **Campaign website links** were copied from the state's candidate list and haven't been checked to load. Two candidates list none (Geral Staten, Cooke Harvey).
- **Glossary definitions** were written by us in plain English. Have someone who knows polling skim them, and we'll add "learn more" sources in Phase 5.
- **Pollster track records**: FiveThirtyEight grades added (frozen Sep 2024). The Public Sentiment Institute has no grade there. Other raters (e.g. Silver Bulletin) may cover it, but check their terms first.
- **2024 state polling errors**: typed in from the AAPOR report's Appendix I.2 (p. 71). AAPOR says a CSV will be posted on its task force GitHub. Swap it in when it's available.
- **Map**: district shapes are simplified for speed. Labels for districts 2, 3, 8, and 11 were placed by hand.

## Sites our tools couldn't read (so a person has to)

Cook Political Report, Inside Elections, Sabato's Crystal Ball, VPAP, Virginia Mercury, Politico. We didn't try to get around these blocks.
