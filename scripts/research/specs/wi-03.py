RACE = 'wi-03'; DATE = '2026-10-10'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
KENT = ('His campaign page says voters should vote yes or no on every issue in his Voter Directed Network app, '
        'and that an elected official\'s job is to serve what voters decide. It takes no position of its own on this issue. '
        'The site also lists essays he wrote; like blog posts, we don\'t use those.')
C = {
 'rebecca-cooke': {
  'pages': ['00-home', '01-meet-rebecca', '02-priorities'],
  'priorities': [
   ('02-priorities', 'Lower Costs', 'Cap out-of-pocket costs on essential drugs', 'cancer medications at $30/month.'),
   ('02-priorities', 'Combat Corruption', 'Ban stock trading for members of Congress', 'and the White House.'),
   ('02-priorities', 'Bolster Agriculture', 'Expand export markets for all commodities.', 'Expand export markets for all commodities.'),
  ],
  'stances': {
   'cost-of-living': ('02-priorities', 'Lower Costs', 'Take on price-gouging corporations', 'reduce everyday costs.'),
   'housing': ('02-priorities', 'Rebuild our American Dream', 'Provide tax credits for first-time home buyers.', 'Provide tax credits for first-time home buyers.'),
   'health-care': ('02-priorities', 'Lower Costs', 'Cap out-of-pocket costs on essential drugs', 'cancer medications at $30/month.'),
   'immigration': ('02-priorities', 'Combat Corruption', 'Fully fund law enforcement', 'protect our borders.'),
   'foreign-policy': ('02-priorities', 'Lower Costs', 'End the costly Iran War', 'through the roof.'),
   'climate-energy': ('02-priorities', 'Rebuild our American Dream', 'Expand energy solutions', 'new green infrastructure.'),
  },
  'notes': {'immigration': 'Her only line on borders is in her "Combat Corruption" list.'},
 },
 'alexander-valiensi-kent': {
  'pages': ['00-home', '01-aboutvdn', '02-about-the-author', '03-essays'],
  'priorities': [
   ('00-home', 'Full Voter Empowerment', 'This means online issue by issue voting', 'Voter Directed Network app.'),
   ('00-home', 'Full Anti-Corruption', 'We will end political corruption by removing the financial incentives', 'it was created to serve.'),
   ('00-home', 'Servant Leadership', 'The belief that leadership begins with humble service.', 'The belief that leadership begins with humble service.'),
  ],
  'stances': {k: None for k in ALL},
  'notes': {k: KENT for k in ALL},
 },
 'rustin-provance': {
  'pages': ['00-home', '01-website-about-1', '02-website-projects-1'],
  'priorities': [
   ('02-website-projects-1', 'Judicial System Reform', 'The Supreme Court needs term limits.', 'The Supreme Court needs term limits.'),
   ('02-website-projects-1', 'S.S.I Reform', 'The options we have are', 'to other unethical programs.'),
   ('02-website-projects-1', 'Abolish the Federal Reserve & Combat Inflation', "I can't remove the Federal Reserve", "and it's fiat currency."),
  ],
  'stances': {
   'cost-of-living': ('02-website-projects-1', 'Abolish the Federal Reserve & Combat Inflation', "I can't remove the Federal Reserve", "and it's fiat currency."),
   'housing': None,
   'health-care': ('02-website-projects-1', 'Health Care', 'My goal is to remove federal control over healthcare', 'it is an individual issue.'),
   'immigration': None,
   'foreign-policy': ('02-website-projects-1', 'Military & the Veterans', 'We need a strong fist', 'understanding and reason.'),
   'climate-energy': None,
  },
  'notes': {'climate-energy': 'His "Environment" section is about nuclear weapons tests, which this issue doesn\'t cover (it covers climate change, energy prices, the power grid, oil and gas, and clean energy).'},
 },
 'derrick-van-orden': {
  'pages': ['00-home', '01-about', '02-issues'],
  'priorities': [
   ('02-issues', 'Transportation and Infrastructure', 'In Congress, Derrick has secured millions in funding', 'to safer alternatives.'),
   ('02-issues', 'Rebuilding our Economy', 'That is why he champions legislation like the Working Family Tax Cuts', 'in your pocket.'),
   ('02-issues', 'Leading with Integrity', 'Derrick has put duty above personal gain', 'his entire life.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Rebuilding our Economy', 'That is why he champions legislation like the Working Family Tax Cuts', 'in your pocket.'),
   'housing': None,
   'health-care': ('02-issues', 'Improving Healthcare and Reducing Costs', 'Derrick will work to make sure individuals with preexisting conditions', 'driving costs down.'),
   'immigration': ('02-issues', 'Border Security', "Derrick has staunchly supported President Trump’s border policies", 'Prairie du Chien.'),
   'foreign-policy': None,
   'climate-energy': ('02-issues', 'Data Centers', 'Data centers will not begin construction', 'not left paying the bill.'),
  },
  'notes': {'housing': 'His "Veterans Issues" section mentions a veterans\' home-loan bill. We don\'t count benefits only for veterans as a position on housing for everyone.',
            'climate-energy': 'From his "Data Centers" plan, on who pays for new power and grid costs.'},
 },
}
