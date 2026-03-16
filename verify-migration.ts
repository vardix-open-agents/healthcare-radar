#!/usr/bin/env tsx
import { db, sqliteDb } from './lib/db/index';

async function verifyMigration() {
  console.log('🔍 Migration Verification Report\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Basic counts
    const entriesCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number };
    const companiesCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM canonical_companies').get() as { count: number };
    const aliasesCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM company_aliases').get() as { count: number };
    const tagsCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM company_tags').get() as { count: number };
    
    console.log('\n📊 Table Counts:');
    console.log(`  Entries:              ${entriesCount.count}`);
    console.log(`  Canonical Companies:  ${companiesCount.count}`);
    console.log(`  Company Aliases:      ${aliasesCount.count}`);
    console.log(`  Company Tags:         ${tagsCount.count}`);
    
    // 2. Entry status breakdown
    const statusBreakdown = sqliteDb.prepare(`
      SELECT status, COUNT(*) as count 
      FROM entries 
      GROUP BY status
    `).all() as { status: string; count: number }[];
    
    console.log('\n📋 Entry Status Breakdown:');
    statusBreakdown.forEach(s => {
      console.log(`  ${s.status || 'NULL'}: ${s.count}`);
    });
    
    // 3. Linked vs unlinked entries
    const linkedEntries = sqliteDb.prepare(`
      SELECT COUNT(*) as count 
      FROM entries 
      WHERE company_id IS NOT NULL
    `).get() as { count: number };
    
    const unlinkedEntries = sqliteDb.prepare(`
      SELECT COUNT(*) as count 
      FROM entries 
      WHERE company_id IS NULL
    `).get() as { count: number };
    
    console.log('\n🔗 Entry Linking:');
    console.log(`  Linked to companies:   ${linkedEntries.count}`);
    console.log(`  Unlinked (no company): ${unlinkedEntries.count}`);
    
    // 4. Sample canonical companies
    const sampleCompanies = sqliteDb.prepare(`
      SELECT 
        canonical_name,
        primary_domain,
        hq_country,
        discovery_count,
        composite_build_score
      FROM canonical_companies
      WHERE discovery_count > 1
      ORDER BY discovery_count DESC
      LIMIT 5
    `).all();
    
    console.log('\n🏢 Top Companies (by discovery count):');
    sampleCompanies.forEach((c: any, i: number) => {
      console.log(`  ${i + 1}. ${c.canonical_name}`);
      console.log(`     Domain: ${c.primary_domain || 'N/A'}`);
      console.log(`     Country: ${c.hq_country || 'N/A'}`);
      console.log(`     Discoveries: ${c.discovery_count}`);
      console.log(`     Composite Score: ${c.composite_build_score || 'N/A'}`);
    });
    
    // 5. Sample entries with company linkage
    const sampleLinkedEntries = sqliteDb.prepare(`
      SELECT 
        e.company,
        e.country,
        e.problem_type,
        e.status,
        e.company_id,
        c.canonical_name
      FROM entries e
      LEFT JOIN canonical_companies c ON e.company_id = c.id
      WHERE e.company_id IS NOT NULL
      LIMIT 5
    `).all();
    
    console.log('\n📝 Sample Linked Entries:');
    sampleLinkedEntries.forEach((e: any, i: number) => {
      console.log(`  ${i + 1}. Entry Company: "${e.company}"`);
      console.log(`     → Canonical: "${e.canonical_name}"`);
      console.log(`     Status: ${e.status}`);
      console.log(`     Problem: ${e.problem_type || 'N/A'}`);
    });
    
    // 6. Unlinked entries sample
    const sampleUnlinkedEntries = sqliteDb.prepare(`
      SELECT company, country, problem_type
      FROM entries
      WHERE company_id IS NULL
      LIMIT 5
    `).all();
    
    if (sampleUnlinkedEntries.length > 0) {
      console.log('\n⚠️  Sample Unlinked Entries (no company name):');
      sampleUnlinkedEntries.forEach((e: any, i: number) => {
        console.log(`  ${i + 1}. Company: "${e.company}" | Country: ${e.country || 'N/A'}`);
      });
    }
    
    // 7. Check for scoring data
    const scoredEntries = sqliteDb.prepare(`
      SELECT COUNT(*) as count 
      FROM entries 
      WHERE composite_build_score IS NOT NULL
    `).get() as { count: number };
    
    const scoredCompanies = sqliteDb.prepare(`
      SELECT COUNT(*) as count 
      FROM canonical_companies 
      WHERE composite_build_score IS NOT NULL
    `).get() as { count: number };
    
    console.log('\n📈 Scoring:');
    console.log(`  Entries with composite scores:    ${scoredEntries.count}`);
    console.log(`  Companies with composite scores:  ${scoredCompanies.count}`);
    
    // 8. Data integrity checks
    console.log('\n✅ Data Integrity Checks:');
    
    // Check for orphaned entries
    const orphanedEntries = sqliteDb.prepare(`
      SELECT COUNT(*) as count 
      FROM entries 
      WHERE company_id IS NOT NULL 
        AND company_id NOT IN (SELECT id FROM canonical_companies)
    `).get() as { count: number };
    
    console.log(`  Orphaned entries: ${orphanedEntries.count === 0 ? '✓ None' : `✗ ${orphanedEntries.count} found`}`);
    
    // Check for duplicate canonical names
    const duplicateCompanies = sqliteDb.prepare(`
      SELECT canonical_name, COUNT(*) as count
      FROM canonical_companies
      GROUP BY canonical_name
      HAVING count > 1
    `).all();
    
    console.log(`  Duplicate company names: ${duplicateCompanies.length === 0 ? '✓ None' : `✗ ${duplicateCompanies.length} found`}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
  
  await db.destroy();
}

verifyMigration();
