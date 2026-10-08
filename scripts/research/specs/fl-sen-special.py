RACE = 'fl-sen-special'; DATE = '2026-10-08'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
SURVEY = 'From his answers to a Ballotpedia candidate survey, which he posted on his campaign website.'
C = {
 'ashley-moody': {
  'pages': ['00-home', '01-about'],
  'priorities': [],
  'priorities_note': "Her campaign website has no list of issues and no stances on our 6 issues. It has a home page and an About page.",
  'stances': {k: None for k in ALL},
 },
 'angie-nixon': {
  'pages': ['02-priorities', '01-meet-angie', '00-home'],
  'priorities': [
   ('02-priorities', 'Angie believes in Medicare for All.', 'Medicare for All that covers every person', 'no surprise bills.'),
   ('02-priorities', 'Angie believes in Universal Child Care & Pre-K.', 'Universal, high-quality child care', 'small share of their income.'),
   ('02-priorities', 'Angie believes in quality Public Education.', 'Tuition-free public college', 'canceling student debt.'),
  ],
  'stances': {
   'cost-of-living': ('02-priorities', 'Angie will fight for the Working Families Guarantee', 'A universal jobs program', 'inflation-adjusted wages'),
   'housing': ('02-priorities', 'Angie will fight for the Working Families Guarantee', 'A National Rent Freeze', 'Moratorium on Evictions'),
   'health-care': ('02-priorities', 'Angie believes in Medicare for All.', 'Medicare for All that covers every person', 'no surprise bills.'),
   'immigration': ('02-priorities', 'Angie believes in supporting human dignity, ending mass incarceration and deportation.', 'A humane immigration system', 'audit of enforcement practices.'),
   'foreign-policy': ('02-priorities', 'Angie believes in a foreign policy rooted in diplomacy, human rights, and restraint.', 'End to the war in Iran', 'everyday people here at home'),
   'climate-energy': ('02-priorities', 'Angie believes in climate action that matches the scale of the crisis.', 'A bold, union-built transition', 'pollution for generations.'),
  },
 },
 'neil-gillespie': {
  'pages': ['00-home'],
  'priorities': [
   ('00-home', 'Restore checks and balances in government, separation of powers.', 'Lawyers admitted to practice are officers', 'legislature or executive branch.'),
   ('00-home', 'Health care reform.', 'I propose national health coverage', 'ability to opt-out.'),
   ('00-home', 'Guarantee the safety of Jews in the United States.', 'Hold Bibi responsible', 'it is a disaster.'),
  ],
  'priorities_note': 'His top 3 are the "3 key messages" in his answers to a Ballotpedia candidate survey, which he posted on his campaign website (a blog).',
  'stances': {
   'cost-of-living': None,
   'housing': None,
   'health-care': ('00-home', 'Health care reform.', 'I propose national health coverage', 'ability to opt-out.'),
   'immigration': ('00-home', 'Neil J. Gillespie Candidate Survey Responses to Ballotpedia', 'I support the lawful removal of people', 'who follow the rules.'),
   'foreign-policy': ('00-home', 'Guarantee the safety of Jews in the United States.', 'Hold Bibi responsible', 'it is a disaster.'),
   'climate-energy': None,
  },
  'notes': {'health-care': SURVEY, 'immigration': SURVEY, 'foreign-policy': SURVEY},
 },
}
