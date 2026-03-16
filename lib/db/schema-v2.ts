import { Kysely } from 'kysely';

// Canonical company table - one record per real company
export interface CanonicalCompany {
  id: string;
  canonical_name: string;
  primary_domain: string;
  aliases: string; // JSON array
  parent_company: string | null;
  brand_names: string | null; // JSON array
  hq_country: string;
  countries_active: string | null; // JSON array
  primary_category: string;
  secondary_categories: string | null; // JSON array
  target_segment: string | null;
  care_setting: string | null;
  buyer_type: string | null;
  business_model: string | null;
  founded_year: number | null;
  employee_count: string | null;
  funding_stage: string | null;
  
  // Strategic fields
  why_varden_should_care: string | null;
  buildable_components: string | null; // JSON array
  non_buildable_components: string | null; // JSON array
  varden_overlap: string | null;
  competitive_moat: string | null;
  
  // Scoring (1-5 each)
  strategic_fit_score: number | null;
  build_feasibility_score: number | null;
  technical_overlap_score: number | null;
  regulatory_burden_score: number | null;
  market_leverage_score: number | null;
  replicability_score: number | null;
  time_to_value_score: number | null;
  
  // Computed scores
  build_attractiveness_score: number | null;
  replication_difficulty_score: number | null;
  confidence_score: number | null;
  
  // Derived fields
  replication_complexity: string | null; // hours, weeks, months
  time_to_mvp: string | null;
  recommended_action: string | null; // build | monitor | ignore | benchmark
  signal_type: string | null; // build_pattern | competitor | benchmark | acquisition_candidate | category_reference
  
  // Status
  status: string; // raw | normalized | duplicate | enriched | prioritized | archived
  discovery_round: number | null;
  source_url: string | null;
  source_type: string | null; // web | api | manual
  source_confidence: number | null; // 1-5
  research_depth: string | null; // shallow | medium | deep
  last_reviewed_at: string | null;
  
  created_at: string;
  updated_at: string;
}

// Discovery instances - raw findings that may map to canonical companies
export interface DiscoveryInstance {
  id: string;
  canonical_company_id: string | null;
  raw_company_name: string;
  raw_domain: string | null;
  country: string;
  region: string;
  problem: string;
  solution: string;
  problem_type: string;
  solution_type: string;
  care_stage: string | null;
  buyer: string | null;
  care_setting: string | null;
  varden_fit: string | null;
  url: string | null;
  source: string;
  discovery_round: number;
  discovered_by: string;
  notes: string | null;
  created_at: string;
}

// Themes table
export interface Theme {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  evidence_count: number;
  growth_signal: string | null;
  varden_fit: string | null;
  opportunity: string | null;
  drivers: string | null; // JSON array
  evidence: string | null; // JSON array
  created_at: string;
  updated_at: string;
}

// Opportunities table
export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  region: string | null;
  score: number | null;
  companies: string | null; // JSON array of company IDs
  build_effort_hours: number | null;
  strategic_value: string | null;
  replication_priority: number | null;
  created_at: string;
  updated_at: string;
}

// Tags for flexible categorization
export interface Tag {
  id: string;
  name: string;
  category: string; // problem_type | care_setting | region | buyer_type
  created_at: string;
}

export interface CompanyTag {
  company_id: string;
  tag_id: string;
}

// Wave ledger for tracking discovery progress
export interface WaveLedger {
  id: string;
  wave_number: number;
  category: string;
  region: string;
  agent: string;
  target_count: number;
  actual_count: number;
  status: string; // planned | running | completed | failed
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}
