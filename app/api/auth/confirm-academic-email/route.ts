import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Verifies the OTP using a standalone client so we do not overwrite the
 * current user's session. Then updates the authenticated user's profile.
 */
export async function POST(request: Request) {
  const serverSupabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await serverSupabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { email?: string; token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (!email || !token) {
    return NextResponse.json(
      { error: 'Email and token are required' },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const verifyClient = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error: verifyError } = await verifyClient.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (verifyError) {
    const message =
      verifyError.message?.toLowerCase().includes('expired') ||
      verifyError.message?.toLowerCase().includes('invalid')
        ? 'Invalid or expired code. Please request a new one.'
        : verifyError.message || 'Invalid or expired code.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const service = createServiceClient()

  const { error: userUpdateError } = await service
    .from('users')
    .update({
      is_verified_student: true,
      university_email: email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (userUpdateError) {
    console.error('[confirm-academic-email] users update error:', userUpdateError.message)
    return NextResponse.json(
      { error: 'Failed to update your student status. Please try again.' },
      { status: 500 }
    )
  }

  await service
    .from('profiles')
    .update({
      is_verified_student: true,
      university_email: email,
      user_type: 'student',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
