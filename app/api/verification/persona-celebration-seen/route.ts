/**
 * Record that the user dismissed the post-Persona congrats dialog.
 * Ensures the celebration is shown only once.
 */
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { error } = await admin
      .from('users')
      .update({
        persona_celebration_seen_at: now,
        updated_at: now,
      })
      .eq('id', user.id)
      .is('persona_celebration_seen_at', null)

    if (error) {
      safeLogger.error('[Verification] Failed to mark persona celebration seen', {
        userId: user.id,
        error,
      })
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, seenAt: now })
  } catch (error) {
    safeLogger.error('[Verification] persona-celebration-seen error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
