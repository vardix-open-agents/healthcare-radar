// Core data types for Healthcare Radar

export type VardenFit = 'very_high' | 'high' | 'medium' | 'low' | 'unknown';
export type FundingStage = 'seed' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'public' | 'acquired' | 'unknown';
export type CareStage = 'prevention' | 'screening' | 'diagnosis' | 'treatment' | 'monitoring' | 'recovery' | 'unknown';
export type AutomationLevel = 'full' | 'partial' | 'assistive' | 'none';
export type BuyerPersona = 'health_systems' | 'providers' | 'payers' | 'pharma' | 'patients' | 'employers' | 'government';

export interface Entry {
  id: string;
  company_name: string;
  problem_solved: string;
  solution_description: string;
  buyer_persona: BuyerPersona | string;
  care_stage: CareStage | string;
  automation_level: AutomationLevel | string;
  varden_fit: VardenFit | string;
  region: string;
  country: string;
  funding_stage: FundingStage | string;
  traction_signals: string[];
  notes?: string;
  discovery_round: number;
  discovered_by: string;
  timestamp: string;
  // Additional computed fields
  boring_software?: boolean;
  contrarian?: boolean;
  score?: number;
}

export interface Theme {
  slug: string;
  title: string;
  summary: string;
  companies: string[];
  growth_signal: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  drivers: string[];
  varden_fit: VardenFit | string;
  opportunity: string[];
  company_count?: number;
}

export interface Presentation {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  slides: Slide[];
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'split' | 'data' | 'image';
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
  };
}

export interface StatsResponse {
  total_entries: number;
  total_themes: number;
  total_opportunities: number;
  by_country: Record<string, number>;
  by_varden_fit: Record<string, number>;
  recent_discoveries: number;
  team_activity: TeamActivity[];
}

export interface TeamActivity {
  name: string;
  discoveries: number;
  last_active: string;
}
