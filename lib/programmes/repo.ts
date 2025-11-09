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
    }
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
  const supabase = useServerClient ? createServerClient() : createClient()
  
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
  const supabase = useServerClient ? createServerClient() : createClient()
  
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
  const supabase = useServerClient ? createServerClient() : createClient()
  
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
  const supabase = useServerClient ? createServerClient() : createClient()
  
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
  
  // Map Programme to database row format
  const rows = programmes.map(prog => ({
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
  const supabase = useServerClient ? createServerClient() : createClient()
  
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

