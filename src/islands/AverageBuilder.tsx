/**
 * Our polling average + "build your own" toggles + "what if the polls are wrong?".
 * All math comes from src/lib/average.ts (the same code the build uses and the tests check).
 */
import { useMemo, useState } from 'preact/hooks';
import {
  pollingAverage, drMargin, applyMiss, isTossup, partisanWeight, DEFAULT_WINDOW_DAYS, SHORT_WINDOW_DAYS,
  type AvgPoll, type CycleMiss,
} from '../lib/average';

type Cand = { id: string; name: string; color: 'dem' | 'rep' | 'other'; party: string };
type Props = {
  today: string;
  polls: AvgPoll[];
  candidates: Cand[];
  demId: string | null;
  repId: string | null;
  typicalMiss: number;
  misses: (CycleMiss & { sourceLabel: string; sourceUrl: string })[];
  stateName: string;
  pollLabels: Record<string, string>;
};

const fmt = (x: number) => x.toFixed(1);

export default function AverageBuilder(p: Props) {
  const [noPartisan, setNoPartisan] = useState(false);
  const [lvOnly, setLvOnly] = useState(false);
  const [short, setShort] = useState(false);
  const [cycle, setCycle] = useState<number | null>(null);
  const [mirror, setMirror] = useState(false);

  const byId = useMemo(() => new Map(p.candidates.map((c) => [c.id, c])), [p.candidates]);
  const base = useMemo(() => pollingAverage(p.polls, { today: p.today }), [p.polls, p.today]);
  const avg = useMemo(
    () => pollingAverage(p.polls, { today: p.today, noPartisan, lvOnly, windowDays: short ? SHORT_WINDOW_DAYS : DEFAULT_WINDOW_DAYS }),
    [p.polls, p.today, noPartisan, lvOnly, short],
  );
  const customized = noPartisan || lvOnly || short;

  /** "Wittman +3.3" from a D-minus-R margin. */
  const says = (m: number) => {
    if (Math.abs(m) < 0.05) return 'Tied';
    const id = m > 0 ? p.demId : p.repId;
    return `${byId.get(id!)?.name ?? (m > 0 ? 'Democrat' : 'Republican')} +${fmt(Math.abs(m))}`;
  };

  const margin = avg ? drMargin(avg.shares, p.demId, p.repId) : null;
  const baseMargin = base ? drMargin(base.shares, p.demId, p.repId) : null;
  const miss = cycle != null ? p.misses.find((m) => m.cycle === cycle) ?? null : null;
  const shown = margin != null && miss ? applyMiss(margin, miss.signed, mirror) : margin;
  const sorted = avg ? Object.entries(avg.shares).sort((a, b) => b[1] - a[1]) : [];
  const pollsters = avg ? new Set(avg.used.map((u) => u.pollster)).size : 0;
  const pw = avg ? partisanWeight(avg, p.polls) : null;
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const sides = pw
    ? [pw.D > 0 && `${pct(pw.D)} Democratic-aligned`, pw.R > 0 && `${pct(pw.R)} Republican-aligned`, pw.other > 0 && `${pct(pw.other)} unknown side`].filter(Boolean).join(', ')
    : '';
  /** "Virginia's presidential polls" / "Senate polls across all states" */
  const whose = (m: CycleMiss) => {
    const kind = m.contest.startsWith('President') ? 'presidential polls' : 'Senate polls';
    return m.scope === 'state' ? `${p.stateName}'s ${kind}` : `${kind} across all states`;
  };

  return (
    <div class="avg">
      <div aria-live="polite">
        {!avg ? (
          <p class="headline">No polls match these settings. Try turning a filter off.</p>
        ) : (
          <>
            <div class="avg-head">
              <div>
                <div class="eyebrow">{miss ? `If polls miss like ${miss.cycle}${mirror ? ' (flipped)' : ''}` : customized ? 'Your average' : 'Our average'}</div>
                <div class="avg-big">{shown != null ? says(shown) : `${byId.get(sorted[0][0])?.name} leads`}</div>
              </div>
              {shown != null && isTossup(shown, p.typicalMiss) && <span class="chip">Toss-up</span>}
            </div>
            {shown != null && (
              <p class="small text-2">
                A typical polling miss is about ±{fmt(p.typicalMiss)} points, so the real result could land anywhere from{' '}
                <strong>{says(shown - p.typicalMiss)}</strong> to <strong>{says(shown + p.typicalMiss)}</strong>.
              </p>
            )}
            <ul class="avg-bars">
              {sorted.map(([id, v]) => {
                const c = byId.get(id);
                return (
                  <li key={id}>
                    <span class="name">{c?.name ?? id}</span>
                    <span class="track" aria-hidden="true"><span class={`fill ${c?.color ?? 'other'}`} style={{ width: `${v}%` }} /></span>
                    <span class="val num">{fmt(v)}%</span>
                  </li>
                );
              })}
            </ul>
            {miss && <p class="small muted">Bars show the polls as reported. The headline applies the {miss.cycle} miss.</p>}
            {pw && pw.total > 0.005 && (
              <p class="small partisan-note">
                <strong>{pw.total > 0.995 ? 'All' : pct(pw.total)}</strong> of this average comes from polls paid for by a campaign, party, or partisan group ({sides}).
              </p>
            )}
            <p class="small muted">
              Based on {avg.used.length} poll{avg.used.length === 1 ? '' : 's'} from {pollsters} pollster{pollsters === 1 ? '' : 's'}
              {miss && ' · as polled: ' + (margin != null ? says(margin) : '—')}
              {customized && !miss && baseMargin != null && margin != null && (
                <> · {Math.abs(margin - baseMargin) < 0.05 ? 'same as our average' : `moved ${fmt(Math.abs(margin - baseMargin))} pts from our average (${says(baseMargin)})`}</>
              )}
            </p>
          </>
        )}
      </div>

      <fieldset class="avg-controls">
        <legend>Build your own average</legend>
        <label class="switch"><input type="checkbox" checked={noPartisan} onChange={(e) => setNoPartisan(e.currentTarget.checked)} /> Remove polls paid for by a campaign, party, or partisan group</label>
        <label class="switch"><input type="checkbox" checked={lvOnly} onChange={(e) => setLvOnly(e.currentTarget.checked)} /> Likely voters only</label>
        <label class="switch"><input type="checkbox" checked={short} onChange={(e) => setShort(e.currentTarget.checked)} /> Last 2 weeks only</label>
      </fieldset>

      {margin != null && p.misses.length > 0 && (
        <fieldset class="avg-controls">
          <legend>What if the polls are wrong?</legend>
          <div class="seg" role="radiogroup" aria-label="Apply a past polling miss">
            {[null, ...p.misses.map((m) => m.cycle)].map((c) => (
              <label key={String(c)} class={cycle === c ? 'on' : ''}>
                <input type="radio" name="cycle" checked={cycle === c} onChange={() => setCycle(c)} />
                {c ?? 'As polled'}
              </label>
            ))}
          </div>
          <label class="switch"><input type="checkbox" checked={mirror} disabled={!miss} onChange={(e) => setMirror(e.currentTarget.checked)} /> Flip it: same size miss, other direction</label>
          {miss && (
            <p class="small text-2 miss-note">
              In {miss.cycle}, {whose(miss)} overstated{' '}
              <strong>{miss.signed > 0 ? 'Democrats' : 'Republicans'} by {fmt(Math.abs(miss.signed))} points</strong> on average
              {miss.scope === 'state' ? ` (${miss.polls} polls)` : ` (no ${p.stateName}-specific figure with enough polls)`}.{' '}
              {mirror ? 'Flipped, that miss goes the other way.' : 'If today’s polls are off the same way:'}{' '}
              <strong>{says(shown!)}</strong>. Source: <a href={miss.sourceUrl} target="_blank" rel="noopener">{miss.sourceLabel} ↗</a>
            </p>
          )}
        </fieldset>
      )}

      {avg && (
        <details class="more">
          <summary>Which polls count, and how much</summary>
          <table class="small">
            <thead><tr><th>Poll</th><th class="num">Weight</th></tr></thead>
            <tbody>
              {avg.used.map((u) => <tr key={u.id}><td>{p.pollLabels[u.id] ?? u.pollster}</td><td class="num">{Math.round(u.share * 100)}%</td></tr>)}
              {avg.skipped.map((s) => <tr key={s.id} class="muted"><td>{p.pollLabels[s.id] ?? s.pollster}</td><td class="num">left out: {s.reason}</td></tr>)}
            </tbody>
          </table>
          <p class="small muted">Weight = recency × sample size. A poll loses half its weight every 14 days. Full formula on <a href="/show-our-work/#average">Show our work</a>.</p>
        </details>
      )}
    </div>
  );
}
