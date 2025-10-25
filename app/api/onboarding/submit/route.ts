import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

      // 2. Save snapshot to onboarding_submissions
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

      // 3. Extract and save academic data from intro section
      const introSection = sections?.find(s => s.section === 'intro')
      if (introSection?.answers) {
        console.log('[Submit] Processing intro section for academic data')
        
        // Extract academic fields from intro section
        const academicData: any = {}
        for (const answer of introSection.answers) {
          if (answer.itemId === 'university') {
            academicData.university_id = answer.value
          } else if (answer.itemId === 'degreeLevel') {
            academicData.degree_level = answer.value
          } else if (answer.itemId === 'program') {
            academicData.program_id = answer.value
          } else if (answer.itemId === 'graduationYear') {
            academicData.study_start_year = parseInt(answer.value)
          }
        }
        
        // Validate required fields
        if (academicData.university_id && academicData.degree_level && academicData.study_start_year) {
          console.log('[Submit] Creating/updating user_academic record:', academicData)
          
          const { error: academicError } = await supabase
            .from('user_academic')
            .upsert({
              user_id: userId,
              university_id: academicData.university_id,
              degree_level: academicData.degree_level,
              program_id: academicData.program_id || null,
              undecided_program: !academicData.program_id,
              study_start_year: academicData.study_start_year,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
          
          if (academicError) {
            console.error('[Submit] Failed to save academic data:', academicError)
            // Don't fail the entire submission, just log the error
          } else {
            console.log('[Submit] Academic data saved successfully')
          }
        } else {
          console.warn('[Submit] Incomplete academic data, skipping user_academic creation:', academicData)
        }
      }

      // 4. Create/update profile record with academic data
      if (introSection?.answers) {
        const academicData: any = {}
        for (const answer of introSection.answers) {
          if (answer.itemId === 'university') {
            academicData.university_id = answer.value
          } else if (answer.itemId === 'degreeLevel') {
            academicData.degree_level = answer.value
          }
        }
        
        if (academicData.university_id && academicData.degree_level) {
          console.log('[Submit] Creating/updating profile record')
          
          // Get first name from intro section or user metadata
          let firstName = user.user_metadata?.full_name?.split(' ')[0] || 'User'
          for (const answer of introSection.answers) {
            if (answer.itemId === 'firstName') {
              firstName = answer.value
            }
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              university_id: academicData.university_id,
              degree_level: academicData.degree_level,
              first_name: firstName,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
          
          if (profileError) {
            console.error('[Submit] Failed to create profile:', profileError)
            // Don't fail the entire submission
          } else {
            console.log('[Submit] Profile created successfully')
          }
        }
      }

      // 5. Transform answers and insert into responses table
      const responsesToInsert = []
      
      for (const section of sections ?? []) {
        console.log(`[Submit] Processing section: ${section.section}, answers: ${section.answers?.length || 0}`)
        for (const answer of section.answers ?? []) {
          const transformed = transformAnswer(answer)
          if (transformed) {
            responsesToInsert.push({
              user_id: userId,
              question_key: transformed.question_key,
              value: JSON.stringify(transformed.value)
            })
          } else {
            console.warn(`[Submit] Failed to transform answer for itemId: ${answer.itemId}`)
          }
        }
      }

      console.log(`[Submit] Prepared ${responsesToInsert.length} responses to insert`)
      console.log('[Submit] Sample responses:', responsesToInsert.slice(0, 3))

      if (responsesToInsert.length > 0) {
        // Deduplicate by question_key, keeping the last occurrence (most recent answer)
        const deduplicatedResponses = Array.from(
          responsesToInsert
            .reduce((map, response) => {
              map.set(response.question_key, response)
              return map
            }, new Map<string, any>())
            .values()
        )

        console.log(`[Submit] Deduplicated responses: ${responsesToInsert.length} → ${deduplicatedResponses.length}`)
        
        if (responsesToInsert.length !== deduplicatedResponses.length) {
          const duplicates = responsesToInsert.length - deduplicatedResponses.length
          console.log(`[Submit] Removed ${duplicates} duplicate question_keys`)
        }

        const { error: responsesError } = await supabase
          .from('responses')
          .upsert(deduplicatedResponses, { 
            onConflict: 'user_id,question_key',
            ignoreDuplicates: false  // This ensures updates happen
          })
          
        if (responsesError) {
          console.error('[Submit] Responses upsert error:', {
            message: responsesError.message,
            details: responsesError.details,
            hint: responsesError.hint,
            code: responsesError.code
          })
          return NextResponse.json({ 
            error: `Database error: ${responsesError.message}. ${responsesError.hint || ''}` 
          }, { status: 500 })
        }

        console.log('[Submit] Successfully inserted/updated responses')
      } else {
        console.warn('[Submit] No responses to insert!')
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


