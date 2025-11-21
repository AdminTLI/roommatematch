# Programme Data (WO) - Domu Match

This document describes how programme data is sourced, imported, and integrated into the Domu Match platform for Dutch research universities (WO).

## Data Sources

The platform uses **Studiekeuzedatabase (SKDB)** as the exclusive source for programme data:

- **SKDB (Primary Source)**: Authoritative source for all programme data
  - Primary: REST OData API (when `SKDB_API_BASE` + `SKDB_API_KEY` are configured)
  - Fallback: Full database CSV/XLSX dump (when `SKDB_DUMP_PATH` is configured)
  - Authority: Studiekeuzedatabase (CROHO-backed)
  - Coverage: All 14 UNL (Association of Universities in the Netherlands) research universities

### Data Strategy

- **SKDB fields** (CROHO, names, ECTS, duration, admission): SKDB values are canonical
- **Source tracking**: `sources` JSONB field tracks data sources: `{ duo: false, skdb: true }`
- **All programmes**: All programmes are sourced exclusively from SKDB with `skdb_only: true` flag

### Supported Programme Levels

- **Bachelor's** (BSc/BA)
- **Master's** (MSc/MA) 
- **Pre-Master/Schakelprogramma** (Bridge programmes)

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# SKDB Configuration (required)
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
# Sync SKDB programmes (requires SKDB_API_KEY or SKDB_DUMP_PATH)
pnpm tsx scripts/sync-skdb-programmes.ts

# Or use the npm script:
pnpm sync:programmes
```

## Sync Process

### SKDB Sync (`scripts/sync-skdb-programmes.ts`)

1. **Data Fetching**:
   - **API Mode**: Fetches via OData API (`/Institutions?$expand=Programmes` or `/Programmes`)
   - **Dump Mode**: Parses CSV/XLSX files for offline imports
2. **Institution Mapping**: Uses comprehensive synonym map to match SKDB institution names to slugs
3. **Programme Matching**: Matches SKDB programmes to existing programmes by:
   - CROHO code (primary identifier)
   - Name + institution + level (fuzzy matching with Levenshtein distance)
4. **Upsert Strategy**:
   - **Matched programmes**: Updates existing programmes with latest SKDB data
   - **New programmes**: Creates new records with `skdb_only: true` flag
5. **Database Upsert**: Updates or creates programmes with SKDB source tracking

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

The `programmes` table stores SKDB data:

```sql
CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_slug VARCHAR(100) NOT NULL,
  brin_code VARCHAR(10),                    -- Institution code (if available)
  rio_code VARCHAR(50),                     -- RIO code (if SKDB provides it, not required)
  name TEXT NOT NULL,                       -- SKDB programme name (canonical)
  name_en TEXT,                             -- SKDB English name
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
  skdb_only BOOLEAN DEFAULT true,            -- All programmes are SKDB-only
  sources JSONB DEFAULT '{}',               -- { duo: false, skdb: true }
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
# Sync SKDB programmes (primary and only source)
pnpm tsx scripts/sync-skdb-programmes.ts

# Or use the npm script
pnpm sync:programmes

# Or use the orchestrator script
pnpm tsx scripts/sync-programmes.ts
```

### Coverage Reports

After syncing, coverage reports are generated:

- **SKDB Sync Report**: `.skdb-sync-report.json` - Shows SKDB sync statistics

Coverage reports include:
- Programme counts by institution and level
- SKDB sync statistics (matched, updated, created, failed)
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
