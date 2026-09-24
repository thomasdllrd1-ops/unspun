/** Formatting helpers. Dates are read as calendar days (UTC) so they never shift by time zone. */

export function money(n: number | null | undefined): string {
  if (n == null) return '—';
  const a = Math.abs(n);
  if (a >= 1e6) return `$${(n / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`;
  if (a >= 1e4) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts });

/** "Oct 23, 2026" */
export const date = (iso: string) => fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
/** "Oct 23" */
export const dateShort = (iso: string) => fmt({ month: 'short', day: 'numeric' }).format(new Date(iso));
/** "Friday, Oct 23" */
export const dateDay = (iso: string) => fmt({ weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(iso));

/** "May 1–5, 2026" style range. */
export function dateRange(start: string, end: string): string {
  if (!start) return end ? date(end) : 'Dates not stated';
  if (!end || start === end) return date(start);
  const s = new Date(start), e = new Date(end);
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth())
    return `${dateShort(start)}–${e.getUTCDate()}, ${e.getUTCFullYear()}`;
  return `${dateShort(start)} – ${date(end)}`;
}

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Whole days from today until an ISO date (0 = today). */
export function daysUntil(iso: string, today = new Date()): number {
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((Date.parse(iso) - t) / 86_400_000);
}
