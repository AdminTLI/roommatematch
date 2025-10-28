import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { itemIdToQuestionKey } from '@/lib/question-key-mapping'

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
  let expected_graduation_year: number | undefined

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
      case 'expected_graduation_year':
        expected_graduation_year = parseInt(answer.value)
        break
      case 'undecided_program':
        undecided_program = answer.value
        break
    }
  }

  // If study_start_year is not provided, calculate it from expected_graduation_year
  if (!study_start_year && expected_graduation_year && degree_level) {
    let calculatedStartYear = expected_graduation_year - 3 // Default for bachelor
    
    if (degree_level === 'master' || degree_level === 'premaster') {
      calculatedStartYear = expected_graduation_year - 1
    }
    
    // Clamp to DB constraints: >= 2015 AND <= EXTRACT(YEAR FROM now()) + 1
    const currentYear = new Date().getFullYear()
    const minYear = 2015
    const maxYear = currentYear + 1
    study_start_year = Math.max(minYear, Math.min(maxYear, calculatedStartYear))
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

export function extractLanguagesFromSections(
  sections: Array<{ section: string; answers: any[] }>
): string[] {
  const languageValues = new Set<string>()
  
  for (const section of sections) {
    for (const answer of section.answers ?? []) {
      // Check if this answer maps to languages_daily
      const questionKey = itemIdToQuestionKey[answer.itemId]
      if (questionKey === 'languages_daily') {
        // Extract the actual value
        let value = answer.value
        
        // Handle nested value object: { value: X }
        if (value && typeof value === 'object' && 'value' in value) {
          value = value.value
        }
        
        // Handle different value types
        if (Array.isArray(value)) {
          // If it's already an array, add all values
          value.forEach(v => {
            if (v && typeof v === 'string') {
              languageValues.add(v.toLowerCase())
            }
          })
        } else if (typeof value === 'string' && value.trim()) {
          // If it's a string, add it
          languageValues.add(value.toLowerCase())
        }
      }
    }
  }
  
  // Convert back to array and map to language codes
  const languageCodeMap: Record<string, string> = {
    'english': 'en',
    'dutch': 'nl',
    'german': 'de',
    'french': 'fr',
    'spanish': 'es',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'chinese': 'zh',
    'japanese': 'ja',
    'korean': 'ko',
    'arabic': 'ar',
    'hindi': 'hi',
    'turkish': 'tr',
    'polish': 'pl',
    'either': 'en', // Default "either" to English
    'other': 'other'
  }
  
  return Array.from(languageValues)
    .map(lang => languageCodeMap[lang] || lang)
    .filter(Boolean)
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
      verification_status: 'unverified',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (profileError) {
    console.error('[Submit] Profile upsert failed:', {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      data: {
        user_id: data.user_id,
        university_id: data.university_id,
        first_name: data.first_name,
        degree_level: data.degree_level,
        program: data.program_id,
        campus: data.campus,
        languages: data.languages_daily || [],
        verification_status: 'unverified'
      }
    })
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
    console.error('[Submit] Academic upsert failed:', {
      code: academicError.code,
      message: academicError.message,
      details: academicError.details,
      hint: academicError.hint,
      data: {
        user_id: data.user_id,
        university_id: data.university_id,
        degree_level: data.degree_level,
        program_id: data.program_id,
        study_start_year: data.study_start_year,
        undecided_program: data.undecided_program
      }
    })
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

export function mapSubmissionError(technicalError: string): { title: string; message: string } {
  const error = technicalError.toLowerCase()
  
  if (error.includes('failed to upsert profile')) {
    return {
      title: 'Profile Save Failed',
      message: 'Unable to save your profile information. Please check your internet connection and try again. If the problem persists, contact support at help@roommatematch.nl'
    }
  }
  
  if (error.includes('failed to upsert user_academic')) {
    return {
      title: 'Academic Information Save Failed',
      message: 'Unable to save your academic information. Please verify your university and program details are correct, then try again. Contact support at help@roommatematch.nl if the issue continues.'
    }
  }
  
  if (error.includes('failed to save responses')) {
    return {
      title: 'Questionnaire Save Failed',
      message: 'Unable to save your questionnaire responses. Please try again. If the problem persists, contact support at help@roommatematch.nl'
    }
  }
  
  if (error.includes('failed to create submission record')) {
    return {
      title: 'Submission Record Failed',
      message: 'Unable to create your submission record. Please try again. Contact support at help@roommatematch.nl if this continues.'
    }
  }
  
  if (error.includes('authentication required')) {
    return {
      title: 'Authentication Required',
      message: 'Please log in to your account and try again. If you continue having issues, contact support at help@roommatematch.nl'
    }
  }
  
  if (error.includes('email not verified')) {
    return {
      title: 'Email Verification Required',
      message: 'Please verify your email address before submitting. Check your email for a verification link or go to Settings to resend it. Contact support at help@roommatematch.nl if you need assistance.'
    }
  }
  
  // Generic fallback
  return {
    title: 'Submission Failed',
    message: `Something went wrong while saving your information. Please try again. If the problem persists, contact support at help@roommatematch.nl with this error: "${technicalError}"`
  }
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
