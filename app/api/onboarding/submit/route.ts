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

    // Check if user exists in users table, create if missing
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      console.log('[Submit] User not found in users table, creating manually...')
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          is_active: true
        })
      
      if (userCreateError) {
        console.error('[Submit] Failed to create user:', userCreateError)
        return NextResponse.json({ 
          error: 'User account setup failed. Please try again.' 
        }, { status: 500 })
      }
      console.log('[Submit] User created successfully')
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

      // 3. Transform answers and insert into responses table
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


