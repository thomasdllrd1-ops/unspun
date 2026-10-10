RACE = 'fl-14'; DATE = '2026-10-10'
C = {
 'mike-beltran': {
  # 03 is a campaign news post (an endorsement), not an issues page, so it isn't used.
  'pages': ['00-home', '01-about', '02-platform'],
  'priorities': [
   ('02-platform', 'Lower Healthcare Costs & Expand Access', 'Mike broke up healthcare bureaucracies', 'working families and seniors.'),
   ('02-platform', 'Lower the Cost of Living & Keep More of What You Earn', 'In Congress, Mike will cut the wasteful spending', 'money in your pocket.'),
   ('02-platform', 'Grow Jobs & Remove Barriers to Opportunity', "In Congress, he'll fight to reduce the regulations", 'Tampa Bay families and businesses.'),
  ],
  'stances': {
   'cost-of-living': ('02-platform', 'Lower the Cost of Living & Keep More of What You Earn', 'In Congress, Mike will cut the wasteful spending', 'money in your pocket.'),
   'housing': None,
   'health-care': ('02-platform', 'Lower Healthcare Costs & Expand Access', 'Mike broke up healthcare bureaucracies', 'working families and seniors.'),
   'immigration': ('02-platform', 'Secure the Border', 'We need to finish the wall', 'at our southern border.'),
   'foreign-policy': ('02-platform', 'Support Our Veterans & Military', 'He supports a strong national defense', 'not advancing political agendas.'),
   'climate-energy': ('02-platform', 'Protect Our Community From Overreach', 'Mike will fight to ensure no data center is built', 'or harm our environment.'),
  },
  'notes': {'climate-energy': 'From his section on data centers, on keeping energy bills from rising.'},
 },
 'brian-lambert': {
  # His Issues page gives a one-line position for each issue; we quote those.
  'pages': ['00-home', '01-about-brian', '02-issues', '03-issues-fiscal-responsibility', '04-issues-individual-liberty', '05-issues-election-integrity', '06-issues-constitutional-government', '07-issues-veterans'],
  'priorities': [
   ('02-issues', 'Fiscal Responsibility', 'Restore fiscal discipline, balance the budget', 'from crushing debt.'),
   ('02-issues', 'Constitutional Government', 'The Constitution limits the government—not the people.', 'not the people.'),
   ('02-issues', 'Individual Liberty', 'Protect the freedoms guaranteed by the Bill of Rights', 'defend individual choice.'),
  ],
  'stances': {
   'cost-of-living': ('02-issues', 'Economy & Small Business', 'Lower taxes, reduce regulation', 'American entrepreneurs succeed.'),
   'housing': None,
   'health-care': ('02-issues', 'Healthcare Reform', 'Restore patient choice, medical freedom', 'federal interference in healthcare.'),
   'immigration': ('02-issues', 'Border Security & Immigration', 'Secure every border and port of entry', 'and the rule of law.'),
   'foreign-policy': ('02-issues', 'National Defense', 'Peace through strength, constitutional accountability', 'support for our troops.'),
   'climate-energy': ('02-issues', 'Energy & American Independence', 'Reliable, affordable energy strengthens our economy', 'dependence on foreign adversaries.'),
  },
 },
 'kathy-castor': {
  # No issues page; "Delivering for Florida" lists federal money she has secured, in order, so that is her list (same as Ciscomani, AZ-06).
  'pages': ['00-home', '01-about', '02-delivering-for-florida'],
  'priorities': [
   ('02-delivering-for-florida', 'Tampa Airport', 'Kathy has secured more than $114 million', 'good-paying local jobs.'),
   ('02-delivering-for-florida', 'Port Tampa Bay', 'Over the past four years alone, Kathy secured more than $63 million', "Florida's largest port."),
   ('02-delivering-for-florida', 'Transportation & Transit', 'Kathy has secured more than $250 million', 'infrastructure across Tampa.'),
  ],
  'stances': {
   'cost-of-living': ('00-home', 'Meet Kathy', 'From securing federal investments that drive the local economy', 'Florida’s unique way of life.'),
   'housing': ('02-delivering-for-florida', 'Housing', 'Kathy has secured more than $76 million to build and preserve affordable housing', 'in Tampa.'),
   'health-care': ('01-about', 'About Kathy', 'She worked to pass the Bipartisan Infrastructure Law', 'cancer and other rare diseases.'),
   'immigration': None,
   'foreign-policy': ('02-delivering-for-florida', 'MacDill Air Force Base', 'Along with championing funding for service member and civilian pay raises', 'our nation’s special operators.'),
   'climate-energy': ('01-about', 'About Kathy', 'Kathy Castor will continue to fight for a diverse and strong Tampa Bay economy', 'protects our way of life.'),
  },
  'notes': {'foreign-policy': 'From her section on MacDill Air Force Base (military pay and base projects).',
            'climate-energy': 'Her only line on energy (keeping it affordable), from her About page.'},
 },
}
