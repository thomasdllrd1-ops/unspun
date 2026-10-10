/**
 * Who funds each candidate, from the FEC (data/money/groups.json, built by scripts/fetch-fec-groups.ts):
 * PAC gifts to the campaign, and outside spending for or against them. Each committee gets its
 * FEC type in plain words, plus our interest-group tag (data/interest_groups.json) when it has one.
 * Tags show only once a person has reviewed the list (status "verified"), or in preview mode.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SHOW_PENDING, issueList } from './data';

type Committee = { name: string; type: string | null; designation: string | null; org_type: string | null; connected_org: string | null } | null;
type Entry = {
  fec_id: string; principal_committee: string | null; cycles: string[];
  given: { id: string; total: number }[];
  outside: { id: string | null; support: number; oppose: number }[];
};
export type Group = { id: string; name: string; issue: string; kind: string; committees: string[]; source?: string; note?: string };
type Tags = {
  status: 'pending' | 'verified'; method: string; limits: string; limits_source: string;
  kinds: Record<string, string>; groups: Group[]; left_untagged: { name: string; committees: string[]; why: string }[];
};

const read = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'data', f), 'utf8'));
export const fec: { fetched_at: string; candidates: Record<string, Entry>; committees: Record<string, Committee> } = read('money/groups.json');
export const tags: Tags = read('interest_groups.json');
export const tagsShown = tags.status === 'verified' || SHOW_PENDING;

// Bad tag data stops the build, like everything else in /data.
const groupOf = new Map<string, Group>();
for (const g of tags.groups) {
  if (!issueList.some((i) => i.id === g.issue)) throw new Error(`interest_groups.json: ${g.id} has unknown issue ${g.issue}`);
  if (!(g.kind in tags.kinds)) throw new Error(`interest_groups.json: ${g.id} has unknown kind ${g.kind}`);
  for (const id of g.committees) {
    if (!/^C\d{8}$/.test(id)) throw new Error(`interest_groups.json: ${g.id} has a malformed committee ID ${id}`);
    if (groupOf.has(id)) throw new Error(`interest_groups.json: ${id} is in both ${groupOf.get(id)!.id} and ${g.id}`);
    groupOf.set(id, g);
  }
}

const ORG: Record<string, string> = {
  C: 'Corporate PAC', L: 'Labor union PAC', M: 'Membership group PAC', T: 'Trade association PAC',
  V: 'Cooperative PAC', W: 'Nonprofit corporation PAC',
};
/** The FEC's committee type, in plain words. */
export function kindOf(id: string | null): string {
  const c = id ? fec.committees[id] : null;
  if (!c) return 'Not listed as an FEC committee';
  const t = c.type ?? '';
  if (c.designation === 'J') return 'Joint fundraising committee';
  if (t && 'HSP'.includes(t)) return "Another candidate's campaign";
  if (c.designation === 'D') return "Leadership PAC (a politician's PAC)";
  if (t && 'XYZ'.includes(t)) return 'Party committee';
  if (t === 'O') return 'Super PAC';
  if (t === 'V' || t === 'W') return 'Hybrid PAC (also has a super PAC account)';
  if (t === 'I' || t === 'U') return 'Independent spender';
  return ORG[c.org_type ?? ''] ?? 'PAC';
}

export type Row = { id: string | null; name: string; kind: string; amount: number; group?: Group };
const row = (id: string | null, amount: number): Row => ({
  id,
  name: id ? fec.committees[id]?.name ?? id : 'Spenders the FEC lists without a committee ID',
  kind: kindOf(id),
  amount,
  group: tagsShown && id ? groupOf.get(id) : undefined,
});
const desc = (a: Row, b: Row) => b.amount - a.amount;
export const sum = (rows: { amount: number }[]) => Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
export const fecCommitteeUrl = (id: string) => `https://www.fec.gov/data/committee/${id}/`;

/** Every committee that gave to the campaign or spent for/against the candidate, biggest first. */
export function fundersOf(candidateId: string) {
  const e = fec.candidates[candidateId];
  if (!e) return null;
  const isJfc = (id: string) => fec.committees[id]?.designation === 'J';
  const jfc = e.given.filter((g) => isJfc(g.id));
  return {
    cycles: e.cycles,
    principal: e.principal_committee,
    given: e.given.filter((g) => !isJfc(g.id)).map((g) => row(g.id, g.total)).sort(desc),
    jfc: { total: sum(jfc.map((g) => ({ amount: g.total }))), count: jfc.length },
    forThem: e.outside.filter((o) => o.support > 0).map((o) => row(o.id, o.support)).sort(desc),
    against: e.outside.filter((o) => o.oppose > 0).map((o) => row(o.id, o.oppose)).sort(desc),
  };
}

export type GroupTotal = { group: Group; amount: number; committees: string[] };
function byGroup(rows: Row[], issue: string): GroupTotal[] {
  const m = new Map<string, GroupTotal>();
  for (const r of rows) {
    if (r.group?.issue !== issue) continue;
    const t = m.get(r.group.id) ?? { group: r.group, amount: 0, committees: [] };
    t.amount = Math.round((t.amount + r.amount) * 100) / 100;
    t.committees.push(r.name);
    m.set(r.group.id, t);
  }
  return [...m.values()].sort((a, b) => b.amount - a.amount);
}

/** Money from the groups we tag on one issue, for one candidate. Null when tags aren't shown or there's no FEC data. */
export function issueMoney(candidateId: string, issue: string) {
  const f = tagsShown ? fundersOf(candidateId) : null;
  if (!f) return null;
  return { given: byGroup(f.given, issue), forThem: byGroup(f.forThem, issue), against: byGroup(f.against, issue) };
}

/** The tagged groups that put the most money behind a candidate (gifts plus spending for them), any issue. */
export function topGroups(candidateId: string, n = 3): GroupTotal[] {
  const f = tagsShown ? fundersOf(candidateId) : null;
  if (!f) return [];
  return issueList.flatMap((i) => byGroup([...f.given, ...f.forThem], i.id)).sort((a, b) => b.amount - a.amount).slice(0, n);
}
