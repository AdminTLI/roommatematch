/**
 * Content filtering utilities for chat messages
 * Detects links, email addresses, phone numbers, and suspicious content
 */

/**
 * Enhanced URL detection - matches various URL patterns
 */
export function containsLinks(text: string): boolean {
  // Match http://, https://, www., and domain patterns
  // Also matches URLs without protocol (e.g., "example.com", "subdomain.example.com")
  const urlPatterns = [
    /https?:\/\/[^\s]+/gi, // http:// or https:// URLs
    /www\.[^\s]+/gi, // www. URLs
    /[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/gi, // Domain patterns
  ]
  
  return urlPatterns.some(pattern => pattern.test(text))
}

/**
 * Email address detection
 */
export function containsEmail(text: string): boolean {
  // Comprehensive email regex pattern
  // Matches: user@domain.com, user.name@domain.co.uk, etc.
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
  return emailPattern.test(text)
}

/**
 * Phone number detection - matches various phone number formats
 */
export function containsPhoneNumber(text: string): boolean {
  // Match various phone number formats:
  // - International: +1 234 567 8900, +31 6 12345678
  // - US format: (123) 456-7890, 123-456-7890, 123.456.7890
  // - European: 06 12345678, +31612345678
  // - Generic: digits with spaces, dashes, parentheses, dots
  const phonePatterns = [
    /\+?\d{1,4}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g, // International formats
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, // US format
    /\d{2}[\s.-]?\d{6,}/g, // European formats
    /\d{10,}/g, // Long sequences of digits (10+)
  ]
  
  // Check if any pattern matches
  const hasPhonePattern = phonePatterns.some(pattern => {
    const matches = text.match(pattern)
    if (!matches) return false
    // Filter out false positives (years, IDs, etc.)
    return matches.some(match => {
      const digitsOnly = match.replace(/\D/g, '')
      // Phone numbers typically have 10-15 digits
      return digitsOnly.length >= 10 && digitsOnly.length <= 15
    })
  })
  
  return hasPhonePattern
}

/**
 * Suspicious content detection
 * Checks for profanity, spam patterns, and suspicious keywords
 */
export function containsSuspiciousContent(text: string): { flagged: boolean; reason: string } {
  const lowerText = text.toLowerCase()
  
  // Common profanity words (basic list - can be expanded)
  const profanityPatterns = [
    /\b(fuck|shit|damn|bitch|asshole|bastard|cunt)\w*/gi,
    // Add more patterns as needed
  ]
  
  // Spam patterns
  const spamPatterns = [
    /(click here|buy now|limited time|act now|urgent|guaranteed|free money|make money fast)/gi,
    /(bitcoin|crypto|investment opportunity|get rich quick)/gi,
    /(viagra|cialis|pharmacy|pills|medication)/gi, // Pharmaceutical spam
    /(lottery|winner|prize|claim your)/gi,
  ]
  
  // Suspicious keywords that might indicate scams or inappropriate content
  const suspiciousKeywords = [
    /(meet me|send me|give me|your number|your email|your address|your location)/gi,
    /(nude|naked|sex|porn|xxx|adult)/gi,
    /(kill|die|suicide|harm|violence|threat)/gi,
  ]
  
  // Check for profanity
  for (const pattern of profanityPatterns) {
    if (pattern.test(lowerText)) {
      return { flagged: true, reason: 'profanity' }
    }
  }
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(lowerText)) {
      return { flagged: true, reason: 'spam' }
    }
  }
  
  // Check for suspicious keywords (less strict - might be false positives)
  let suspiciousCount = 0
  for (const pattern of suspiciousKeywords) {
    if (pattern.test(lowerText)) {
      suspiciousCount++
    }
  }
  
  // Flag if multiple suspicious keywords found
  if (suspiciousCount >= 2) {
    return { flagged: true, reason: 'suspicious_content' }
  }
  
  // Check for excessive capitalization (spam indicator)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.5 && text.length > 20) {
    return { flagged: true, reason: 'excessive_caps' }
  }
  
  // Check for excessive repetition (spam indicator)
  const words = text.split(/\s+/)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    return { flagged: true, reason: 'repetitive_content' }
  }
  
  return { flagged: false, reason: '' }
}

/**
 * Combined content filter
 * Returns filtered text and list of violations
 */
export function filterContent(text: string): { 
  filtered: string; 
  violations: string[];
  hasLinks: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  suspicious: { flagged: boolean; reason: string };
} {
  const violations: string[] = []
  let filtered = text
  
  const hasLinks = containsLinks(text)
  const hasEmail = containsEmail(text)
  const hasPhone = containsPhoneNumber(text)
  const suspicious = containsSuspiciousContent(text)
  
  if (hasLinks) {
    violations.push('links')
  }
  
  if (hasEmail) {
    violations.push('email')
  }
  
  if (hasPhone) {
    violations.push('phone')
  }
  
  if (suspicious.flagged) {
    violations.push(`suspicious:${suspicious.reason}`)
  }
  
  return {
    filtered,
    violations,
    hasLinks,
    hasEmail,
    hasPhone,
    suspicious
  }
}

/**
 * Get user-friendly error message for violations
 */
export function getViolationErrorMessage(violations: string[]): string {
  if (violations.length === 0) return ''
  
  const messages: string[] = []
  
  if (violations.includes('links')) {
    messages.push('Links are not allowed in messages for safety reasons.')
  }
  
  if (violations.includes('email')) {
    messages.push('Email addresses cannot be shared in messages.')
  }
  
  if (violations.includes('phone')) {
    messages.push('Phone numbers cannot be shared in messages.')
  }
  
  if (violations.some(v => v.startsWith('suspicious:'))) {
    const suspiciousReasons = violations
      .filter(v => v.startsWith('suspicious:'))
      .map(v => v.replace('suspicious:', ''))
    
    if (suspiciousReasons.length > 0) {
      messages.push('Your message contains content that may be inappropriate and has been flagged for review.')
    }
  }
  
  return messages.join(' ')
}
