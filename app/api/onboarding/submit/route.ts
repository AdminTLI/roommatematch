import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitCompleteOnboarding, extractSubmissionDataFromIntro } from '@/lib/onboarding/submission'
import { transformAnswer } from '@/lib/question-key-mapping'

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
      }
      
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

      // 4. Save snapshot to onboarding_submissions (after successful transformation)
      console.log('[Submit] Saving to onboarding_submissions')
      const submissionPayload = {
        user_id: userId,
        snapshot: sections ?? [],
        submitted_at: new Date().toISOString(),
      }

      const { error: submissionError } = await supabase
        .from('onboarding_submissions')
        .upsert(submissionPayload, { onConflict: 'user_id' })
        
      if (submissionError) {
        console.error('[Submit] Submission error:', submissionError)
        return NextResponse.json({ error: submissionError.message }, { status: 500 })
      }

      console.log('[Submit] Saved to onboarding_submissions successfully')

      // 5. Use consolidated submission helper
      if (submissionData && responsesToInsert.length > 0) {
        const result = await submitCompleteOnboarding(supabase, {
          user_id: userId,
          university_id: submissionData.university_id,
          first_name: submissionData.first_name,
          degree_level: submissionData.degree_level,
          program_id: submissionData.program_id,
          program: submissionData.program,
          campus: submissionData.campus,
          languages_daily: submissionData.languages_daily,
          study_start_year: submissionData.study_start_year,
          undecided_program: submissionData.undecided_program,
          responses: responsesToInsert
        })

        if (!result.success) {
          console.error('[Submit] Consolidated submission failed:', result.error)
          return NextResponse.json({ 
            error: `Submission failed: ${result.error}` 
          }, { status: 500 })
        }

        console.log('[Submit] Consolidated submission successful')
      } else {
        console.warn('[Submit] No submission data or responses to process')
      }

    console.log('[Submit] Submission complete')
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('[Submit] Unexpected error:', error)
    return NextResponse.json({ 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}


