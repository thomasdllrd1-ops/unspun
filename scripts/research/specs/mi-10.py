RACE = 'mi-10'; DATE = '2026-10-10'
NOSITE = "We found no campaign website for {}. Michigan's official candidate list doesn't include websites, and a web search on Oct 10, 2026 found none."
C = {
 'christina-bertrand-hines': {
  # Her campaign site's "Choose a Topic" links go to posts on her campaign's Substack; we used those as her issue pages
  # (same as Curtis Stinnett, OK). Reader comments under the posts are not quoted.
  'pages': ['00-home', '01-p-my-plan-to-fix-healthcare-lessons', '02-p-the-american-dream-is-frozen', '03-p-why-your-grocery-bill-keeps-going', '04-p-my-plan-to-protect-michigans-water'],
  'priorities': [
   ('00-home', 'Lower Costs', 'In Congress, Christina will fight to lower costs', 'good-paying Michigan jobs.'),
   ('00-home', 'Protect Families', 'In Congress, she’ll fight for safer communities', 'protect kids and seniors online.'),
   ('00-home', 'Fight Corruption', 'In Congress, she’ll take on anyone driving up costs', 'deliver for working families.'),
  ],
  'stances': {
   'cost-of-living': ('03-p-why-your-grocery-bill-keeps-going', 'Why Your Grocery Bill Keeps Going Up—and What Congress Can Do About It', 'That’s why, when I’m in Congress, I will co-sponsor legislation', 'fairness and accountability.'),
   'housing': ('02-p-the-american-dream-is-frozen', 'The American Dream Is Frozen', 'Expand tax incentives that help build affordable housing', 'working families in our district.'),
   'health-care': ('01-p-my-plan-to-fix-healthcare-lessons', 'My Plan to Fix Healthcare: Lessons From My Mom', 'Strengthen and expand the ACA, Medicare, and Medicaid', 'stable, affordable coverage.'),
   'immigration': None,
   'foreign-policy': None,
   'climate-energy': ('04-p-my-plan-to-protect-michigans-water', 'My Plan to Protect Michigan’s Water, Jobs, and Future', 'I support investments in clean energy, advanced manufacturing', 'creating good-paying jobs.'),
  },
 },
 'michael-bouchard': {
  'pages': ['00-home'],
  'priorities': [
   ('00-home', 'Economy', 'That means bringing manufacturing jobs back home', 'crushes small businesses.'),
   ('00-home', 'Immigration & Security', 'I stand for finishing the wall', 'catch-and-release once and for all.'),
   ('00-home', 'Education', 'In Congress, I’ll back a Parents’ Bill of Rights', 'what their kids are being taught.'),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Economy', 'That means bringing manufacturing jobs back home', 'crushes small businesses.'),
   'housing': None,
   'health-care': ('00-home', 'Medicare & Social Security', 'I will always protect Medicare and Social Security.', 'I will always protect Medicare and Social Security.'),
   'immigration': ('00-home', 'Immigration & Security', 'I stand for finishing the wall', 'catch-and-release once and for all.'),
   'foreign-policy': None,
   'climate-energy': None,
  },
 },
 'mike-saliba': {'no_site': NOSITE.format('him'), 'looked_at': ['official-mi-2026']},
 'kwabena-nkromo': {'no_site': NOSITE.format('him'), 'looked_at': ['official-mi-2026']},
 'andrea-kirby': {'no_site': NOSITE.format('her'), 'looked_at': ['official-mi-2026']},
}
