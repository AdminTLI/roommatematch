/**
 * Input sanitization utilities for security
 * Prevents injection attacks and validates input
 */

/**
 * Sanitize search input for PostgREST/Supabase queries
 * Escapes special characters that could be used for injection
 * 
 * @param input - Raw search input from user
 * @returns Sanitized string safe for use in queries
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Escape PostgREST special characters
  // % and _ are wildcards in ILIKE/LIKE patterns
  // Escape them by replacing with literal versions
  let sanitized = input
    .replace(/%/g, '\\%')  // Escape % wildcard
    .replace(/_/g, '\\_')  // Escape _ wildcard
    .trim()

  // Remove any control characters and normalize whitespace
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // Remove commas and operators that could be used for filter injection
  // Commas separate filters in PostgREST .or() clauses
  // Operators like .eq., .neq., .gt., etc. could inject filters
  sanitized = sanitized
    .replace(/,/g, '')  // Remove commas to prevent filter injection
    .replace(/\.(eq|neq|gt|gte|lt|lte|like|ilike|is|in|cs|cd|ov|sl|sr|nxr|nxl|adj)\./gi, '')  // Remove PostgREST operators

  return sanitized
}

/**
 * Validate search input length
 * 
 * @param input - Search input to validate
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns True if valid, false otherwise
 */
export function validateSearchInputLength(input: string, maxLength: number = 100): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }
  return input.length <= maxLength
}

