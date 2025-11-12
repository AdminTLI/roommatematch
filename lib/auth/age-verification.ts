/**
 * Age Verification
 * 
 * Handles age verification for GDPR compliance (minimum age: 17)
 */

export const MINIMUM_AGE = 17

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Check if user meets minimum age requirement
 */
export function meetsMinimumAge(dateOfBirth: Date | string | null | undefined): boolean {
  if (!dateOfBirth) {
    return false
  }

  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  
  if (isNaN(birthDate.getTime())) {
    return false
  }

  const age = calculateAge(birthDate)
  return age >= MINIMUM_AGE
}

/**
 * Validate date of birth format and age
 */
export function validateDateOfBirth(dateOfBirth: string): {
  valid: boolean
  age?: number
  error?: string
} {
  const date = new Date(dateOfBirth)
  
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format'
    }
  }

  // Check if date is in the future
  if (date > new Date()) {
    return {
      valid: false,
      error: 'Date of birth cannot be in the future'
    }
  }

  // Check if date is too far in the past (reasonable limit: 120 years)
  const oneHundredTwentyYearsAgo = new Date()
  oneHundredTwentyYearsAgo.setFullYear(oneHundredTwentyYearsAgo.getFullYear() - 120)
  
  if (date < oneHundredTwentyYearsAgo) {
    return {
      valid: false,
      error: 'Date of birth is not valid'
    }
  }

  const age = calculateAge(date)
  
  if (age < MINIMUM_AGE) {
    return {
      valid: false,
      age,
      error: `You must be at least ${MINIMUM_AGE} years old to use this platform`
    }
  }

  return {
    valid: true,
    age
  }
}

/**
 * Format date of birth for display (YYYY-MM-DD)
 */
export function formatDateOfBirth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get age verification error message
 */
export function getAgeVerificationError(age?: number): string {
  if (age !== undefined && age < MINIMUM_AGE) {
    return `You must be at least ${MINIMUM_AGE} years old to use this platform. You are currently ${age} years old.`
  }
  return `You must be at least ${MINIMUM_AGE} years old to use this platform.`
}

