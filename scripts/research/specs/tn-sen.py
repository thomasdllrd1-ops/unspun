RACE = 'tn-sen'; DATE = '2026-10-09'
ALL = ['cost-of-living', 'housing', 'health-care', 'immigration', 'foreign-policy', 'climate-energy']
NOSITE = "We found no campaign website for him. Tennessee's official candidate list doesn't include websites, and a web search on Oct 9, 2026 found none."
# bill-hagerty: teamhagerty.com shows a bot check (Cloudflare) to our tools on Oct 9, 2026, and no archived copy exists.
# Read it in Thomas's browser (supervised Chrome session), add him here, then build. Don't publish TN without him.
C = {
 'marquita-bradshaw': {
  'pages': ['00-home', '01-meet-marquita', '02-priorities', '03-issues-economy', '04-issues-invest-in-affordable-housing', '05-issues-healthcare',
            '06-issues-environmental-and-climate-justice', '07-issues-public-education', '08-issues-defend-voting-rights-end-gerrymandering', '09-issues-universal-affordable-broadband'],
  'priorities': [
   ('02-priorities', 'Support Students and Teachers', 'Every student deserves a well-funded public school', 'strong resources, and respect.'),
   ('03-issues-economy', 'Build a Fair and Equitable Economy', 'She will pursue policies that ensure fair wages', 'protect workers from discrimination.'),
   ('04-issues-invest-in-affordable-housing', 'Invest In Affordable Housing', 'She will support policies that expand affordable housing', 'unfair housing practices.'),
  ],
  'stances': {
   'cost-of-living': ('03-issues-economy', 'Build a Fair and Equitable Economy', 'By expanding access to affordable childcare', 'families across Tennessee.'),
   'housing': ('04-issues-invest-in-affordable-housing', 'Invest In Affordable Housing', 'She will support policies that expand affordable housing', 'unfair housing practices.'),
   'health-care': ('05-issues-healthcare', 'Healthcare Is a Right', 'Her priorities include lowering prescription-drug costs', 'preventive and primary care.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('06-issues-environmental-and-climate-justice', 'Environmental and Climate Justice', 'She will support policies that reduce pollution', 'modernize infrastructure.'),
  },
 },
 'tharon-chandler': {'no_site': NOSITE, 'looked_at': ['official-tn-2026']},
 'andrew-gerena': {'no_site': NOSITE, 'looked_at': ['official-tn-2026']},
 'jeremy-dean-hearn': {
  'pages': ['00-home'],
  'priorities': [
   ('00-home', 'Defend our US_Constitution', None, None),
   ('00-home', 'Clarify our History', None, None),
   ('00-home', 'Restore Equality for Humans', None, None),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'INFLATION', 'Since 2008 this has only gotten worse', 'a plant that makes them all.'),
   'housing': None,
   'health-care': None,
   'immigration': ('00-home', 'IMMIGRATION', 'SINCE AMERICA BEGAN IN 1776', 'keep track of the USD.'),
   'foreign-policy': ('00-home', 'Introduction', 'TOGETHER, WE CAN FINALLY RESTORE EQUALITY', 'ECONOMIC ALTERNATIVES TO WAR.'),
   'climate-energy': None,
  },
 },
 'robert-jones': {
  'pages': ['00-home', '01-about', '02-issues'],
  'priorities': [
   ('02-issues', 'Accountability', 'I will seek to pass an Accountability Act', 'or a secure website).'),
   ('02-issues', 'Transparency', 'By not accepting donations and help from a party', 'on your collective behalf without bias.'),
   ('02-issues', 'Necessities', 'Communities, with the assistance of the government', 'letting their money extend further.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Food', 'Communities, with the assistance of the government', 'letting their money extend further.'),
   'housing': ('02-issues', 'Shelter', 'We must use a combination of technological advancements', 'to make quality housing achievable.'),
   'health-care': ('02-issues', 'Healthcare', 'The fact that medical facilities may charge', 'completely rethink our healthcare system.'),
   'immigration': ('02-issues', 'Immigration', 'Anyone deemed to be breaking our laws', 'on the basis of proof.'),
   'foreign-policy': ('02-issues', 'Foreign Policy', 'We must strengthen our bonds with our allies', 'for the defense of the defenseless.'),
   'climate-energy': ('02-issues', 'Environment', 'By focusing on renewable energy', 'economic growth and ecological sustainability.'),
  },
 },
 'james-william-macon': {'no_site': NOSITE + ' A voter guide lists a Facebook page for him, but our rules use only campaign websites.', 'looked_at': ['official-tn-2026']},
 'yoshi-matthews': {
  'pages': ['00-home', '01-about-yoshi', '02-issues'],
  'priorities': [
   ('02-issues', 'Reparations', 'My proposal addresses a specific historic injustice', 'limited in scope.'),
   ('02-issues', 'Senior Property Taxes', 'No Tennessee senior should lose their home', 'work and contribution.'),
   ('02-issues', 'Universal Basic Income', 'My proposal would provide a reliable financial foundation', 'costs of everyday life.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Universal Basic Income', 'My proposal would provide a reliable financial foundation', 'costs of everyday life.'),
   'housing': ('02-issues', 'Senior Property Taxes', 'No Tennessee senior should lose their home', 'work and contribution.'),
   'health-care': None,
   'immigration': ('02-issues', 'Border Security & Immigration', 'Secure the border, enforce immigration laws', 'legal immigration system.'),
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
 'david-sutman': {
  'pages': ['00-home'],
  'priorities': [
   ('00-home', 'Cost of Living Crisis', 'Focus on practical solutions', 'reduce everyday costs'),
   ('00-home', 'Independent Leadership', "I don't answer to a party.", 'I answer to Tennessee.'),
   ('00-home', 'Accountability in Government', 'Push for term limits', 'Push for term limits'),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Cost of Living Crisis', 'Focus on practical solutions', 'reduce everyday costs'),
   'housing': None,
   'health-care': None,
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
 'catherine-barcel-whitson': {
  'pages': ['00-home', '02-about', '03-issues'],
  'priorities': [
   ('03-issues', 'Economic Growth', 'Lowering costs, creating high-paying jobs', 'small business/entrepreneurs.'),
   ('03-issues', 'Healthcare', 'Work to reduce prescription drug costs', 'protect and improve rural hospitals.'),
   ('03-issues', 'Education & Wellbeing', 'Boosting funding for public schools', 'home schooling initiatives.'),
  ],
  'stances': {
   'cost-of-living': ('03-issues', 'Economic Growth', 'Lowering costs, creating high-paying jobs', 'small business/entrepreneurs.'),
   'housing': ('03-issues', 'Fair Housing', 'Affordable housing for all Tennesseans', 'safe tiny house communities.'),
   'health-care': ('03-issues', 'Healthcare', 'Work to reduce prescription drug costs', 'protect and improve rural hospitals.'),
   'immigration': ('03-issues', 'New Wannabe Tennesseans', 'Build networks for helping refugees and immigrants', 'in our wonderful state.'),
   'foreign-policy': None,
   'climate-energy': ('03-issues', 'Economic Growth', 'Promoting green energy and creativity', 'future generations.'),
  },
 },
}
