import { Kysely, SqliteDialect, PostgresDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';
import { Pool } from 'pg';
import type { Database } from './schema';
import path from 'path';
import fs from 'fs';

// Store database in local db/ directory (not in the symlinked data/)
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dbDir, 'radar.db');

// Check if we should use PostgreSQL
const usePostgres = !!process.env.POSTGRES_URL;

let sqliteDb: BetterSqlite3.Database | null = null;
let db: Kysely<Database>;

if (usePostgres) {
  // Use PostgreSQL (Supabase)
  let connectionString = process.env.POSTGRES_URL!;
  
  // Use port 6543 (transaction pooler) which works from containerized environments
  const url = new URL(connectionString);
  if (url.port === '6432' || !url.port) {
    url.port = '6543';
    connectionString = url.toString();
  }
  
  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
      })
    })
  });
  
  console.log('Using PostgreSQL database');
} else {
  // Use SQLite (local development)
  sqliteDb = new BetterSqlite3(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  
  db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: sqliteDb,
    }),
  });
  
  console.log('Using SQLite database');
}

export { db, sqliteDb };

// Helper to close database connection
export async function closeDb() {
  await db.destroy();
}

// Re-export types
export type { Database } from './schema';
