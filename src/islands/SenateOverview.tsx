/**
 * National Senate overview: equal-size tile map + list.
 * Color by forecaster ratings or by our polling average, and apply
 * "what if the polls are wrong?" to every race at once.
 * Math comes from src/lib/average.ts (same as race pages and tests).
 */
import { useMemo, useState } from 'preact/hooks';
import { applyMiss, isTossup, type CycleMiss } from '../lib/average';
import { TILES } from '../lib/tilegrid';

export type OverviewRace = {
  state: string;
  stateName: string;
  raceId: string;
  special: boolean;
  ratingFill: string | null;
  ratingText: string;
  ratingShort: string; // e.g. "Lean D"

  margin: number | null; // D minus R, our average; null if no recent polls or no D-vs-R matchup
  pollCount: number;
  demName: string | null;
  repName: string | null;
  note: string | null; // e.g. "No Democrat on the ballot"
  misses: CycleMiss[];
};
type Mode = 'rating' | 'polls';

const fmt = (x: number) => Math.abs(x).toFixed(1);
const marginFill = (m: number, typical: number) => {
  if (isTossup(m, typical)) return 'var(--neutral)';
  const side = m > 0 ? 'dem' : 'rep';
  const strength = Math.min(1, (Math.abs(m) - typical) / 15);
  return `color-mix(in oklab, var(--${side}) ${Math.round(40 + 60 * strength)}%, var(--neutral))`;
};

export default function SenateOverview({ races, typicalMiss, cycles }: { races: OverviewRace[]; typicalMiss: number; cycles: number[] }) {
  const [mode, setMode] = useState<Mode>('rating');
  const [cycle, setCycle] = useState<number | null>(null);
  const [mirror, setMirror] = useState(false);

  const shifted = useMemo(
    () =>
      races.map((r) => {
        const miss = cycle != null ? r.misses.find((m) => m.cycle === cycle) ?? null : null;
        const m = r.margin == null ? null : miss ? applyMiss(r.margin, miss.signed, mirror) : r.margin;
        return { ...r, shownMargin: m, miss };
      }),
    [races, cycle, mirror],
  );
  const withPolls = shifted.filter((r) => r.margin != null);
  const changed = withPolls.filter((r) => Math.sign(r.shownMargin!) !== Math.sign(r.margin!) && Math.abs(r.shownMargin!) > 0.05);
  const tossups = withPolls.filter((r) => isTossup(r.shownMargin!, typicalMiss));
  const says = (r: (typeof shifted)[number], m: number) =>
    Math.abs(m) < 0.05 ? 'Tied' : `${(m > 0 ? r.demName : r.repName) ?? (m > 0 ? 'Dem.' : 'Rep.')} +${fmt(m)}`;
  const byState = new Map(shifted.map((r) => [r.state, r]));
  const fill = (r: (typeof shifted)[number]) =>
    mode === 'rating' ? r.ratingFill ?? 'var(--surface-2)' : r.shownMargin == null ? 'var(--surface-2)' : marginFill(r.shownMargin, typicalMiss);
  const sortedList = [...shifted].sort((a, b) => {
    const am = a.shownMargin == null ? 999 : Math.abs(a.shownMargin), bm = b.shownMargin == null ? 999 : Math.abs(b.shownMargin);
    return am - bm || a.stateName.localeCompare(b.stateName);
  });

  return (
    <div class="overview">
      <div class="modes" role="group" aria-label="Color the map by">
        <span class="muted small">Color by:</span>
        <button type="button" aria-pressed={mode === 'rating'} onClick={() => setMode('rating')}>Forecasters</button>
        <button type="button" aria-pressed={mode === 'polls'} onClick={() => setMode('polls')}>Our polling average</button>
      </div>

      {mode === 'polls' && (
        <fieldset class="avg-controls">
          <legend>What if the polls are wrong?</legend>
          <div class="seg" role="radiogroup" aria-label="Apply a past polling miss to every race">
            {[null, ...cycles].map((c) => (
              <label key={String(c)} class={cycle === c ? 'on' : ''}>
                <input type="radio" name="ov-cycle" checked={cycle === c} onChange={() => setCycle(c)} />
                {c ?? 'As polled'}
              </label>
            ))}
          </div>
          <label class="switch"><input type="checkbox" checked={mirror} disabled={cycle == null} onChange={(e) => setMirror(e.currentTarget.checked)} /> Flip it: same size miss, other direction</label>
          <p class="small text-2" aria-live="polite">
            {withPolls.length} race{withPolls.length === 1 ? ' has' : 's have'} a polling average.{' '}
            {cycle != null
              ? `If polls miss like ${cycle}${mirror ? ' (flipped)' : ''}: ${changed.length} change leader, ${tossups.length} ${tossups.length === 1 ? 'is' : 'are'} within a typical polling miss (±${typicalMiss}).`
              : `${tossups.length} ${tossups.length === 1 ? 'is' : 'are'} within a typical polling miss (±${typicalMiss}).`}
          </p>
        </fieldset>
      )}

      <div class="tiles" role="list" aria-label="States with a Senate race in 2026">
        {Object.entries(TILES).map(([st, [c, r]]) => {
          const race = byState.get(st);
          const style = { gridColumn: c + 1, gridRow: r + 1 };
          if (!race) return <div key={st} class="tile none" style={style} aria-hidden="true">{st}</div>;
          const m = race.shownMargin;
          const label = mode === 'rating' ? race.ratingShort : m == null ? '—' : Math.abs(m) < 0.05 ? 'Tie' : `${m > 0 ? 'D' : 'R'}+${fmt(m)}`;
          return (
            <a key={st} role="listitem" href={`/races/${race.raceId}/`} class="tile" style={{ ...style, background: fill(race) }}
              aria-label={`${race.stateName}${race.special ? ' special election' : ''}: ${mode === 'rating' ? race.ratingText : race.shownMargin == null ? 'no polling average' : says(race, race.shownMargin)}`}>
              <span class="st">{st}{race.special ? '*' : ''}</span>
              <span class="lbl">{label}</span>
            </a>
          );
        })}
      </div>
      <p class="legend small muted">
        {mode === 'rating'
          ? 'Average of Cook, Inside Elections and Sabato. Teal leans Democratic, amber leans Republican, gray is a toss-up. Darker = more one-sided.'
          : `Gray = within a typical polling miss (±${typicalMiss}). Darker = bigger lead. Blank = no average: no recent polls, polls still being checked, or no Democrat-vs-Republican matchup.`}{' '}
        * special election. Every state is the same size on purpose.
      </p>

      <details class="more" open>
        <summary>All {races.length} races, closest first</summary>
        <div class="table-scroll">
          <table class="small">
            <thead><tr><th>Race</th><th>Forecasters</th><th class="num">{cycle != null ? `If polls miss like ${cycle}` : 'Our average'}</th></tr></thead>
            <tbody>
              {sortedList.map((r) => (
                <tr key={r.raceId}>
                  <td><a href={`/races/${r.raceId}/`}>{r.stateName}{r.special ? ' (special)' : ''}</a></td>
                  <td>{r.ratingText}</td>
                  <td class="num">{r.shownMargin == null ? <span class="muted">{r.note ?? 'No recent polls'}</span> : says(r, r.shownMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
