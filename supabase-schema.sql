-- Healthcare Radar - Supabase Schema
-- Run this in Supabase SQL Editor

CREATE SCHEMA IF NOT EXISTS radar;

CREATE TABLE radar.canonical_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  country TEXT,
  category TEXT,
  description TEXT,
  score INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE radar.company_tags (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES radar.canonical_companies(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE radar.entries (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  category TEXT,
  subcategory TEXT,
  notes TEXT,
  score INTEGER,
  status TEXT DEFAULT 'active',
  source TEXT,
  canonical_company_id TEXT REFERENCES radar.canonical_companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_score ON radar.entries(score);
CREATE INDEX IF NOT EXISTS idx_entries_country ON radar.entries(country);
CREATE INDEX IF NOT EXISTS idx_canonical_companies_name ON radar.canonical_companies(name);
