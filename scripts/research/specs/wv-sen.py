RACE = 'wv-sen'; DATE = '2026-10-09'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'shelley-moore-capito': {
  'pages': ['00-home'],
  'priorities': [],
  'priorities_note': 'Her campaign website has no list of issues and no stances on our 6 issues. It has a biography, endorsements, and a veterans page.',
  'stances': {k: None for k in ALL},
 },
 'rachel-fetty-anderson': {
  'pages': ['02-platform', '03-issues', '01-about', '00-home'],
  'priorities': [
   ('02-platform', 'I support the US Constitution.', None, None),
   ('02-platform', 'I support human rights.', None, None),
   ('02-platform', 'I will improve Medicare and Medicaid.', 'My plan for Medicare, Medicaid and Tricare ensures', 'healthcare providers.'),
  ],
  'priorities_note': 'Her Issues page lists topics in alphabetical order, so her top 3 come from her Platform page, in its order. The first two are one-line headings; the text under them is longer than our 60-word limit.',
  'stances': {
   'cost-of-living': ('03-issues', 'Taxation', 'The American tax and resource burden must be fairly', 'whatever the income stream.'),
   'housing': None,
   'health-care': ('03-issues', 'Healthcare', 'We must invest in Medicare, Medicaid and Tricare', 'taxpayers invest in.'),
   'immigration': None,
   'foreign-policy': ('03-issues', 'Israel and Palestine', 'I support a two-state solution.', 'purely self-defense.'),
   'climate-energy': ('03-issues', 'Energy', 'The government must encourage investment in sustainable energy sources', 'wind and water power.'),
  },
  'notes': {'cost-of-living': 'Her Taxation section also supports ending the "Buy, Borrow, Die" tax loophole and raising the tax rate on income over $500,000. That sentence is longer than our 60-word limit; see her Issues page.'},
 },
 'marshall-wilson': {
  'pages': ['00-home', '01-delegate-record'],
  'priorities': [
   ('00-home', 'Economy & Jobs', "Marshall will fight to unleash West Virginia's energy economy", 'Mountain State families first.'),
   ('00-home', 'Government Spending & Debt', "Marshall will vote against every budget that doesn't balance", 'without real cuts.'),
   ('00-home', 'Constitutional Rights', 'Marshall Wilson will be a Senate vote that never flinches', 'every American citizen.'),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Economy & Jobs', "Marshall will fight to unleash West Virginia's energy economy", 'Mountain State families first.'),
   'housing': None,
   'health-care': None,
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('00-home', 'Economy & Jobs', "Marshall will fight to unleash West Virginia's energy economy", 'Mountain State families first.'),
  },
  'notes': {'climate-energy': 'This is the only passage about energy on his site. The same sentence is used for Cost of living & jobs.'},
 },
}
