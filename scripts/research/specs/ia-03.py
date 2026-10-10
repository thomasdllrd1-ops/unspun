RACE = 'ia-03'; DATE = '2026-10-10'
C = {
 'zach-nunn': {
  # 03 is a campaign news post (debates), not an issues page, so it isn't used.
  'pages': ['00-home', '01-about', '02-issues'],
  'priorities': [
   ('02-issues', 'Supporting Iowa Families', 'His first bill that passed the House', 'time with new children.'),
   ('02-issues', 'Constitutional Rights', 'Zach put his life on the line', 'the right to bear arms.'),
   ('02-issues', 'Stronger Economy', 'In Congress, he passed legislation to rein in government bureaucracy', 'impeding our economy.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Stronger Economy', 'In Congress, he passed legislation to rein in government bureaucracy', 'impeding our economy.'),
   'housing': None,
   'health-care': None,
   'immigration': ('02-issues', 'Back the Blue & Defend the Border', 'As your representative, he helped pass the most comprehensive border security solution', 'across our Southern Border.'),
   'foreign-policy': ('02-issues', 'National Defense', 'In Washington, he supported policies that not only adequately fund our military', 'and mental health.'),
   'climate-energy': ('02-issues', 'Growing Agriculture', 'Also a tireless advocate for Iowa’s biofuels and ethanol producers', 'more energy independent.'),
  },
 },
 'sarah-trone-garriott': {
  # Her issues page lists 12 issues; the order looks alphabetical (likely the website's default sort). We use the site's order, as for everyone.
  'pages': ['00-home', '01-about', '02-issues', '04-issue-higher-standard', '09-issue-growing-our-economy-by-investing-in-people-not-specia',
            '10-issue-health-care-thats-affordable-and-there-when-you-need', '05-issue-immigration-thats-smart-fair-and-reflects-our-values',
            '11-issue-making-life-more-affordable-for-all-of-us', '06-issue-protecting-iowas-land-water-and-clean-energy-future', '07-issue-serving-our-veterans-like-they-served-us'],
  'priorities': [
   ('04-issue-higher-standard', 'A Higher Standard for Washington', 'So here’s my promise: I’ll work to hold everyone who runs our government', 'to the same higher standard.'),
   ('09-issue-growing-our-economy', 'Growing our economy by investing in people, not special interests', 'In Congress, I’ll fight to raise wages', 'high-skill, high-wage work.'),
   ('10-issue-health-care', 'Health care that’s affordable and there when you need it', 'In Congress, I’ll fight for common-sense solutions', 'people with more choices.'),
  ],
  'stances': {
   'cost-of-living': ('11-issue-making-life', 'Making life more affordable—for all of us', 'This includes cracking down on corporate price gouging', 'wreaking havoc on Iowa’s economy.'),
   'housing': None,
   'health-care': ('10-issue-health-care', 'Health care that’s affordable and there when you need it', 'In Congress, I’ll fight for common-sense solutions', 'people with more choices.'),
   'immigration': ('05-issue-immigration', 'Immigration that’s smart, fair, and reflects our values', 'In Congress, I’ll push for comprehensive immigration reform', 'human trafficking and drug smuggling.'),
   'foreign-policy': None,
   'climate-energy': ('06-issue-protecting', 'Protecting Iowa’s land, water, and clean energy future', 'In Congress, I’ll support investments in clean energy', 'our water safe.'),
  },
 },
}
