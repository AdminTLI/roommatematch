/**
 * Month-aware study year calculation helper
 * Calculates accurate academic year based on start/graduation months and years
 * Academic year starts in September (month 9)
 */

export interface StudyYearCalculationParams {
  studyStartYear: number
  studyStartMonth: number | null
  expectedGraduationYear: number
  graduationMonth: number | null
  institutionType: 'wo' | 'hbo'
  degreeLevel: 'bachelor' | 'master' | 'premaster'
}

/**
 * Calculate current study year using month-aware academic year logic
 * 
 * Academic year logic:
 * - Academic year starts in September (month 9)
 * - If current month >= 9, we're in the next academic year
 * - Study year = currentAcademicYear - startAcademicYear + 1
 * 
 * @param params Study year calculation parameters
 * @returns Numeric study year (1-4) or null for masters/premasters
 */
export function calculateStudyYearWithMonths(
  params: StudyYearCalculationParams
): number | null {
  const { 
    studyStartYear, 
    studyStartMonth, 
    expectedGraduationYear, 
    graduationMonth,
    institutionType,
    degreeLevel 
  } = params

  // Masters and premasters don't have numeric study years
  if (degreeLevel === 'master' || degreeLevel === 'premaster') {
    return null
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Calculate academic year offsets
  // Academic year starts in September (month 9)
  // If month >= 9, we're in the next academic year
  const currentAcademicYear = currentYear + (currentMonth >= 9 ? 1 : 0)

  // Use month-aware calculation if both months are provided
  if (studyStartMonth !== null && graduationMonth !== null) {
    const startAcademicYear = studyStartYear + (studyStartMonth >= 9 ? 1 : 0)
    const graduationAcademicYear = expectedGraduationYear + (graduationMonth >= 9 ? 1 : 0)
    
    // Calculate programme duration
    const duration = graduationAcademicYear - startAcademicYear + 1
    
    // Calculate current year number
    const currentYearNumber = currentAcademicYear - startAcademicYear + 1
    
    // Clamp between 1 and duration
    return Math.max(1, Math.min(currentYearNumber, duration))
  }

  // Fallback: use institution-type defaults
  // This matches the old calculation logic for backward compatibility
  const programDuration = institutionType === 'wo' ? 3 : 4
  const yearsUntilGraduation = expectedGraduationYear - currentYear
  const currentYearNumber = programDuration - yearsUntilGraduation

  // Clamp between 1 and programDuration
  return Math.max(1, Math.min(currentYearNumber, programDuration))
}

/**
 * Get study year status text (for display)
 * Returns formatted string like "Year 1", "Year 2", etc.
 * For masters/premasters, returns appropriate status text
 */
export function getStudyYearStatus(
  params: StudyYearCalculationParams
): string {
  const { degreeLevel } = params

  if (degreeLevel === 'premaster') {
    return 'Pre-Master Student'
  }
  
  if (degreeLevel === 'master') {
    return "Master's Student"
  }

  const studyYear = calculateStudyYearWithMonths(params)
  
  if (studyYear === null) {
    return 'Unknown'
  }

  if (studyYear < 1) {
    return 'Not yet started'
  }

  const { institutionType } = params
  const maxYear = institutionType === 'wo' ? 3 : 4
  
  if (studyYear > maxYear) {
    return 'Graduated'
  }

  return `Year ${studyYear}`
}




