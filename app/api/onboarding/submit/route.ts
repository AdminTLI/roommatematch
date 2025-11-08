import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitCompleteOnboarding, extractSubmissionDataFromIntro, extractLanguagesFromSections, mapSubmissionError } from '@/lib/onboarding/submission'
import { transformAnswer } from '@/lib/question-key-mapping'
import { safeLogger } from '@/lib/utils/logger'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[Submit] User:', user?.id, 'isDemo:', !user)
  
  // Require authentication
  if (!user?.id) {
    console.log('[Submit] No authenticated user')
    return NextResponse.json({ 
      error: 'Authentication required. Please log in and try again.' 
    }, { status: 401 })
  }
  
  const userId = user.id
  
  try {
    // Check if user is verified (optional for development)
    if (!user.email_confirmed_at) {
      console.log('[Submit] User email not verified:', user.email)
      return NextResponse.json({ 
        error: 'Please verify your email before submitting the questionnaire. Check your email for a verification link or go to Settings to resend verification email.' 
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
        submissionData = extractSubmissionDataFromIntro(introSection.answers, user)
        console.log('[Submit] Extracted submission data:', submissionData)
        
        // Look up university_id from institution_slug if university_id is empty
        if (!submissionData.university_id) {
          const institutionSlugAnswer = introSection.answers.find((a: any) => a.itemId === 'institution_slug')
          if (institutionSlugAnswer?.value) {
            console.log('[Submit] Looking up university for slug:', institutionSlugAnswer.value)
            
            const { data: university, error: universityError } = await supabase
              .from('universities')
              .select('id')
              .eq('slug', institutionSlugAnswer.value)
              .single()
            
            if (universityError) {
              console.error('[Submit] University lookup failed:', universityError)
            } else if (university) {
              submissionData.university_id = university.id
              console.log('[Submit] Found university_id:', university.id)
            }
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
            // If program not found, set to null to avoid UUID constraint violation
            console.log('[Submit] Setting program_id to null since program not found in database')
            submissionData.program_id = undefined
          } else if (program) {
            submissionData.program_id = program.id
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

      // 4. Use consolidated submission helper
      if (submissionData && deduplicatedResponses.length > 0) {
        // Ensure we have a valid university_id
        if (!submissionData.university_id) {
          console.error('[Submit] No university_id found, cannot proceed with submission')
          return NextResponse.json({ 
            error: 'University information is required. Please complete the academic information section.',
            title: 'Missing University Information'
          }, { status: 400 })
        }
        
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
          }
        } catch (vectorErr) {
          console.error('[Submit] Vector generation error:', vectorErr)
          // Don't fail submission if vector generation fails
          safeLogger.warn('[Submit] Vector generation error, will be generated on next matching run', {
            userId,
            error: vectorErr instanceof Error ? vectorErr.message : String(vectorErr)
          })
        }
      } else {
        console.warn('[Submit] No submission data or responses to process')
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


