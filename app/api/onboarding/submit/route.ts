import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transformAnswer } from '@/lib/question-key-mapping'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Handle demo users
  const userId = user?.id || 'demo-user-id'
  const isDemo = !user
  
  if (!isDemo) {
    // Real user: save to both onboarding_submissions AND responses tables
    
    // 1. Fetch all sections from onboarding_sections
    const { data: sections, error: sectionsError } = await supabase
      .from('onboarding_sections')
      .select('section, answers, version, updated_at')
      .eq('user_id', userId)

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }

    // 2. Save snapshot to onboarding_submissions
    const submissionPayload = {
      user_id: userId,
      snapshot: sections ?? [],
      submitted_at: new Date().toISOString(),
    }

    const { error: submissionError } = await supabase
      .from('onboarding_submissions')
      .insert(submissionPayload)
      
    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 })
    }

    // 3. Transform answers and insert into responses table
    const responsesToInsert = []
    
    for (const section of sections ?? []) {
      for (const answer of section.answers ?? []) {
        const transformed = transformAnswer(answer)
        if (transformed) {
          responsesToInsert.push({
            user_id: userId,
            question_key: transformed.question_key,
            value: JSON.stringify(transformed.value) // JSONB requires string
          })
        }
      }
    }

    if (responsesToInsert.length > 0) {
      const { error: responsesError } = await supabase
        .from('responses')
        .upsert(responsesToInsert, { 
          onConflict: 'user_id,question_key' 
        })
        
      if (responsesError) {
        console.error('Failed to insert responses:', responsesError)
        return NextResponse.json({ error: responsesError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true, isDemo })
}


