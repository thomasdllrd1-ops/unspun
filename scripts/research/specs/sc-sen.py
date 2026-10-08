RACE = 'sc-sen'; DATE = '2026-10-08'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
SAME = "We found only one passage on this issue, and it also covers {}, so the same sentence is used for both."
C = {
 'annie-andrews': {
  'pages': ['02-platform', '05-issue-healthcare', '06-issue-an-economy', '07-issue-strong', '08-issue-reproductive', '09-issue-fighting', '10-issue-an-end', '11-issue-immigration', '12-issue-protecting', '13-issue-no-more', '14-issue-transportation', '00-home', '01-about'],
  'priorities': [
   ('05-issue-healthcare', 'Healthcare is a Right, Not a Privilege', 'Advocate for policies like a public option', 'for all South Carolinians'),
   ('06-issue-an-economy', 'An Economy That Works for Working People', 'End tax breaks for the ultra-wealthy', 'corporate polluters'),
   ('07-issue-strong', 'Strong Schools & Affordable Child Care', 'Invest in modern classrooms', 'and school safety'),
  ],
  'stances': {
   'cost-of-living': ('06-issue-an-economy', 'An Economy That Works for Working People', 'End tax breaks for the ultra-wealthy', 'corporate polluters'),
   'housing': None,
   'health-care': ('05-issue-healthcare', 'Healthcare is a Right, Not a Privilege', 'Advocate for policies like a public option', 'for all South Carolinians'),
   'immigration': ('11-issue-immigration', 'Immigration: Security with Dignity', 'Creates a fair path to citizenship', 'follow the rules'),
   'foreign-policy': ('13-issue-no-more', 'No More Endless Wars', 'Require Congress to approve', 'use of military force'),
   'climate-energy': None,
  },
 },
 'darline-graham': {
  'pages': ['01-issues', '00-home'],
  'priorities': [
   ('01-issues', 'Economy', 'She will work to make the Trump tax cuts permanent', "mortgaging our children's future."),
   ('01-issues', 'Border', 'Darline supports finishing the wall', 'those here illegally.'),
   ('01-issues', 'Life', 'She supports mothers, adoption', 'girls\' sports and locker rooms.'),
  ],
  'stances': {
   'cost-of-living': ('01-issues', 'Economy', 'She will work to make the Trump tax cuts permanent', "mortgaging our children's future."),
   'housing': None,
   'health-care': ('01-issues', 'Fighting for South Carolina', 'She will stand up for South Carolina farmers', 'who paid into them.'),
   'immigration': ('01-issues', 'Border', 'Darline supports finishing the wall', 'those here illegally.'),
   'foreign-policy': ('01-issues', 'Strength', 'Darline will fight for the resources our installations', 'dependence on foreign adversaries.'),
   'climate-energy': ('01-issues', 'Strength', 'Darline will fight for the resources our installations', 'dependence on foreign adversaries.'),
  },
  'notes': {'foreign-policy': SAME.format('Climate & energy'), 'climate-energy': SAME.format('War & foreign policy')},
 },
 'mark-hackett': {
  'no_site': "We found no campaign website for him. South Carolina's official candidate page lists none, and a web search on Oct 8, 2026 found none.",
  'looked_at': ['official-sc-2026'],
 },
 'kasie-whitener': {
  'pages': ['02-blog', '03-bad-laws', '04-healthcare', '05-uncertainty', '06-we-cant', '07-do-the-ends', '08-military', '09-why-less', '10-what-about', '11-a-visit-with-some-low-country-republicans', '12-a-visit-with-some-low-country-democrats', '13-econ', '00-home', '01-about'],
  'priorities': [],
  'priorities_note': "Her website's “On the Issues” page is a list of blog posts by date, not a list of issues, so there's no top 3. Her stances below come from those posts and her home page.",
  'stances': {
   'cost-of-living': ('00-home', 'Meet Dr. Kasie Whitener', 'Kasie will bring real oversight', 'so people can prosper.'),
   'housing': None,
   'health-care': ('04-healthcare', 'Healthcare: Decoupled', 'So: decouple.', 'from employment.'),
   'immigration': ('03-bad-laws', 'Bad laws make for bad enforcement', 'I said I think people who come to the United States', 'become registered workers.'),
   'foreign-policy': ('07-do-the-ends', 'Do the ends justify the means?', 'As the United States was not attacked by Venezuela or Iran', 'at will or on whims.'),
   'climate-energy': None,
  },
 },
}
