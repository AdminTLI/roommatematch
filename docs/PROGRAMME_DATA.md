# Programme Data (WO) - Domu Match

This document describes how programme data is sourced, imported, and integrated into the Domu Match platform for Dutch research universities (WO).

## Data Sources

The platform uses a **dual-source approach** combining DUO and Studiekeuzedatabase (SKDB) data:

- **DUO (Baseline)**: Primary source for programme identifiers (RIO codes, BRIN codes) and basic programme information
  - Source: DUO's "Overzicht Erkenningen ho" dataset
  - Update frequency: Daily
  - Authority: Dutch Ministry of Education (DUO)
  
- **SKDB (Enrichment)**: Additional authoritative source for enriched programme metadata
  - Primary: REST OData API (when `SKDB_API_BASE` + `SKDB_API_KEY` are configured)
  - Fallback: Full database CSV/XLSX dump (when `SKDB_DUMP_PATH` is configured)
  - Authority: Studiekeuzedatabase (CROHO-backed)
  - Coverage: All 14 UNL (Association of Universities in the Netherlands) research universities

### Merge Strategy

- **DUO fields** (RIO code, BRIN, names): DUO values are canonical and preserved
- **SKDB fields** (CROHO, ECTS, duration, admission): SKDB values enrich DUO data
- **Name conflicts**: DUO names remain primary; SKDB variants stored in `metadata.skdb_name`
- **Source tracking**: `sources` JSONB field tracks which sources contributed: `{ duo: boolean, skdb: boolean }`
- **SKDB-only programmes**: Programmes found only in SKDB (no DUO match) are ingested with `skdb_only: true` flag

### Supported Programme Levels

- **Bachelor's** (BSc/BA)
- **Master's** (MSc/MA) 
- **Pre-Master/Schakelprogramma** (Bridge programmes)

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# DUO Configuration (required for baseline)
# DUO data is fetched from public CSV endpoints (no API key needed)

# SKDB Configuration (for enrichment)
# API Mode (Primary)
SKDB_API_BASE=https://api.skdb.nl
SKDB_API_KEY=your_skdb_api_key_here

# OR Dump Mode (Fallback)
SKDB_DUMP_PATH=./data/studiekeuzedatabase_dump.csv
```

### Database Setup

1. Run the academic schema migration:
```bash
pnpm db:push
```

2. Seed UNL universities:
```bash
pnpm db:seed
```

3. Sync programmes:
```bash
# Sync DUO programmes (baseline)
pnpm tsx scripts/sync-duo-programmes.ts

# Sync SKDB programmes (enrichment) - requires SKDB_API_KEY or SKDB_DUMP_PATH
pnpm tsx scripts/sync-skdb-programmes.ts

# Or run both in sequence:
pnpm tsx scripts/sync-programmes.ts

# Or use the --with-skdb flag:
pnpm tsx scripts/sync-duo-programmes.ts --with-skdb
```

## Sync Process

### DUO Sync (`scripts/sync-duo-programmes.ts`)

1. **Data Fetching**: Fetches HO Opleidingsoverzicht CSV (primary) or Erkenningen CSV (fallback)
2. **Institution Mapping**: Matches by BRIN code or institution name
3. **Programme Processing**: Normalizes DUO data and classifies by level (bachelor/master/premaster)
4. **Database Upsert**: Upserts to `programmes` table with DUO identifiers as canonical

### SKDB Sync (`scripts/sync-skdb-programmes.ts`)

1. **Data Fetching**:
   - **API Mode**: Fetches via OData API (`/Institutions?$expand=Programmes` or `/Programmes`)
   - **Dump Mode**: Parses CSV/XLSX files for offline imports
2. **Institution Mapping**: Uses comprehensive synonym map to match SKDB institution names to slugs
3. **Programme Matching**: Matches SKDB programmes to existing DUO programmes by:
   - CROHO code (if available in both)
   - RIO code (if SKDB provides it)
   - Name + institution + level (fuzzy matching with Levenshtein distance)
4. **Merge Strategy**:
   - **Matched programmes**: Enriches existing DUO programmes with SKDB fields
   - **SKDB-only programmes**: Creates new records with `skdb_only: true` flag
5. **Database Upsert**: Updates or creates programmes with source tracking

### Combined Sync (`scripts/sync-programmes.ts`)

Orchestrates both syncs in sequence:
1. Runs DUO sync first (establishes baseline)
2. Runs SKDB sync (enriches with additional data)
3. Generates combined coverage report

### Institution Mapping

Uses a comprehensive synonym map to match dataset institution names to our 14 UNL universities:

```typescript
// Example mappings
'Wageningen University & Research' → 'wur'
'Technische Universiteit Delft' → 'tud'
'University of Amsterdam' → 'uva'
```

## Database Schema

### `programmes` Table

The `programmes` table stores combined DUO + SKDB data:

```sql
CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_slug VARCHAR(100) NOT NULL,
  brin_code VARCHAR(10),                    -- DUO institution code
  rio_code VARCHAR(50) UNIQUE,              -- DUO programme identifier (canonical)
  name TEXT NOT NULL,                       -- DUO name (canonical)
  name_en TEXT,                             -- DUO English name
  level programme_level NOT NULL,           -- bachelor, premaster, master
  sector programme_sector NOT NULL,         -- hbo, wo, wo_special
  modes TEXT[] DEFAULT '{}',
  is_variant BOOLEAN DEFAULT false,
  discipline TEXT,
  sub_discipline TEXT,
  city TEXT,
  isat_code VARCHAR(50),
  
  -- SKDB enrichment fields
  croho_code VARCHAR(50),                   -- CROHO code from SKDB
  language_codes TEXT[] DEFAULT '{}',       -- Instruction languages
  faculty TEXT,                             -- Faculty/department
  active BOOLEAN DEFAULT true,
  ects_credits INTEGER,                     -- ECTS credit points
  duration_years DECIMAL(3,1),              -- Duration in years
  duration_months INTEGER,                  -- Duration in months
  admission_requirements TEXT,              -- Admission notes
  
  -- Source tracking
  skdb_only BOOLEAN DEFAULT false,          -- True if no DUO match
  sources JSONB DEFAULT '{}',               -- { duo: boolean, skdb: boolean }
  skdb_updated_at TIMESTAMPTZ,              -- Last SKDB sync timestamp
  
  -- Metadata
  enrichment_status VARCHAR(20) DEFAULT 'pending',
  enriched_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',              -- Can store skdb_name variant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `user_academic` Table
```sql
CREATE TABLE user_academic (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id),
    university_id uuid NOT NULL REFERENCES universities(id),
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    program_id uuid REFERENCES programs(id),
    undecided_program boolean DEFAULT false,
    study_start_year int NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### `user_study_year_v` View
```sql
CREATE VIEW user_study_year_v AS
SELECT 
    user_id,
    GREATEST(1, EXTRACT(YEAR FROM now())::int - study_start_year + 1) AS study_year
FROM user_academic;
```

## Integration Points

### 1. Onboarding Questionnaire
- **Academic Step**: Required step in user onboarding
- **University Selection**: Typeahead dropdown with all 14 UNL universities
- **Degree Level**: Radio selection for bachelor/master/premaster
- **Programme Selection**: Dependent dropdown filtered by university + degree level
  - Displays enriched programme information: languages, ECTS credits, duration
  - Shows badges for study modes, languages, ECTS, and duration when available
- **Study Start Year**: Dropdown with live "Year X" calculation
- **Undecided Option**: Toggle for users who haven't chosen a specific programme

### 2. Matching Algorithm
Academic affinity scoring with weighted bonuses:

```typescript
const weights = {
  university_affinity: 0.08,  // Same university
  program_affinity: 0.12,     // Same programme  
  faculty_affinity: 0.05,     // Same faculty, different programme
  study_year_gap_penalty: 0.02 // Penalty per year gap beyond 2
}
```

### 3. Match Filters
- **University**: Multi-select filter for specific universities
- **Degree Level**: Multi-select for bachelor/master/premaster
- **Programme**: Dependent multi-select (enabled when universities selected)
- **Study Year**: Range or discrete selection (Year 1, 2, 3, 4+)

### 4. Match Cards
Academic affinity badges displayed on match cards:
- 🏫 **Same Programme** (highest priority)
- 🎓 **Same University** 
- 🏛️ **Same Faculty**
- ⚠️ **Study Year Gap Warning** (when gap > 4 years)

## Admin Features

### Analytics Dashboard
- **Signups by University**: Top 10 programmes per university
- **Undecided Programme %**: Percentage of users with undecided programmes
- **Study Year Distribution**: Breakdown of users by academic year

### Programme Management
- **Re-sync Button**: Protected admin action to trigger programme import
- **Import Logs**: Detailed logging of import operations
- **Data Validation**: Checks for data integrity and completeness

## Re-sync Process

### Manual Re-sync
```bash
# Sync DUO programmes (baseline)
pnpm tsx scripts/sync-duo-programmes.ts

# Sync SKDB programmes (enrichment)
pnpm tsx scripts/sync-skdb-programmes.ts

# Or run both in sequence
pnpm tsx scripts/sync-programmes.ts

# Or use the --with-skdb flag for combined sync
pnpm tsx scripts/sync-duo-programmes.ts --with-skdb
```

### Coverage Reports

After syncing, coverage reports are generated:

- **DUO Coverage**: `.coverage-report.json` - Shows programme counts per institution and missing levels
- **SKDB Sync Report**: `.skdb-sync-report.json` - Shows SKDB matching statistics and discrepancies
- **Combined Report**: `.combined-coverage-report.json` - Merged view of both sources

Coverage reports include:
- Programme counts by institution and level
- SKDB enrichment statistics (enriched vs DUO-only vs SKDB-only)
- Discrepancies (SKDB-only programmes, name conflicts)
- Missing levels per institution

### Admin Panel Re-sync
1. Navigate to Admin → Settings
2. Click "Re-sync Programmes" button
3. Monitor progress in admin logs
4. Verify updated programme counts and SKDB enrichment status

## Data Quality

### Validation Rules
- **University Mapping**: All programmes must map to valid UNL university
- **Degree Level**: Must be one of bachelor/master/premaster
- **Programme Names**: Required and non-empty
- **Active Status**: Ended programmes marked as inactive

### Error Handling
- **Missing Data**: Logged and skipped with warnings
- **Invalid Mappings**: Fallback to manual review queue
- **API Failures**: Graceful fallback to dump mode if available

## Links and References

- **Studiekeuzedatabase**: [Official Portal](https://www.studiekeuzedatabase.nl/)
- **DUO/RIO**: [Dutch Education Ministry](https://www.duo.nl/)
- **UNL**: [Association of Universities in the Netherlands](https://www.universiteitenvannederland.nl/)
- **CROHO**: [Central Register of Higher Education Programmes](https://www.croho.nl/)

## Troubleshooting

### Common Issues

1. **No programmes imported**
   - Check API credentials or dump file path
   - Verify university mapping in synonym table
   - Review import logs for errors

2. **Missing universities**
   - Ensure UNL seed data is loaded
   - Check institution synonym mappings
   - Verify API/dump contains expected institutions

3. **Programme filter not working**
   - Confirm programmes are active in database
   - Check university_id foreign key constraints
   - Verify degree_level enum values match

### Debug Commands

```bash
# Check imported programme counts
psql $DATABASE_URL -c "SELECT u.common_name, p.degree_level, COUNT(*) FROM programs p JOIN universities u ON p.university_id = u.id GROUP BY u.common_name, p.degree_level ORDER BY u.common_name;"

# Verify user academic data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_academic;"

# Check study year calculations
psql $DATABASE_URL -c "SELECT * FROM user_study_year_v LIMIT 10;"
```
