# Healthcare Radar App

A Next.js 14 application for the Varden team to browse presentations, opportunities, and market themes from the Healthcare Radar knowledge base.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Create the data symlink (if not already created):
   ```bash
   ln -s ../healthcare-radar data
   ```

3. Set up the database:
   ```bash
   # Create the SQLite database and tables
   pnpm db:migrate
   
   # Populate from JSON/Markdown source files
   pnpm db:seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

- `pnpm db:migrate` - Create SQLite database (stored in `db/radar.db`)
- `pnpm db:seed` - Populate database from JSON/Markdown source files
- `pnpm db:studio` - Generate TypeScript types from database schema (optional)

The SQLite database is stored locally in `db/radar.db`. The `data/` symlink points to the source JSON/Markdown files in `../healthcare-radar/`.

## Database Schema

The app uses SQLite with Kysely query builder for type-safe database access:

- **entries** - Healthcare companies/problems from knowledge base
- **themes** - Market theme clusters
- **opportunities** - Ranked investment opportunities
- **tags** / **entry_tags** - Tagging system for entries

## API Endpoints

- `GET /api/data` - Combined data (entries, themes, stats)
- `GET /api/data/entries` - Entries with optional filters
- `GET /api/data/entries?id=xxx` - Single entry by ID
- `GET /api/data/entries?q=search` - Search entries
- `GET /api/data/themes` - All themes
- `GET /api/data/themes?slug=xxx` - Single theme by slug
- `GET /api/data/opportunities` - Top opportunities
- `GET /api/data/stats` - Aggregated statistics

## Migrating to Supabase (PostgreSQL)

The app is designed to make migration to Supabase easy:

1. Create a Supabase project and get your credentials
2. Install PostgreSQL dependencies:
   ```bash
   pnpm add @vercel/postgres kysely-postgres-js
   ```
3. Update `lib/db/index.ts` to use PostgreSQL dialect:
   ```typescript
   import { PostgresAdapter } from '@kysely/postgres-adapter';
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.SUPABASE_DATABASE_URL,
   });
   
   export const db = new Kysely<Database>({
     dialect: new PostgresAdapter({ pool }),
   });
   ```
4. Update `.env` with Supabase credentials
5. Run migrations against PostgreSQL

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- SQLite with Kysely query builder
- Tailwind CSS
- Dark theme with cyan accents

## Deployment

Ready for Vercel deployment. Use `npm run build` to create a production build.

Note: For production, consider migrating to Supabase/PostgreSQL for better scalability.
