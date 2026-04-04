import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { profileUpdateSchema } from '@/lib/validation/profile-schema'
import { getUserFriendlyError as getFriendlyError } from '@/lib/errors/user-friendly-messages'

/** Name and phone on the profile row are not updated via this endpoint (support-only). */
function preservedProfileIdentity(user: User, existing: { first_name: string | null; last_name: string | null; phone: string | null } | null) {
  if (existing?.first_name != null && String(existing.first_name).trim() !== '') {
    return {
      first_name: existing.first_name.trim(),
      last_name: existing.last_name?.trim() || null,
      phone: existing.phone?.trim() || null,
    }
  }
  const meta = user.user_metadata || {}
  const full = typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const firstFromFull = full.split(/\s+/)[0] || ''
  const first =
    (typeof meta.first_name === 'string' && meta.first_name.trim()) ||
    firstFromFull ||
    'Member'
  const lastFromMeta = typeof meta.last_name === 'string' ? meta.last_name.trim() : ''
  const lastFromFull = full.split(/\s+/).slice(1).join(' ').trim()
  const last = lastFromMeta || lastFromFull || null
  return {
    first_name: first,
    last_name: last,
    phone: existing?.phone?.trim() || null,
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    safeLogger.debug('[Profile] Request received', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
    const body = await request.json()
    safeLogger.debug('[Profile] Request body received')
    
    // Validate input with Zod schema
    const validationResult = profileUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return NextResponse.json({ 
        error: firstError.message || getFriendlyError('Validation failed')
      }, { status: 400 })
    }
    
    const { bio, interests, housingStatus } = validationResult.data

    // Check if user exists in users table using SERVICE ROLE (bypass RLS)
    const { createServiceClient } = await import('@/lib/supabase/service')
    const serviceSupabase = createServiceClient()

    const { data: existingUser, error: checkError } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()  // Use maybeSingle() instead of single()

    safeLogger.debug('[Profile] User existence check', { exists: !!existingUser })

    if (!existingUser && !checkError) {
      safeLogger.debug('[Profile] User not found in users table, creating...')
      
      const { error: userCreateError } = await serviceSupabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (userCreateError) {
        // Check if it's a duplicate key error (user was created by trigger in the meantime)
        if (userCreateError.code === '23505') {
          safeLogger.debug('[Profile] User already exists (created by trigger), continuing...')
        } else {
          safeLogger.error('[Profile] Failed to create user', {
            code: userCreateError.code,
            message: userCreateError.message
          })
          return NextResponse.json({ 
            error: `User initialization failed: ${userCreateError.message}` 
          }, { status: 500 })
        }
      } else {
        safeLogger.debug('[Profile] User created successfully')
      }
    }

    // Get user's academic data to find university_id
    // Use service role client to bypass RLS to avoid infinite recursion in admins policy
    let { data: academicData, error: academicError } = await serviceSupabase
      .from('user_academic')
      .select('university_id, degree_level')
      .eq('user_id', user.id)
      .maybeSingle()

    if (academicError) {
      safeLogger.error('[Profile] Failed to fetch academic data', academicError)
      return NextResponse.json({ 
        error: 'Failed to fetch user academic data' 
      }, { status: 500 })
    }

    if (!academicData) {
      // Previously this endpoint required questionnaire/academic data
      // and would block profile updates if they were missing.
      // Relax this to allow saving basic profile info without completing the questionnaire.
      safeLogger.debug('[Profile] No user_academic record; allowing profile update without academic data')
      academicData = { university_id: null, degree_level: null } as any
    }

    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', user.id)
      .maybeSingle()

    const identity = preservedProfileIdentity(user, existingProfile)

    // Update or create profile (PII fields preserved server-side only)
    safeLogger.debug('[Profile] Attempting profile upsert')

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        university_id: academicData.university_id,
        first_name: identity.first_name,
        last_name: identity.last_name,
        phone: identity.phone,
        bio: bio || null,
        interests: interests && Array.isArray(interests) ? interests : [],
        housing_status: housingStatus && Array.isArray(housingStatus) ? housingStatus : [],
        degree_level: academicData.degree_level,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      safeLogger.error('[Profile] Update error', {
        code: profileError.code,
        message: profileError.message
      })
      return NextResponse.json({ 
        error: `Failed to update profile: ${profileError.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    safeLogger.error('[Profile] Unexpected error', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
