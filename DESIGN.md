# Unspun Design System — "Oval Office Edition"

Read this file before any UI work on Unspun. (Adopted Oct 9, 2026; replaces the Sep 28 scoreboard look. The plain-English sports words — "score," "too close to call," "under review" — stay in the copy.)

## Concept
A civics handout a poli-sci teacher would actually be proud to pass out: Oval Office navy and gold, cream paper, a thin flag-stripe band, heraldic eagle. Patriotic but restrained — never "over the top." Graphics carry the page; text stays short.

## Colors
| Token | Hex | Use |
|---|---|---|
| `--navy` | `#1B2A47` | Header, footer, dark bands, headings |
| `--navy-2` | `#2E4166` | Map fills on navy backgrounds |
| `--gold` | `#B08D3C` | Rules, frames, plinths (decoration only — not body text) |
| `--gold-light` | `#D4B26A` | Gold on navy (numbers, eagle, stars) |
| `--gold-dark` | `#7A5E1E` | Gold when used as text on cream |
| `--oxblood` | `#8B1E2D` | Primary button, eyebrow labels, years, stripes |
| `--paper` | `#F4EEDF` | Page background |
| `--paper-2` | `#FBF8F0` | Cards |
| `--paper-3` | `#EAE1CB` | Alternate section band |
| `--rule` | `#CDBF9C` | Borders, dividers |
| `--ink` | `#2A2418` | Body text |
| `--ink-soft` | `#3A3426` | Secondary text |
| `--ink-mute` | `#5A4A2A` | Captions, datelines |

**Party colors** (blue = Democratic, red = Republican, teal = every other party) mark party data only — chips, bars, map fills that mean a party. They are their own tokens (`--dem`, `--rep`, `--other`), tuned to pass 4.5:1 on cream and on navy, and never reused as brand colors. Party names are always written out, so color never carries meaning alone. No purple anywhere.

**On maps, Virginia is marked in gold, never oxblood** — navy-plus-red on a political map reads as "blue states, red state."

**Night edition (dark mode, follows the phone's setting):** navy page (`--navy`), `--navy-2` cards, cream text, gold accents. Same fonts and layout.

## Fonts (self-hosted via `@fontsource` — no requests to Google)
- **Libre Caslon Display** — big headlines, numbers, logo wordmark
- **Libre Caslon Text** — sub-heads, candidate names, lead sentences
- **Public Sans** — body text and UI (the U.S. government's own typeface)
- **IBM Plex Mono** — datelines, data, poll receipts, labels

Never use Inter, Roboto, Arial, or system defaults for visible text.

## Voice
- Talk to readers like a smart friend, not a teacher.
- Max ~12 words per sentence. Headlines 2–5 words.
- No lectures, no "why this matters," no telling people how to think.
- If a graphic can say it, cut the sentence.

## Components (build each as an Astro component)
1. **StripeBand** — 18px band of thin horizontal oxblood/paper stripes, top and bottom of page.
2. **Masthead** — navy bar, gold Capitol icon + "UNSPUN" wordmark, nav links, 4px gold bottom border.
3. **Dateline** — mono uppercase strip: Election Day date + days-remaining countdown (computed), plus the next key Virginia deadline.
4. **EagleMedallion** — navy circle, gold rings, 13 gold stars, gold heraldic eagle (`/images/eagle-gold.svg`). This is an ORIGINAL emblem — never use the real Presidential Seal (restricted by federal law).
5. **StatStrip** — navy band of big gold Caslon numbers with small caps labels. Every number computed from our data, with its source.
6. **SenateMap** — U.S. states: navy = a race we cover, gold = Virginia, tan = none. Every state with a race is a link into its state page (`/states/<code>/`).
7. **VirginiaMap** — 133 counties/cities on navy. Tap one to see its U.S. House district(s) and the Senate race. A plain list of localities sits under it for no-JavaScript and screen-reader use.
8. **CandidateCard** — gilt oval portrait frame, role label, name, party chip, 3 priorities in their own words, money. Every candidate in the race gets a card — never just "incumbent vs. challenger."
9. **PollReceipt** — mono "receipt": pollster, who paid, sample, results, margin, lean tag.
10. **Midterms past** — one sourced chart of the president's party's House seat change in each midterm; the bust graphic is decoration only. No "you decide" framing.

## Images
- Incumbents: official congressional portraits (public domain) from bioguide.congress.gov.
- Everyone else: a headshot the candidate published themselves (campaign site or press kit), with a credit line. Wikimedia Commons with credit if that's all there is. Initials in the frame if there's no photo.
- **Every portrait gets the same engraving treatment** (grayscale, warm sepia, same crop, same gilt oval), so official portraits and campaign snapshots look equally finished.
- Always save images into `public/images/` — never hotlink. Credits live in `data/photos.json`.
- Credits: maps from U.S. Census Bureau; icons from game-icons.net (CC BY 3.0) — keep the footer credit.

## Rules
- Every number shows its source.
- Touch targets ≥ 44px. Text contrast ≥ 4.5:1.
- Must work at phone width (stack columns, maps scale to 100% width).
- Include a print stylesheet so pages print as a clean handout.
