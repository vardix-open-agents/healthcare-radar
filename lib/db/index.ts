import { Kysely, SqliteDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';
import type { Database } from './schema';
import path from 'path';
import fs from 'fs';

// Store database in local db/ directory (not in the symlinked data/)
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dbDir, 'radar.db');

const sqliteDb = new BetterSqlite3(dbPath);
sqliteDb.pragma('journal_mode = WAL');

export const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
});

export { sqliteDb };

// Helper to close database connection
export async function closeDb() {
  await db.destroy();
}

// Re-export types
export type { Database } from './schema';
