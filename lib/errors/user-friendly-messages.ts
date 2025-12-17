/**
 * User-friendly error message mapping
 * Maps technical error messages to user-friendly ones
 */

export function getUserFriendlyError(error: Error | string | unknown): string {
  const errorStr = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : String(error)
  
  const errorLower = errorStr.toLowerCase()
  
  // Authentication errors
  if (errorLower.includes('unauthorized') || errorLower.includes('authentication required')) {
    return 'Please sign in to continue.'
  }
  
  if (errorLower.includes('email not confirmed') || errorLower.includes('email verification')) {
    return 'Please verify your email address to continue.'
  }
  
  // Chat errors
  if (errorLower.includes('failed to verify chat membership') || errorLower.includes('chat membership')) {
    return 'Unable to send message. Please try again.'
  }
  
  if (errorLower.includes('too many requests') || errorLower.includes('rate limit')) {
    return 'You\'re sending messages too quickly. Please wait a moment and try again.'
  }
  
  // Network errors
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
    return 'Connection error. Please check your internet and try again.'
  }
  
  // Database errors
  if (errorLower.includes('database') || errorLower.includes('query') || errorLower.includes('sql')) {
    return 'A temporary error occurred. Please try again in a moment.'
  }
  
  // Matching errors
  if (errorLower.includes('match') && errorLower.includes('not found')) {
    return 'Match not found. It may have been removed or expired.'
  }
  
  // Validation errors
  if (errorLower.includes('validation') || errorLower.includes('invalid')) {
    return 'Please check your input and try again.'
  }
  
  // Permission errors
  if (errorLower.includes('forbidden') || errorLower.includes('permission') || errorLower.includes('access denied')) {
    return 'You don\'t have permission to perform this action.'
  }
  
  // Not found errors
  if (errorLower.includes('not found') || errorLower.includes('404')) {
    return 'The requested item could not be found.'
  }
  
  // Server errors
  if (errorLower.includes('500') || errorLower.includes('internal server error')) {
    return 'A server error occurred. Please try again later.'
  }
  
  // Default fallback
  return 'Something went wrong. Please try again.'
}

/**
 * Check if an error should be logged (technical errors)
 */
export function shouldLogError(error: Error | string | unknown): boolean {
  const errorStr = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : String(error)
  
  // Don't log user-friendly errors (they're already mapped)
  // Log technical errors for debugging
  return !errorStr.includes('Please') && !errorStr.includes('try again')
}










