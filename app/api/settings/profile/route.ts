import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncProfileNameToAuth } from '@/lib/auth/user-profile'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ 
      error: 'Authentication required' 
    }, { status: 401 })
  }

  try {
    console.log('[Profile] Request received:', {
      userId: user.id,
      email: user.email,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
    const body = await request.json()
    console.log('[Profile] Request body:', body)
    
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

    console.log('[Profile] User existence check:', { exists: !!existingUser, checkError })

    if (!existingUser && !checkError) {
      console.log('[Profile] User not found in users table, creating...')
      
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
          console.log('[Profile] User already exists (created by trigger), continuing...')
        } else {
          console.error('[Profile] Failed to create user:', {
            code: userCreateError.code,
            message: userCreateError.message,
            details: userCreateError.details
          })
          return NextResponse.json({ 
            error: `User initialization failed: ${userCreateError.message}` 
          }, { status: 500 })
        }
      } else {
        console.log('[Profile] User created successfully')
      }
    }

    // Get user's academic data to find university_id
    let { data: academicData, error: academicError } = await supabase
      .from('user_academic')
      .select('university_id, degree_level')
      .eq('user_id', user.id)
      .maybeSingle()

    if (academicError) {
      console.error('[Profile] Failed to fetch academic data:', academicError)
      return NextResponse.json({ 
        error: 'Failed to fetch user academic data' 
      }, { status: 500 })
    }

    if (!academicData) {
      // FALLBACK: Try to extract from onboarding_sections
      console.log('[Profile] No user_academic record, checking onboarding_sections...')
      
      const { data: introSection } = await supabase
        .from('onboarding_sections')
        .select('answers')
        .eq('user_id', user.id)
        .eq('section', 'intro')
        .maybeSingle()
      
      console.log('[Profile] Intro section data:', introSection)
      
      if (introSection?.answers) {
        // Extract academic data from intro answers
        // Note: intro saves as institution_slug, not university_id
        let institution_slug, degree_level, program_id, study_start_year
        for (const answer of introSection.answers) {
          console.log('[Profile] Checking answer:', answer)
          if (answer.itemId === 'institution_slug') institution_slug = answer.value
          if (answer.itemId === 'degree_level') degree_level = answer.value
          if (answer.itemId === 'program_id') program_id = answer.value
          if (answer.itemId === 'expected_graduation_year') study_start_year = parseInt(answer.value)
        }
        
        console.log('[Profile] Extracted from intro:', { institution_slug, degree_level, program_id, study_start_year })
        
        if (institution_slug && degree_level) {
          // Look up university UUID from slug
          const { data: university, error: uniError } = await supabase
            .from('universities')
            .select('id')
            .eq('slug', institution_slug)
            .maybeSingle()
          
          if (uniError) {
            console.error('[Profile] Failed to lookup university:', uniError)
            return NextResponse.json({ 
              error: 'Failed to lookup university' 
            }, { status: 500 })
          }
          
          if (!university) {
            console.error('[Profile] University not found for slug:', institution_slug)
            return NextResponse.json({ 
              error: 'University not found. Please contact support.' 
            }, { status: 400 })
          }
          
          const university_id = university.id
          console.log('[Profile] Found university UUID:', university_id, 'for slug:', institution_slug)
          
          // Backfill user_academic so future loads work
          console.log('[Profile] Backfilling user_academic...')
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
            console.error('[Profile] Failed to backfill user_academic:', backfillErr)
            // Continue with derived data even if backfill fails
            academicData = { university_id, degree_level }
          } else {
            console.log('[Profile] Backfilled user_academic successfully')
            academicData = backfilledData
          }
        } else {
          console.error('[Profile] Missing institution_slug or degree_level in intro section')
          return NextResponse.json({ 
            error: 'User academic data not found. Please complete your questionnaire first.' 
          }, { status: 400 })
        }
      } else {
        console.error('[Profile] No intro section found')
        return NextResponse.json({ 
          error: 'User academic data not found. Please complete your questionnaire first.' 
        }, { status: 400 })
      }
    }

    // Update or create profile
    console.log('[Profile] Attempting profile upsert for user:', user.id, 'university:', academicData.university_id)
    
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
      console.error('[Profile] Update error:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
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
    console.error('[Profile] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
