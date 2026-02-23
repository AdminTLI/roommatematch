import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

const VALID_SURVEY_TYPES = ['day_14', 'day_30'] as const

/** GET: Check if the authenticated user should see a wellness survey (day_14 or day_30). */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: userRow, error: userError } = await admin
      .from('users')
      .select('created_at')
      .eq('id', user.id)
      .maybeSingle()

    if (userError || !userRow?.created_at) {
      safeLogger.warn('[Wellness] Could not get user created_at', { userId: user.id, error: userError })
      return NextResponse.json({ trigger: null })
    }

    const createdAt = new Date(userRow.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdAt.getTime()
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))

    if (days >= 30) {
      const { data: day30 } = await admin
        .from('wellness_surveys')
        .select('id')
        .eq('user_id', user.id)
        .eq('survey_type', 'day_30')
        .maybeSingle()
      return NextResponse.json({ trigger: day30 ? null : 'day_30' })
    }

    if (days >= 14) {
      const { data: day14 } = await admin
        .from('wellness_surveys')
        .select('id')
        .eq('user_id', user.id)
        .eq('survey_type', 'day_14')
        .maybeSingle()
      return NextResponse.json({ trigger: day14 ? null : 'day_14' })
    }

    return NextResponse.json({ trigger: null })
  } catch (error) {
    safeLogger.error('[Wellness] GET error', { error })
    return NextResponse.json({ error: 'Failed to check wellness survey' }, { status: 500 })
  }
}

/** POST: Submit a wellness survey response. */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const surveyType = body?.survey_type
    const foundHousing = body?.found_housing
    const foundWithMatch = body?.found_with_match
    const reducedStress = body?.reduced_stress

    if (typeof surveyType !== 'string' || !VALID_SURVEY_TYPES.includes(surveyType as typeof VALID_SURVEY_TYPES[number])) {
      return NextResponse.json(
        { error: 'Invalid or missing survey_type; must be "day_14" or "day_30"' },
        { status: 400 }
      )
    }
    if (typeof foundHousing !== 'boolean') {
      return NextResponse.json(
        { error: 'found_housing must be a boolean' },
        { status: 400 }
      )
    }
    if (typeof reducedStress !== 'boolean') {
      return NextResponse.json(
        { error: 'reduced_stress must be a boolean' },
        { status: 400 }
      )
    }
    if (foundHousing && typeof foundWithMatch !== 'boolean') {
      return NextResponse.json(
        { error: 'found_with_match must be a boolean when found_housing is true' },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase.from('wellness_surveys').insert({
      user_id: user.id,
      survey_type: surveyType,
      found_housing: foundHousing,
      found_with_match: foundHousing ? foundWithMatch : null,
      reduced_stress: reducedStress,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already submitted this survey' },
          { status: 409 }
        )
      }
      safeLogger.error('[Wellness] POST insert error', { error: insertError, userId: user.id })
      return NextResponse.json(
        { error: 'Failed to save survey' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Wellness] POST error', { error })
    return NextResponse.json({ error: 'Failed to submit wellness survey' }, { status: 500 })
  }
}
