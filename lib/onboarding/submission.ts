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
  programme_duration_months?: number
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
        // Only set if it's a valid UUID (not empty string)
        if (answer.value && typeof answer.value === 'string' && answer.value.trim() !== '') {
          university_id = answer.value
        }
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

  // Validate study_start_month and graduation_month are provided (required)
  if (expected_graduation_year && (!study_start_month || !graduation_month)) {
    throw new Error('Study start month and graduation month are required for accurate academic year calculation')
  }

  // Validate months are in valid range (1-12)
  if (study_start_month !== null && (study_start_month < 1 || study_start_month > 12)) {
    throw new Error('Study start month must be between 1 and 12')
  }
  if (graduation_month !== null && (graduation_month < 1 || graduation_month > 12)) {
    throw new Error('Graduation month must be between 1 and 12')
  }

  // Ensure graduation_month defaults to June (6) if not provided (should not happen with validation)
  if (graduation_month === null && expected_graduation_year) {
    graduation_month = 6
  }
  
  // Ensure study_start_month is set if expected_graduation_year is provided (should not happen with validation)
  if (study_start_month === null && expected_graduation_year) {
    // Default to September (9) for most students
    study_start_month = 9
  }

  // Calculate study_start_year using month-aware logic if months are provided
  // Otherwise fall back to institution-type defaults
  // CRITICAL: study_start_year is REQUIRED (NOT NULL) in user_academic table
  if (!study_start_year) {
    if (expected_graduation_year && degree_level && institution_slug) {
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
      } else if (institutionType) {
        // Fallback to old calculation when months are not provided
        let calculatedStartYear = expected_graduation_year - 3 // Default for bachelor
        
        if (degree_level === 'master' || degree_level === 'premaster') {
          calculatedStartYear = expected_graduation_year - 1
        } else if (degree_level === 'bachelor') {
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
    
    // Final fallback: if still undefined, use current year minus 1 as a safe default
    // This should rarely happen, but prevents database constraint violations
    if (!study_start_year) {
      const currentYear = new Date().getFullYear()
      study_start_year = currentYear - 1
      console.warn('[extractSubmissionDataFromIntro] study_start_year could not be calculated, using fallback:', study_start_year)
    }
  }
  
  // Validate study_start_year is within acceptable range
  const currentYear = new Date().getFullYear()
  const minYear = 2015
  const maxYear = currentYear + 1
  if (study_start_year < minYear || study_start_year > maxYear) {
    console.warn('[extractSubmissionDataFromIntro] study_start_year out of range, clamping:', study_start_year)
    study_start_year = Math.max(minYear, Math.min(maxYear, study_start_year))
  }

  // Calculate programme duration in months
  let programme_duration_months: number | undefined = undefined
  if (study_start_year && study_start_month !== null && expected_graduation_year && graduation_month !== null) {
    const startDate = new Date(study_start_year, study_start_month - 1, 1)
    const endDate = new Date(expected_graduation_year, graduation_month - 1, 1)
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth())
    // Clamp to reasonable range (12-120 months = 1-10 years)
    programme_duration_months = Math.max(12, Math.min(120, monthsDiff))
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  // Ensure university_id is set if we have institution_slug (will be looked up in submit route if not set)
  // Return empty string if not set (submit route will handle lookup)
  const finalUniversityId = university_id && university_id.trim() !== '' ? university_id : ''

  // Final validation: study_start_year MUST be defined (required by database)
  if (!study_start_year || isNaN(study_start_year)) {
    throw new Error(`study_start_year is required but could not be calculated. Expected graduation year: ${expected_graduation_year}, Degree level: ${degree_level}, Institution: ${institution_slug}`)
  }

  return {
    user_id: user.id,
    university_id: finalUniversityId,
    first_name: firstName,
    degree_level,
    program_id,
    program,
    campus,
    study_start_year,
    study_start_month,
    expected_graduation_year,
    graduation_month,
    programme_duration_months,
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
  // Look up program name if we have a program_id (UUID)
  let programName: string | null = null
  if (data.program_id && typeof data.program_id === 'string' && data.program_id.trim() !== '') {
    // Check if it's a UUID (program_id) or a string (program name)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.program_id)
    
    if (isUUID) {
      // It's a UUID, look up the program name
      try {
        const { data: programData } = await supabase
          .from('programs')
          .select('name')
          .eq('id', data.program_id)
          .maybeSingle()
        
        if (programData?.name) {
          programName = programData.name
        } else {
          // If not found in programs table, try programmes table
          const { data: programmeData } = await supabase
            .from('programmes')
            .select('name')
            .eq('id', data.program_id)
            .maybeSingle()
          
          if (programmeData?.name) {
            programName = programmeData.name
          }
        }
      } catch (lookupError) {
        console.warn('[upsertProfileAndAcademic] Failed to look up program name:', lookupError)
        // Continue without program name
      }
    } else {
      // It's already a program name string, use it directly
      programName = data.program_id
    }
  } else if (data.program && typeof data.program === 'string' && data.program.trim() !== '') {
    // Use the program name from data.program if available
    programName = data.program
  }

  // Validate required fields before upsert
  if (!data.user_id || typeof data.user_id !== 'string' || data.user_id.trim() === '') {
    throw new Error('user_id is required but is missing or invalid')
  }
  
  if (!data.university_id || typeof data.university_id !== 'string' || data.university_id.trim() === '') {
    throw new Error('university_id is required but is missing or invalid')
  }
  
  if (!data.first_name || typeof data.first_name !== 'string' || data.first_name.trim() === '') {
    throw new Error('first_name is required but is missing or invalid')
  }
  
  if (!data.degree_level || typeof data.degree_level !== 'string' || data.degree_level.trim() === '') {
    throw new Error('degree_level is required but is missing or invalid')
  }

  // Verify university exists before attempting profile upsert
  try {
    const { data: university, error: uniError } = await supabase
      .from('universities')
      .select('id')
      .eq('id', data.university_id)
      .maybeSingle()
    
    if (uniError) {
      console.error('[upsertProfileAndAcademic] Error checking university:', uniError)
      throw new Error(`University validation failed: ${uniError.message}`)
    }
    
    if (!university) {
      throw new Error(`University with ID ${data.university_id} does not exist in the database`)
    }
  } catch (validationError) {
    console.error('[upsertProfileAndAcademic] University validation error:', validationError)
    throw validationError
  }

  // Map degree_level to profiles table enum values
  // profiles.degree_level enum: ('bachelor', 'master', 'phd', 'exchange', 'other')
  // user_academic.degree_level uses: ('bachelor', 'master', 'premaster')
  // Map 'premaster' to 'master' for profiles table
  let profileDegreeLevel: 'bachelor' | 'master' | 'phd' | 'exchange' | 'other' = 'other'
  if (data.degree_level === 'bachelor') {
    profileDegreeLevel = 'bachelor'
  } else if (data.degree_level === 'master' || data.degree_level === 'premaster') {
    profileDegreeLevel = 'master'
  } else if (data.degree_level === 'phd') {
    profileDegreeLevel = 'phd'
  } else if (data.degree_level === 'exchange') {
    profileDegreeLevel = 'exchange'
  } else {
    profileDegreeLevel = 'other'
  }

  // Truncate program name if it's too long (VARCHAR(255) limit)
  const truncatedProgramName = programName && programName.length > 255 
    ? programName.substring(0, 252) + '...' 
    : programName

  console.log('[upsertProfileAndAcademic] Upserting profile with data:', {
    user_id: data.user_id,
    university_id: data.university_id,
    first_name: data.first_name,
    degree_level: data.degree_level,
    program: truncatedProgramName,
    campus: data.campus,
    languages_count: (data.languages_daily || []).length,
    verification_status: verificationStatus
  })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: data.user_id,
      university_id: data.university_id,
      first_name: data.first_name,
      degree_level: profileDegreeLevel, // Use mapped enum value for profiles table
      program: truncatedProgramName, // Use program name, not UUID
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
    console.error('[upsertProfileAndAcademic] Profile upsert failed:', {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      attempted_data: {
        user_id: data.user_id,
        university_id: data.university_id,
        first_name: data.first_name,
        degree_level: data.degree_level,
        program: truncatedProgramName,
        program_length: truncatedProgramName?.length,
        campus: data.campus,
        languages: data.languages_daily || [],
        verification_status: verificationStatus
      }
    })
    throw new Error(`Failed to upsert profile: ${profileError.message} (Code: ${profileError.code}, Details: ${profileError.details || 'none'}, Hint: ${profileError.hint || 'none'})`)
  }

  // 2. Upsert user_academic
  // CRITICAL: Validate required fields before upserting
  if (!data.study_start_year || isNaN(data.study_start_year)) {
    console.error('[upsertProfileAndAcademic] study_start_year is missing or invalid:', data.study_start_year)
    throw new Error(`study_start_year is required but is missing or invalid: ${data.study_start_year}. Cannot create user_academic record.`)
  }

  if (!data.university_id || data.university_id.trim() === '') {
    console.error('[upsertProfileAndAcademic] university_id is missing:', data.university_id)
    throw new Error(`university_id is required but is missing. Cannot create user_academic record.`)
  }

  if (!data.degree_level || data.degree_level.trim() === '') {
    console.error('[upsertProfileAndAcademic] degree_level is missing:', data.degree_level)
    throw new Error(`degree_level is required but is missing. Cannot create user_academic record.`)
  }

  // Convert empty string or undefined to null for program_id to satisfy FK constraint
  // Also validate that the program_id exists in the programs table if it's provided
  let programIdForDb: string | null = null
  let undecidedProgram = data.undecided_program ?? false
  
  if (data.program_id && typeof data.program_id === 'string' && data.program_id.trim() !== '') {
    // Check if it's a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.program_id)
    
    if (isUUID) {
      // Verify the program exists in the programs table
      try {
        const { data: programExists, error: programCheckError } = await supabase
          .from('programs')
          .select('id')
          .eq('id', data.program_id)
          .maybeSingle()
        
        if (programCheckError) {
          console.warn('[upsertProfileAndAcademic] Error checking program existence:', programCheckError)
          programIdForDb = null
          undecidedProgram = true
        } else if (programExists) {
          // Program exists, use it
          programIdForDb = data.program_id
          undecidedProgram = false
        } else {
          // Program doesn't exist, set to null
          console.warn('[upsertProfileAndAcademic] Program ID does not exist in programs table:', data.program_id)
          programIdForDb = null
          undecidedProgram = true
        }
      } catch (checkError) {
        console.error('[upsertProfileAndAcademic] Failed to verify program existence:', checkError)
        programIdForDb = null
        undecidedProgram = true
      }
    } else {
      // Not a UUID, can't be a valid program_id
      console.warn('[upsertProfileAndAcademic] program_id is not a valid UUID:', data.program_id)
      programIdForDb = null
      undecidedProgram = true
    }
  } else {
    // No program_id provided
    programIdForDb = null
    undecidedProgram = data.undecided_program ?? true
  }
  
  // Calculate programme duration if months are provided (trigger will also calculate, but we set it here for consistency)
  let programme_duration_months: number | null = null
  if (data.study_start_year && data.study_start_month !== null && 
      data.expected_graduation_year && data.graduation_month !== null) {
    const startDate = new Date(data.study_start_year, data.study_start_month - 1, 1)
    const endDate = new Date(data.expected_graduation_year, data.graduation_month - 1, 1)
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth())
    // Clamp to reasonable range (12-120 months = 1-10 years)
    programme_duration_months = Math.max(12, Math.min(120, monthsDiff))
  }

  // Validate study_start_year is within database constraints
  const currentYear = new Date().getFullYear()
  const minYear = 2015
  const maxYear = currentYear + 1
  if (data.study_start_year < minYear || data.study_start_year > maxYear) {
    console.warn('[upsertProfileAndAcademic] study_start_year out of range, clamping:', data.study_start_year)
    data.study_start_year = Math.max(minYear, Math.min(maxYear, data.study_start_year))
  }

  console.log('[upsertProfileAndAcademic] Upserting user_academic with data:', {
    user_id: data.user_id,
    university_id: data.university_id,
    degree_level: data.degree_level,
    program_id: programIdForDb,
    original_program_id: data.program_id,
    study_start_year: data.study_start_year,
    study_start_month: data.study_start_month,
    expected_graduation_year: data.expected_graduation_year,
    graduation_month: data.graduation_month,
    programme_duration_months: programme_duration_months,
    undecided_program: undecidedProgram
  })

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
      programme_duration_months: programme_duration_months,
      undecided_program: undecidedProgram,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (academicError) {
    console.error('[upsertProfileAndAcademic] Academic upsert failed:', {
      code: academicError.code,
      message: academicError.message,
      details: academicError.details,
      hint: academicError.hint,
      data: {
        user_id: data.user_id,
        university_id: data.university_id,
        degree_level: data.degree_level,
        program_id: programIdForDb,
        original_program_id: data.program_id,
        study_start_year: data.study_start_year,
        study_start_month: data.study_start_month,
        expected_graduation_year: data.expected_graduation_year,
        graduation_month: data.graduation_month,
        undecided_program: undecidedProgram,
        programme_duration_months: programme_duration_months
      }
    })
    
    // If it's a foreign key constraint violation on program_id, provide more context
    if (academicError.code === '23503' && academicError.message.includes('program_id')) {
      throw new Error(`Failed to upsert user_academic: The program ID "${programIdForDb}" does not exist in the programs table. This should have been caught by validation. ${academicError.message}`)
    }
    
    throw new Error(`Failed to upsert user_academic: ${academicError.message}. Please check server logs for details.`)
  }

  console.log('[upsertProfileAndAcademic] Successfully upserted user_academic for user:', data.user_id)
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
  programme_duration_months?: number
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
      message: 'Unable to save your profile information. Please check your internet connection and try again. If the problem persists, contact support at help@domumatch.nl'
    }
  }
  
  if (error.includes('failed to upsert user_academic')) {
    return {
      title: 'Academic Information Save Failed',
      message: 'Unable to save your academic information. Please verify your university and program details are correct, then try again. Contact support at help@domumatch.nl if the issue continues.'
    }
  }
  
  if (error.includes('failed to save responses')) {
    return {
      title: 'Questionnaire Save Failed',
      message: 'Unable to save your questionnaire responses. Please try again. If the problem persists, contact support at help@domumatch.nl'
    }
  }
  
  if (error.includes('failed to create submission record')) {
    return {
      title: 'Submission Record Failed',
      message: 'Unable to create your submission record. Please try again. Contact support at help@domumatch.nl if this continues.'
    }
  }
  
  if (error.includes('authentication required')) {
    return {
      title: 'Authentication Required',
      message: 'Please log in to your account and try again. If you continue having issues, contact support at help@domumatch.nl'
    }
  }
  
  if (error.includes('email not verified')) {
    return {
      title: 'Email Verification Required',
      message: 'Please verify your email address before submitting. Check your email for a verification link or go to Settings to resend it. Contact support at help@domumatch.nl if you need assistance.'
    }
  }
  
  // Generic fallback
  return {
    title: 'Submission Failed',
    message: `Something went wrong while saving your information. Please try again. If the problem persists, contact support at help@domumatch.nl with this error: "${technicalError}"`
  }
}

export async function submitCompleteOnboarding(
  supabase: SupabaseClient,
  data: CompleteOnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[submitCompleteOnboarding] Starting submission with data:', {
      user_id: data.user_id,
      university_id: data.university_id,
      first_name: data.first_name,
      degree_level: data.degree_level,
      program_id: data.program_id,
      study_start_year: data.study_start_year,
      has_responses: data.responses.length > 0
    })
    
    // 1. Upsert profile and academic data
    try {
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
        programme_duration_months: data.programme_duration_months,
        undecided_program: data.undecided_program
      })
      console.log('[submitCompleteOnboarding] Profile and academic data upserted successfully')
    } catch (upsertError) {
      console.error('[submitCompleteOnboarding] Failed to upsert profile and academic:', upsertError)
      // Re-throw with more context
      throw new Error(`Failed to upsert profile and academic: ${upsertError instanceof Error ? upsertError.message : String(upsertError)}`)
    }

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

    console.log('[submitCompleteOnboarding] Submission completed successfully')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[submitCompleteOnboarding] Complete onboarding submission failed:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        user_id: data.user_id,
        university_id: data.university_id,
        degree_level: data.degree_level
      }
    })
    return { 
      success: false, 
      error: errorMessage
    }
  }
}
