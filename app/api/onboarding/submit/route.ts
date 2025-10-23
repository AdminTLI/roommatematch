import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transformAnswer } from '@/lib/question-key-mapping'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[Submit] User:', user?.id || 'demo-user-id', 'isDemo:', !user)
  
  // Handle demo users
  const userId = user?.id || 'demo-user-id'
  const isDemo = !user
  
  if (!isDemo) {
    try {
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
        const { error: responsesError } = await supabase
          .from('responses')
          .upsert(responsesToInsert, { 
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
    } catch (error) {
      console.error('[Submit] Unexpected error:', error)
      return NextResponse.json({ 
        error: `Unexpected error: ${error.message}` 
      }, { status: 500 })
    }
  }

  console.log('[Submit] Submission complete, isDemo:', isDemo)
  return NextResponse.json({ ok: true, isDemo })
}


