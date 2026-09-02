import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { profileUpdateSchema } from '@/lib/validation/profile-schema'
import { getUserFriendlyError as getFriendlyError } from '@/lib/errors/user-friendly-messages'
import { resolveStoredProfileName } from '@/lib/auth/identity-name'

/** Name and phone on the profile row are not updated via this endpoint (support-only). */
function preservedProfileIdentity(user: User, existing: { first_name: string | null; last_name: string | null; phone: string | null } | null) {
  const resolved = resolveStoredProfileName(existing, user)
  return {
    first_name: resolved.firstName || 'Member',
    last_name: resolved.lastName,
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
      const firstError = validationResult.error.issues[0]
      return NextResponse.json({ 
        error: firstError.message || getFriendlyError('Validation failed')
      }, { status: 400 })
    }
    
    const { bio, interests, housingStatus, budgetMin, budgetMax, budgetUnknown } = validationResult.data
    const resolvedBudgetUnknown = Boolean(budgetUnknown)
    const resolvedBudgetMin = resolvedBudgetUnknown ? null : (budgetMin ?? null)
    const resolvedBudgetMax = resolvedBudgetUnknown ? null : (budgetMax ?? null)

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

    const academic = academicData ?? { university_id: null as string | null, degree_level: null as string | null }
    if (!academicData) {
      safeLogger.debug('[Profile] No user_academic record; allowing profile update without academic data')
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
        university_id: academic.university_id,
        first_name: identity.first_name,
        last_name: identity.last_name,
        phone: identity.phone,
        bio: bio || null,
        interests: interests && Array.isArray(interests) ? interests : [],
        housing_status: housingStatus && Array.isArray(housingStatus) ? housingStatus : [],
        budget_min: resolvedBudgetMin,
        budget_max: resolvedBudgetMax,
        budget_unknown: resolvedBudgetUnknown,
        degree_level: academic.degree_level,
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

    // Keep questionnaire responses in sync so matching / Match Insights stay aligned
    try {
      if (resolvedBudgetUnknown || resolvedBudgetMin == null || resolvedBudgetMax == null) {
        await serviceSupabase
          .from('responses')
          .delete()
          .eq('user_id', user.id)
          .in('question_key', ['budget_min', 'budget_max'])
      } else {
        const now = new Date().toISOString()
        await serviceSupabase.from('responses').upsert(
          [
            {
              user_id: user.id,
              question_key: 'budget_min',
              value: resolvedBudgetMin,
              updated_at: now,
            },
            {
              user_id: user.id,
              question_key: 'budget_max',
              value: resolvedBudgetMax,
              updated_at: now,
            },
          ],
          { onConflict: 'user_id,question_key' }
        )
      }
    } catch (syncError) {
      safeLogger.warn('[Profile] Budget response sync failed (non-fatal)', {
        error: syncError instanceof Error ? syncError.message : String(syncError),
      })
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
