/**
 * Checks every data file before the site builds. Run with: npm run validate
 * If this fails, the message tells you which file and row to fix.
 */
export {}; // makes this file a module so top-level await works

process.env.SHOW_PENDING = '1';

try {
  const { db } = await import('../src/lib/data');
  const pendingRatings = db.ratings.filter((r) => r.status === 'pending').length;
  const pendingPolls = db.polls.filter((p) => p.status === 'pending').length;

  console.log('✓ Data check passed');
  console.log(`  ${db.races.length} races · ${db.candidates.length} candidates · ${db.polls.length} polls · ${db.sources.length} sources`);
  if (pendingRatings || pendingPolls) {
    console.log(`  ⚠ Waiting for a human check (hidden on the public site): ${pendingRatings} ratings, ${pendingPolls} polls`);
  }
} catch (err) {
  console.error('\n✗ Data check FAILED. Nothing was built.\n');
  console.error((err as Error).message);
  console.error('\nFix the file and row named above, then run `npm run validate` again.\n');
  process.exit(1);
}
