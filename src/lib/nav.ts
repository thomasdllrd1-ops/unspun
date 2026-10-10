/** The site's sections: the toolbar (tablets and up) and the bottom tab bar (phones). */
export type NavItem = { href: string; label: string; icon: 'MapPin' | 'Landmark' | 'Building2' | 'ChartColumn' | 'Flag' | 'Banknote' | 'Map' | 'Vote' | 'Trophy'; also?: string[] };

export const TOOLBAR: readonly NavItem[] = [
  { href: '/', label: 'Map', icon: 'MapPin', also: ['/states/'] },
  { href: '/senate/', label: 'Senate', icon: 'Landmark' },
  { href: '/house/', label: 'House', icon: 'Building2' },
  { href: '/polls/', label: 'Polls', icon: 'ChartColumn' },
  { href: '/issues/', label: 'Issues', icon: 'Flag' },
  { href: '/money/', label: 'Money', icon: 'Banknote' },
  { href: '/virginia/', label: 'Virginia', icon: 'Map' },
  { href: '/how-to-vote/virginia/', label: 'Vote', icon: 'Vote' },
];

/** Phones: six tabs. Senate, House and Polls share one tab; those pages link to each other. */
export const TABBAR: readonly NavItem[] = [
  { href: '/', label: 'Map', icon: 'MapPin', also: ['/states/'] },
  { href: '/senate/', label: 'Races', icon: 'Trophy', also: ['/house/', '/polls/', '/races/'] },
  { href: '/issues/', label: 'Issues', icon: 'Flag' },
  { href: '/money/', label: 'Money', icon: 'Banknote' },
  { href: '/virginia/', label: 'Virginia', icon: 'Map' },
  { href: '/how-to-vote/virginia/', label: 'Vote', icon: 'Vote' },
];

export const isActive = (n: NavItem, path: string) =>
  n.href === '/' ? path === '/' || (n.also ?? []).some((p) => path.startsWith(p)) : path.startsWith(n.href) || (n.also ?? []).some((p) => path.startsWith(p));
