#!/usr/bin/env tsx
/**
 * Database migration script
 * Creates all tables if they don't exist
 * 
 * Run with: pnpm db:migrate
 */

import { sql } from 'kysely';
import { db, sqliteDb } from './index';

async function migrate() {
  console.log('🔄 Running database migrations...');

  // SQLite-only migration
  if (!sqliteDb) {
    console.log('⚠️  SQLite database not available. Skipping migration (PostgreSQL mode).');
    return;
  }

  try {
    // Create entries table
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT,
        country TEXT,
        region TEXT,
        problem TEXT NOT NULL,
        solution TEXT,
        problem_type TEXT,
        solution_type TEXT,
        care_stage TEXT,
        buyer TEXT,
        care_setting TEXT,
        automation_type TEXT,
        technology TEXT,
        traction_signals TEXT,
        funding TEXT,
        varden_fit INTEGER,
        boring_software INTEGER DEFAULT 0,
        contrarian INTEGER DEFAULT 0,
        url TEXT,
        source TEXT,
        notes TEXT,
        discovery_round INTEGER,
        discovered_by TEXT,
        date_added TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);
    console.log('✅ Created entries table');

    // Create themes table
    await sql`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        evidence_count INTEGER DEFAULT 0,
        growth_signal TEXT,
        varden_fit TEXT,
        opportunity TEXT,
        drivers TEXT,
        evidence TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);
    console.log('✅ Created themes table');

    // Create opportunities table
    await sql`
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        rank INTEGER NOT NULL,
        company TEXT NOT NULL,
        country TEXT,
        score REAL DEFAULT 0,
        action TEXT NOT NULL,
        investment_min REAL,
        investment_max REAL,
        rationale TEXT,
        tier INTEGER,
        theme TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);
    console.log('✅ Created opportunities table');

    // Create tags table
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);
    console.log('✅ Created tags table');

    // Create entry_tags junction table
    await sql`
      CREATE TABLE IF NOT EXISTS entry_tags (
        entry_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (entry_id, tag_id),
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `.execute(db);
    console.log('✅ Created entry_tags table');

    // Create indexes for common queries
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_entries_varden_fit ON entries(varden_fit)',
      'CREATE INDEX IF NOT EXISTS idx_entries_country ON entries(country)',
      'CREATE INDEX IF NOT EXISTS idx_entries_problem_type ON entries(problem_type)',
      'CREATE INDEX IF NOT EXISTS idx_entries_boring_software ON entries(boring_software)',
      'CREATE INDEX IF NOT EXISTS idx_entries_contrarian ON entries(contrarian)',
      'CREATE INDEX IF NOT EXISTS idx_entries_company ON entries(company)',
      'CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug)',
      'CREATE INDEX IF NOT EXISTS idx_opportunities_rank ON opportunities(rank)',
      'CREATE INDEX IF NOT EXISTS idx_opportunities_tier ON opportunities(tier)',
    ];

    for (const indexSql of indexes) {
      await sql`${sql.raw(indexSql)}`.execute(db);
    }
    console.log('✅ Created indexes');

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
