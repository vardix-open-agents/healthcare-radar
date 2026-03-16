const { Client } = require('pg');

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('ERROR: POSTGRES_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  
  await client.connect();
  console.log('✅ Connected to Supabase!');
  
  // Create schema
  await client.query('CREATE SCHEMA IF NOT EXISTS radar');
  console.log('✅ Schema created');
  
  // Create canonical_companies table
  await client.query(`
    CREATE TABLE IF NOT EXISTS radar.canonical_companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      canonical_name TEXT NOT NULL UNIQUE,
      hq_country TEXT,
      primary_category TEXT,
      primary_domain TEXT,
      composite_build_score REAL,
      strategic_fit_score REAL,
      recommended_action TEXT,
      discovery_count INTEGER DEFAULT 1,
      created_at TIMESTAMPT DEFAULT now(),
      updated_at TIMESTAMPT DEFAULT now()
    )
  `);
  console.log('✅ Table canonical_companies created');
  
  // Create company_tags table
  await client.query(`
    CREATE TABLE IF NOT EXISTS radar.company_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES radar.canonical_companies(id),
      tag TEXT NOT NULL,
      created_at TIMESTAMPT DEFAULT now()
    )
  `);
  console.log('✅ Table company_tags created');
  
  // Create entries table
  await client.query(`
    CREATE TABLE IF NOT EXISTS radar.entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company TEXT,
      canonical_company_id UUID REFERENCES radar.canonical_companies(id),
      source_file TEXT,
      created_at TIMESTAMPT DEFAULT now()
    )
  `);
  console.log('✅ Table entries created');
  
  // List tables
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'radar'
  `);
  console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
  
  await client.end();
  console.log('✅ Migration complete!');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
