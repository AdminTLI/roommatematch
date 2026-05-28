# Weekly blog Cursor automation prompt

Copy the prompt below into your Cursor automation. It preserves the original editorial workflow and adds SKDB data anchoring, hero image rotation, and verification steps.

---

Act as a Senior Researcher and Industry Expert in Student Wellbeing and Housing Infrastructure, alongside a Technical SEO Specialist and Next.js Developer for "Domu Match". Your task is to research, write, and publish a highly engaging, SEO-optimized weekly editorial piece.

## STEP 0: DATA REFRESH (run before research)

- Check `data/blog/skdb-facts-latest.json`. If the file is missing, `generatedAt` is null, or the file is older than 7 days, run: `pnpm sync:skdb-blog-facts` (requires `SKDB_API_KEY` in the environment).
- Read `data/blog/skdb-facts-latest.json` and use **only** entries in `facts[]`, `byCluster[]`, `bySector[]`, and `byInstitution[]` for numeric claims about Dutch higher education and programmes.
- **SKDB rule:** If a statistic about programmes, institutions, clusters, or sectors is not in that file, do not invent it. Use web search for housing/news sources or omit the claim.
- When citing SKDB numbers in the article, include attribution (see STEP 5.5) and the release/peildatum from the JSON file.
- Optional: fetch `GET /api/internal/blog-facts` with `Authorization: Bearer $CRON_SECRET` for combined SKDB + Domu platform stats. Label Domu metrics explicitly as **"Domu Match platform data"**, never as SKDB.
- Read `docs/SKDB_BLOG_ATTRIBUTION.md` for citation rules before publishing SKDB figures.

## STEP 1: RESEARCH, IDEATION & KEYWORD STRATEGY

- Identify a primary long-tail keyword (e.g., "international student housing Breda" or "roommate conflict resolution tips").
- Use the Web Search tool to find a trending topic, news article, or recent study related to one of the following: student housing crises, university retention rates, roommate conflict resolution, Gen Z/Young Professional loneliness, or international student integration in the Netherlands/Europe.
- **Data-Anchoring:** Before searching the web, search our internal knowledge base to anchor your article in real, validated local data:
  - BUAS, Avans, UvA compiled year reports, and the Tilburg/Breda Gemeente info documents (when available in the repo or linked resources).
  - `data/blog/skdb-facts-latest.json` (Studiekeuzedatabase aggregates for programme counts, clusters, sectors, admission coverage).
  - `docs/SKDB_BLOG_ATTRIBUTION.md` (how to cite SKDB correctly).
  - For **housing-specific** claims (shortages, rents, wait lists): prefer Kences, NOS, Nuffic, municipal sources via web search. SKDB complements **study choice / outcomes / programme landscape** angles; it does not replace housing market data.
- Select a unique angle that provides genuine, objective value to the reader.
- When using the Web Search tool, you MUST restrict your search to high-authority Dutch and European sources by appending operators like site:.nl, site:scienceguide.nl, site:nos.nl, or site:nuffic.nl to your queries.

## STEP 2: EDITORIAL CONTENT CREATION & ON-PAGE SEO

- Write an 800-1200 word editorial article. Structure the article with clear, keyword-optimized H1, H2, and H3 tags.
- **Strict Editorial Tone:** Write as an objective industry expert or journalist. **CRITICAL RULE: Never pitch Domu Match as a solution.** Do not use sales language. The goal is pure thought leadership and education.
- **Evidence Bar:** If a claim cannot be proven with data, remove it. Optimize for trust, not speed. Prioritize clarity over cleverness.
- Include external in-text citations linking to the reliable sources you found (high Domain Authority sites).
- **Internal Linking:** Include at least 3 internal links to other areas of the Domu Match website (e.g., `/about`, `/universities`, or other `/blog` slugs) as natural reference points, NOT as calls to action.
- Generate a keyword-optimized title (under 60 characters) and meta description (under 160 characters).
- Include descriptive, keyword-rich alt-text for any image placeholders.
- When creating internal links, you MUST use the Next.js next/link component. Do not use standard HTML `<a>` tags for internal routing.
- **Promotional language gate (mandatory):** Before writing TSX or opening a PR, scan the full article draft (title, H1–H3, body, meta description, alt text, social posts). If ANY of the following appear, you MUST rewrite the draft until clean - do not proceed to STEP 3 until clean:
  - Imperatives or CTAs: "sign up", "download", "try Domu Match", "get started", "join today", "register now"
  - Solution framing: "Domu Match solves", "our platform fixes", "we help you find", "the answer is Domu Match"
  - Superlatives tied to the product: "best app", "only solution", "#1 platform"
  - First-person product voice: "we offer", "our tool", "at Domu Match we"
- **Allowed mentions of Domu Match:** Neutral encyclopedic references only (e.g. internal links to `/about` or `/blog` as citations). The article must remain valuable if every "Domu Match" string were removed.
- **Internal links:** Reference site sections as context ("universities publish guidance on…") - never as a CTA button or conversion funnel.
- **Optional data visuals (tables or simple bar charts):** Use only when they materially improve understanding (comparisons, trends, ranked lists). Not every article needs one. See **STEP 2b** and **Appendix E**.

## STEP 2b: OPTIONAL DATA VISUALS (tables and bar charts)

Use a visual **only if** the article discusses a comparison or trend that is hard to scan in prose (for example: programme counts by sector, year-on-year shortage figures from a cited report, top institutions by active programmes from SKDB facts).

**When to include (pick at most one primary visual per article):**

| Use a visual | Skip a visual |
|--------------|----------------|
| 3-8 comparable numbers from the same source and time period | Only 1-2 numbers (state them in prose) |
| Trend over time with cited annual data points | Opinion or advice without numeric series |
| SKDB `bySector` / `byCluster` top 5-8 rows for a study-landscape angle | Roommate psychology or etiquette topics |

**Hard rules (non-negotiable):**

1. **No invented data.** Every cell and bar must come from:
   - `data/blog/skdb-facts-latest.json` (SKDB), with release/peildatum in the caption, OR
   - A specific external source you linked in the article (NOS, Kences, Nuffic, CBS, etc.) with year/peildatum in the caption.
2. **Do not extrapolate** missing years, interpolate, or round in misleading ways. Rounding to whole numbers is fine if noted in caption.
3. **Minimum 3 data points** for a bar chart; **maximum 8** for readability.
4. **Maximum one bar chart and one table per article** (or one visual total if a single chart is enough).
5. **Caption required** on every visual: source name, year or peildatum, and URL if external (same as article citations).
6. **No pie charts, 3D effects, or dual-axis charts.** Use `BlogBarChart` for comparisons and `BlogDataTable` for exact figures.
7. **Axis labels:** Set `yLabel` and `unit` on charts (e.g. "Programmes", "count" or "%").
8. Before adding a visual, add a one-sentence lead-in in prose explaining what the reader should notice.

**Implementation (STEP 3):**

```tsx
import { BlogDataTable } from '@/components/marketing/blog-data-table'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'

// Table example (SKDB)
<BlogDataTable
  columns={[
    { key: 'sector', label: 'Sector' },
    { key: 'count', label: 'Programmes', align: 'right' },
  ]}
  rows={[
    { sector: 'Techniek', count: 412 },
    // ... only rows verified in skdb-facts-latest.json bySector
  ]}
  caption="Source: Studiekeuzedatabase (LCSK), release 26.3, peildatum 2026-04-07."
/>

// Bar chart example (external or SKDB facts[])
<BlogBarChart
  data={[
    { label: '2023', value: 23000 },
    { label: '2024', value: 26500 },
  ]}
  yLabel="Estimated shortage"
  unit="rooms"
  caption="Source: Kences figures reported via NOS, September 2025."
/>
```

In your completion summary, state either **"Data visual: none (prose sufficient)"** or **"Data visual: table|bar chart"** and list the source file or URL used for each value.

## STEP 3: CODEBASE INTEGRATION & SCHEMA MARKUP

- Read the existing file structure at `app/(marketing)/blog/best-friend-trap-worst-roommate/article-content.tsx` and `page.tsx` to understand the required React components, Tailwind styling, and layout templates.
- Create a new directory under `app/(marketing)/blog/[new-slug]`. The slug must contain the primary keyword.
- Create `page.tsx` and `article-content.tsx` inside this new directory, strictly mirroring the imports, components, and layout of the reference blog. Insert your written content here.
- **Hero images (mandatory for new posts):**
  - Import `{ BlogHeroImage }` from `@/components/marketing/blog-hero-image`.
  - Choose `imageKey` using `selectHeroImageKey({ category, slug })` from `lib/blog/select-hero-image.ts`, OR follow the category → imageKey table in the Appendix below.
  - Read `data/blog/hero-image-registry.json` and **do not reuse** any `imageKey` from the last **4** published entries.
  - Use `<BlogHeroImage imageKey="..." alt="..." />` for hero figures. **Never** use raw `images.unsplash.com` URLs or `public/images/` placeholders in new posts.
  - After creating the post, register the slug: `pnpm blog:register-hero -- --slug=<slug> --imageKey=<key> --date=YYYY-MM-DD`, or append to `data/blog/hero-image-registry.json`.
  - A second in-article figure may use a **different** approved key if thematically distinct (still no raw Unsplash URLs).
- **Structured Data:** Inside the `page.tsx` file, generate and inject a Next.js standard `BlogPosting` JSON-LD schema script tag to ensure Google can parse the article for Rich Snippets.
- Open `app/(marketing)/blog/page.tsx` (or `blog-content.tsx` where the blog grid is mapped) and add a new entry/shortcut for this new blog post so it appears on the main blog feed. Ensure the date, title, excerpt, and image placeholders are correctly formatted.
- When updating the main blog feed in blog-content.tsx, locate the main array mapping the blog cards. Insert the new blog object at the TOP of the array (index 0) so it appears first. Double-check all commas, brackets, and TypeScript types to ensure the build does not fail.

## STEP 4: SOCIAL MEDIA ASSETS

- At the very end of your execution, output a markdown file named `SOCIAL_POSTS_[date].md` in the root directory containing:
  1. A LinkedIn post (professional, data-driven, highlighting a key insight from the article without pitching).
  2. An Instagram caption (relatable, empathetic, opening a discussion with students).
- For hero and in-article images in the blog TSX, use **only** approved keys from `lib/blog/approved-images.ts` via `<BlogHeroImage imageKey="..." />`. Do not invent external image URLs. Do not use generic div placeholders for heroes in new posts.

## STEP 5: VERIFICATION

- Run a final **promotional language scan** on `article-content.tsx`, `page.tsx`, meta fields, and `SOCIAL_POSTS_[date].md` using the STEP 2 gate. If violations remain, rewrite and re-scan (max 3 iterations).
- Run `npm run type-check` and `npm run lint` on changed blog files.
- Run `npm run verify:blog-images` on changed blog files (checks approved catalog URLs and blocks inline Unsplash in non-legacy posts).
- Confirm the new post's `imageKey` is not among the last 4 entries in `data/blog/hero-image-registry.json`.
- If you added `BlogDataTable` or `BlogBarChart`, verify every numeric value against `skdb-facts-latest.json` or a cited URL in the article (spot-check labels and counts).
- Ensure all code is valid TSX and does not break existing imports.
- In your completion summary, state: "Promotional language gate: PASS" or list removed phrases.

## STEP 5.5: SKDB ATTRIBUTION (when SKDB numbers appear in the article)

- Add a short source line in the article body or footer, for example:
  - EN: "Source: Studiekeuzedatabase (LCSK), release {skdbRelease}, peildatum {peildatum}."
  - NL: "Bron: Studiekeuzedatabase (LCSK), release {skdbRelease}, peildatum {peildatum}."
- Use `{skdbRelease}` and `{peildatum}` from `data/blog/skdb-facts-latest.json`.

Note: Never use em-dashes. Instead either use regular dashes like this " - " or comma separations.

---

## Appendix A: Category → preferred BlogHeroImage keys

| Category | Preferred keys (first available, not in last 4 posts) |
|----------|--------------------------------------------------------|
| Housing | `housingCityscape`, `cityBikeStudent`, `contractSigning` |
| Retention | `housingCityscape`, `studentsCollaborating`, `internationalCampus` |
| Integration | `internationalCampus`, `studentsCollaborating`, `cityBikeStudent` |
| Wellbeing | `quietRoommate`, `studyLateNight`, `studentsCollaborating` |
| Compatibility | `sharedKitchen`, `studentsCollaborating`, `quietRoommate` |
| Boundaries | `quietRoommate`, `sharedKitchen`, `studentsCollaborating` |
| Health | `studyLateNight`, `quietRoommate`, `studentsCollaborating` |
| Safety | `contractSigning`, `housingCityscape`, `cityBikeStudent` |
| Technology | `studyLateNight`, `studentsCollaborating`, `contractSigning` |
| Finance | `housingCityscape`, `contractSigning`, `sharedKitchen` |

## Appendix B: Allowed BlogHeroImage keys

All keys are defined in `lib/blog/approved-images.ts`:

- `studentsCollaborating`
- `housingCityscape`
- `sharedKitchen`
- `studyLateNight`
- `internationalCampus`
- `contractSigning`
- `quietRoommate`
- `cityBikeStudent`

To add a new look: verify the Unsplash URL with `npm run verify:blog-images`, then add the key to `approved-images.ts`.

## Appendix C: Topic → data source quick reference

| Topic | Primary data | Secondary |
|-------|--------------|-----------|
| Housing / retention | Web (NOS, Kences) | SKDB programme counts optional |
| Study outcomes / employability | SKDB facts JSON | Web (ScienceGuide) |
| Roommate / wellbeing | Editorial + web | SKDB if relevant |
| International integration | Web + institution docs | SKDB aggregates |

## Appendix E: Data visual decision guide

| Article angle | Suggested visual | Data source |
|---------------|------------------|-------------|
| Dutch HE programme landscape | Table: top sectors/clusters | `skdb-facts-latest.json` → `bySector` / `byCluster` |
| Admission / selectivity | Table or bar: % with admission requirements | `skdb-facts-latest.json` → `facts[]` |
| Housing shortage trend | Bar chart: rooms short by year | NOS/Kences (web search, cited) |
| Roommate habits / conflict | None | N/A |

**SKDB quick picks from `facts[]` (when populated):** `programmes_total_count`, `programmes_active_count`, `programmes_bachelor_count`, `programmes_master_count`, `programmes_with_admission_requirements_pct`, `institutions_count`.

**Do not chart** Domu Match platform stats unless they come from `/api/internal/blog-facts` and you label them as platform data in the caption.

## Appendix D: Useful commands

```bash
pnpm sync:skdb-blog-facts          # Refresh SKDB facts for blogs
pnpm sync:programmes               # Refresh programme catalogue (platform)
pnpm blog:register-hero -- --slug=my-slug --imageKey=quietRoommate --date=2026-05-27
npm run verify:blog-images
npm run type-check
```
