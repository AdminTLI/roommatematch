import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncProfileNameToAuth } from '@/lib/auth/user-profile'
import { safeLogger } from '@/lib/utils/logger'
import { profileUpdateSchema, getUserFriendlyError } from '@/lib/validation/profile-schema'
import { getUserFriendlyError as getFriendlyError } from '@/lib/errors/user-friendly-messages'

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
    
    const { firstName, lastName, phone, bio, interests, housingStatus } = validationResult.data

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

    // Update or create profile
    safeLogger.debug('[Profile] Attempting profile upsert')
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        university_id: academicData.university_id,
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
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

    // Sync profile name to auth metadata
    await syncProfileNameToAuth(user.id, firstName, lastName)

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
