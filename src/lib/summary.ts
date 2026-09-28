/**
 * One race, summed up the way a scoreboard would: the "score" (our polling
 * average), the game status, games played (recent checked polls), the form
 * guide (who led the last 5 checked polls), and the expert picks.
 * Every number comes from the same code the race pages use.
 */
import { db, candidatesInRace, ratingsForRace, pollsForRace, resultsForPoll, majorPair, pendingRecentPolls, partyById } from './data';
import { pollingAverage, isTossup, type AvgPoll } from './average';
import { pollDate, daysBetween, RECENT_DAYS } from './polls';
import { consensus, ratingLabel } from './ratings';
import type { Race, Rating } from './schema';

export type Team = { id: string; name: string; party: string; abbr: string; color: 'dem' | 'rep' | 'other'; incumbent: boolean; score: number | null };
export type Status = 'close' | 'lead' | 'review' | 'none';
export type Summary = {
  race: Race;
  teams: Team[]; // the two leading candidates (Democrat and Republican when both run), score = our average
  leader: Team | null;
  margin: number | null; // leader minus runner-up, points
  status: Status;
  gamesPlayed: number; // checked polls in the last 60 days
  underReview: number; // unchecked polls in the last 60 days
  form: ('dem' | 'rep' | 'other' | 'tie')[]; // leader of each of the last 5 checked polls, newest first
  picks: { text: string; rating: Rating['rating'] | null; count: number };
};

export function summarize(race: Race, today = new Date()): Summary {
  const cands = candidatesInRace(race.id);
  const ids = new Set(cands.map((c) => c.id));
  const polls = pollsForRace(race.id);
  const avgPolls: AvgPoll[] = polls.map((p) => ({
    id: p.id, pollster: p.pollster, sponsorType: p.sponsor_type, sponsorLean: p.sponsor_lean, population: p.population,
    sampleSize: p.sample_size, date: pollDate(p),
    shares: Object.fromEntries(resultsForPoll(p.id).filter((r) => ids.has(r.candidate)).map((r) => [r.candidate, r.pct])),
  }));
  const underReview = pendingRecentPolls(race.id, today).length;
  const recent = polls.filter((p) => daysBetween(pollDate(p), today) <= RECENT_DAYS);
  const avg = underReview ? null : pollingAverage(avgPolls, { today: today.toISOString().slice(0, 10) });

  // Pick the two "teams": the Democratic and Republican candidates if both run, else the top two in the average.
  const pair = majorPair(race.id);
  let two = pair.dem && pair.rep ? [pair.dem, pair.rep] : [];
  if (two.length < 2) {
    const ranked = avg ? [...cands].sort((a, b) => (avg.shares[b.id] ?? -1) - (avg.shares[a.id] ?? -1)) : cands;
    two = ranked.slice(0, 2);
  }
  const teams: Team[] = two.map((c) => {
    const p = partyById(c.party);
    return { id: c.id, name: c.sort_name, party: p.name, abbr: p.abbr, color: p.color, incumbent: c.incumbent, score: avg ? avg.shares[c.id] ?? null : null };
  });
  const scored = teams.filter((t) => t.score != null).sort((a, b) => b.score! - a.score!);
  const leader = scored.length === 2 ? scored[0] : null;
  const margin = scored.length === 2 ? scored[0].score! - scored[1].score! : null;

  const status: Status = underReview ? 'review' : margin == null ? 'none' : isTossup(margin, db.pollHistory.typical_miss) ? 'close' : 'lead';

  // Form guide: who led each of the last 5 checked polls (among the two teams).
  const form = avgPolls
    .filter((p) => polls.find((x) => x.id === p.id)?.status === 'verified')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((p) => {
      const [a, b] = teams.map((t) => p.shares[t.id]);
      if (a == null || b == null) return 'tie' as const;
      if (Math.abs(a - b) < 0.05) return 'tie' as const;
      return (a > b ? teams[0] : teams[1]).color;
    });

  const ratings = ratingsForRace(race.id);
  const cons = consensus(ratings);
  const picks = cons
    ? { text: `${ratingLabel(cons)}${new Set(ratings.map((r) => r.rating)).size > 1 ? ' (average)' : ''}`, rating: cons, count: ratings.length }
    : { text: 'Picks under review', rating: null, count: 0 };

  return { race, teams, leader, margin, status, gamesPlayed: recent.length, underReview, form, picks };
}

export const STATUS_TEXT: Record<Status, string> = {
  close: 'Too close to call',
  lead: 'Clear lead',
  review: 'Under review',
  none: 'No recent polls',
};
