/**
 * Shared helpers for age verification on both client and server.
 */

export const MINIMUM_AGE = 17
const DEFAULT_MIN_AGE = MINIMUM_AGE

export type AgeValidationReason = 'missing' | 'invalid' | 'future' | 'underage'

export type AgeValidationResult = {
  valid: boolean
  age?: number | null
  error?: string
  reason?: AgeValidationReason
}

/**
 * Normalize a date input into YYYY-MM-DD (no time component).
 */
export function normalizeDateInput(value?: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  // Force UTC to avoid TZ off-by-one issues when stringifying
  const iso = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
  return iso.toISOString().split('T')[0]
}

/**
 * Calculate age in full years from a date string.
 */
export function calculateAge(dateOfBirth: string | Date): number | null {
  const normalized = typeof dateOfBirth === 'string' ? normalizeDateInput(dateOfBirth) : normalizeDateInput(dateOfBirth?.toISOString())
  if (!normalized) return null

  const [year, month, day] = normalized.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - year

  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1
  }

  return age
}

/**
 * Default error message for age verification failures.
 */
export function getAgeVerificationError(age?: number | null, minAge: number = DEFAULT_MIN_AGE): string {
  if (age !== undefined && age !== null && age < minAge) {
    return `You must be at least ${minAge} years old to use this platform.`
  }
  return 'Please enter a valid date of birth.'
}

/**
 * Validate a date of birth against formatting and minimum age requirements.
 */
export function validateDateOfBirth(
  value: string,
  minAge: number = DEFAULT_MIN_AGE
): AgeValidationResult {
  if (!value) {
    return { valid: false, error: 'Date of birth is required', reason: 'missing' }
  }

  const normalized = normalizeDateInput(value)
  if (!normalized) {
    return { valid: false, error: 'Enter a valid date of birth', reason: 'invalid' }
  }

  const dobDate = new Date(normalized)
  const today = new Date()
  if (dobDate > today) {
    return { valid: false, error: 'Date of birth cannot be in the future', reason: 'future' }
  }

  const age = calculateAge(normalized)
  if (age === null) {
    return { valid: false, error: 'Enter a valid date of birth', reason: 'invalid' }
  }

  if (age < minAge) {
    return { valid: false, age, error: getAgeVerificationError(age, minAge), reason: 'underage' }
  }

  return { valid: true, age }
}

/**
 * Check if user meets minimum age requirement
 */
export function meetsMinimumAge(dateOfBirth: Date | string | null | undefined, minAge: number = DEFAULT_MIN_AGE): boolean {
  if (!dateOfBirth) {
    return false
  }

  const age = calculateAge(dateOfBirth)
  if (age === null) return false
  return age >= minAge
}

/**
 * Format date of birth for display (YYYY-MM-DD)
 */
export function formatDateOfBirth(date: Date | string): string {
  const normalized = normalizeDateInput(typeof date === 'string' ? date : date.toISOString())
  if (!normalized) {
    return ''
  }
  return normalized
}

