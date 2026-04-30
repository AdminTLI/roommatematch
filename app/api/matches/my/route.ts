import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type Filters = {
  universityIds?: string[]
  degreeLevels?: string[]
  programIds?: string[]
  studyYears?: number[]
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let filters: Filters = {}
  try {
    const body = (await request.json()) as { filters?: Filters }
    filters = body?.filters || {}
  } catch {
    // allow empty body
  }

  const admin = await createAdminClient()

  const { data: individualMatches, error: individualError } = await admin.rpc('get_user_matches', {
    p_user_id: user.id,
    p_limit: 20,
    p_offset: 0,
    p_university_ids: filters.universityIds && filters.universityIds.length > 0 ? filters.universityIds : null,
    p_degree_levels: filters.degreeLevels && filters.degreeLevels.length > 0 ? filters.degreeLevels : null,
    p_program_ids: filters.programIds && filters.programIds.length > 0 ? filters.programIds : null,
    p_study_years: filters.studyYears && filters.studyYears.length > 0 ? filters.studyYears : null,
  })

  if (individualError) {
    return NextResponse.json({ error: individualError.message }, { status: 500 })
  }

  // Group matches are not part of the warning list, but we still execute server-side
  // to avoid leaking powerful RPC capability to the browser client.
  const { data: groupSuggestions, error: groupError } = await admin.rpc('get_group_matches', {
    p_user_id: user.id,
    p_limit: 10,
    p_offset: 0,
  })

  return NextResponse.json({
    individualMatches: individualMatches || [],
    groupSuggestions: groupError ? [] : (groupSuggestions || []),
  })
}

