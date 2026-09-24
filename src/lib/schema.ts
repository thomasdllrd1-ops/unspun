/**
 * The rules every data file must follow. Used by both the website build and
 * `npm run validate`, so a record without a source can never reach the site.
 */
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD');
const url = z.url({ protocol: /^https$/, error: 'links must be full https:// URLs' });
const sourceId = z.string().min(1);
/** A number from a CSV cell. A blank cell means "not known" (null), never 0. */
const csvNumber = z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().positive().nullable());

export const SourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url,
  file_url: url.optional(),
  type: z.enum(['official', 'news', 'reference', 'pollster', 'forecaster', 'campaign', 'organization']),
  published: isoDate.optional(),
  accessed: isoDate,
});

export const PartySchema = z.object({
  id: z.string(),
  name: z.string(),
  abbr: z.string().max(2),
  color: z.enum(['dem', 'rep', 'other']),
});

export const RaceSchema = z.object({
  id: z.string().regex(/^[a-z]{2}-(sen|sen-special|\d{2})$/),
  state: z.string().length(2),
  chamber: z.enum(['senate', 'house']),
  district: z.number().int().positive().nullable(),
  name: z.string(),
  short: z.string(),
  election_date: isoDate,
  source: sourceId,
});

export const CandidateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  race: z.string(),
  ballot_name: z.string(),
  sort_name: z.string(),
  party: z.string(),
  incumbent: z.boolean(),
  website: url.nullable(),
  fec_id: z.string().regex(/^[HSP]\d[A-Z]{2}\d{5}$/).nullable(),
  source: sourceId,
});

export const RATING_VALUES = ['solid-d', 'likely-d', 'lean-d', 'tossup', 'lean-r', 'likely-r', 'solid-r'] as const;
export const FORECASTERS = ['cook', 'inside', 'sabato'] as const;
const status = z.enum(['pending', 'verified']);

export const RatingSchema = z.object({
  race: z.string(),
  forecaster: z.enum(FORECASTERS),
  rating: z.enum(RATING_VALUES),
  as_of: isoDate,
  source: sourceId,
  found_via: z.string(),
  status,
  verified_by: z.string(),
  verified_on: z.union([isoDate, z.literal('')]),
  notes: z.string(),
});

export const SPONSOR_TYPES = ['independent', 'media', 'academic', 'campaign', 'party', 'partisan-aligned', 'not-stated', 'unknown'] as const;
export const PollSchema = z.object({
  id: z.string(),
  race: z.string(),
  pollster: z.string(),
  sponsor: z.string(),
  sponsor_type: z.enum(SPONSOR_TYPES),
  sponsor_lean: z.enum(['D', 'R', 'none', 'unknown']),
  population: z.enum(['LV', 'RV', 'A', 'unknown']),
  sample_size: csvNumber.refine((n) => n == null || Number.isInteger(n), 'sample size must be a whole number'),
  moe: csvNumber,
  method: z.enum(['phone', 'online', 'text', 'ivr', 'mixed', 'unknown']),
  method_detail: z.string(),
  field_start: z.union([isoDate, z.literal('')]),
  field_end: z.union([isoDate, z.literal('')]),
  released: z.union([isoDate, z.literal('')]),
  source: sourceId,
  status,
  notes: z.string(),
}).refine((p) => p.field_end || p.released, 'each poll needs a field end date or a release date');

export const PollResultSchema = z
  .object({
    poll: z.string(),
    candidate: z.string(), // our candidate id, or blank for "Undecided"/other names
    label: z.string(),
    pct: z.coerce.number().min(0).max(100),
  })
  .refine((r) => r.candidate || r.label, 'each result needs a candidate id or a label');

export const PastResultSchema = z.object({
  race: z.string(),
  year: z.coerce.number().int(),
  contest: z.string(),
  candidate: z.string(),
  party: z.string(),
  votes: z.coerce.number().int().nonnegative(),
  winner: z.enum(['true', 'false']).transform((v) => v === 'true'),
  source: sourceId,
  notes: z.string(),
});

export const PollsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: url.nullable(),
  track_record: z.string().nullable(),
  track_record_note: z.string(),
});

export const GlossarySchema = z.object({ id: z.string(), term: z.string(), short: z.string().min(10) });

export const RedistrictingSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  steps: z.array(
    z.object({ date: isoDate, label: z.string(), title: z.string(), text: z.string(), sources: z.array(sourceId).min(1) }),
  ),
  limits: z.string(),
});

export const HowToVoteSchema = z.object({
  state: z.string(),
  election_date: isoDate,
  headline: z.string(),
  deadlines: z.array(
    z.object({
      date: isoDate,
      time: z.string().optional(),
      label: z.string(),
      detail: z.string(),
      source: sourceId,
      key: z.boolean().optional(),
    }),
  ),
  students: z.array(z.object({ q: z.string(), a: z.string(), source: sourceId, warn: z.boolean().optional() })),
  links: z.array(z.object({ label: z.string(), url, source: sourceId.nullable() })),
  on_ballot: z.string(),
  on_ballot_source: sourceId,
  limits: z.string(),
});

const moneyOk = z.object({
  fec_id: z.string(),
  fec_name: z.string(),
  status: z.literal('ok'),
  receipts: z.number().nullable(),
  disbursements: z.number().nullable(),
  cash_on_hand: z.number().nullable(),
  individual_itemized: z.number().nullable(),
  from_other_committees: z.number().nullable(),
  coverage_start: z.string().nullable(),
  coverage_end: isoDate,
  fec_url: url,
});
const moneyNone = z.object({
  fec_id: z.string().nullable(),
  fec_name: z.string().optional(),
  status: z.enum(['not-registered', 'no-totals', 'no-reports']),
  note: z.string(),
  fec_url: url.optional(),
});
export const MoneySchema = z.object({
  fetched_at: z.string(),
  cycle: z.number(),
  api_url: url,
  candidates: z.record(z.string(), z.union([moneyOk, moneyNone])),
});

export const CorrectionSchema = z.object({
  date: isoDate,
  page: z.string(),
  was: z.string(),
  now: z.string(),
  reported_by: z.string().optional(),
  source: sourceId.optional(),
});

export type Source = z.infer<typeof SourceSchema>;
export type Party = z.infer<typeof PartySchema>;
export type Race = z.infer<typeof RaceSchema>;
export type Candidate = z.infer<typeof CandidateSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Poll = z.infer<typeof PollSchema>;
export type PollResult = z.infer<typeof PollResultSchema>;
export type PastResult = z.infer<typeof PastResultSchema>;
export type Pollster = z.infer<typeof PollsterSchema>;
export type GlossaryTerm = z.infer<typeof GlossarySchema>;
export type Redistricting = z.infer<typeof RedistrictingSchema>;
export type HowToVote = z.infer<typeof HowToVoteSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type MoneyEntry = Money['candidates'][string];
export type Correction = z.infer<typeof CorrectionSchema>;
