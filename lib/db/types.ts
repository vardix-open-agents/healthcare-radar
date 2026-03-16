// Re-export all types from schema
export type {
  Database,
  EntriesTable,
  ThemesTable,
  OpportunitiesTable,
  TagsTable,
  EntryTagsTable,
} from './schema';

// Runtime types for application use
export interface Entry {
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
  traction_signals: string[] | null;
  funding: string | null;
  varden_fit: number | null;
  boring_software: boolean;
  contrarian: boolean;
  url: string | null;
  source: string | null;
  notes: string | null;
  discovery_round: number | null;
  discovered_by: string | null;
  date_added: string;
  created_at: Date;
  updated_at: Date;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  evidence_count: number;
  growth_signal: 'high' | 'medium' | 'low' | null;
  varden_fit: 'very_high' | 'high' | 'medium' | 'low' | null;
  opportunity: string[] | null;
  drivers: string[] | null;
  evidence: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface Opportunity {
  id: string;
  rank: number;
  company: string;
  country: string | null;
  score: number;
  action: 'acquire' | 'partner' | 'build' | 'monitor';
  investment_min: number | null;
  investment_max: number | null;
  rationale: string | null;
  tier: number | null;
  theme: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}

// Filter types for queries
export interface EntryFilters {
  country?: string;
  region?: string;
  problem_type?: string;
  solution_type?: string;
  care_stage?: string;
  buyer?: string;
  varden_fit_min?: number;
  varden_fit_max?: number;
  boring_software?: boolean;
  contrarian?: boolean;
  funding?: string;
  search?: string;
}

// Stats response type
export interface StatsResponse {
  total_entries: number;
  total_themes: number;
  total_opportunities: number;
  by_country: Record<string, number>;
  by_varden_fit: Record<string, number>;
  by_funding: Record<string, number>;
  by_care_stage: Record<string, number>;
  recent_discoveries: number;
  avg_varden_fit: number | null;
  boring_software_count: number;
  contrarian_count: number;
}
