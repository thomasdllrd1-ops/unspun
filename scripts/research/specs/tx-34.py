RACE = 'tx-34'; DATE = '2026-10-10'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
COL = 'Lower the Cost of Living'
C = {
 'eric-flores': {
  'pages': ['00-home', '01-abouteric', '02-priorities'],
  'priorities': [
   ('02-priorities', 'Stand Up for South Texas and the Coastal Bend', "I'll bring federal funds to our community", 'real, lasting results.'),
   ('02-priorities', COL, "I'll oppose reckless federal spending", 'our growing communities.'),
   ('02-priorities', 'Improve Our Infrastructure', "I'll fight to secure federal funding for road, bridge, and port improvements", 'national economic assets they are.'),
  ],
  'stances': {
   'cost-of-living': ('02-priorities', COL, "I'll oppose reckless federal spending", 'our growing communities.'),
   'housing': ('02-priorities', COL, "I'll oppose reckless federal spending", 'our growing communities.'),
   'health-care': ('02-priorities', "Safeguard Seniors' Benefits", "While Vicente Gonzalez wants to tax seniors' benefits", 'fraud and financial exploitation.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': None,
  },
  'notes': {'housing': 'His only line on housing ("support affordable housing solutions") is in this sentence from his cost-of-living section.',
            'health-care': 'His only line on health costs (prescription drugs), from his section on seniors.'},
 },
 'vicente-gonzalez': {
  'pages': ['00-home', '01-meet-vicente', '02-issues'],
  'priorities': [
   ('02-issues', 'Affordability', 'Vicente Gonzalez believes that people who work hard', 'a stable and dignified life.'),
   ('02-issues', 'Seniors', 'Vicente Gonzalez understands that protecting seniors', 'access to healthcare.'),
   ('02-issues', 'Women’s Rights', 'Vicente Gonzalez supports policies that promote fairness', 'their lives and futures.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Affordability', 'Vicente Gonzalez believes that people who work hard', 'a stable and dignified life.'),
   'housing': None,
   'health-care': ('02-issues', 'Healthcare', 'Vicente Gonzalez supports a healthcare system that works for everyone', 'a rural community.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
 'chris-royal': {
  'pages': ['00-home'],
  'priorities': [],
  'priorities_note': 'His campaign website is one page with a letter about the Constitution and federal spending. It has no list of issues and no stances on our 6 issues.',
  'stances': {k: None for k in ALL},
 },
 'eddie-espinoza': {
  'pages': ['00-home', '01-meet-eddie', '02-priorities'],
  'priorities': [
   ('02-priorities', 'Help our Students, Seniors and Veterans', 'Free Palestine! Arms embargo', 'military aid to Israel'),
   ('02-priorities', 'Medicare for All', 'Improve and expand Medicare for All', 'dental, and prescriptions.'),
   ('02-priorities', 'U.S. Energy Independence', 'We must invest in safe renewable energy projects', 'options for energy.'),
  ],
  'stances': {
   'cost-of-living': ('02-priorities', 'Protect Our Land and Water', 'We can localize our energy, food, and water', 'the best solution for affordability.'),
   'housing': None,
   'health-care': ('02-priorities', 'Medicare for All', 'Improve and expand Medicare for All', 'dental, and prescriptions.'),
   'immigration': None,
   'foreign-policy': ('02-priorities', 'Help our Students, Seniors and Veterans', 'Free Palestine! Arms embargo', 'military aid to Israel'),
   'climate-energy': ('02-priorities', 'U.S. Energy Independence', 'We must invest in safe renewable energy projects', 'options for energy.'),
  },
  'notes': {'housing': 'His only line on homelessness is for veterans ("END homelessness for Veterans"). We don\'t count benefits only for veterans as a position on housing for everyone.'},
 },
}
