/**
 * Programme Data Repository
 * 
 * Data access layer for programme data stored in the programmes table.
 * Provides functions to query programmes by institution, level, and other criteria.
 */

import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Programme, DegreeLevel, ProgrammesByLevel } from '@/types/programme'

/**
 * Database row structure for programmes table
 */
interface ProgrammeRow {
  id: string
  institution_slug: string
  brin_code: string | null
  rio_code: string | null
  name: string
  name_en: string | null
  level: 'bachelor' | 'premaster' | 'master'
  sector: 'hbo' | 'wo' | 'wo_special'
  modes: string[] | null
  is_variant: boolean
  discipline: string | null
  sub_discipline: string | null
  city: string | null
  isat_code: string | null
  croho_code: string | null
  language_codes: string[] | null
  faculty: string | null
  active: boolean | null
  enrichment_status: 'pending' | 'enriched' | 'failed' | 'not_found' | null
  enriched_at: string | null
  ects_credits: number | null
  duration_years: number | null
  duration_months: number | null
  admission_requirements: string | null
  skdb_only: boolean | null
  sources: Record<string, any> | null
  skdb_updated_at: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

/**
 * Map database row to Programme type
 */
function mapRowToProgramme(row: ProgrammeRow): Programme {
  return {
    id: row.rio_code || row.id,
    name: row.name,
    nameEn: row.name_en || undefined,
    level: row.level,
    sector: row.sector,
    modes: row.modes ? (row.modes as ('fulltime' | 'parttime' | 'dual')[]) : undefined,
    isVariant: row.is_variant || undefined,
    discipline: row.discipline || undefined,
    subDiscipline: row.sub_discipline || undefined,
    city: row.city || undefined,
    externalRefs: {
      rioCode: row.rio_code || row.id,
      instCode: row.brin_code || '',
      ...(row.isat_code ? { isat: row.isat_code } : {})
    },
    crohoCode: row.croho_code || undefined,
    languageCodes: row.language_codes && row.language_codes.length > 0 ? row.language_codes : undefined,
    faculty: row.faculty || undefined,
    active: row.active !== null ? row.active : undefined,
    enrichmentStatus: row.enrichment_status || undefined,
    ectsCredits: row.ects_credits || undefined,
    durationYears: row.duration_years || undefined,
    durationMonths: row.duration_months || undefined,
    admissionRequirements: row.admission_requirements || undefined,
    skdbOnly: row.skdb_only || undefined,
    sources: row.sources ? (row.sources as { duo: boolean; skdb: boolean }) : undefined,
    skdbUpdatedAt: row.skdb_updated_at || undefined,
    metadata: row.metadata || undefined
  }
}

/**
 * Get programmes for a specific institution and degree level
 * 
 * @param institutionSlug - Institution slug (e.g., 'uva', 'vu')
 * @param level - Degree level ('bachelor', 'premaster', or 'master')
 * @param useServerClient - Whether to use server-side client (default: false)
 * @returns Array of programmes
 */
export async function getProgrammesByInstitutionAndLevel(
  institutionSlug: string,
  level: DegreeLevel,
  useServerClient: boolean = false
): Promise<Programme[]> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('institution_slug', institutionSlug)
    .eq('level', level)
    .order('name', { ascending: true })
  
  if (error) {
    console.error(`Error fetching programmes for ${institutionSlug}/${level}:`, error)
    return []
  }
  
  return (data || []).map(mapRowToProgramme)
}

/**
 * Get all programmes for an institution, grouped by level
 * 
 * @param institutionSlug - Institution slug
 * @param useServerClient - Whether to use server-side client (default: false)
 * @returns Programmes grouped by level
 */
export async function getAllProgrammesForInstitution(
  institutionSlug: string,
  useServerClient: boolean = false
): Promise<ProgrammesByLevel> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('institution_slug', institutionSlug)
    .order('level', { ascending: true })
    .order('name', { ascending: true })
  
  if (error) {
    console.error(`Error fetching all programmes for ${institutionSlug}:`, error)
    return { bachelor: [], premaster: [], master: [] }
  }
  
  const programmes = (data || []).map(mapRowToProgramme)
  
  return {
    bachelor: programmes.filter(p => p.level === 'bachelor'),
    premaster: programmes.filter(p => p.level === 'premaster'),
    master: programmes.filter(p => p.level === 'master')
  }
}

/**
 * Get a programme by its RIO code
 * 
 * @param rioCode - DUO RIO code
 * @param useServerClient - Whether to use server-side client (default: false)
 * @returns Programme or null if not found
 */
export async function getProgrammeByRioCode(
  rioCode: string,
  useServerClient: boolean = false
): Promise<Programme | null> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('rio_code', rioCode)
    .maybeSingle()
  
  if (error) {
    console.error(`Error fetching programme by RIO code ${rioCode}:`, error)
    return null
  }
  
  return data ? mapRowToProgramme(data) : null
}

/**
 * Search programmes by name with optional filters
 * 
 * @param query - Search query (searches in name and name_en)
 * @param filters - Optional filters (institutionSlug, level, sector)
 * @param useServerClient - Whether to use server-side client (default: false)
 * @returns Array of matching programmes
 */
export async function searchProgrammes(
  query: string,
  filters?: {
    institutionSlug?: string
    level?: DegreeLevel
    sector?: 'hbo' | 'wo' | 'wo_special'
  },
  useServerClient: boolean = false
): Promise<Programme[]> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  let dbQuery = supabase
    .from('programmes')
    .select('*')
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%`)
  
  if (filters?.institutionSlug) {
    dbQuery = dbQuery.eq('institution_slug', filters.institutionSlug)
  }
  
  if (filters?.level) {
    dbQuery = dbQuery.eq('level', filters.level)
  }
  
  if (filters?.sector) {
    dbQuery = dbQuery.eq('sector', filters.sector)
  }
  
  dbQuery = dbQuery.order('name', { ascending: true }).limit(100)
  
  const { data, error } = await dbQuery
  
  if (error) {
    console.error(`Error searching programmes with query "${query}":`, error)
    return []
  }
  
  return (data || []).map(mapRowToProgramme)
}

/**
 * Upsert programmes for an institution (for sync script - requires admin client)
 * 
 * @param institutionSlug - Institution slug
 * @param programmes - Array of programmes to upsert
 * @returns Number of programmes upserted
 */
export async function upsertProgrammesForInstitution(
  institutionSlug: string,
  programmes: Programme[]
): Promise<number> {
  const supabase = createAdminClient()
  
  // Deduplicate programmes by rio_code (keep the first occurrence)
  const seen = new Set<string>()
  const uniqueProgrammes: Programme[] = []
  
  for (const prog of programmes) {
    const rioCode = prog.externalRefs?.rioCode || prog.id
    if (!seen.has(rioCode)) {
      seen.add(rioCode)
      uniqueProgrammes.push(prog)
    } else {
      console.warn(`⚠️  Skipping duplicate programme with rio_code: ${rioCode} (${prog.name})`)
    }
  }
  
  if (uniqueProgrammes.length !== programmes.length) {
    console.log(`   Deduplicated ${programmes.length - uniqueProgrammes.length} duplicate programme(s)`)
  }
  
  // Map Programme to database row format
  const rows = uniqueProgrammes.map(prog => ({
    institution_slug: institutionSlug,
    brin_code: prog.externalRefs?.instCode || null,
    rio_code: prog.externalRefs?.rioCode || prog.id,
    name: prog.name,
    name_en: prog.nameEn || null,
    level: prog.level,
    sector: prog.sector,
    modes: prog.modes || [],
    is_variant: prog.isVariant || false,
    discipline: prog.discipline || null,
    sub_discipline: prog.subDiscipline || null,
    city: prog.city || null,
    isat_code: prog.externalRefs?.isat || null,
    croho_code: prog.crohoCode || null,
    language_codes: prog.languageCodes || [],
    faculty: prog.faculty || null,
    active: prog.active !== undefined ? prog.active : true,
    enrichment_status: prog.enrichmentStatus || 'pending',
    metadata: {}
  }))
  
  // Upsert in batches to handle potential conflicts
  // Use rio_code as conflict key if available, otherwise use composite key
  const { data, error } = await supabase
    .from('programmes')
    .upsert(rows, {
      onConflict: 'rio_code',
      ignoreDuplicates: false
    })
    .select()
  
  if (error) {
    console.error(`Error upserting programmes for ${institutionSlug}:`, error)
    throw error
  }
  
  return data?.length || 0
}

/**
 * Get programme counts by institution and level (for coverage reporting)
 * 
 * @param useServerClient - Whether to use server-side client (default: true)
 * @returns Map of institution slug to counts by level
 */
export async function getProgrammeCountsByInstitution(
  useServerClient: boolean = true
): Promise<Record<string, { bachelor: number; premaster: number; master: number }>> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('institution_slug, level')
  
  if (error) {
    console.error('Error fetching programme counts:', error)
    return {}
  }
  
  const counts: Record<string, { bachelor: number; premaster: number; master: number }> = {}
  
  for (const row of data || []) {
    if (!counts[row.institution_slug]) {
      counts[row.institution_slug] = { bachelor: 0, premaster: 0, master: 0 }
    }
    counts[row.institution_slug][row.level as DegreeLevel]++
  }
  
  return counts
}

/**
 * Enrich a programme with Studiekeuzedatabase data
 * 
 * @param rioCode - RIO code of the programme to enrich
 * @param enrichmentData - Enrichment data to apply
 * @returns Updated programme or null if not found
 */
export async function enrichProgramme(
  rioCode: string,
  enrichmentData: {
    crohoCode?: string
    languageCodes?: string[]
    faculty?: string
    active?: boolean
    ectsCredits?: number
    durationYears?: number
    durationMonths?: number
    admissionRequirements?: string
    sources?: { duo: boolean; skdb: boolean }
    skdbOnly?: boolean
  }
): Promise<Programme | null> {
  const supabase = createAdminClient()
  
  const updateData: any = {
    enrichment_status: 'enriched',
    enriched_at: new Date().toISOString(),
    skdb_updated_at: new Date().toISOString()
  }
  
  if (enrichmentData.crohoCode !== undefined) {
    updateData.croho_code = enrichmentData.crohoCode || null
  }
  if (enrichmentData.languageCodes !== undefined) {
    updateData.language_codes = enrichmentData.languageCodes || []
  }
  if (enrichmentData.faculty !== undefined) {
    updateData.faculty = enrichmentData.faculty || null
  }
  if (enrichmentData.active !== undefined) {
    updateData.active = enrichmentData.active
  }
  if (enrichmentData.ectsCredits !== undefined) {
    updateData.ects_credits = enrichmentData.ectsCredits || null
  }
  if (enrichmentData.durationYears !== undefined) {
    updateData.duration_years = enrichmentData.durationYears || null
  }
  if (enrichmentData.durationMonths !== undefined) {
    updateData.duration_months = enrichmentData.durationMonths || null
  }
  if (enrichmentData.admissionRequirements !== undefined) {
    updateData.admission_requirements = enrichmentData.admissionRequirements || null
  }
  if (enrichmentData.sources !== undefined) {
    updateData.sources = enrichmentData.sources
  }
  if (enrichmentData.skdbOnly !== undefined) {
    updateData.skdb_only = enrichmentData.skdbOnly
  }
  
  const { data, error } = await supabase
    .from('programmes')
    .update(updateData)
    .eq('rio_code', rioCode)
    .select()
    .single()
  
  if (error) {
    console.error(`Error enriching programme ${rioCode}:`, error)
    // Mark as failed if update fails
    await supabase
      .from('programmes')
      .update({ enrichment_status: 'failed' })
      .eq('rio_code', rioCode)
    return null
  }
  
  return data ? mapRowToProgramme(data) : null
}

/**
 * Upsert SKDB-only programme (no DUO match)
 * 
 * @param programmeData - SKDB programme data
 * @param institutionSlug - Institution slug
 * @returns Created programme or null if failed
 */
export async function upsertSkdbProgramme(
  programmeData: {
    name: string
    nameEn?: string
    crohoCode?: string
    level: DegreeLevel
    languageCodes?: string[]
    faculty?: string
    active?: boolean
    ectsCredits?: number
    durationYears?: number
    durationMonths?: number
    admissionRequirements?: string
  },
  institutionSlug: string
): Promise<Programme | null> {
  const supabase = createAdminClient()
  
  // Get BRIN code and sector
  const { getInstitutionBrinCode } = await import('@/lib/duo/erkenningen')
  const { loadInstitutions } = await import('@/lib/loadInstitutions')
  const brinCode = getInstitutionBrinCode(institutionSlug)
  const institutions = loadInstitutions()
  const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo]
  const institution = allInstitutions.find(inst => inst.id === institutionSlug)
  const sector = institution?.sector || 'wo'
  
  const now = new Date().toISOString()
  const sources = { duo: false, skdb: true }
  
  const insertData: any = {
    institution_slug: institutionSlug,
    brin_code: brinCode || null,
    rio_code: null, // No DUO match
    name: programmeData.name,
    name_en: programmeData.nameEn || null,
    level: programmeData.level,
    sector,
    modes: [],
    is_variant: false,
    croho_code: programmeData.crohoCode || null,
    language_codes: programmeData.languageCodes || [],
    faculty: programmeData.faculty || null,
    active: programmeData.active !== undefined ? programmeData.active : true,
    ects_credits: programmeData.ectsCredits || null,
    duration_years: programmeData.durationYears || null,
    duration_months: programmeData.durationMonths || null,
    admission_requirements: programmeData.admissionRequirements || null,
    skdb_only: true,
    sources,
    skdb_updated_at: now,
    enrichment_status: 'enriched',
    enriched_at: now,
    metadata: {}
  }
  
  const { data, error } = await supabase
    .from('programmes')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error(`Error creating SKDB-only programme:`, error)
    return null
  }
  
  return data ? mapRowToProgramme(data) : null
}

/**
 * Get programmes filtered by source
 * 
 * Note: All programmes are now SKDB-only. DUO filter is deprecated and will always return empty results.
 * 
 * @param filters - Source filters
 * @param useServerClient - Whether to use server-side client (default: true)
 * @returns Array of matching programmes
 */
export async function getProgrammesBySource(
  filters: {
    hasDuo?: boolean // Deprecated: All programmes are SKDB-only, this will always return empty
    hasSkdb?: boolean
    skdbOnly?: boolean
    institutionSlug?: string
    level?: DegreeLevel
  },
  useServerClient: boolean = true
): Promise<Programme[]> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  let query = supabase.from('programmes').select('*')
  
  if (filters.institutionSlug) {
    query = query.eq('institution_slug', filters.institutionSlug)
  }
  
  if (filters.level) {
    query = query.eq('level', filters.level)
  }
  
  if (filters.skdbOnly !== undefined) {
    query = query.eq('skdb_only', filters.skdbOnly)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching programmes by source:', error)
    return []
  }
  
  // Filter by sources JSONB in memory (PostgreSQL JSONB queries can be complex)
  let filtered = (data || []).map(mapRowToProgramme)
  
  // Deprecated: hasDuo filter - all programmes are SKDB-only now
  if (filters.hasDuo !== undefined) {
    if (filters.hasDuo) {
      // Requesting DUO programmes will always return empty (all are SKDB-only)
      return []
    }
    // hasDuo=false means "not DUO", which is all programmes, so no filtering needed
  }
  
  if (filters.hasSkdb !== undefined) {
    filtered = filtered.filter(p => {
      if (!p.sources) return !filters.hasSkdb
      return filters.hasSkdb ? p.sources.skdb === true : p.sources.skdb !== true
    })
  }
  
  return filtered
}

/**
 * Get programmes that haven't been enriched yet
 * 
 * @param institutionSlug - Optional institution slug to filter by
 * @param useServerClient - Whether to use server-side client (default: true)
 * @returns Array of unenriched programmes
 */
export async function getUnenrichedProgrammes(
  institutionSlug?: string,
  useServerClient: boolean = true
): Promise<Programme[]> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  let query = supabase
    .from('programmes')
    .select('*')
    .in('enrichment_status', ['pending', null])
    .order('institution_slug', { ascending: true })
    .order('name', { ascending: true })
  
  if (institutionSlug) {
    query = query.eq('institution_slug', institutionSlug)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching unenriched programmes:', error)
    return []
  }
  
  return (data || []).map(mapRowToProgramme)
}

/**
 * Find programme by croho code
 * 
 * @param crohoCode - CROHO code to search for
 * @param useServerClient - Whether to use server-side client (default: true)
 * @returns Programme or null if not found
 */
export async function getProgrammeByCrohoCode(
  crohoCode: string,
  useServerClient: boolean = true
): Promise<Programme | null> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('croho_code', crohoCode)
    .maybeSingle()
  
  if (error) {
    console.error(`Error fetching programme by CROHO code ${crohoCode}:`, error)
    return null
  }
  
  return data ? mapRowToProgramme(data) : null
}

/**
 * Find programmes by name, institution, and level (for fuzzy matching)
 * 
 * @param name - Programme name (normalized)
 * @param institutionSlug - Institution slug
 * @param level - Degree level
 * @param useServerClient - Whether to use server-side client (default: true)
 * @returns Array of matching programmes
 */
export async function findProgrammesByNameAndInstitution(
  name: string,
  institutionSlug: string,
  level: DegreeLevel,
  useServerClient: boolean = true
): Promise<Programme[]> {
  const supabase = useServerClient ? await createServerClient() : createClient()
  
  // Normalize name for matching (lowercase, trim)
  const normalizedName = name.toLowerCase().trim()
  
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('institution_slug', institutionSlug)
    .eq('level', level)
    .or(`name.ilike.%${normalizedName}%,name_en.ilike.%${normalizedName}%`)
    .limit(10)
  
  if (error) {
    console.error(`Error finding programmes by name:`, error)
    return []
  }
  
  return (data || []).map(mapRowToProgramme)
}

