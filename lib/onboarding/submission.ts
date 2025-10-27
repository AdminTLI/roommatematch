import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

export interface OnboardingSubmissionData {
  user_id: string
  university_id: string
  first_name: string
  degree_level: string
  program_id?: string
  program?: string
  campus?: string
  languages_daily?: string[]
  study_start_year?: number
  undecided_program?: boolean
}

export function extractSubmissionDataFromIntro(
  answers: Array<{ itemId: string; value: any }>,
  user: User
): OnboardingSubmissionData {
  let university_id = ''
  let degree_level = ''
  let program_id = ''
  let program = ''
  let campus = ''
  let study_start_year: number | undefined
  let undecided_program = false

  for (const answer of answers) {
    switch (answer.itemId) {
      case 'university_id':
        university_id = answer.value
        break
      case 'degree_level':
        degree_level = answer.value
        break
      case 'program_id':
        program_id = answer.value
        break
      case 'program':
        program = answer.value
        break
      case 'campus':
        campus = answer.value
        break
      case 'study_start_year':
        study_start_year = parseInt(answer.value)
        break
      case 'undecided_program':
        undecided_program = answer.value
        break
    }
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  return {
    user_id: user.id,
    university_id,
    first_name: firstName,
    degree_level,
    program_id,
    program,
    campus,
    study_start_year,
    undecided_program
  }
}

export async function upsertProfileAndAcademic(
  supabase: SupabaseClient,
  data: OnboardingSubmissionData
) {
  // 1. Upsert profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: data.user_id,
      university_id: data.university_id,
      first_name: data.first_name,
      degree_level: data.degree_level,
      program: data.program_id,
      campus: data.campus,
      languages: data.languages_daily || [],
      verification_status: 'unverified'
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (profileError) {
    throw new Error(`Failed to upsert profile: ${profileError.message}`)
  }

  // 2. Upsert user_academic
  const { error: academicError } = await supabase
    .from('user_academic')
    .upsert({
      user_id: data.user_id,
      university_id: data.university_id,
      degree_level: data.degree_level,
      program_id: data.program_id,
      study_start_year: data.study_start_year,
      undecided_program: data.undecided_program,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (academicError) {
    throw new Error(`Failed to upsert user_academic: ${academicError.message}`)
  }

  return profile
}

export interface CompleteOnboardingData {
  user_id: string
  university_id: string
  first_name: string
  degree_level: string
  program_id?: string
  program?: string
  campus?: string
  languages_daily?: string[]
  study_start_year?: number
  undecided_program?: boolean
  responses: Array<{
    question_key: string
    value: any
  }>
}

export async function submitCompleteOnboarding(
  supabase: SupabaseClient,
  data: CompleteOnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Upsert profile and academic data
    await upsertProfileAndAcademic(supabase, {
      user_id: data.user_id,
      university_id: data.university_id,
      first_name: data.first_name,
      degree_level: data.degree_level,
      program_id: data.program_id,
      program: data.program,
      campus: data.campus,
      languages_daily: data.languages_daily,
      study_start_year: data.study_start_year,
      undecided_program: data.undecided_program
    })

    // 2. Upsert questionnaire responses
    if (data.responses.length > 0) {
      const responsesToInsert = data.responses.map(response => ({
        user_id: data.user_id,
        question_key: response.question_key,
        value: response.value
      }))

      const { error: responsesError } = await supabase
        .from('responses')
        .upsert(responsesToInsert, { onConflict: 'user_id,question_key' })

      if (responsesError) {
        throw new Error(`Failed to save responses: ${responsesError.message}`)
      }
    }

    // 3. Create onboarding submission record
    const { error: submissionError } = await supabase
      .from('onboarding_submissions')
      .upsert({
        user_id: data.user_id,
        submitted_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (submissionError) {
      throw new Error(`Failed to create submission record: ${submissionError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Complete onboarding submission failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
