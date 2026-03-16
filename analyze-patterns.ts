import { db } from './lib/db';

async function main() {
  // Get total count
  const count = await db.selectFrom('entries').select(db.fn.count('id').as('count')).executeTakeFirst();
  console.log('Total entries:', count?.count);
  
  // Get entries by varden_fit
  const byFit = await db.selectFrom('entries')
    .select(['varden_fit', db.fn.count('id').as('count')])
    .groupBy('varden_fit')
    .execute();
  console.log('\nBy Varden Fit:', byFit);
  
  // Get high-value entries (varden_fit >= 7 means high or very_high)
  const highValue = await db.selectFrom('entries')
    .select(['company', 'problem_type', 'solution_type', 'country', 'varden_fit', 'buyer', 'care_setting', 'problem', 'solution'])
    .where('varden_fit', '>=', 7)
    .limit(30)
    .execute();
  
  console.log('\nHigh-value entries:');
  console.log(JSON.stringify(highValue, null, 2));
  
  // Get problem types
  const problemTypes = await db.selectFrom('entries')
    .select(['problem_type', db.fn.count('id').as('count')])
    .groupBy('problem_type')
    .orderBy('count', 'desc')
    .limit(20)
    .execute();
  
  console.log('\nTop problem types:', problemTypes);
  
  // Get solution types
  const solutionTypes = await db.selectFrom('entries')
    .select(['solution_type', db.fn.count('id').as('count')])
    .groupBy('solution_type')
    .orderBy('count', 'desc')
    .limit(20)
    .execute();
  
  console.log('\nTop solution types:', solutionTypes);
  
  process.exit(0);
}

main().catch(console.error);
