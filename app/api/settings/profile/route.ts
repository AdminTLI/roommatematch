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
        // Use the same extraction logic as submit route
        const { extractSubmissionDataFromIntro } = await import('@/lib/onboarding/submission')
        
        try {
          const submissionData = extractSubmissionDataFromIntro(introSection.answers, user)
          safeLogger.debug('[Profile] Extracted submission data from intro', {
            hasUniversityId: !!submissionData.university_id,
            hasDegreeLevel: !!submissionData.degree_level,
            hasStudyStartYear: !!submissionData.study_start_year
          })
          
          // Look up university_id from institution_slug if not present
          let university_id = submissionData.university_id
          if (!university_id || university_id === '') {
            const institutionSlugAnswer = introSection.answers.find((a: any) => a.itemId === 'institution_slug')
            if (institutionSlugAnswer?.value && institutionSlugAnswer.value !== 'other') {
              safeLogger.debug('[Profile] Looking up university for slug:', institutionSlugAnswer.value)
              
              // Try exact match first
              const { data: university, error: uniError } = await supabase
                .from('universities')
                .select('id, slug, name')
                .eq('slug', institutionSlugAnswer.value)
                .maybeSingle()
              
              if (uniError) {
                safeLogger.error('[Profile] Failed to lookup university', uniError)
                return NextResponse.json({ 
                  error: 'Failed to lookup university. Please contact support.' 
                }, { status: 500 })
              }
              
              if (university) {
                university_id = university.id
                safeLogger.debug('[Profile] Found university UUID:', university_id, 'for slug:', institutionSlugAnswer.value)
              } else {
                // Try case-insensitive lookup as fallback
                safeLogger.debug('[Profile] Trying case-insensitive lookup for slug:', institutionSlugAnswer.value)
                const { data: universities } = await supabase
                  .from('universities')
                  .select('id, slug, name')
                  .ilike('slug', institutionSlugAnswer.value)
                  .limit(1)
                
                if (universities && universities.length > 0) {
                  university_id = universities[0].id
                  safeLogger.debug('[Profile] Found university with case-insensitive lookup:', university_id, 'for slug:', institutionSlugAnswer.value)
                } else {
                  safeLogger.error('[Profile] University not found for slug:', institutionSlugAnswer.value)
                  return NextResponse.json({ 
                    error: `University not found for institution "${institutionSlugAnswer.value}". Please contact support.` 
                  }, { status: 400 })
                }
              }
            } else if (institutionSlugAnswer?.value === 'other') {
              safeLogger.error('[Profile] User selected "other" institution - cannot determine university_id')
              return NextResponse.json({ 
                error: 'Cannot update profile with "other" institution. Please select a valid institution from the list.' 
              }, { status: 400 })
            }
          }
          
          if (!university_id || university_id === '') {
            safeLogger.error('[Profile] University ID is missing after lookup')
            return NextResponse.json({ 
              error: 'University information is missing. Please complete your questionnaire with a valid institution.' 
            }, { status: 400 })
          }
          
          if (!submissionData.degree_level || submissionData.degree_level.trim() === '') {
            safeLogger.error('[Profile] Degree level is missing')
            return NextResponse.json({ 
              error: 'Degree level is missing. Please complete your questionnaire.' 
            }, { status: 400 })
          }
          
          if (!submissionData.study_start_year || isNaN(submissionData.study_start_year)) {
            safeLogger.error('[Profile] Study start year is missing or invalid:', submissionData.study_start_year)
            return NextResponse.json({ 
              error: 'Study start year could not be calculated. Please ensure all academic information is complete.' 
            }, { status: 400 })
          }
          
          // Backfill user_academic so future loads work
          safeLogger.debug('[Profile] Backfilling user_academic...')
          const { upsertProfileAndAcademic } = await import('@/lib/onboarding/submission')
          
          try {
            await upsertProfileAndAcademic(supabase, {
              user_id: user.id,
              university_id: university_id,
              first_name: submissionData.first_name,
              degree_level: submissionData.degree_level,
              program_id: submissionData.program_id,
              program: submissionData.program,
              campus: submissionData.campus,
              languages_daily: [],
              study_start_year: submissionData.study_start_year,
              study_start_month: submissionData.study_start_month,
              expected_graduation_year: submissionData.expected_graduation_year,
              graduation_month: submissionData.graduation_month,
              programme_duration_months: submissionData.programme_duration_months,
              undecided_program: submissionData.undecided_program
            })
            
            // Fetch the created/updated academic data
            const { data: backfilledData, error: fetchError } = await supabase
              .from('user_academic')
              .select('university_id, degree_level')
              .eq('user_id', user.id)
              .maybeSingle()
            
            if (fetchError) {
              safeLogger.error('[Profile] Failed to fetch backfilled academic data', fetchError)
              academicData = { university_id, degree_level: submissionData.degree_level }
            } else if (backfilledData) {
              safeLogger.debug('[Profile] Backfilled user_academic successfully')
              academicData = backfilledData
            } else {
              safeLogger.warn('[Profile] user_academic was not created after backfill')
              academicData = { university_id, degree_level: submissionData.degree_level }
            }
          } catch (backfillError) {
            safeLogger.error('[Profile] Failed to backfill user_academic', backfillError)
            // Continue with derived data even if backfill fails
            academicData = { university_id, degree_level: submissionData.degree_level }
          }
        } catch (extractError) {
          safeLogger.error('[Profile] Failed to extract submission data from intro', extractError)
          const errorMessage = extractError instanceof Error ? extractError.message : 'Unknown error'
          return NextResponse.json({ 
            error: `Failed to process academic information: ${errorMessage}. Please check your academic details.` 
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
