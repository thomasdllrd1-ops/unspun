RACE = 'ia-01'; DATE = '2026-10-10'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'christina-bohannan': {
  # 04 is a news post (party endorsements), not an issues page, so it isn't used.
  'pages': ['00-home', '01-about', '02-priorities'],
  'priorities': [
   ('02-priorities', 'Lowering Costs For Iowans', 'Exercising Congress’s power to end the disastrous tariffs', 'thousands per year in higher costs'),
   ('02-priorities', 'Restoring Faith in our Government', 'Ban the trading of stocks by all Members of Congress', 'divestment of currently-owned stocks'),
   ('02-priorities', 'Fixing our Broken Health Care System', 'Immediately reverse the Medicaid cuts', 'rural hospitals and nursing homes'),
  ],
  'stances': {
   'cost-of-living': ('02-priorities', 'Lowering Costs For Iowans', 'Exercising Congress’s power to end the disastrous tariffs', 'thousands per year in higher costs'),
   'housing': ('02-priorities', 'Lowering Costs For Iowans', 'Prohibiting hedge funds and private investors', 'artificially raising rents'),
   'health-care': ('02-priorities', 'Lowering Costs For Iowans', 'Lowering prescription drug prices by allowing Medicare to negotiate', 'at $35 per month for everyone'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('02-priorities', 'Lowering Costs For Iowans', 'Cracking down on utility monopolies', 'to lower energy bills'),
  },
 },
 'michael-bridgford': {
  # JavaScript site, read in headless Chrome. His Issues page shows 11 headings with no text under them.
  # His "Why I'm Running" link returned "page not found" on Oct 10, 2026.
  'pages': ['00-home', '01-about', '02-issues'],
  'priorities': [
   ('02-issues', 'Represent the People of Our District, Not Party Bosses and Special Interests', None, None),
   ('02-issues', 'Address Our Affordability Crisis by Establishing Fiscal Responsibility', None, None),
   ('02-issues', 'Enact Term Limits, Congressional Stock Trading Bans, and Campaign Finance Reform', None, None),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Work to Lower Costs', 'for everyday Iowans—bringing fiscal sanity', 'can get ahead.'),
   'housing': None,
   'health-care': ('00-home', 'Revitalize Rural Healthcare', 'By mandating absolute price transparency', 'our families deserve.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('00-home', 'Put Iowa Producers First', 'I will fight to aggressively enforce ag antitrust laws', 'year-round E15.'),
  },
  'notes': {'cost-of-living': 'This line finishes his home-page heading "Work to Lower Costs."',
            'climate-energy': 'E15 is gasoline blended with 15% ethanol, a fuel made from corn.'},
 },
 'mariannette-miller-meeks': {
  'pages': ['00-home', '01-triple-m-tour'],
  'priorities': [],
  'priorities_note': 'Her campaign website has no list of issues and no stances on our 6 issues. It has a biography, news posts from 2024, and a schedule of tour events.',
  'stances': {k: None for k in ALL},
 },
}
