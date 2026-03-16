#!/usr/bin/env tsx
/**
 * Database migration script v2
 * Migrates from flat entries to normalized company-centric schema
 * 
 * Creates:
 * - canonical_companies: Master list of unique companies
 * - discovery_instances: Each problem/solution discovery (was entries)
 * - company_aliases: Alternate names for companies (for deduplication)
 * - company_tags: Categories for companies
 * 
 * Also adds scoring fields and status workflow to entries.
 * 
 * Run with: pnpm db:migrate-v2
 */

import { sql } from 'kysely';
import { db, sqliteDb } from './index';
import crypto from 'crypto';

// Migration statistics
const stats = {
  entriesBefore: 0,
  companiesCreated: 0,
  aliasesCreated: 0,
  tagsCreated: 0,
  entriesMigrated: 0,
  duplicatesLinked: 0,
  errors: [] as string[],
};

// Helper to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Normalize company name for matching
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .replace(/\b(inc|llc|ltd|gmbh|ag|sa|nv|bv|ab|as|oy|co|corp|corporation|company|limited|international|international|technologies|technology|solutions|software|healthcare|health|medical|systems|system|services|service|group|holdings)\b/g, '')
    .trim();
}

// Extract domain from URL
function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// Map old varden_fit to new 1-5 scoring scale
function mapVardenFitToScore(vardenFit: number | null): number | null {
  if (vardenFit === null) return null;
  // Old scale: 1-10, New scale: 1-5
  if (vardenFit >= 9) return 5;
  if (vardenFit >= 7) return 4;
  if (vardenFit >= 5) return 3;
  if (vardenFit >= 3) return 2;
  return 1;
}

// Calculate composite build score from individual scores
function calculateCompositeScore(scores: {
  strategic_fit?: number | null;
  build_feasibility?: number | null;
  technical_overlap?: number | null;
  regulatory_burden?: number | null;
  market_leverage?: number | null;
  replicability?: number | null;
  confidence?: number | null;
}): number | null {
  const validScores = Object.values(scores).filter(s => s !== null) as number[];
  if (validScores.length === 0) return null;
  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  return Math.round(avg * 10) / 10;
}

async function migrate() {
  console.log('🔄 Starting database migration to v2 schema...\n');

  // This migration script only works with SQLite (local development)
  if (!sqliteDb) {
    console.log('⚠️  SQLite database not available. Skipping migration (PostgreSQL mode).');
    return;
  }
  const db_local = sqliteDb; // TypeScript narrowing

  try {
    // Step 1: Get current state
    console.log('📊 Analyzing current database...');
    const entriesBefore = db_local.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number };
    stats.entriesBefore = entriesBefore.count;
    console.log(`   Found ${stats.entriesBefore} entries to migrate\n`);

    if (stats.entriesBefore === 0) {
      console.log('⚠️  No entries found. Nothing to migrate.');
      return;
    }

    // Step 2: Create new tables using better-sqlite3 directly
    console.log('🏗️  Creating new tables...');

    // Drop existing tables to ensure clean slate (they might have wrong schema)
    db_local.pragma('foreign_keys = OFF');
    db_local.exec('DROP TABLE IF EXISTS company_tags');
    db_local.exec('DROP TABLE IF EXISTS company_aliases');
    db_local.exec('DROP TABLE IF EXISTS canonical_companies');
    db_local.pragma('foreign_keys = ON');

    // Canonical companies table
    db_local.exec(`
      CREATE TABLE canonical_companies (
        id TEXT PRIMARY KEY,
        canonical_name TEXT NOT NULL UNIQUE,
        primary_domain TEXT,
        hq_country TEXT,
        countries_active TEXT,
        primary_category TEXT,
        secondary_categories TEXT,
        target_segment TEXT,
        care_setting TEXT,
        buyer_type TEXT,
        business_model TEXT,
        
        -- Aggregated scoring (average across all discoveries)
        avg_strategic_fit_score REAL,
        avg_build_feasibility_score REAL,
        avg_technical_overlap_score REAL,
        avg_regulatory_burden_score REAL,
        avg_market_leverage_score REAL,
        avg_replicability_score REAL,
        avg_confidence_score REAL,
        composite_build_score REAL,
        
        -- Discovery counts
        discovery_count INTEGER DEFAULT 0,
        problem_count INTEGER DEFAULT 0,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ canonical_companies table');

    // Company aliases table
    db_local.exec(`
      CREATE TABLE company_aliases (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        alias_name TEXT NOT NULL UNIQUE,
        alias_type TEXT DEFAULT 'alternate_spelling',
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES canonical_companies(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ company_aliases table');

    // Company tags table
    db_local.exec(`
      CREATE TABLE company_tags (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        tag_category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES canonical_companies(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ company_tags table');

    // Add new columns to entries table (if they don't exist)
    const newColumns = [
      { name: 'company_id', def: 'TEXT' },
      { name: 'status', def: "TEXT DEFAULT 'raw'" },
      { name: 'source_url', def: 'TEXT' },
      { name: 'source_type', def: "TEXT DEFAULT 'manual'" },
      { name: 'source_confidence', def: 'INTEGER' },
      { name: 'research_depth', def: "TEXT DEFAULT 'shallow'" },
      { name: 'last_reviewed_at', def: 'DATETIME' },
      // Scoring fields
      { name: 'strategic_fit_score', def: 'INTEGER' },
      { name: 'build_feasibility_score', def: 'INTEGER' },
      { name: 'technical_overlap_score', def: 'INTEGER' },
      { name: 'regulatory_burden_score', def: 'INTEGER' },
      { name: 'market_leverage_score', def: 'INTEGER' },
      { name: 'replicability_score', def: 'INTEGER' },
      { name: 'confidence_score', def: 'INTEGER' },
      { name: 'composite_build_score', def: 'REAL' },
      // Strategic fields
      { name: 'signal_type', def: 'TEXT' },
      { name: 'why_varden_should_care', def: 'TEXT' },
      { name: 'buildable_components', def: 'TEXT' },
      { name: 'non_buildable_components', def: 'TEXT' },
      { name: 'varden_overlap', def: 'TEXT' },
      { name: 'competitive_moat', def: 'TEXT' },
      { name: 'replication_complexity', def: 'TEXT' },
      { name: 'time_to_mvp', def: 'TEXT' },
      { name: 'recommended_action', def: 'TEXT' },
    ];

    // Get existing columns
    const existingColumns = db_local.pragma('table_info(entries)') as { name: string }[];
    const existingColNames = existingColumns.map(c => c.name);

    for (const col of newColumns) {
      if (!existingColNames.includes(col.name)) {
        db_local.exec(`ALTER TABLE entries ADD COLUMN ${col.name} ${col.def}`);
      }
    }
    console.log('   ✅ Added new columns to entries table');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_entries_company_id ON entries(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status)',
      'CREATE INDEX IF NOT EXISTS idx_canonical_companies_name ON canonical_companies(canonical_name)',
      'CREATE INDEX IF NOT EXISTS idx_company_aliases_name ON company_aliases(alias_name)',
      'CREATE INDEX IF NOT EXISTS idx_company_tags_company ON company_tags(company_id)',
    ];

    for (const indexSql of indexes) {
      db_local.exec(indexSql);
    }
    console.log('   ✅ Created indexes\n');

    // Step 3: Extract unique companies from entries
    console.log('🏢 Extracting unique companies...');

    const entries = db_local.prepare(`
      SELECT id, company, country, problem_type, care_setting, buyer, url, varden_fit, boring_software, contrarian
      FROM entries
    `).all() as Array<{
      id: string;
      company: string | null;
      country: string | null;
      problem_type: string | null;
      care_setting: string | null;
      buyer: string | null;
      url: string | null;
      varden_fit: number | null;
      boring_software: number | null;
      contrarian: number | null;
    }>;

    // Group entries by normalized company name
    const companyMap = new Map<string, {
      canonicalName: string;
      entries: typeof entries;
      countries: Set<string>;
      categories: Set<string>;
      careSettings: Set<string>;
      buyers: Set<string>;
      domains: Set<string>;
      avgVardenFit: number[];
    }>();

    for (const entry of entries) {
      if (!entry.company) continue;

      const normalizedName = normalizeCompanyName(entry.company);
      
      if (!companyMap.has(normalizedName)) {
        companyMap.set(normalizedName, {
          canonicalName: entry.company,
          entries: [],
          countries: new Set(),
          categories: new Set(),
          careSettings: new Set(),
          buyers: new Set(),
          domains: new Set(),
          avgVardenFit: [],
        });
      }

      const companyData = companyMap.get(normalizedName)!;
      companyData.entries.push(entry);
      
      if (entry.country) companyData.countries.add(entry.country);
      if (entry.problem_type) companyData.categories.add(entry.problem_type);
      if (entry.care_setting) companyData.careSettings.add(entry.care_setting);
      if (entry.buyer) companyData.buyers.add(entry.buyer);
      if (entry.varden_fit) companyData.avgVardenFit.push(entry.varden_fit);

      const domain = extractDomain(entry.url);
      if (domain) companyData.domains.add(domain);
    }

    console.log(`   Found ${companyMap.size} unique companies\n`);

    // Step 4: Create canonical companies using prepared statements
    console.log('📝 Creating canonical companies...');

    const insertCompany = db_local.prepare(`
      INSERT INTO canonical_companies (
        id, canonical_name, primary_domain, hq_country, countries_active,
        primary_category, secondary_categories, care_setting, buyer_type,
        avg_strategic_fit_score, discovery_count, problem_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAlias = db_local.prepare(`
      INSERT OR IGNORE INTO company_aliases (id, company_id, alias_name, alias_type, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updateEntry = db_local.prepare(`
      UPDATE entries SET
        company_id = ?,
        status = ?,
        source_type = ?,
        research_depth = ?,
        strategic_fit_score = ?,
        confidence_score = ?,
        recommended_action = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const insertTag = db_local.prepare(`
      INSERT INTO company_tags (id, company_id, tag_name, tag_category, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Run everything in a transaction
    const insertCompanies = db_local.transaction((companies: typeof companyMap) => {
      for (const [normalizedName, data] of companies) {
        const companyId = generateId();
        
        // Pick the most common company name variant as canonical
        const nameVariants = data.entries.map(e => e.company).filter(Boolean) as string[];
        const mostCommonName = nameVariants.sort((a, b) =>
          nameVariants.filter(n => n === b).length - nameVariants.filter(n => n === a).length
        )[0] || data.canonicalName;

        // Pick the best domain
        const domainList = Array.from(data.domains);
        const primaryDomain = domainList.length > 0 ? domainList[0] : null;

        // Calculate average varden fit
        const avgFit = data.avgVardenFit.length > 0
          ? data.avgVardenFit.reduce((a, b) => a + b, 0) / data.avgVardenFit.length
          : null;

        // Insert company
        insertCompany.run(
          companyId,
          mostCommonName,
          primaryDomain,
          Array.from(data.countries)[0] || null,
          JSON.stringify(Array.from(data.countries)),
          Array.from(data.categories)[0] || null,
          JSON.stringify(Array.from(data.categories).slice(1)),
          Array.from(data.careSettings)[0] || null,
          Array.from(data.buyers)[0] || null,
          avgFit ? mapVardenFitToScore(avgFit) : null,
          data.entries.length,
          data.entries.filter(e => e.problem_type).length,
          new Date().toISOString(),
          new Date().toISOString()
        );

        stats.companiesCreated++;

        // Create aliases for name variants
        const uniqueVariants = new Set(nameVariants.map(v => v.trim()));
        for (const variant of uniqueVariants) {
          if (variant !== mostCommonName) {
            insertAlias.run(
              generateId(),
              companyId,
              variant,
              'alternate_spelling',
              'migration',
              new Date().toISOString()
            );
            stats.aliasesCreated++;
          }
        }

        // Update entries to link to this company
        for (const entry of data.entries) {
          const recommendedAction = entry.boring_software === 1 ? 'build' 
            : entry.contrarian === 1 ? 'monitor' 
            : null;

          updateEntry.run(
            companyId,
            'normalized',
            'import',
            'shallow',
            entry.varden_fit ? mapVardenFitToScore(entry.varden_fit) : null,
            entry.varden_fit ? Math.min(5, Math.ceil(entry.varden_fit / 2)) : null,
            recommendedAction,
            new Date().toISOString(),
            entry.id
          );
          
          stats.entriesMigrated++;
        }

        // Count duplicates
        if (data.entries.length > 1) {
          stats.duplicatesLinked += data.entries.length - 1;
        }

        // Create tags from categories
        for (const category of data.categories) {
          insertTag.run(
            generateId(),
            companyId,
            category,
            'problem_type',
            new Date().toISOString()
          );
          stats.tagsCreated++;
        }
      }
    });

    insertCompanies(companyMap);

    console.log(`   ✅ Created ${stats.companiesCreated} canonical companies`);
    console.log(`   ✅ Created ${stats.aliasesCreated} company aliases`);
    console.log(`   ✅ Created ${stats.tagsCreated} company tags`);
    console.log(`   ✅ Linked ${stats.entriesMigrated} entries to companies`);
    console.log(`   ✅ Merged ${stats.duplicatesLinked} duplicate entries\n`);

    // Step 5: Calculate composite scores for entries with scores
    console.log('📊 Calculating composite scores...');
    
    const entriesWithScores = db_local.prepare(`
      SELECT id, strategic_fit_score, confidence_score
      FROM entries
      WHERE strategic_fit_score IS NOT NULL OR confidence_score IS NOT NULL
    `).all() as Array<{
      id: string;
      strategic_fit_score: number | null;
      confidence_score: number | null;
    }>;

    const updateComposite = db_local.prepare(`
      UPDATE entries SET composite_build_score = ? WHERE id = ?
    `);

    const updateComposites = db_local.transaction((entries: typeof entriesWithScores) => {
      for (const entry of entries) {
        const composite = calculateCompositeScore({
          strategic_fit: entry.strategic_fit_score,
          confidence: entry.confidence_score,
        });

        if (composite !== null) {
          updateComposite.run(composite, entry.id);
        }
      }
    });

    updateComposites(entriesWithScores);
    console.log(`   ✅ Composite scores calculated for ${entriesWithScores.length} entries\n`);

    // Step 6: Calculate aggregate scores for companies
    console.log('📈 Calculating company aggregate scores...');

    const companies = db_local.prepare('SELECT id FROM canonical_companies').all() as { id: string }[];

    const updateCompanyScores = db_local.prepare(`
      UPDATE canonical_companies SET
        avg_strategic_fit_score = ?,
        avg_confidence_score = ?,
        composite_build_score = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const updateCompanies = db_local.transaction((companyList: typeof companies) => {
      for (const company of companyList) {
        const companyEntries = db_local.prepare(`
          SELECT strategic_fit_score, confidence_score, composite_build_score
          FROM entries
          WHERE company_id = ?
        `).all(company.id) as Array<{
          strategic_fit_score: number | null;
          confidence_score: number | null;
          composite_build_score: number | null;
        }>;

        const strategicScores = companyEntries.filter(e => e.strategic_fit_score).map(e => e.strategic_fit_score!);
        const confidenceScores = companyEntries.filter(e => e.confidence_score).map(e => e.confidence_score!);
        const compositeScores = companyEntries.filter(e => e.composite_build_score).map(e => e.composite_build_score!);

        updateCompanyScores.run(
          avg(strategicScores),
          avg(confidenceScores),
          avg(compositeScores),
          new Date().toISOString(),
          company.id
        );
      }
    });

    updateCompanies(companies);
    console.log(`   ✅ Company aggregate scores calculated\n`);

    // Print summary
    console.log('═'.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Entries before migration:    ${stats.entriesBefore}`);
    console.log(`Unique companies identified: ${stats.companiesCreated}`);
    console.log(`Company aliases created:     ${stats.aliasesCreated}`);
    console.log(`Company tags created:        ${stats.tagsCreated}`);
    console.log(`Entries migrated:            ${stats.entriesMigrated}`);
    console.log(`Duplicates linked:           ${stats.duplicatesLinked}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors (${stats.errors.length}):`);
      stats.errors.slice(10).forEach(e => console.log(`   - ${e}`));
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more`);
      }
    }

    // Verify final state
    const finalCompanies = db_local.prepare('SELECT COUNT(*) as count FROM canonical_companies').get() as { count: number };
    const finalEntries = db_local.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number };
    const linkedEntries = db_local.prepare("SELECT COUNT(*) as count FROM entries WHERE company_id IS NOT NULL").get() as { count: number };
    const aliasesCount = db_local.prepare('SELECT COUNT(*) as count FROM company_aliases').get() as { count: number };
    const tagsCount = db_local.prepare('SELECT COUNT(*) as count FROM company_tags').get() as { count: number };

    console.log('\n📊 Final database state:');
    console.log(`   Canonical companies: ${finalCompanies.count}`);
    console.log(`   Company aliases:     ${aliasesCount.count}`);
    console.log(`   Company tags:        ${tagsCount.count}`);
    console.log(`   Total entries:       ${finalEntries.count}`);
    console.log(`   Linked entries:      ${linkedEntries.count}`);
    console.log(`   Unlinked entries:    ${finalEntries.count - linkedEntries.count}`);

    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
