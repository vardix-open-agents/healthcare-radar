import { db } from './lib/db';

async function main() {
  // Get high-value entries (varden_fit >= 7)
  const highValue = await db.selectFrom('entries')
    .select([
      'company', 
      'problem_type', 
      'solution_type', 
      'country', 
      'varden_fit', 
      'buyer', 
      'care_setting',
      'problem',
      'solution',
      'url'
    ])
    .where('varden_fit', '>=', 7)
    .orderBy('varden_fit', 'desc')
    .execute();
  
  console.log(`\nFound ${highValue.length} high-value entries (varden_fit >= 7):\n`);
  
  // Group by problem_type
  const byProblemType: Record<string, typeof highValue> = {};
  for (const entry of highValue) {
    const key = entry.problem_type || 'uncategorized';
    if (!byProblemType[key]) byProblemType[key] = [];
    byProblemType[key].push(entry);
  }
  
  console.log('Grouped by problem_type:');
  for (const [type, entries] of Object.entries(byProblemType)) {
    console.log(`\n## ${type} (${entries.length} entries)`);
    for (const entry of entries) {
      console.log(`  - ${entry.company} (${entry.country}) - varden_fit: ${entry.varden_fit}`);
      console.log(`    Problem: ${entry.problem?.substring(0, 100)}...`);
      console.log(`    Solution: ${entry.solution?.substring(0, 100)}...`);
    }
  }
  
  // Print full details for top 10
  console.log('\n\n=== TOP 10 HIGH-VALUE BUILD PATTERNS ===\n');
  const top10 = highValue.slice(0, 10);
  for (let i = 0; i < top10.length; i++) {
    const entry = top10[i];
    console.log(`\n${i + 1}. **${entry.company}** (${entry.country})`);
    console.log(`   Problem Type: ${entry.problem_type}`);
    console.log(`   Solution Type: ${entry.solution_type}`);
    console.log(`   Buyer: ${entry.buyer}`);
    console.log(`   Care Setting: ${entry.care_setting}`);
    console.log(`   Varden Fit: ${entry.varden_fit}`);
    console.log(`   Problem: ${entry.problem}`);
    console.log(`   Solution: ${entry.solution}`);
    console.log(`   URL: ${entry.url}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
