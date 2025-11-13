import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitCompleteOnboarding, extractSubmissionDataFromIntro, extractLanguagesFromSections, mapSubmissionError } from '@/lib/onboarding/submission'
import { transformAnswer } from '@/lib/question-key-mapping'
import { safeLogger } from '@/lib/utils/logger'
import { trackEvent, EVENT_TYPES } from '@/lib/events'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if this is edit mode
  const url = new URL(request.url)
  const isEditMode = url.searchParams.get('mode') === 'edit'
  
  console.log('[Submit] User:', user?.id, 'isDemo:', !user, 'isEditMode:', isEditMode)
  
  // Require authentication
  if (!user?.id) {
    console.log('[Submit] No authenticated user')
    return NextResponse.json({ 
      error: 'Authentication required. Please log in and try again.' 
    }, { status: 401 })
  }
  
  const userId = user.id
  
  try {
    // Check verification status (email and Persona)
    const verificationStatus = await checkUserVerificationStatus(user)
    
    if (verificationStatus.needsEmailVerification) {
      console.log('[Submit] User email not verified:', user.email)
      return NextResponse.json({ 
        error: 'Please verify your email before submitting the questionnaire. Check your email for a verification link or go to Settings to resend verification email.' 
      }, { status: 403 })
    }

    if (verificationStatus.needsPersonaVerification) {
      console.log('[Submit] User Persona not verified:', user.email)
      return NextResponse.json({ 
        error: 'Please complete identity verification before submitting the questionnaire. Go to Settings to complete verification.' 
      }, { status: 403 })
    }

    // Check if user exists in users table using SERVICE ROLE (bypass RLS)
    const { createServiceClient } = await import('@/lib/supabase/service')
    const serviceSupabase = createServiceClient()

    const { data: existingUser, error: checkError } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()  // Use maybeSingle() instead of single() to avoid errors

    console.log('[Submit] User existence check:', { exists: !!existingUser, checkError })

    if (!existingUser && !checkError) {
      console.log('[Submit] User not found in users table, creating...')
      
      const { error: userCreateError } = await serviceSupabase
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (userCreateError) {
        // Check if it's a duplicate key error (user was created by trigger in the meantime)
        if (userCreateError.code === '23505') {
          console.log('[Submit] User already exists (created by trigger), continuing...')
        } else {
          console.error('[Submit] Failed to create user:', {
            code: userCreateError.code,
            message: userCreateError.message,
            details: userCreateError.details,
            hint: userCreateError.hint
          })
          return NextResponse.json({ 
            error: `User account setup failed: ${userCreateError.message}. Please contact support.` 
          }, { status: 500 })
        }
      } else {
        console.log('[Submit] User created successfully')
      }
    }

    // 1. Fetch all sections from onboarding_sections
      console.log('[Submit] Fetching sections for user:', userId)
      const { data: sections, error: sectionsError } = await supabase
        .from('onboarding_sections')
        .select('section, answers, version, updated_at')
        .eq('user_id', userId)

      if (sectionsError) {
        console.error('[Submit] Sections fetch error:', sectionsError)
        return NextResponse.json({ error: sectionsError.message }, { status: 500 })
      }

      console.log('[Submit] Fetched sections:', sections?.length || 0)

      // 2. Find intro section for later processing
      const introSection = sections?.find((s: any) => s.section === 'intro')

      // 3. Extract submission data and transform responses
      let submissionData = null
      const responsesToInsert = []
      
      if (introSection?.answers) {
        try {
          submissionData = extractSubmissionDataFromIntro(introSection.answers, user)
          console.log('[Submit] Extracted submission data:', submissionData)
          
          // Validate critical fields after extraction
          if (!submissionData.study_start_year || isNaN(submissionData.study_start_year)) {
            console.error('[Submit] study_start_year is missing or invalid after extraction:', submissionData.study_start_year)
            return NextResponse.json({ 
              error: 'Unable to calculate study start year. Please ensure all academic information is complete, including expected graduation year, degree level, and institution.',
              title: 'Invalid Academic Data'
            }, { status: 400 })
          }
        } catch (extractError) {
          console.error('[Submit] Failed to extract submission data:', extractError)
          const errorMessage = extractError instanceof Error ? extractError.message : 'Unknown error'
          return NextResponse.json({ 
            error: `Failed to process academic information: ${errorMessage}. Please check your academic details and try again.`,
            title: 'Academic Data Error'
          }, { status: 400 })
        }
        
        // Look up university_id from institution_slug if university_id is empty
        if (!submissionData.university_id || submissionData.university_id === '') {
          const institutionSlugAnswer = introSection.answers.find((a: any) => a.itemId === 'institution_slug')
          if (institutionSlugAnswer?.value && institutionSlugAnswer.value !== 'other') {
            console.log('[Submit] Looking up university for slug:', institutionSlugAnswer.value)
            
            const { data: university, error: universityError } = await supabase
              .from('universities')
              .select('id')
              .eq('slug', institutionSlugAnswer.value)
              .maybeSingle()
            
            if (universityError) {
              console.error('[Submit] University lookup failed:', universityError)
              // Don't fail submission if lookup fails - user might have selected "other"
            } else if (university) {
              submissionData.university_id = university.id
              console.log('[Submit] Found university_id:', university.id)
            } else {
              console.warn('[Submit] University not found for slug:', institutionSlugAnswer.value)
              // If university not found and not "other", this is an error
              if (institutionSlugAnswer.value !== 'other') {
                console.error('[Submit] University not found in database for slug:', institutionSlugAnswer.value)
              }
            }
          } else if (institutionSlugAnswer?.value === 'other') {
            console.warn('[Submit] User selected "other" institution - university_id cannot be set')
            // For "other" institutions, we cannot set university_id
            // This should be handled by the validation below
          }
        }
        
        // Look up program UUID from CROHO code if program_id exists
        if (submissionData.program_id) {
          console.log('[Submit] Looking up program for CROHO code:', submissionData.program_id)
          
          const { data: program, error: programError } = await supabase
            .from('programs')
            .select('id')
            .eq('croho_code', submissionData.program_id)
            .single()
          
          if (programError) {
            console.error('[Submit] Program lookup failed:', programError)
            // If program not found, set to null and mark as undecided to satisfy constraint
            // Constraint: (program_id IS NOT NULL AND undecided_program = false) OR (program_id IS NULL AND undecided_program = true)
            console.log('[Submit] Setting program_id to null and undecided_program to true since program not found in database')
            submissionData.program_id = undefined
            submissionData.undecided_program = true
          } else if (program) {
            submissionData.program_id = program.id
            submissionData.undecided_program = false
            console.log('[Submit] Found program UUID:', program.id)
          }
        }
      }
      
      // Extract languages from all sections
      const extractedLanguages = extractLanguagesFromSections(sections ?? [])
      console.log('[Submit] Extracted languages:', extractedLanguages)
      
      // Transform all answers from all sections
      for (const section of sections ?? []) {
        console.log(`[Submit] Processing section: ${section.section}, answers: ${section.answers?.length || 0}`)
        for (const answer of section.answers ?? []) {
          const transformed = transformAnswer(answer)
          if (transformed) {
            responsesToInsert.push({
              question_key: transformed.question_key,
              value: transformed.value
            })
          } else {
            console.warn(`[Submit] Failed to transform answer for itemId: ${answer.itemId}`)
          }
        }
      }

      console.log(`[Submit] Prepared ${responsesToInsert.length} responses to insert`)

      // Deduplicate responses by question_key (keep last value for each key)
      const responseMap = new Map<string, any>()
      for (const response of responsesToInsert) {
        responseMap.set(response.question_key, response.value)
      }

      const deduplicatedResponses = Array.from(responseMap.entries()).map(([question_key, value]) => ({
        question_key,
        value
      }))

      console.log(`[Submit] Deduplicated ${responsesToInsert.length} responses to ${deduplicatedResponses.length} unique keys`)

      // 4. Validate we have data to submit
      if (!submissionData || deduplicatedResponses.length === 0) {
        console.warn('[Submit] No submission data or responses to process', {
          hasSubmissionData: !!submissionData,
          responseCount: deduplicatedResponses.length,
          sectionsCount: sections?.length || 0
        })
        return NextResponse.json({ 
          error: 'No questionnaire data found. Please ensure all sections are saved before submitting. Try refreshing the page and submitting again.',
          title: 'No Data to Submit'
        }, { status: 400 })
      }

      // 5. Use consolidated submission helper
      if (submissionData && deduplicatedResponses.length > 0) {
        // Validate all required fields before submission
        // Ensure we have a valid university_id
        if (!submissionData.university_id || submissionData.university_id === '' || submissionData.university_id === null) {
          // Check if we have institution_slug (might be "other")
          const institutionSlugAnswer = introSection?.answers?.find((a: any) => a.itemId === 'institution_slug')
          if (institutionSlugAnswer?.value === 'other') {
            console.error('[Submit] User selected "other" institution - university_id is required but cannot be set for "other"')
            return NextResponse.json({ 
              error: 'University information is incomplete. Please select a valid institution from the list or contact support if your institution is not listed.',
              title: 'Missing University Information'
            }, { status: 400 })
          } else {
            console.error('[Submit] No university_id found and institution_slug lookup failed, cannot proceed with submission')
            return NextResponse.json({ 
              error: 'University information is required. Please complete the academic information section.',
              title: 'Missing University Information'
            }, { status: 400 })
          }
        }

        // Validate study_start_year is present and valid (required by database)
        if (!submissionData.study_start_year || isNaN(submissionData.study_start_year)) {
          console.error('[Submit] study_start_year is missing or invalid:', submissionData.study_start_year)
          return NextResponse.json({ 
            error: 'Study start year is required but could not be calculated. Please ensure all academic information is complete, including expected graduation year, degree level, and institution.',
            title: 'Missing Academic Data'
          }, { status: 400 })
        }

        // Validate degree_level is present
        if (!submissionData.degree_level || submissionData.degree_level.trim() === '') {
          console.error('[Submit] degree_level is missing:', submissionData.degree_level)
          return NextResponse.json({ 
            error: 'Degree level is required. Please complete the academic information section.',
            title: 'Missing Academic Data'
          }, { status: 400 })
        }

        console.log('[Submit] All validations passed, proceeding with submission:', {
          user_id: userId,
          university_id: submissionData.university_id,
          degree_level: submissionData.degree_level,
          study_start_year: submissionData.study_start_year,
          expected_graduation_year: submissionData.expected_graduation_year
        })
        
        try {
          const result = await submitCompleteOnboarding(supabase, {
            user_id: userId,
            university_id: submissionData.university_id,
            first_name: submissionData.first_name,
            degree_level: submissionData.degree_level,
            program_id: submissionData.program_id,
            program: submissionData.program,
            campus: submissionData.campus,
            languages_daily: extractedLanguages,
            study_start_year: submissionData.study_start_year,
            study_start_month: submissionData.study_start_month,
            expected_graduation_year: submissionData.expected_graduation_year,
            graduation_month: submissionData.graduation_month,
            programme_duration_months: submissionData.programme_duration_months,
            undecided_program: submissionData.undecided_program,
            responses: deduplicatedResponses
          })

          if (!result.success) {
            console.error('[Submit] Consolidated submission failed:', result.error)
            const mappedError = mapSubmissionError(result.error || 'Unknown error')
            return NextResponse.json({ 
              error: mappedError.message,
              title: mappedError.title
            }, { status: 500 })
          }

          console.log('[Submit] Consolidated submission successful')
          
          // Verify user_academic was created/updated
          const { data: verifyAcademic, error: verifyError } = await supabase
            .from('user_academic')
            .select('user_id, study_start_year, university_id, degree_level')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (verifyError) {
            console.error('[Submit] Failed to verify user_academic after submission:', verifyError)
            // Attempt to backfill from submission data
            console.log('[Submit] Attempting to backfill user_academic from submission data...')
            try {
              // Re-extract and upsert academic data
              const { upsertProfileAndAcademic } = await import('@/lib/onboarding/submission')
              await upsertProfileAndAcademic(supabase, {
                user_id: userId,
                university_id: submissionData.university_id,
                first_name: submissionData.first_name,
                degree_level: submissionData.degree_level,
                program_id: submissionData.program_id,
                program: submissionData.program,
                campus: submissionData.campus,
                languages_daily: extractedLanguages,
                study_start_year: submissionData.study_start_year!,
                study_start_month: submissionData.study_start_month,
                expected_graduation_year: submissionData.expected_graduation_year,
                graduation_month: submissionData.graduation_month,
                programme_duration_months: submissionData.programme_duration_months,
                undecided_program: submissionData.undecided_program
              })
              console.log('[Submit] Successfully backfilled user_academic')
            } catch (backfillError) {
              console.error('[Submit] Failed to backfill user_academic:', backfillError)
              // Log but don't fail - submission was successful
            }
          } else if (!verifyAcademic) {
            console.error('[Submit] CRITICAL: user_academic was not created after successful submission')
            console.error('[Submit] Attempting to backfill user_academic from submission data...')
            try {
              // Re-extract and upsert academic data
              const { upsertProfileAndAcademic } = await import('@/lib/onboarding/submission')
              await upsertProfileAndAcademic(supabase, {
                user_id: userId,
                university_id: submissionData.university_id,
                first_name: submissionData.first_name,
                degree_level: submissionData.degree_level,
                program_id: submissionData.program_id,
                program: submissionData.program,
                campus: submissionData.campus,
                languages_daily: extractedLanguages,
                study_start_year: submissionData.study_start_year!,
                study_start_month: submissionData.study_start_month,
                expected_graduation_year: submissionData.expected_graduation_year,
                graduation_month: submissionData.graduation_month,
                programme_duration_months: submissionData.programme_duration_months,
                undecided_program: submissionData.undecided_program
              })
              console.log('[Submit] Successfully backfilled user_academic')
            } catch (backfillError) {
              console.error('[Submit] Failed to backfill user_academic:', backfillError)
              // Log but don't fail - submission was successful, but academic data is missing
              console.error('[Submit] User should have user_academic record but it was not created. Manual intervention may be required.')
            }
          } else {
            console.log('[Submit] Verified user_academic was created/updated:', verifyAcademic)
          }
        } catch (submitError) {
          console.error('[Submit] Error during submission:', submitError)
          const errorMessage = submitError instanceof Error ? submitError.message : 'Unknown error'
          const mappedError = mapSubmissionError(errorMessage)
          return NextResponse.json({ 
            error: mappedError.message || `Failed to submit questionnaire: ${errorMessage}`,
            title: mappedError.title || 'Submission Error'
          }, { status: 500 })
        }

        // 5. Save snapshot to onboarding_submissions (only after successful submission)
        // Store both raw sections (for audit trail) and transformed responses (for analysis)
        // Normalized data avoids needing to recompute transformAnswer for historical analysis
        console.log('[Submit] Saving to onboarding_submissions')
        const submissionPayload = {
          user_id: userId,
          snapshot: {
            raw_sections: sections ?? [], // Raw sections with untransformed answers for audit
            transformed_responses: deduplicatedResponses, // Normalized question_key/value pairs for easy analysis
          },
          submitted_at: new Date().toISOString(),
        }

        const { error: submissionError } = await supabase
          .from('onboarding_submissions')
          .upsert(submissionPayload, { onConflict: 'user_id' })
          
        if (submissionError) {
          console.error('[Submit] Submission error:', submissionError)
          const mappedError = mapSubmissionError(submissionError.message)
          return NextResponse.json({ 
            error: mappedError.message,
            title: mappedError.title
          }, { status: 500 })
        }

        console.log('[Submit] Saved to onboarding_submissions successfully')

        // 6. Generate user vector from responses
        console.log('[Submit] Generating user vector...')
        let vectorGenerated = false
        try {
          const { error: vectorError } = await supabase.rpc('update_user_vector', {
            p_user_id: userId
          })

          if (vectorError) {
            console.error('[Submit] Vector generation failed:', vectorError)
            // Log but don't fail - vector can be generated later via backfill
            safeLogger.warn('[Submit] Vector generation failed, will be generated on next matching run', {
              userId,
              error: vectorError.message
            })
          } else {
            console.log('[Submit] User vector generated successfully')
            vectorGenerated = true
          }
        } catch (vectorErr) {
          console.error('[Submit] Vector generation error:', vectorErr)
          // Don't fail submission if vector generation fails
          safeLogger.warn('[Submit] Vector generation error, will be generated on next matching run', {
            userId,
            error: vectorErr instanceof Error ? vectorErr.message : String(vectorErr)
          })
        }

        // 7. Track analytics event
        try {
          await trackEvent(EVENT_TYPES.QUESTIONNAIRE_COMPLETED, {
            user_id: userId,
            university_id: submissionData.university_id,
            program_id: submissionData.program_id,
            response_count: deduplicatedResponses.length,
            vector_generated: vectorGenerated,
            is_edit: isEditMode
          }, userId)
        } catch (analyticsError) {
          // Don't fail submission if analytics fails
          console.error('[Submit] Analytics tracking failed:', analyticsError)
        }
      }

    console.log('[Submit] Submission complete')
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('[Submit] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const mappedError = mapSubmissionError(errorMessage)
    return NextResponse.json({ 
      error: mappedError.message,
      title: mappedError.title
    }, { status: 500 })
  }
}


