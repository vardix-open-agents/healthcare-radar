#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db', 'radar.db');
const sqliteDb = new Database(dbPath);

console.log('🔍 Simple Migration Verification\n');
console.log('Database path:', dbPath);
console.log('');

try {
  // List all tables
  const tables = sqliteDb.prepare(`
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all() as { name: string }[];
  
  console.log('📋 Tables in database:');
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  // Check canonical_companies
  try {
    const companiesCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM canonical_companies').get() as { count: number };
    console.log(`\n✅ canonical_companies: ${companiesCount.count} records`);
  } catch (e: any) {
    console.log(`\n❌ canonical_companies: ${e.message}`);
  }
  
  // Check entries
  try {
    const entriesCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number };
    console.log(`✅ entries: ${entriesCount.count} records`);
    
    // Check if company_id column exists
    const entriesInfo = sqliteDb.prepare('PRAGMA table_info(entries)').all() as { name: string }[];
    const hasCompanyId = entriesInfo.some(c => c.name === 'company_id');
    console.log(`   Has company_id column: ${hasCompanyId ? '✓' : '✗'}`);
    
    if (hasCompanyId) {
      const linkedCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM entries WHERE company_id IS NOT NULL').get() as { count: number };
      console.log(`   Linked entries: ${linkedCount.count}`);
    }
  } catch (e: any) {
    console.log(`❌ entries: ${e.message}`);
  }
  
} catch (error) {
  console.error('Error:', error);
}

sqliteDb.close();
