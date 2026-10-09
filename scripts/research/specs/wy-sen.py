RACE = 'wy-sen'; DATE = '2026-10-09'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
SAME = 'This sentence covers energy prices and foreign wars together. It is the only passage on his site about {}.'
C = {
 'harriet-hageman': {
  'pages': ['00-home', '02-resources'],
  'priorities': [],
  'priorities_note': 'Her campaign website has no list of issues and no stances on our 6 issues. It has a home page, a donation page, yard signs, and a page of campaign logos and photos. Its "About" link returned "page not found" on Oct 9, 2026.',
  'stances': {k: None for k in ALL},
 },
 'james-byrd': {
  'pages': ['01-blank', '02-blank-1', '00-home'],
  'priorities': [
   ('01-blank', 'Bring Down Gas and Grocery Prices', 'James Byrd will fight to lower energy costs', 'investing at home.'),
   ('01-blank', 'Protect Public Lands', 'James Byrd will stand against efforts to sell off', 'grazing, and recreation.'),
   ('01-blank', 'Make Healthcare Affordable', 'James Byrd will push to lower prescription drug costs', 'paying into it.'),
  ],
  'stances': {
   'cost-of-living': ('01-blank', 'Bring Down Gas and Grocery Prices', "On groceries, he'll push back", 'squeezed on both ends.'),
   'housing': None,
   'health-care': ('01-blank', 'Make Healthcare Affordable', 'James Byrd will push to lower prescription drug costs', 'paying into it.'),
   'immigration': None,
   'foreign-policy': ('01-blank', 'Bring Down Gas and Grocery Prices', 'James Byrd will fight to lower energy costs', 'investing at home.'),
   'climate-energy': ('01-blank', 'Bring Down Gas and Grocery Prices', 'James Byrd will fight to lower energy costs', 'investing at home.'),
  },
  'notes': {'foreign-policy': SAME.format('foreign policy'), 'climate-energy': SAME.format('energy')},
 },
}
