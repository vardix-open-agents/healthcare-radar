#!/usr/bin/env tsx
import { Kysely, sql, RawBuilder } from 'kysely';
import { db, closeDb } from './index';
import type { Database } from './schema';

// Migration: Add missing fields to entries table and ensure canonical_companies has entry_count
async function addColumnIfNotExists(
  db: Kysely<Database>,
  table: string,
  column: string,
  type: string
) {
  try {
    // Use raw SQL for ALTER TABLE - SQLite doesn't support parameterized DDL
    await sql`ALTER TABLE ${sql.raw(table)} ADD COLUMN ${sql.raw(column)} ${sql.raw(type)}`.execute(db);
    console.log(`  ✅ Added ${table}.${column}`);
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log(`  ⏭️  ${table}.${column} already exists`);
    } else {
      throw error;
    }
  }
}

export async function up(db: Kysely<Database>) {
  console.log('🔄 Adding missing columns to entries table...');
  
  // Add missing columns to entries table (one at a time for SQLite compatibility)
  const entriesColumns: [string, string][] = [
    ['canonical_name', 'TEXT'],
    ['primary_domain', 'TEXT'],
    ['parent_company', 'TEXT'],
    ['aliases', 'TEXT'],
    ['hq_country', 'TEXT'],
    ['countries_active', 'TEXT'],
    ['primary_category', 'TEXT'],
    ['secondary_categories', 'TEXT'],
    ['target_segment', 'TEXT'],
    ['buyer_type', 'TEXT'],
    ['business_model', 'TEXT'],
    ['time_to_value_score', 'INTEGER'],
    ['build_attractiveness_score', 'REAL'],
    ['replication_difficulty_score', 'REAL'],
  ];

  for (const [column, type] of entriesColumns) {
    await addColumnIfNotExists(db, 'entries', column, type);
  }

  console.log('\n🔄 Adding entry_count to canonical_companies table...');
  await addColumnIfNotExists(db, 'canonical_companies', 'entry_count', 'INTEGER DEFAULT 0');

  console.log('\n🔄 Ensuring company_aliases has all columns...');
  await addColumnIfNotExists(db, 'company_aliases', 'country', 'TEXT');
  await addColumnIfNotExists(db, 'company_aliases', 'url', 'TEXT');
  await addColumnIfNotExists(db, 'company_aliases', 'notes', 'TEXT');
}

export async function down(db: Kysely<Database>) {
  // No down migration - we don't rollback schema changes
}

// Run migration if executed directly
async function main() {
  console.log('🚀 Starting schema migration...\n');
  
  try {
    await up(db);
    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

main();
