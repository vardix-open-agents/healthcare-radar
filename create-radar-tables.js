const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create radar schema
    await client.query('CREATE SCHEMA IF NOT EXISTS radar');
    console.log('Schema radar created');

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
        created_at TIMESTAMPT DEFAULT now()
      )
    `);
    console.log('Table canonical_companies created');

    // Create company_tags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS radar.company_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES radar.canonical_companies(id),
        tag TEXT NOT NULL,
        created_at TIMESTAMPT DEFAULT now()
      )
    `);
    console.log('Table company_tags created');

    // List tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'radar'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));

    await client.end();
    console.log('SUCCESS!');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

main();
