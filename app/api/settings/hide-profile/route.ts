/**
 * POST /api/settings/hide-profile
 *
 * Toggle profile visibility ( Hide Profile / Snooze ).
 * When hidden: user is excluded from search, gets no notifications, but keeps data.
 * Used as retention alternative to account deletion.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { hidden } = body as { hidden?: boolean }

    const isVisible = hidden === true ? false : true

    const { error } = await supabase
      .from('profiles')
      .update({ is_visible: isVisible })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      is_visible: isVisible,
      message: isVisible
        ? 'Profile is now visible in search.'
        : 'Profile is now hidden. You will not appear in search or receive notifications.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
