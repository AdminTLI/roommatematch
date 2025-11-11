# Programme Data (WO) - Domu Match

This document describes how programme data is sourced, imported, and integrated into the Domu Match platform for Dutch research universities (WO).

## Data Source

The platform uses the **Studiekeuzedatabase** as the authoritative source for all WO (research-university) programmes:

- **Primary Source**: REST OData API (when `SKDB_API_BASE` + `SKDB_API_KEY` are configured)
- **Fallback Source**: Full database CSV/XLSX dump (when `SKDB_DUMP_PATH` is configured)
- **Authority**: CROHO/RIO-backed through DUO (Dutch Ministry of Education)
- **Coverage**: All 14 UNL (Association of Universities in the Netherlands) research universities

### Supported Programme Levels

- **Bachelor's** (BSc/BA)
- **Master's** (MSc/MA) 
- **Pre-Master/Schakelprogramma** (Bridge programmes)

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# API Mode (Primary)
SKDB_API_BASE=https://api.studiekeuzedatabase.nl
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

3. Import programmes:
```bash
pnpm import:programs
```

## Import Process

The programme importer (`/scripts/import_programs.ts`) handles:

### 1. Data Fetching
- **API Mode**: Fetches institutions and programmes via OData endpoints
- **Dump Mode**: Parses CSV/XLSX files for offline imports
- **WO Filtering**: Automatically filters to research universities only

### 2. Institution Mapping
Uses a comprehensive synonym map to match dataset institution names to our 14 UNL universities:

```typescript
// Example mappings
'Wageningen University & Research' → 'wur'
'Technische Universiteit Delft' → 'tud'
'University of Amsterdam' → 'uva'
```

### 3. Programme Processing
- **Degree Level Detection**: Automatically determines bachelor/master/premaster from programme data
- **Faculty Assignment**: Maps programmes to their respective faculties
- **Language Codes**: Captures instruction languages
- **Active Status**: Marks ended programmes as inactive

### 4. Database Upsert
- **Idempotent Operations**: Safe to run multiple times
- **Conflict Resolution**: Uses `university_id,name,degree_level` as unique constraint
- **Statistics Logging**: Reports import counts per university and degree level

## Database Schema

### `programs` Table
```sql
CREATE TABLE programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id uuid NOT NULL REFERENCES universities(id),
    croho_code text UNIQUE,
    name text NOT NULL,
    name_en text,
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    language_codes text[] DEFAULT '{}',
    faculty text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
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
# Run import script
pnpm import:programs

# Or watch mode for development
pnpm import:programs:watch
```

### Admin Panel Re-sync
1. Navigate to Admin → Settings
2. Click "Re-sync Programmes" button
3. Monitor progress in admin logs
4. Verify updated programme counts

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
