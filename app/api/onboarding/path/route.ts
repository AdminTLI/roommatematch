import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isUserType } from '@/types/profile'

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { user_id, user_type } = body as { user_id?: string; user_type?: unknown }

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid user_id' }, { status: 400 })
    }

    if (!isUserType(user_type)) {
      return NextResponse.json({ error: 'Invalid user_type' }, { status: 400 })
    }

    const service = createServiceClient()

    const { error: updateError } = await service
      .from('users')
      .update({
        user_type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('[api/onboarding/path] users update error:', updateError.message ?? updateError)
      return NextResponse.json(
        { error: 'Failed to save your selection. Please try again.' },
        { status: 500 }
      )
    }

    const { data: userRow, error: fetchError } = await service
      .from('users')
      .select('is_verified_student')
      .eq('id', user_id)
      .maybeSingle()

    const isVerifiedStudent = !fetchError && userRow?.is_verified_student === true

    return NextResponse.json({ ok: true, isVerifiedStudent })
  } catch (e) {
    console.error('[api/onboarding/path] unexpected error:', e)
    return NextResponse.json(
      { error: 'Something went wrong while saving your selection.' },
      { status: 500 }
    )
  }
}

