import { describe, it, expect, beforeAll } from 'vitest';

// Tags are hidden until reviewed; preview mode shows them so we can test the math.
process.env.SHOW_PENDING = '1';
let F: typeof import('../src/lib/funders');
beforeAll(async () => { F = await import('../src/lib/funders'); });

const cents = (n: number) => Math.round(n * 100);

describe('interest-group money', () => {
  it('every candidate: issue totals add up to the tagged FEC rows they came from', () => {
    for (const [cid, e] of Object.entries(F.fec.candidates)) {
      const f = F.fundersOf(cid)!;
      const tagged = (rows: { id: string | null; amount: number }[]) =>
        rows.filter((r) => r.id && F.tags.groups.some((g) => g.committees.includes(r.id!))).reduce((s, r) => s + cents(r.amount), 0);
      const fromIssues = (k: 'given' | 'forThem' | 'against') =>
        F.topics.map((t) => t.id)
          .flatMap((i) => F.issueMoney(cid, i)![k]).reduce((s, g) => s + cents(g.amount), 0);
      expect(fromIssues('given'), cid).toBe(tagged(f.given));
      expect(fromIssues('forThem'), cid).toBe(tagged(f.forThem));
      expect(fromIssues('against'), cid).toBe(tagged(f.against));
      // Nothing dropped: gifts + joint-fundraising transfers = every FEC gift row.
      expect(cents(F.sum(f.given)) + cents(f.jfc.total), cid).toBe(e.given.reduce((s, g) => s + cents(g.total), 0));
    }
  });

  it('labels FEC committee types in plain words', () => {
    expect(F.kindOf('C00797670')).toBe('Membership group PAC'); // AIPAC PAC
    expect(F.kindOf('C00799031')).toBe('Super PAC'); // United Democracy Project
    expect(F.kindOf('C00303024')).toBe('Corporate PAC'); // Lockheed Martin employees' PAC
    expect(F.kindOf('C00011114')).toBe('Labor union PAC'); // AFSCME PEOPLE
    expect(F.kindOf(null)).toBe('Not listed as an FEC committee');
  });

  it('AIPAC money for a candidate sums its PAC and its super PAC', () => {
    const cid = Object.keys(F.fec.candidates).find((c) => F.fec.candidates[c].outside.some((o) => o.id === 'C00799031'));
    expect(cid).toBeTruthy();
    const fp = F.issueMoney(cid!, 'foreign-policy')!;
    const aipac = [...fp.forThem, ...fp.against].filter((g) => g.group.id === 'aipac');
    expect(aipac.length).toBeGreaterThan(0);
  });
});
