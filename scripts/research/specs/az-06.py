RACE = 'az-06'; DATE = '2026-10-10'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'juan-ciscomani': {
  # No issues page; his "Results" page lists what he has worked on, in order, so that is his list.
  'pages': ['00-home', '01-meet-juan-2026', '03-results'],
  'priorities': [
   ('03-results', 'Supporting Veterans', 'Juan worked to honor the service of our veterans', 'the dream of homeownership.'),
   ('03-results', 'Fighting for Lower Taxes', 'Juan has consistently supported tax relief', 'overtime, and Social Security.'),
   ('03-results', 'Bringing Federal Dollars Home', 'In just his first three years in Congress, Juan secured more than $60 million', 'across Southern Arizona.'),
  ],
  'stances': {
   'cost-of-living': ('03-results', 'Fighting for Lower Taxes', 'Juan has consistently supported tax relief', 'overtime, and Social Security.'),
   'housing': None,
   'health-care': ('03-results', 'Fighting for Better Health Care', 'Juan has focused on expanding access to health care in rural communities', 'record funding for cancer research.'),
   'immigration': ('00-home', 'Ranked Arizona’s Most Effective Lawmaker', 'His focus is on getting results', 'law enforcement officers.'),
   'foreign-policy': ('03-results', 'Strengthening Fort Huachuca', 'Juan advocated for and secured a new military mission for Fort Huachuca', "America's defense infrastructure."),
   'climate-energy': None,
  },
  'notes': {'housing': 'His only line on homes is about veterans buying homes. We don\'t count benefits only for veterans as a position on housing for everyone.',
            'immigration': 'His only line on the border, from his home page.'},
 },
 'joanna-mendoza': {
  'pages': ['00-home', '01-meet-jo', '02-issues', '04-issues-cost-of-living', '05-issues-economy', '06-issues-healthcare',
            '07-issues-immigration-border-security', '08-issues-environment', '09-issues-oversight-accountability', '10-issues-veterans'],
  'priorities': [
   ('04-issues-cost-of-living', 'Lowering Costs & Protecting Our Families and Seniors', 'In Congress, JoAnna will work to lower costs', 'price disparities in rural communities.'),
   ('05-issues-economy', 'Bring Good-Paying Jobs to Southern Arizona & Protecting Workers', 'In Congress, JoAnna will work to support small businesses', 'workers from our communities.'),
   ('06-issues-healthcare', 'Strengthening our Healthcare System', 'That’s why JoAnna will work to reverse disastrous cuts', '(ACA) subsidies.'),
  ],
  'stances': {
   'cost-of-living': ('04-issues-cost-of-living', 'Lowering Costs & Protecting Our Families and Seniors', 'In Congress, JoAnna will work to lower costs', 'price disparities in rural communities.'),
   'housing': None,
   'health-care': ('06-issues-healthcare', 'Strengthening our Healthcare System', 'That’s why JoAnna will work to reverse disastrous cuts', '(ACA) subsidies.'),
   'immigration': ('07-issues-immigration-border-security', 'Safe Communities, Strong Borders & Real Immigration Solutions', 'In Congress, JoAnna will work with both parties to strengthen border security', 'consistent with the law.'),
   'foreign-policy': None,
   'climate-energy': ('08-issues-environment', 'Climate, Water & Energy Security for Rural Arizona', 'In Congress, JoAnna will support investments in American-made energy', 'save money for ratepayers.'),
  },
 },
 'jereme-peters': {'no_site': "We found no campaign website for him. Arizona's official candidate list couldn't be read by our tools, and web searches on Oct 10, 2026 found no site (a candidate guide reported the same on Sep 10).", 'looked_at': ['wikipedia-house-2026']},
 'gary-swing': {
  # 01 is a blog post; we use only his home page, which carries his campaign message.
  'pages': ['00-home'],
  'priorities': [],
  'priorities_note': 'His home page has a campaign message but no list or headings of priorities, so we don\'t show a top 3.',
  'stances': {
   'cost-of-living': ('00-home', 'My Campaign Message', 'Enact a universal basic income.', 'Enact a universal basic income.'),
   'housing': None,
   'health-care': ('00-home', 'My Campaign Message', 'Medicare for all.', 'Medicare for all.'),
   'immigration': ('00-home', 'My Campaign Message', 'Abolish ICE.', 'Abolish ICE.'),
   'foreign-policy': ('00-home', 'My Campaign Message', 'Uphold the Kellogg-Briand Pact', 'outlawing war.'),
   'climate-energy': ('00-home', 'My Campaign Message', 'Transition away from fossil fuels', 'renewable energy sources.'),
  },
 },
}
