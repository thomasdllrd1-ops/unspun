# Unspun: the 2026 midterms, sourced

A mobile-first site that helps 18–25 year olds understand the 2026 U.S. midterms without spin. Every number links to its source, every candidate gets the same template, and anything we can't confirm stays blank.

See `CLAUDE.md` for the project rules and `NEEDS_REVIEW.md` for what's waiting on a human check.

## Run it on your computer

```bash
npm install        # first time only
npm run dev        # open http://localhost:4321
```

`npm run dev` shows **preview mode**: items still pending a check appear with a yellow "Pending check" tag. The public site never shows them.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Local site with live reload (shows pending items) |
| `npm run validate` | Checks every data file. Tells you the file + row if something's wrong |
| `npm test` | Runs the poll-math and fairness tests |
| `npm run build` | Validates data, then builds the public site into `dist/` |
| `npm run fetch:fec` | Pulls the latest fundraising totals from the FEC |
| `npm run build:geo` | Rebuilds the Virginia district map from Census files |

## Where things live

```
data/                 ← all facts (JSON/CSV), versioned in git
  sources.json        every source, with the date we checked it
  races.json          races in scope
  candidates.json     candidates, exactly as certified by the state
  ratings.csv         Cook / Inside Elections / Sabato ratings
  polls/              polls.csv + poll_results.csv (+ TEMPLATE.csv)
  past_results.csv    official past results
  money/              FEC totals (generated, don't edit by hand)
  how_to_vote/        voting deadlines and rules
  virginia/           redistricting explainer
  geo/                district map (generated)
src/lib/              data loading, rules (schema.ts), poll math
src/components/       shared pieces: every race and candidate uses the same ones
src/pages/            one file per page type
scripts/              data scripts (FEC, map, validation)
tests/                automated tests
```

## Add a poll

1. Copy the example row from `data/polls/TEMPLATE.csv` into `data/polls/polls.csv`.
2. Add one row per answer to `data/polls/poll_results.csv` (use the candidate's `id` from `candidates.json`, or leave it blank and fill `label`, e.g. "Undecided").
3. Add the pollster's release to `data/sources.json` and put its `id` in the poll's `source` column.
4. Set `status` to `pending` until you've checked every number against the release, then `verified`.
5. Run `npm run validate`.

## FEC API key

Copy `.env.example` to `.env` and paste your free key from https://api.data.gov/signup/. Without it the script uses `DEMO_KEY`, which is limited to a few requests an hour. `.env` is never committed.

## License

Code: MIT. Data in `/data`: CC BY-SA 4.0 (some poll listings were found via Wikipedia, which uses the same license).
