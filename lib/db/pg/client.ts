import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { Generated, ColumnType } from 'kysely'

export interface CanonicalCompaniesTable {
  id: Generated<string>
  canonical_name: string
  hq_country: ColumnType<string, string | null>
  primary_category: ColumnType<string, string | null>
  primary_domain: ColumnType<string, string | null>
  composite_build_score: ColumnType<number, number | null>
  strategic_fit_score: ColumnType<number, number | null>
  recommended_action: ColumnType<string, string | null>
  why_varden_should_care: ColumnType<string, string | null>
  discovery_count: ColumnType<number, number | null>
  created_at: ColumnType<Date, string | undefined>
  updated_at: ColumnType<Date, string | undefined>
}

export interface CompanyTagsTable {
  id: Generated<string>
  company_id: string
  tag: string
  created_at: ColumnType<Date, string | undefined>
}

export interface EntriesTable {
  id: Generated<string>
  company: ColumnType<string, string | null>
  canonical_company_id: ColumnType<string, string | null>
  source_file: ColumnType<string, string | null>
  created_at: ColumnType<Date, string | undefined>
}

export interface Database {
  canonical_companies: CanonicalCompaniesTable
  company_tags: CompanyTagsTable
  entries: EntriesTable
}

let connectionString = process.env.POSTGRES_URL!

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is required')
}

// Use port 6543 (transaction pooler) which works from containerized environments
// The default port 6432 (session pooler) times out
const url = new URL(connectionString)
if (url.port === '6432' || !url.port) {
  url.port = '6543'
  connectionString = url.toString()
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
  })
})
