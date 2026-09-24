/**
 * Interactive Virginia district map (Preact island).
 *
 * - Tap a district on the map, or use the 11 district buttons below it.
 * - Without JavaScript, the buttons are plain links to each race page.
 * - Color never carries meaning alone: every district's details are in text.
 */
import { useState } from 'preact/hooks';

export type DistrictInfo = {
  number: number;
  raceId: string;
  name: string;
  d: string;
  label: [number, number];
  anchor: [number, number] | null;
  ratingFill: string | null;
  ratingText: string;
  resultFill: string;
  resultText: string;
  candidates: { name: string; party: string; color: string; incumbent: boolean }[];
  raised: { name: string; amount: string }[];
};

type Mode = 'rating' | 'result';

export default function VaMap({ viewBox, districts, hasRatings }: { viewBox: string; districts: DistrictInfo[]; hasRatings: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>(hasRatings ? 'rating' : 'result');
  const current = districts.find((d) => d.number === selected) ?? null;

  const fillFor = (d: DistrictInfo) => (mode === 'rating' ? d.ratingFill ?? 'var(--surface-2)' : d.resultFill);
  const pick = (n: number) => (e?: Event) => {
    e?.preventDefault();
    setSelected((s) => (s === n ? null : n));
  };

  return (
    <div class="vamap">
      <div class="modes" role="group" aria-label="Color the map by">
        <span class="muted small">Color by:</span>
        <button type="button" aria-pressed={mode === 'rating'} onClick={() => setMode('rating')} disabled={!hasRatings}
          title={hasRatings ? undefined : 'Ratings are being double-checked'}>
          Forecaster rating
        </button>
        <button type="button" aria-pressed={mode === 'result'} onClick={() => setMode('result')}>2024 result</button>
      </div>

      <svg viewBox={viewBox} class="map" role="img"
        aria-label="Map of Virginia's 11 congressional districts. Use the district buttons below the map to explore each one.">
        {districts.map((d) => (
          <path
            key={d.number}
            d={d.d}
            fill={fillFor(d)}
            class={`district${selected === d.number ? ' selected' : ''}`}
            onClick={pick(d.number)}
            aria-hidden="true"
          />
        ))}
        {districts.map((d) =>
          d.anchor ? (
            <line key={`l${d.number}`} x1={d.anchor[0]} y1={d.anchor[1]} x2={d.label[0]} y2={d.label[1] - 6} class="callout" aria-hidden="true" />
          ) : null,
        )}
        {districts.map((d) => (
          <text key={`t${d.number}`} x={d.label[0]} y={d.label[1]} class={`dlabel${selected === d.number ? ' selected' : ''}`} aria-hidden="true">
            {d.number}
          </text>
        ))}
      </svg>

      <p class="legend small muted">
        {mode === 'rating'
          ? 'Teal = leans Democratic, amber = leans Republican, gray = toss-up. Darker = more one-sided. Average of 3 forecasters.'
          : "Party of the 2024 winner. Teal = Democrat, amber = Republican. Darker = bigger win. Past results don't decide 2026."}
      </p>

      <div class="dbuttons" role="group" aria-label="Choose a district">
        {districts.map((d) => (
          <a key={d.number} href={`/races/${d.raceId}/`} class="dbtn" aria-current={selected === d.number ? 'true' : undefined}
            onClick={pick(d.number)} aria-label={`District ${d.number}. ${mode === 'rating' ? d.ratingText : d.resultText}`}>
            <span class="swatch" style={{ background: fillFor(d) }} aria-hidden="true" />
            {d.number}
          </a>
        ))}
      </div>

      <div class="panel card" aria-live="polite">
        {current ? (
          <div>
            <div class="eyebrow">VA-{current.number}</div>
            <h3>{current.name}</h3>
            <p class="small"><strong>Forecasters:</strong> {current.ratingText}</p>
            <p class="small"><strong>2024:</strong> {current.resultText}</p>
            <ul class="plist">
              {current.candidates.map((c) => (
                <li key={c.name}>
                  <span class={`dot ${c.color}`} aria-hidden="true" /> {c.name}{' '}
                  <span class="muted">({c.party}{c.incumbent ? ', incumbent' : ''})</span>
                </li>
              ))}
            </ul>
            {current.raised.length > 0 && (
              <p class="small muted">Raised (FEC): {current.raised.map((r) => `${r.name} ${r.amount}`).join(' · ')}</p>
            )}
            <a class="btn" href={`/races/${current.raceId}/`}>Full race page →</a>
          </div>
        ) : (
          <p class="muted">Tap a district on the map, or pick a number above.</p>
        )}
      </div>
    </div>
  );
}
