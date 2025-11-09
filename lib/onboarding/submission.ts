import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { itemIdToQuestionKey } from '@/lib/question-key-mapping'
import { getInstitutionType } from '@/lib/getInstitutionType'
import { calculateStudyYearWithMonths } from '@/lib/academic/calculateStudyYear'

export interface OnboardingSubmissionData {
  user_id: string
  university_id: string
  first_name: string
  degree_level: string
  program_id?: string | null | undefined
  program?: string
  campus?: string
  languages_daily?: string[]
  study_start_year?: number
  study_start_month?: number | null
  expected_graduation_year?: number
  graduation_month?: number | null
  undecided_program?: boolean
}

export function extractSubmissionDataFromIntro(
  answers: Array<{ itemId: string; value: any }>,
  user: User
): OnboardingSubmissionData {
  let university_id = ''
  let institution_slug = ''
  let degree_level = ''
  let program_id = ''
  let program = ''
  let campus = ''
  let study_start_year: number | undefined
  let study_start_month: number | null = null
  let undecided_program = false
  let expected_graduation_year: number | undefined
  let graduation_month: number | null = null

  for (const answer of answers) {
    switch (answer.itemId) {
      case 'university_id':
        university_id = answer.value
        break
      case 'institution_slug':
        institution_slug = answer.value
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
      case 'study_start_month':
        study_start_month = answer.value ? parseInt(answer.value) : null
        break
      case 'expected_graduation_year':
        expected_graduation_year = parseInt(answer.value)
        break
      case 'graduation_month':
        graduation_month = answer.value ? parseInt(answer.value) : null
        break
      case 'undecided_program':
        undecided_program = answer.value
        break
    }
  }

  // Enforce mutual exclusivity constraint: program_id and undecided_program cannot both be set
  // Database constraint: (program_id IS NOT NULL AND undecided_program = false) OR (program_id IS NULL AND undecided_program = true)
  if (program_id && typeof program_id === 'string' && program_id.trim() !== '') {
    // User has selected a program, so they're not undecided
    undecided_program = false
  } else {
    // User has no program selected, so they must be undecided
    // Set to undefined (not empty string) so Supabase writes NULL to database
    program_id = undefined
    undecided_program = true
  }

  // Calculate study_start_year using month-aware logic if months are provided
  // Otherwise fall back to institution-type defaults
  if (!study_start_year && expected_graduation_year && degree_level && institution_slug) {
    const institutionType = getInstitutionType(institution_slug) as 'wo' | 'hbo'
    
    if (institutionType && study_start_month !== null && graduation_month !== null) {
      // Use month-aware calculation
      // Calculate academic year offsets
      // Academic year starts in September (month 9)
      const graduationAcademicYear = expected_graduation_year + (graduation_month >= 9 ? 1 : 0)
      const startAcademicYear = graduationAcademicYear - (institutionType === 'wo' ? 3 : 4) + 1
      
      // Convert academic year back to calendar year
      // If start month >= 9, the academic year started in the previous calendar year
      study_start_year = startAcademicYear - (study_start_month >= 9 ? 1 : 0)
    } else {
      // Fallback to old calculation
      let calculatedStartYear = expected_graduation_year - 3 // Default for bachelor
      
      if (degree_level === 'master' || degree_level === 'premaster') {
        calculatedStartYear = expected_graduation_year - 1
      } else if (degree_level === 'bachelor' && institutionType) {
        const bachelorDuration = institutionType === 'hbo' ? 4 : 3
        calculatedStartYear = expected_graduation_year - bachelorDuration
      }
      
      // Clamp to DB constraints: >= 2015 AND <= EXTRACT(YEAR FROM now()) + 1
      const currentYear = new Date().getFullYear()
      const minYear = 2015
      const maxYear = currentYear + 1
      study_start_year = Math.max(minYear, Math.min(maxYear, calculatedStartYear))
    }
  }
  
  // Default graduation_month to June (6) if not provided
  if (graduation_month === null && expected_graduation_year) {
    graduation_month = 6
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
    study_start_month,
    expected_graduation_year,
    graduation_month,
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
    .map(lang => languageCodeMap[lang] || 'other')
    .filter(Boolean)
}

export async function upsertProfileAndAcademic(
  supabase: SupabaseClient,
  data: OnboardingSubmissionData
) {
  // Check verification status from verifications table first
  // This ensures we preserve the verified status if user completed verification before onboarding
  const { data: verification } = await supabase
    .from('verifications')
    .select('status')
    .eq('user_id', data.user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Determine verification status: if verification is approved, use 'verified', otherwise 'unverified'
  let verificationStatus: 'unverified' | 'pending' | 'verified' | 'failed' = 'unverified'
  if (verification?.status === 'approved') {
    verificationStatus = 'verified'
  } else if (verification?.status === 'rejected' || verification?.status === 'expired') {
    verificationStatus = 'failed'
  } else if (verification?.status === 'pending') {
    verificationStatus = 'pending'
  }

  // 1. Upsert profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: data.user_id,
      university_id: data.university_id,
      first_name: data.first_name,
      degree_level: data.degree_level,
      program: (data.program_id && typeof data.program_id === 'string' && data.program_id.trim() !== '') 
        ? data.program_id 
        : null,
      campus: data.campus,
      languages: data.languages_daily || [],
      verification_status: verificationStatus,
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
  // Convert empty string or undefined to null for program_id to satisfy FK constraint
  const programIdForDb = (data.program_id && typeof data.program_id === 'string' && data.program_id.trim() !== '') 
    ? data.program_id 
    : null
  
  const { error: academicError } = await supabase
    .from('user_academic')
    .upsert({
      user_id: data.user_id,
      university_id: data.university_id,
      degree_level: data.degree_level,
      program_id: programIdForDb,
      study_start_year: data.study_start_year,
      study_start_month: data.study_start_month ?? null,
      expected_graduation_year: data.expected_graduation_year ?? null,
      graduation_month: data.graduation_month ?? null,
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
  study_start_month?: number | null
  expected_graduation_year?: number
  graduation_month?: number | null
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
      study_start_month: data.study_start_month,
      expected_graduation_year: data.expected_graduation_year,
      graduation_month: data.graduation_month,
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

    // 3. Onboarding submission record is handled by the calling code with snapshot data

    return { success: true }
  } catch (error) {
    console.error('Complete onboarding submission failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
