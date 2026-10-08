RACE = 'ne-sen'; DATE = '2026-10-08'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'pete-ricketts': {
  'pages': ['03-delivering-for-nebraska', '04-delivering-for-nebraska-cutting-taxes', '05-delivering-for-nebraska-keeping', '08-delivering-for-nebraska-protecting', '07-delivering-for-nebraska-making', '06-delivering-for-nebraska-delivering', '01-delivering-for-nebraska-defending', '00-home'],
  'priorities': [
   ('04-delivering-for-nebraska-cutting-taxes', 'Cutting Taxes', 'In Washington, Pete helped pass the largest federal tax cut', 'less than $50,000 a year.'),
   ('05-delivering-for-nebraska-keeping', 'Keeping Nebraskans Safe', 'Pete has helped President Trump bring illegal border crossings', 'immigration court backlog.'),
   ('08-delivering-for-nebraska-protecting', 'Protecting Our National Security', 'Pete introduced bipartisan legislation', 'deter Communist China.'),
  ],
  'stances': {
   'cost-of-living': ('04-delivering-for-nebraska-cutting-taxes', 'Cutting Taxes', 'In Washington, Pete helped pass the largest federal tax cut', 'less than $50,000 a year.'),
   'housing': None,
   'health-care': ('03-delivering-for-nebraska', 'Delivering for Nebraska', 'Pete helped secure $500 million', 'rural Nebraska hospitals'),
   'immigration': ('05-delivering-for-nebraska-keeping', 'Keeping Nebraskans Safe', 'Pete has helped President Trump bring illegal border crossings', 'immigration court backlog.'),
   'foreign-policy': ('08-delivering-for-nebraska-protecting', 'Protecting Our National Security', 'Pete introduced bipartisan legislation', 'deter Communist China.'),
   'climate-energy': None,
  },
 },
 'mike-marvin': {
  'pages': ['00-home'],
  'priorities': [],
  'priorities_note': "His campaign website has no list of issues. It says he will stay on the ballot but now urges his supporters to vote for Dan Osborn.",
  'stances': {k: None for k in ALL},
 },
 'robin-richards': {
  'pages': ['01-issues', '00-home'],
  'priorities': [
   ('01-issues', 'Lower costs. Good jobs.', 'The price of a gallon of gas', 'not another speech.'),
   ('01-issues', 'Affordable health care.', 'Robin will fight for an approach', 'institutional loyalty.'),
   ('01-issues', 'Fully funded public schools.', 'Nebraska schools should be places', 'serve every community.'),
  ],
  'stances': {
   'cost-of-living': ('01-issues', 'Lower costs. Good jobs.', 'The price of a gallon of gas', 'not another speech.'),
   'housing': ('01-issues', 'Housing people can live in.', 'Robin believes practical government', 'actually live in possible.'),
   'health-care': ('01-issues', 'Affordable health care.', 'Robin will fight for an approach', 'institutional loyalty.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
 'chuck-conboy': {
  'pages': ['02-platform', '01-about', '00-home'],
  'priorities': [
   ('02-platform', 'Seal the Border', 'Expand immigration enforcement', 'process illegal aliens'),
   ('02-platform', 'Fix Social Security', 'Protect and preserve Social Security', 'current and future retirees'),
   ('02-platform', 'America First', 'No more endless foreign wars that drain', 'blood and treasure'),
  ],
  'stances': {
   'cost-of-living': ('02-platform', 'Economy', 'Bring down the cost of living', 'American middle class'),
   'housing': None,
   'health-care': ('02-platform', 'Healthcare', 'Bring down the out-of-control cost', 'for American families'),
   'immigration': ('02-platform', 'Seal the Border', 'Expand immigration enforcement', 'process illegal aliens'),
   'foreign-policy': ('02-platform', 'America First', 'No more endless foreign wars that drain', 'blood and treasure'),
   'climate-energy': None,
  },
 },
 'dan-osborn': {
  'pages': ['02-plans', '03-ngfp-draintheswamp', '04-ngfp-protect', '05-ngfp-cut', '06-ngfp-protect-the-good-life', '07-ngfp-fight', '08-ngfp-defend', '00-home', '01-meet-dan'],
  'priorities': [
   ('02-plans', 'drain the swamp', 'When I’m in the Senate', 'Washington has ever seen.'),
   ('02-plans', 'PROTECT OUR PAYCHECKS, SOCIAL SECURITY, AND HEALTHCARE', 'I will take on the corporations', 'bankrupt from medical debt.'),
   ('02-plans', 'Cut Waste and Balance the Budget', 'I\'ll cut waste, end corporate welfare', 'spending we can\'t afford.'),
  ],
  'stances': {
   'cost-of-living': ('04-ngfp-protect', 'Middle-Class Tax Cut', 'I support a real middle class tax cut', 'into a brokerage account.'),
   'housing': None,
   'health-care': ('04-ngfp-protect', 'Break Up Healthcare Monopolies', 'I support the bipartisan Break Up Big Medicine Act', 'watch costs come down.'),
   'immigration': None,
   'foreign-policy': ('06-ngfp-protect-the-good-life', 'Protect the Good Life', 'A Nebraska-First Foreign Policy', 'against Gaza and their neighbors.'),
   'climate-energy': ('04-ngfp-protect', 'Protect Utility Ratepayers', 'If these corporations want to consume the power', 'your electric bill.'),
  },
  'notes': {'climate-energy': 'This passage is about electricity prices. We found no passage about climate change.'},
 },
}
