import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireVerifiedStudent } from '@/lib/lab/auth'
import { requireDomuLabEnabled } from '@/lib/lab/guard'
import { isValidLabPromptKey } from '@/lib/lab/validation'
import { LAB_PROMPT_KEYS } from '@/lib/lab/types'
import { safeLogger } from '@/lib/utils/logger'

export async function GET() {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verified = await requireVerifiedStudent(supabase, user.id)
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.error },
        { status: verified.status }
      )
    }

    const { data: dismissals } = await supabase
      .from('lab_prompt_dismissals')
      .select('prompt_key')
      .eq('user_id', user.id)

    const dismissed = (dismissals ?? []).map(d => d.prompt_key)
    const eligible = LAB_PROMPT_KEYS.filter(k => !dismissed.includes(k))

    return NextResponse.json({ eligible, dismissed })
  } catch (error) {
    safeLogger.error('[DomuLab] GET prompts error', { error })
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const promptKey =
      typeof body?.prompt_key === 'string' ? body.prompt_key : ''
    if (!isValidLabPromptKey(promptKey)) {
      return NextResponse.json({ error: 'Invalid prompt key' }, { status: 400 })
    }

    const { error } = await supabase.from('lab_prompt_dismissals').upsert(
      {
        user_id: user.id,
        prompt_key: promptKey,
        dismissed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,prompt_key' }
    )

    if (error) {
      safeLogger.error('[DomuLab] Dismiss prompt failed', { error })
      return NextResponse.json(
        { error: 'Failed to dismiss prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[DomuLab] POST prompts error', { error })
    return NextResponse.json(
      { error: 'Failed to dismiss prompt' },
      { status: 500 }
    )
  }
}
