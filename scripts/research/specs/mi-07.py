RACE = 'mi-07'; DATE = '2026-10-10'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
C = {
 'william-lawrence': {
  'pages': ['00-home', '01-about', '02-platform'],
  'priorities': [
   ('02-platform', 'Make housing affordable', 'We need major federal investment in quality housing', 'at all price points.'),
   ('02-platform', 'Guarantee healthcare', 'I support Medicare for All', 'for a lower price.'),
   ('02-platform', 'End homelessness', 'I support a “Housing First” approach', 'rebuild a stable life.'),
  ],
  'stances': {
   'cost-of-living': ('02-platform', 'Tax the billionaires', 'I support a billionaire minimum tax', 'the mega-wealthy must pay.'),
   'housing': ('02-platform', 'Make housing affordable', 'We need major federal investment in quality housing', 'at all price points.'),
   'health-care': ('02-platform', 'Guarantee healthcare', 'I support Medicare for All', 'for a lower price.'),
   'immigration': ('02-platform', 'End the ICE occupation of American cities and streets; create a path to citizenship for immigrants', 'I support a path to citizenship for undocumented immigrants', 'raise wages for everybody.'),
   'foreign-policy': ('02-platform', 'Say no to endless war', 'Most urgently, we must stop arming Israel', 'weapons and tax dollars.'),
   'climate-energy': ('02-platform', 'Defend our water, land, air and climate', 'I will fight for investment to secure the climate', 'drive our electric bills down.'),
  },
 },
 'tom-barrett': {
  'pages': ['00-home', '01-7th-district'],
  'priorities': [],
  'priorities_note': 'His campaign website has no list of issues and no stances on our 6 issues. It has a biography, a page about the district, and pages to endorse, volunteer and donate.',
  'stances': {k: None for k in ALL},
 },
 'shane-dedrick': {'no_site': "We found no campaign website for him. Michigan's official candidate list doesn't include websites, a web search on Oct 10, 2026 found none, and Michigan news reports in August 2026 said he had no campaign website.", 'looked_at': ['official-mi-2026']},
}
