/**
 * "Who matches me?" — a blind quiz. For each issue you read what the candidates say with names hidden,
 * pick the one closest to your view, and only at the end see whose words you picked.
 * Nothing is saved or sent anywhere: it all happens on your device.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { tally } from '../lib/quiz';

type Cand = { id: string; name: string; party: string; color: 'dem' | 'rep' | 'other'; href: string };
type Option = { candidate: string; blind: string; heading: string };
type Question = { issue: string; name: string; covers: string; options: Option[]; missing: string[] };
type Props = { race: string; compareHref: string; candidates: Cand[]; questions: Question[]; skipped: { name: string; reason: string }[] };

const LETTERS = 'ABCDEFGH';
const shuffle = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function BlindQuiz(p: Props) {
  const [order, setOrder] = useState<Question[] | null>(null); // null = start screen
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const byId = new Map(p.candidates.map((c) => [c.id, c]));
  const top = useRef<HTMLDivElement>(null);
  // Move keyboard/screen-reader focus to the new question (or the results) after each step.
  useEffect(() => { if (order) top.current?.focus(); }, [step, order]);

  const start = () => {
    setOrder(p.questions.map((q) => ({ ...q, options: shuffle(q.options) })));
    setPicks({});
    setStep(0);
  };

  if (!order) {
    return (
      <div class="quiz card">
        <h2>How it works</h2>
        <ol class="how">
          <li>For each issue, read what the candidates say. <strong>Names are hidden.</strong></li>
          <li>Pick the one closest to your view, or "None of these."</li>
          <li>At the end, see whose words you picked.</li>
        </ol>
        <p class="small muted">{p.questions.length} issues · about {Math.max(2, Math.round(p.questions.length * 0.7))} minutes · your picks stay on your device. We don't save or send them.</p>
        <button class="btn" type="button" onClick={start}>Start the quiz</button>
      </div>
    );
  }

  if (step >= order.length) {
    const counts = tally(picks, p.candidates.map((c) => c.id));
    const answered = Object.values(picks).filter((v) => v !== 'skip').length;
    const max = Math.max(1, ...Object.values(counts));
    return (
      <div class="quiz card" ref={top} tabIndex={-1}>
        <div class="eyebrow">Final score</div>
        <h2>Whose words you picked</h2>
        <ul class="tallies">
          {p.candidates.map((c) => (
            <li>
              <span class={`dot ${c.color}`} aria-hidden="true"></span>
              <a href={c.href}>{c.name}</a>
              <span class="muted small">{c.party}</span>
              <span class="bar" aria-hidden="true"><span class={c.color} style={{ width: `${(counts[c.id] / max) * 100}%` }}></span></span>
              <span class="score">{counts[c.id]}</span>
              <span class="visually-hidden">{counts[c.id] === 1 ? 'pick' : 'picks'}</span>
            </li>
          ))}
        </ul>
        <p class="small muted">Out of {answered} {answered === 1 ? 'issue' : 'issues'} you answered{Object.values(picks).includes('none') ? ` (including "None of these")` : ''}. Candidates are listed alphabetically.</p>

        <h3>Issue by issue</h3>
        <ul class="reveal">
          {order.map((q) => {
            const pick = picks[q.issue];
            return (
              <li>
                <strong>{q.name}:</strong>{' '}
                {pick === 'skip' ? 'You skipped this one.' : pick === 'none' ? 'You picked "None of these."' : <>You picked <strong>{byId.get(pick)?.name}</strong>.</>}
                <div class="small muted">
                  {q.options.map((o, i) => <span>{i > 0 && ' · '}{LETTERS[i]} was {byId.get(o.candidate)?.name}</span>)}
                </div>
              </li>
            );
          })}
        </ul>
        <p class="note small">This isn't advice on how to vote. It only compares a few sentences, mostly from campaign websites, which are written to win votes. Read the full context, check their records, and decide for yourself.</p>
        <p class="row">
          <a class="btn" href={p.compareHref}>See the full quotes, with names</a>
          <button class="btn btn-ghost" type="button" onClick={start}>Start over</button>
        </p>
      </div>
    );
  }

  const q = order[step];
  const chosen = picks[q.issue];
  const choose = (v: string) => setPicks({ ...picks, [q.issue]: v });
  const name = `q-${q.issue}`;
  return (
    <div class="quiz card" ref={top} tabIndex={-1}>
      <div class="progress" aria-hidden="true"><span style={{ width: `${(step / order.length) * 100}%` }}></span></div>
      <fieldset>
        <legend>
          <span class="eyebrow">Issue {step + 1} of {order.length}</span>
          <span class="qname">{q.name}</span>
          <span class="small muted qcovers">Which comes closest to your view?</span>
        </legend>
        <div class="opts">
          {q.options.map((o, i) => (
            <label class={`opt ${chosen === o.candidate ? 'on' : ''}`}>
              <input type="radio" name={name} value={o.candidate} checked={chosen === o.candidate} onChange={() => choose(o.candidate)} />
              <span class="letter" aria-hidden="true">{LETTERS[i]}</span>
              <span class="otext">
                <span class="visually-hidden">Option {LETTERS[i]}: </span>
                {o.heading && <span class="oh">{o.heading}</span>}
                “{o.blind}”
              </span>
            </label>
          ))}
          <label class={`opt opt-plain ${chosen === 'none' ? 'on' : ''}`}>
            <input type="radio" name={name} value="none" checked={chosen === 'none'} onChange={() => choose('none')} />
            <span class="otext">None of these</span>
          </label>
          <label class={`opt opt-plain ${chosen === 'skip' ? 'on' : ''}`}>
            <input type="radio" name={name} value="skip" checked={chosen === 'skip'} onChange={() => choose('skip')} />
            <span class="otext">Skip this issue</span>
          </label>
        </div>
      </fieldset>
      {q.missing.length > 0 && <p class="small muted">Not shown: {q.missing.length === 1 ? '1 candidate' : `${q.missing.length} candidates`} with no position found on this issue.</p>}
      <div class="row nav">
        {step > 0 && <button class="btn btn-ghost" type="button" onClick={() => setStep(step - 1)}>Back</button>}
        <button class="btn" type="button" disabled={!chosen} onClick={() => setStep(step + 1)}>{step + 1 === order.length ? 'See my results' : 'Next issue'}</button>
      </div>
    </div>
  );
}
