# Healthcare Radar Pre-Migration Analysis Report

**Date:** 2026-03-14  
**Database:** db/radar.db  
**Status:** Ready for migration strategy design

---

## Step 1: Current Database State

### Overview
- **Total Entries:** 588
- **Unique Company Names:** 536
- **Entries with NULL company:** 31 (5.3% of total)

### Tables in Database
1. `entries` - Main company/problem tracking
2. `themes` - Thematic categorization
3. `opportunities` - Business opportunities
4. `tags` - Tagging system
5. `entry_tags` - Tag associations

### Entries Table Schema (27 columns)
Key columns:
- `id` (TEXT, NOT NULL) - Primary key
- `company` (TEXT, NOT NULL) - Company name ⚠️ **Allows NULL despite NOT NULL**
- `title`, `problem`, `solution` - Content fields
- `problem_type`, `solution_type`, `care_stage` - Categorization
- `url`, `source`, `notes` - Metadata
- `varden_fit`, `boring_software`, `contrarian` - Scoring (INTEGER)
- `date_added`, `created_at`, `updated_at` - Timestamps

### Problem Type Distribution
**Top 10:**
1. NULL (unspecified): 215 entries (36.5%)
2. Healthcare Infrastructure: 35 entries
3. eligibility: 22 entries
4. Telemedicine: 19 entries
5. data_integration: 18 entries
6. claims: 15 entries
7. coordination: 12 entries
8. Occupational Health: 11 entries
9. scheduling: 11 entries
10. staffing_workforce: 11 entries

**Total unique problem types:** 113 (including NULL)

---

## Step 2: Duplicate Pattern Analysis

### 2.1 Companies with Multiple Entries

**19 companies** have duplicate entries (same exact company name):

| Company | Count | Notes |
|---------|-------|-------|
| Doctolib | 3 | Multiple entries for same company |
| Kaia Health | 3 | Multiple entries for same company |
| Ada Health | 2 | Multiple entries for same company |
| Availity | 2 | Multiple entries for same company |
| CompuGroup Medical | 2 | Multiple entries for same company |
| Docrates | 2 | Multiple entries for same company |
| Doctrin | 2 | Multiple entries for same company |
| K Health | 2 | Multiple entries for same company |
| Leyr | 2 | Multiple entries for same company |
| Livi (Kry) | 2 | Multiple entries for same company |
| LloydsDirect / Echo | 2 | Multiple entries for same company |
| MinDoktor | 2 | Multiple entries for same company |
| Modivcare | 2 | Multiple entries for same company |
| Sundhed.dk (Denmark) | 2 | Multiple entries for same company |
| Tandem Health | 2 | Multiple entries for same company |
| VisualDx | 2 | Multiple entries for same company |
| Viz.ai | 2 | Multiple entries for same company |

**Plus 2 multi-company entries:**
- `Change Healthcare, Experian Health, Availity, Waystar`: 2 entries
- `Change Healthcare, Experian Health, Waystar, Availity`: 2 entries

### 2.2 Domain-Based Duplicates

**25 domains** show duplicate/multiple company associations:

**Key Examples:**

| Domain | Company Variations | Issue |
|--------|-------------------|-------|
| `changehealthcare.com` | 30+ variations | Multiple entries, different labels |
| `waystar.com` | 3 variations | "Waystar", "Waystar (formerly ZirMed)", "Waystar (formerly Navicure)" |
| `mindoktor.se` | 2 variations | "MinDoktor" vs "Min Doktor" |
| `corti.ai` | 2 variations | "Corti" vs "Corti, Nuance, Augmedix" |
| `captionhealth.com` | 2 variations | "Caption Health" vs "Caption Health (GE HealthCare)" |
| `flatiron.com` | 2 variations | "Flatiron Health, Navigating Cancer..." vs "Flatiron Health (Roche)" |
| `talkspace.com` | 2 variations | "Talkspace" vs "Talkspace, BetterHelp, Livi Mental Health" |

### 2.3 Known Company Aliases

#### KRY/LIVI (16 variations!)
- `Kry` (1 entry)
- `Kry (Consumer Brand)` (1 entry)
- `Kry / Livi` (1 entry)
- `Kry Germany` (1 entry)
- `Kry Livi Tech (Sweden)` (1 entry)
- `Kry Livi Tech Platform` (1 entry)
- `Kry Norway (Livi Norway)` (1 entry)
- `Livi (Kry International)` (1 entry)
- `Livi (Kry)` (2 entries)
- `Livi (Kry) (Sweden)` (1 entry)
- `Livi Employer Health` (1 entry)
- Plus mentions in multi-company entries

#### DOCTOLIB (4 variations)
- `Doctolib` (3 entries)
- `Doctolib (France)` (1 entry)
- Plus mentions in multi-company entries

#### CHANGE HEALTHCARE (30+ variations)
Appears in numerous multi-vendor entries like:
- "Change Healthcare, Experian Health, Availity, Waystar"
- "Change Healthcare (UnitedHealth)"
- "Change Healthcare (now Optum)"
- Etc.

#### WAYSTAR (20+ variations)
- `Waystar` (1 entry)
- `Waystar (USA)` (1 entry)
- `Waystar (formerly Navicure)` (1 entry)
- `Waystar (formerly ZirMed)` (1 entry)
- Plus 20+ multi-vendor entries

---

## Step 3: Migration Strategy Proposal

### Design Principles
1. ✅ **Preserve ALL data** - No deletions, only additions
2. ✅ **Non-destructive** - Existing entries remain unchanged initially
3. ✅ **Gradual migration** - Canonical fields can be NULL initially
4. ✅ **Future-proof** - Triggers normalize new entries automatically
5. ✅ **Audit trail** - Track when/how entries were normalized

### Proposed Schema Changes

#### 3.1 Add Columns to `entries` Table
```sql
ALTER TABLE entries ADD COLUMN canonical_company_id TEXT;
ALTER TABLE entries ADD COLUMN canonical_company_name TEXT;
ALTER TABLE entries ADD COLUMN normalized_at DATETIME;
ALTER TABLE entries ADD COLUMN normalization_source TEXT; -- 'auto', 'manual', NULL
```

#### 3.2 Create `canonical_companies` Table
```sql
CREATE TABLE canonical_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  aliases TEXT, -- JSON array of known aliases
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT -- JSON for additional data
);
```

#### 3.3 Create `company_aliases` Table
```sql
CREATE TABLE company_aliases (
  id TEXT PRIMARY KEY,
  canonical_company_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  alias_type TEXT DEFAULT 'name', -- 'name', 'domain', 'abbreviation'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canonical_company_id) REFERENCES canonical_companies(id),
  UNIQUE(alias, alias_type)
);
```

#### 3.4 Create `normalization_rules` Table
```sql
CREATE TABLE normalization_rules (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL, -- Regex or exact match
  canonical_company_id TEXT NOT NULL,
  rule_type TEXT DEFAULT 'exact', -- 'exact', 'regex', 'domain'
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canonical_company_id) REFERENCES canonical_companies(id)
);
```

### Migration Script Strategy

#### Phase 1: Schema Migration
1. Add new columns to `entries` table
2. Create new tables (`canonical_companies`, `company_aliases`, `normalization_rules`)
3. Create indexes for performance

#### Phase 2: Data Migration
1. **Identify canonical companies:**
   - Extract unique company names from entries
   - Group by normalized name (lowercase, strip punctuation)
   - Create canonical_company for each group
   
2. **Create aliases:**
   - For each duplicate company name → create alias
   - For domain-based duplicates → create domain aliases
   - For known variations (Kry/Livi, etc.) → create manual aliases

3. **Link entries to canonical companies:**
   - Update `entries.canonical_company_id` based on matching
   - Set `normalized_at` timestamp
   - Set `normalization_source` to 'auto' or 'manual'

#### Phase 3: Automation Setup
1. Create triggers for auto-normalization on INSERT/UPDATE
2. Create views for common queries (with canonical names)
3. Add utility functions for manual normalization

### Handling Multi-Company Entries
**Special consideration needed!**

Entries like "Change Healthcare, Experian Health, Availity, Waystar" pose a challenge:
- Option A: Keep as-is, treat as multi-vendor comparison entries
- Option B: Split into individual entries (risky - loses context)
- Option C: Tag as "multi-vendor" and skip normalization

**Recommendation:** Option C - add a `is_multi_vendor` flag to entries table.

### Rollback Strategy
Since we're only adding columns and tables:
```sql
-- Safe rollback (if needed)
ALTER TABLE entries DROP COLUMN canonical_company_id;
ALTER TABLE entries DROP COLUMN canonical_company_name;
ALTER TABLE entries DROP COLUMN normalized_at;
ALTER TABLE entries DROP COLUMN normalization_source;
DROP TABLE IF EXISTS canonical_companies;
DROP TABLE IF EXISTS company_aliases;
DROP TABLE IF EXISTS normalization_rules;
```

---

## Estimated Migration Statistics

Based on analysis:
- **~50-70 canonical companies** will be created from duplicates
- **~150-200 aliases** will be created
- **~30 multi-vendor entries** flagged for special handling
- **31 entries with NULL company** need manual review

## Next Steps

1. ✅ Review and approve migration strategy
2. ⏳ Create migration script (Python/SQL)
3. ⏳ Test on backup copy of database
4. ⏳ Run migration on production
5. ⏳ Verify data integrity
6. ⏳ Update application code to use canonical names
7. ⏳ Create UI for manual normalization review

---

**Status:** ⚠️ **AWAITING CONFIRMATION TO PROCEED**

Please review the findings and migration strategy above. Once approved, I will create the migration script.
