// Database schema types for Kysely
// These define the structure of our SQLite tables

// Entries table - Healthcare companies/problems
export interface EntriesTable {
  id: string;
  title: string;
  company: string | null;
  country: string | null;
  region: string | null;
  problem: string;
  solution: string | null;
  problem_type: string | null;
  solution_type: string | null;
  care_stage: string | null;
  buyer: string | null;
  care_setting: string | null;
  automation_type: string | null;
  technology: string | null;
  traction_signals: string | null; // JSON array stored as string
  funding: string | null;
  varden_fit: number | null; // 1-10 score (mapped from very_high=10, high=7, medium=5, low=2)
  boring_software: number; // 0 or 1
  contrarian: number; // 0 or 1
  url: string | null;
  source: string | null;
  notes: string | null;
  discovery_round: number | null;
  discovered_by: string | null;
  date_added: string;
  created_at: Date;
  updated_at: Date;
}

// Themes table - Theme clusters
export interface ThemesTable {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  evidence_count: number;
  growth_signal: string | null; // high, medium, low
  varden_fit: string | null; // very_high, high, medium, low
  opportunity: string | null; // JSON array stored as string
  drivers: string | null; // JSON array stored as string
  evidence: string | null; // JSON array stored as string
  created_at: Date;
  updated_at: Date;
}

// Opportunities table - Ranked opportunities
export interface OpportunitiesTable {
  id: string;
  rank: number;
  company: string;
  country: string;
  score: number;
  action: string; // acquire, partner, build, monitor
  investment_min: number | null;
  investment_max: number | null;
  rationale: string | null;
  tier: number | null; // 1, 2, 3
  theme: string | null;
  created_at: Date;
  updated_at: Date;
}

// Tags table - Tags for entries
export interface TagsTable {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}

// Entry-Tags junction - Many-to-many relationship
export interface EntryTagsTable {
  entry_id: string;
  tag_id: string;
}

// Full database type for Kysely
export interface Database {
  entries: EntriesTable;
  themes: ThemesTable;
  opportunities: OpportunitiesTable;
  tags: TagsTable;
  entry_tags: EntryTagsTable;
}
