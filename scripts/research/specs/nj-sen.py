RACE = 'nj-sen'; DATE = '2026-10-09'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
SAME = 'This sentence covers several issues, including {}. It is the only passage on his site about this one.'
C = {
 'cory-booker': {
  'pages': ['01-about-cory', '00-home'],
  'priorities': [],
  'priorities_note': 'His campaign website has no list of issues. It has a home page and an About page.',
  'stances': {
   'cost-of-living': ('01-about-cory', 'About Cory', 'Cory believes in an economy that values American workers', 'bill in a generation.'),
   'housing': None,
   'health-care': ('01-about-cory', 'About Cory', 'He is an original co-sponsor of the Equality Act', 'vulnerable communities.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('01-about-cory', 'About Cory', 'He is an original co-sponsor of the Equality Act', 'vulnerable communities.'),
  },
  'notes': {'health-care': SAME.format('climate change'), 'climate-energy': SAME.format('health care')},
 },
 'justin-murphy': {
  'pages': ['01-issue-energy', '02-issue-china', '03-issue-immigration', '04-issue-drugs', '05-issue-videos', '00-home'],
  'priorities': [
   ('01-issue-energy', 'Responsible Energy for America', 'Expedite federal leasing and permitting', 'energy development projects'),
   ('02-issue-china', 'China', 'Engage the communist government of China', 'politically and economically.'),
   ('03-issue-immigration', 'Secure our borders', 'Secure both the southern and northern borders', 'deportation of criminals'),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Taxes', 'Abolish the IRS', 'Flat Income Tax.'),
   'housing': ('00-home', 'Home ownership', 'The best homeownership policy', 'low interest rates.'),
   'health-care': ('00-home', 'Health Care', 'Ensures every American owns a Health Savings Account', 'insuring family members.'),
   'immigration': ('03-issue-immigration', 'Secure our borders', 'Secure both the southern and northern borders', 'deportation of criminals'),
   'foreign-policy': ('02-issue-china', 'China', 'Engage the communist government of China', 'politically and economically.'),
   'climate-energy': ('01-issue-energy', 'Responsible Energy for America', 'Expedite federal leasing and permitting', 'energy development projects'),
  },
 },
 'veronica-fernandez': {
  'pages': ['01-policies', '02-about-me', '00-home'],
  'priorities': [
   ('01-policies', 'Campaign finance reform', 'There is a proposed 28th Amendment resolution', 'sign on day one.'),
   ('01-policies', 'Healthcare', 'I am a FIERCE supporter of M4A', 'S1506 immediately.'),
   ('01-policies', 'ICE', 'ABOLISH immediately', 'path to citizenship.'),
  ],
  'stances': {
   'cost-of-living': None,
   'housing': None,
   'health-care': ('01-policies', 'Healthcare', 'I am a FIERCE supporter of M4A', 'S1506 immediately.'),
   'immigration': ('01-policies', 'ICE', 'ABOLISH immediately', 'path to citizenship.'),
   'foreign-policy': ('01-policies', 'Israel', 'Unlike Cory Booker, I will NOT vote', 'AIPAC in any form.'),
   'climate-energy': None,
  },
 },
 'joanne-kuniansky': {
  'no_site': "We found no campaign website for her. New Jersey's official candidate list gives only an email address, and a web search on Oct 9, 2026 found no site.",
  'looked_at': ['official-nj-2026'],
 },
}
