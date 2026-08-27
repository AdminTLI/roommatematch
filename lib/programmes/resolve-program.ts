/**
 * Resolve a catalogue programme (programmes) to the legacy programs row
 * used by user_academic.program_id. CROHO is scoped by university.
 */

type SupabaseLike = {
  from: (table: string) => any
}

export type ProgrammeBridgeRow = {
  id: string
  croho_code: string | null
  name: string
  level: string
  institution_slug?: string | null
  rio_code?: string | null
  name_en?: string | null
  language_codes?: string[] | null
  faculty?: string | null
  active?: boolean | null
}

/**
 * Find or create a programs row for this university + programme offering.
 * Prefer (university_id, croho_code); fall back to name + degree_level.
 */
export async function ensureProgramsRowForUniversity(
  supabase: SupabaseLike,
  universityId: string,
  programme: ProgrammeBridgeRow
): Promise<string | null> {
  if (!universityId) return null

  if (programme.croho_code) {
    const { data: byCroho } = await supabase
      .from('programs')
      .select('id')
      .eq('university_id', universityId)
      .eq('croho_code', programme.croho_code)
      .maybeSingle()

    if (byCroho?.id) return byCroho.id as string
  }

  const { data: byName } = await supabase
    .from('programs')
    .select('id')
    .eq('university_id', universityId)
    .eq('degree_level', programme.level)
    .ilike('name', programme.name)
    .maybeSingle()

  if (byName?.id) {
    if (programme.croho_code) {
      await supabase
        .from('programs')
        .update({
          croho_code: programme.croho_code,
          name_en: programme.name_en ?? undefined,
          language_codes: programme.language_codes ?? undefined,
          faculty: programme.faculty ?? undefined,
          active: programme.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', byName.id)
    }
    return byName.id as string
  }

  const insertPayload = {
    university_id: universityId,
    croho_code: programme.croho_code || null,
    name: programme.name,
    name_en: programme.name_en || null,
    degree_level: programme.level,
    language_codes: programme.language_codes || [],
    faculty: programme.faculty || null,
    active: programme.active !== false,
  }

  const { data: inserted, error } = await supabase
    .from('programs')
    .insert(insertPayload)
    .select('id')
    .maybeSingle()

  if (error) {
    // Race: another request inserted the same (university, croho)
    if (error.code === '23505' && programme.croho_code) {
      const { data: raced } = await supabase
        .from('programs')
        .select('id')
        .eq('university_id', universityId)
        .eq('croho_code', programme.croho_code)
        .maybeSingle()
      return (raced?.id as string) || null
    }
    console.error('[ensureProgramsRowForUniversity] insert failed:', error)
    return null
  }

  return (inserted?.id as string) || null
}

/**
 * Resolve a user-selected programme id (UUID, RIO code, or CROHO) to programs.id.
 */
export async function resolveProgramIdForUniversity(
  supabase: SupabaseLike,
  opts: {
    programRef: string
    universityId: string
    institutionSlug?: string | null
  }
): Promise<string | null> {
  const { programRef, universityId, institutionSlug } = opts
  if (!programRef?.trim() || !universityId) return null

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      programRef
    )

  if (isUUID) {
    const { data: inPrograms } = await supabase
      .from('programs')
      .select('id')
      .eq('id', programRef)
      .maybeSingle()
    if (inPrograms?.id) return inPrograms.id as string

    const { data: programmeById } = await supabase
      .from('programmes')
      .select(
        'id, croho_code, name, name_en, level, institution_slug, rio_code, language_codes, faculty, active'
      )
      .eq('id', programRef)
      .maybeSingle()

    if (programmeById) {
      return ensureProgramsRowForUniversity(
        supabase,
        universityId,
        programmeById as ProgrammeBridgeRow
      )
    }
  }

  // Frontend often sends rio_code || programmes.id as the select value
  let programmeQuery = supabase
    .from('programmes')
    .select(
      'id, croho_code, name, name_en, level, institution_slug, rio_code, language_codes, faculty, active'
    )
    .eq('rio_code', programRef)

  if (institutionSlug) {
    programmeQuery = programmeQuery.eq('institution_slug', institutionSlug)
  }

  const { data: byRio } = await programmeQuery.maybeSingle()
  if (byRio) {
    return ensureProgramsRowForUniversity(
      supabase,
      universityId,
      byRio as ProgrammeBridgeRow
    )
  }

  // Treat as CROHO within this university's programmes catalogue
  let byCrohoQuery = supabase
    .from('programmes')
    .select(
      'id, croho_code, name, name_en, level, institution_slug, rio_code, language_codes, faculty, active'
    )
    .eq('croho_code', programRef)

  if (institutionSlug) {
    byCrohoQuery = byCrohoQuery.eq('institution_slug', institutionSlug)
  }

  const { data: byCroho } = await byCrohoQuery.maybeSingle()
  if (byCroho) {
    return ensureProgramsRowForUniversity(
      supabase,
      universityId,
      byCroho as ProgrammeBridgeRow
    )
  }

  // Direct programs lookup scoped to university
  const { data: programByCroho } = await supabase
    .from('programs')
    .select('id')
    .eq('university_id', universityId)
    .eq('croho_code', programRef)
    .maybeSingle()

  return (programByCroho?.id as string) || null
}
