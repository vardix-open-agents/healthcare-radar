#!/usr/bin/env node
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Ensure radar schema exists
    await client.query(`CREATE SCHEMA IF NOT EXISTS radar`);
    console.log('✅ Created radar schema');

    // Drop existing tables (for clean migration)
    console.log('\n🔄 Dropping existing tables...');
    await client.query(`DROP TABLE IF EXISTS radar.company_tags CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.discovery_instances CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.opportunities CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.themes CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.wave_ledger CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.tags CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.company_aliases CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.entries CASCADE`);
    await client.query(`DROP TABLE IF EXISTS radar.canonical_companies CASCADE`);
    console.log('✅ Dropped existing tables');

    // Create canonical_companies table
    console.log('\n🔄 Creating canonical_companies table...');
    await client.query(`
      CREATE TABLE radar.canonical_companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_name TEXT NOT NULL,
        primary_domain TEXT,
        aliases JSONB,
        parent_company TEXT,
        brand_names JSONB,
        hq_country TEXT,
        countries_active JSONB,
        primary_category TEXT,
        secondary_categories JSONB,
        target_segment TEXT,
        care_setting TEXT,
        buyer_type TEXT,
        business_model TEXT,
        founded_year INTEGER,
        employee_count TEXT,
        funding_stage TEXT,
        
        -- Strategic fields
        why_varden_should_care TEXT,
        buildable_components JSONB,
        non_buildable_components JSONB,
        varden_overlap TEXT,
        competitive_moat TEXT,
        
        -- Scoring (1-5 each)
        strategic_fit_score INTEGER,
        build_feasibility_score INTEGER,
        technical_overlap_score INTEGER,
        regulatory_burden_score INTEGER,
        market_leverage_score INTEGER,
        replicability_score INTEGER,
        time_to_value_score INTEGER,
        
        -- Computed scores
        build_attractiveness_score DECIMAL(5,2),
        replication_difficulty_score DECIMAL(5,2),
        confidence_score DECIMAL(3,2),
        
        -- Derived fields
        replication_complexity TEXT,
        time_to_mvp TEXT,
        recommended_action TEXT,
        signal_type TEXT,
        
        -- Status
        status TEXT NOT NULL DEFAULT 'raw',
        discovery_round INTEGER,
        source_url TEXT,
        source_type TEXT,
        source_confidence INTEGER,
        research_depth TEXT,
        last_reviewed_at TIMESTAMPTZ,
        
        -- Counts
        entry_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created canonical_companies');

    // Create discovery_instances table
    console.log('\n🔄 Creating discovery_instances table...');
    await client.query(`
      CREATE TABLE radar.discovery_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_company_id UUID REFERENCES radar.canonical_companies(id),
        raw_company_name TEXT NOT NULL,
        raw_domain TEXT,
        country TEXT,
        region TEXT,
        problem TEXT,
        solution TEXT,
        problem_type TEXT,
        solution_type TEXT,
        care_stage TEXT,
        buyer TEXT,
        care_setting TEXT,
        varden_fit TEXT,
        url TEXT,
        source TEXT,
        discovery_round INTEGER,
        discovered_by TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created discovery_instances');

    // Create themes table
    console.log('\n🔄 Creating themes table...');
    await client.query(`
      CREATE TABLE radar.themes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        evidence_count INTEGER DEFAULT 0,
        growth_signal TEXT,
        varden_fit TEXT,
        opportunity TEXT,
        drivers JSONB,
        evidence JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created themes');

    // Create opportunities table
    console.log('\n🔄 Creating opportunities table...');
    await client.query(`
      CREATE TABLE radar.opportunities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        region TEXT,
        score DECIMAL(5,2),
        companies JSONB,
        build_effort_hours INTEGER,
        strategic_value TEXT,
        replication_priority INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created opportunities');

    // Create tags table
    console.log('\n🔄 Creating tags table...');
    await client.query(`
      CREATE TABLE radar.tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, category)
      )
    `);
    console.log('✅ Created tags');

    // Create company_tags junction table
    console.log('\n🔄 Creating company_tags table...');
    await client.query(`
      CREATE TABLE radar.company_tags (
        company_id UUID REFERENCES radar.canonical_companies(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES radar.tags(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, tag_id)
      )
    `);
    console.log('✅ Created company_tags');

    // Create wave_ledger table
    console.log('\n🔄 Creating wave_ledger table...');
    await client.query(`
      CREATE TABLE radar.wave_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wave_number INTEGER NOT NULL,
        category TEXT,
        region TEXT,
        agent TEXT,
        target_count INTEGER,
        actual_count INTEGER,
        status TEXT NOT NULL DEFAULT 'planned',
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created wave_ledger');

    // Create company_aliases table (for name lookups)
    console.log('\n🔄 Creating company_aliases table...');
    await client.query(`
      CREATE TABLE radar.company_aliases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_company_id UUID REFERENCES radar.canonical_companies(id) ON DELETE CASCADE,
        alias_name TEXT NOT NULL,
        country TEXT,
        url TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created company_aliases');

    // Create indexes
    console.log('\n🔄 Creating indexes...');
    await client.query(`CREATE INDEX idx_canonical_companies_name ON radar.canonical_companies(canonical_name)`);
    await client.query(`CREATE INDEX idx_canonical_companies_domain ON radar.canonical_companies(primary_domain)`);
    await client.query(`CREATE INDEX idx_canonical_companies_category ON radar.canonical_companies(primary_category)`);
    await client.query(`CREATE INDEX idx_canonical_companies_country ON radar.canonical_companies(hq_country)`);
    await client.query(`CREATE INDEX idx_canonical_companies_status ON radar.canonical_companies(status)`);
    await client.query(`CREATE INDEX idx_discovery_instances_company ON radar.discovery_instances(canonical_company_id)`);
    await client.query(`CREATE INDEX idx_discovery_instances_country ON radar.discovery_instances(country)`);
    await client.query(`CREATE INDEX idx_company_tags_company ON radar.company_tags(company_id)`);
    await client.query(`CREATE INDEX idx_company_tags_tag ON radar.company_tags(tag_id)`);
    await client.query(`CREATE INDEX idx_tags_category ON radar.tags(category)`);
    await client.query(`CREATE INDEX idx_company_aliases_name ON radar.company_aliases(alias_name)`);
    await client.query(`CREATE INDEX idx_company_aliases_company ON radar.company_aliases(canonical_company_id)`);
    console.log('✅ Created indexes');

    // Verify tables
    console.log('\n📊 Verifying created tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'radar'
      ORDER BY table_name
    `);
    console.log('Tables in radar schema:', result.rows.map(r => r.table_name).join(', '));

    // Count indexes
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'radar'
      ORDER BY indexname
    `);
    console.log('Indexes:', indexResult.rows.length);

    console.log('\n🎉 Schema creation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
