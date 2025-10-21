<!-- bc050d81-f96f-4df8-9358-4667802cd67b f2b7dccb-9525-4244-bbf5-68055b3b8926 -->
# HBO/WO Institutions + Location & Commute

## Data & Types
- Add `types/institution.ts` with `InstitutionKind` and `Institution`.
- Add `data/nl-institutions.v1.json` with the exact HBO/WO list provided.
- Add `lib/loadInstitutions.ts`:
  - `loadInstitutions()` returns `{ wo, wo_special, hbo }` from file
  - `toGroupedOptions()` returns `[ { group:'WO' }, { group:'WO (special)' }, { group:'HBO' } ]` with mapped options
- Extend `types/questionnaire.ts`:
  - Add `'location-commute'` to `SectionKey`
  - Add optional `optionsFrom?: 'nl-institutions'|'nl-campuses'` to `Item`

## Components
- Create `components/questionnaire/GroupedSearchSelect.tsx` using shadcn `Command` (cmdk) + `Popover`:
  - Accepts `GroupedOption[]`, search input, keyboard nav
  - Emits selected value; supports an `Other (HBO/WO, not listed)` option that reveals text input
  - Front-end guard: block common MBO terms (e.g., `ROC`, `MBO College`, `\bmbo\b`) with hint
- Create `components/questionnaire/InstitutionSelect.tsx`:
  - Wraps `GroupedSearchSelect`, uses `toGroupedOptions()`
  - On select, maps dataset `id` (slug) → Supabase `universities.slug` to set `university_id` (DB id)
  - Shows `Other` path: store `{ institutionId:'other', institutionOther:string }`

## Intro integration (keep + enhance)
- Update `app/onboarding/components/steps/academic-step.tsx`:
  - Replace current University `Select` with `InstitutionSelect`
  - Keep existing `programs` loader; use the mapped DB `university_id`
  - If no programs found, show non-blocking info and allow “Undecided program”

## New Step: Location & Commute
- Create `app/onboarding/location-commute/page.tsx` and `pageClient.tsx`:
  - Render from a new `data/item-bank.location.v1.json`
  - Prepend the exact item:
    - `M9_Q0_University`: MCQ with `optionsFrom: 'nl-institutions'`, label, helper
  - Add `M9_Q1_Campus`: MCQ with `optionsFrom: 'nl-campuses'` (file scaffold), `Other campus/city` fallback text
- Add `lib/loadCampuses.ts` + `data/nl-campuses.v1.json` (seed minimal; expandable later)

## Routing & Order
- Set order: `/onboarding/intro` → `/onboarding/location-commute` → existing 8 sections → `/onboarding/review` → `/onboarding/complete`.
- Update each page’s `stepIndex`/`totalSteps` accordingly.

## Store & Progress
- Update `store/onboarding.ts` to include `'location-commute'` section.
- Replace fixed progress with dynamic required counts derived from loaded item banks (location + v1 bank).

## MCQ renderer
- Update `RadioGroupMCQ` (or section renderer) to detect `optionsFrom`:
  - If `'nl-institutions'`, use `InstitutionSelect` (grouped searchable)
  - If `'nl-campuses'`, use a grouped searchable select from `loadCampuses()`

## Programs completeness
- Ensure program fetching stays DB-driven by `university_id`:
  - Map slug → DB id at selection; `AcademicStep` loads all programs for that id
  - If needed, extend `scripts/import_programs.ts` to include HBO/WO slugs from the dataset (out of scope for UI but noted)

## Tests
- E2E: update onboarding spec for new route order; verify grouped select search; verify MBO guard.
- Unit: add tests for `InstitutionSelect` mapping and guard behavior.


### To-dos

- [x] Add institution types and dataset loader
- [x] Create nl-institutions.v1.json (exact provided content)
- [x] Build GroupedSearchSelect and InstitutionSelect with MBO guard
- [x] Swap AcademicStep university select to InstitutionSelect
- [x] Add Location & Commute step and item bank
- [x] Create nl-campuses.v1.json and loader
- [x] Reorder wizard to include location step near start
- [x] Make progress dynamic from item banks
- [x] Teach MCQ renderer to use dataset-backed grouped selects
- [x] Update e2e + add unit tests for InstitutionSelect

