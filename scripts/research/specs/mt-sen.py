RACE = 'mt-sen'; DATE = '2026-10-09'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'kurt-alme': {
  'pages': ['02-priorities', '01-meet-kurt', '00-home'],
  'priorities': [],
  'priorities_note': 'His website\'s "Priorities" page had only placeholder text ("lorem ipsum") when we checked on Oct 9, 2026, so there was no list of issues to use.',
  'stances': {**{k: None for k in ALL},
   'cost-of-living': ('01-meet-kurt', 'Making Life More Affordable', 'As a former Department of Revenue Director and Budget Director', 'to make life more affordable.'),
  },
 },
 'alani-bankhead': {
  'pages': ['00-home', '02-positions', '01-meet-alani'],
  'priorities': [
   ('00-home', 'Affordability', 'Bring the cost of living back to earth', 'can actually cover.'),
   ('00-home', 'Accountability', 'Zero corporate PAC money.', 'the way service taught her.'),
   ('00-home', 'Protecting the Vulnerable', 'A career spent on crimes against children', 'most easily overlooked.'),
  ],
  'stances': {
   'cost-of-living': ('02-positions', 'Jobs & Wages', 'Raise the federal minimum wage to at least $17 an hour by 2030, so a full-time job', '17 years again.'),
   'housing': ('02-positions', 'Housing', 'Tax breaks for builders who make at least 30%', 'genuinely affordable.'),
   'health-care': ('02-positions', 'Healthcare', 'I’m a universal healthcare girl.', 'about to go bankrupt.'),
   'immigration': ('02-positions', 'Immigration & Border Security', 'You shut it down, and the name ICE goes with it', 'independent review recommends.'),
   'foreign-policy': ('02-positions', 'Iran', 'Vote to end the war and invoke the War Powers Resolution', 'never authorized this.'),
   'climate-energy': ('02-positions', 'Energy', 'Expand real choice, never mandates', 'gets help doing it.'),
  },
  'notes': {'housing': 'Her housing plan also backs the HOPE for Homeownership Act and down-payment help for first-time buyers. Those passages are longer than our 60-word limit, so see her Positions page for the full plan.'},
 },
 'seth-bodnar': {
  'pages': ['02-issues', '01-about', '03-seths-record', '00-home'],
  'priorities': [
   ('02-issues', 'End the Costly and Unauthorized War in Iran', None, None),
   ('02-issues', 'Stop Reckless Tariffs Driving Up Prices', None, None),
   ('02-issues', 'Lower Health Care, Housing, and Energy Costs', None, None),
  ],
  'priorities_note': 'His Issues page lists his positions as one-line statements with no further detail.',
  'stances': {
   'cost-of-living': ('02-issues', 'Seth on the Issues', 'Stop Reckless Tariffs Driving Up Prices', 'Driving Up Prices'),
   'housing': ('02-issues', "Seth's Priorities", 'MAKE IT MORE AFFORDABLE TO BUY A HOME', 'TO BUY A HOME'),
   'health-care': ('02-issues', "Seth's Priorities", 'LOWER HEALTH CARE PREMIUMS AND DRUG COSTS', 'AND DRUG COSTS'),
   'immigration': ('02-issues', "Seth's Priorities", 'SECURE OUR BORDER AND ENFORCE IMMIGRATION LAWS', 'IMMIGRATION LAWS'),
   'foreign-policy': ('02-issues', 'Seth on the Issues', 'End the Costly and Unauthorized War in Iran', 'War in Iran'),
   'climate-energy': ('02-issues', 'Seth on the Issues', 'Lower Health Care, Housing, and Energy Costs', 'and Energy Costs'),
  },
  'notes': {'climate-energy': 'This line is the only mention of energy on his Issues page.'},
 },
 'kyle-austin': {
  'pages': ['01-platform', '02-meet-kyle', '03-candidacy', '00-home'],
  'priorities': [
   ('01-platform', 'My fellow Montanans', 'As a candidate for the United States Senate, it is my number one priority', 'our great State of Montana.'),
   ('01-platform', 'Agriculture', 'When elected to the United States Senate, Austin will work hard', 'in the United States.'),
   ('01-platform', '2nd Amendment', 'Austin believes everyone American', 'access to bear arms.'),
  ],
  'priorities_note': 'His Platform page opens with a letter that calls cutting federal money to Montana\'s Department of Labor and Industry his "number one priority," so that is listed first, followed by the first two items on his platform list.',
  'stances': {
   'cost-of-living': ('01-platform', 'My fellow Montanans', 'As a candidate for the United States Senate, it is my number one priority', 'our great State of Montana.'),
   'housing': None,
   'health-care': ('01-platform', 'Healthcare 2.0', 'Austin has plans, when elected', 'all United States citizens.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
}
