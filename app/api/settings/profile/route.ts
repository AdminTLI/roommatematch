import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncProfileNameToAuth } from '@/lib/auth/user-profile'
import { safeLogger } from '@/lib/utils/logger'

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
    
    const { firstName, lastName, phone, bio } = body

    // Validate required fields
    if (!firstName) {
      return NextResponse.json({ 
        error: 'First name is required' 
      }, { status: 400 })
    }

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
    let { data: academicData, error: academicError } = await supabase
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
      // FALLBACK: Try to extract from onboarding_sections
      safeLogger.debug('[Profile] No user_academic record, checking onboarding_sections...')
      
      const { data: introSection } = await supabase
        .from('onboarding_sections')
        .select('answers')
        .eq('user_id', user.id)
        .eq('section', 'intro')
        .maybeSingle()
      
      safeLogger.debug('[Profile] Intro section data found', { hasAnswers: !!introSection?.answers })
      
      if (introSection?.answers) {
        // Extract academic data from intro answers
        // Note: intro saves as institution_slug, not university_id
        let institution_slug, degree_level, program_id, study_start_year
        for (const answer of introSection.answers) {
          if (answer.itemId === 'institution_slug') institution_slug = answer.value
          if (answer.itemId === 'degree_level') degree_level = answer.value
          if (answer.itemId === 'program_id') program_id = answer.value
          if (answer.itemId === 'expected_graduation_year') study_start_year = parseInt(answer.value)
        }
        
        safeLogger.debug('[Profile] Extracted academic data from intro')
        
        if (institution_slug && degree_level) {
          // Look up university UUID from slug
          const { data: university, error: uniError } = await supabase
            .from('universities')
            .select('id')
            .eq('slug', institution_slug)
            .maybeSingle()
          
          if (uniError) {
            safeLogger.error('[Profile] Failed to lookup university', uniError)
            return NextResponse.json({ 
              error: 'Failed to lookup university' 
            }, { status: 500 })
          }
          
          if (!university) {
            safeLogger.error('[Profile] University not found for slug')
            return NextResponse.json({ 
              error: 'University not found. Please contact support.' 
            }, { status: 400 })
          }
          
          const university_id = university.id
          safeLogger.debug('[Profile] Found university UUID for slug')
          
          // Backfill user_academic so future loads work
          safeLogger.debug('[Profile] Backfilling user_academic...')
          const { data: backfilledData, error: backfillErr } = await supabase
            .from('user_academic')
            .upsert({
              user_id: user.id,
              university_id,
              degree_level,
              program_id: program_id || null,
              study_start_year: study_start_year || new Date().getFullYear(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select('university_id, degree_level')
            .single()
          
          if (backfillErr) {
            safeLogger.error('[Profile] Failed to backfill user_academic', backfillErr)
            // Continue with derived data even if backfill fails
            academicData = { university_id, degree_level }
          } else {
            safeLogger.debug('[Profile] Backfilled user_academic successfully')
            academicData = backfilledData
          }
        } else {
          safeLogger.error('[Profile] Missing institution_slug or degree_level in intro section')
          return NextResponse.json({ 
            error: 'User academic data not found. Please complete your questionnaire first.' 
          }, { status: 400 })
        }
      } else {
        safeLogger.error('[Profile] No intro section found')
        return NextResponse.json({ 
          error: 'User academic data not found. Please complete your questionnaire first.' 
        }, { status: 400 })
      }
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
