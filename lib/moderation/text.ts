// Text Moderation and Content Filtering
// This module handles PII detection, link blocking, and content moderation

export interface ModerationResult {
  isAllowed: boolean
  reason?: string
  sanitizedContent?: string
  flags: string[]
}

export interface PIIPattern {
  name: string
  pattern: RegExp
  replacement: string
}

export interface ModerationConfig {
  blockLinks: boolean
  blockPII: boolean
  blockSlurs: boolean
  maxLength: number
  allowedDomains?: string[]
}

// PII detection patterns
export const PII_PATTERNS: PIIPattern[] = [
  {
    name: 'email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    replacement: '[EMAIL REMOVED]'
  },
  {
    name: 'phone_nl',
    pattern: /(\+31|0)[0-9\s\-\(\)]{8,}/gi,
    replacement: '[PHONE REMOVED]'
  },
  {
    name: 'phone_international',
    pattern: /\+[1-9]\d{1,14}/gi,
    replacement: '[PHONE REMOVED]'
  },
  {
    name: 'url',
    pattern: /https?:\/\/[^\s]+/gi,
    replacement: '[URL REMOVED]'
  },
  {
    name: 'ip_address',
    pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/gi,
    replacement: '[IP REMOVED]'
  },
  {
    name: 'postal_code_nl',
    pattern: /\b[1-9][0-9]{3}\s?[A-Z]{2}\b/gi,
    replacement: '[POSTAL CODE REMOVED]'
  },
  {
    name: 'bsn',
    pattern: /\b[0-9]{9}\b/gi,
    replacement: '[BSN REMOVED]'
  },
  {
    name: 'bank_account',
    pattern: /\b(?:NL|BE|DE)[0-9]{2}[A-Z0-9]{4}[0-9]{7}(?:[0-9]{2})?\b/gi,
    replacement: '[BANK ACCOUNT REMOVED]'
  }
]

// Basic slur detection (simplified list for MVP)
export const SLUR_KEYWORDS = [
  // Add appropriate content here - keeping minimal for example
  'spam',
  'scam',
  'fake'
]

// Allowed domains for links (if any)
export const ALLOWED_DOMAINS = [
  'uva.nl',
  'tudelft.nl',
  'eur.nl',
  'student.uva.nl',
  'student.tudelft.nl',
  'student.eur.nl'
]

export const DEFAULT_CONFIG: ModerationConfig = {
  blockLinks: true,
  blockPII: true,
  blockSlurs: true,
  maxLength: 5000,
  allowedDomains: ALLOWED_DOMAINS
}

export class TextModerator {
  private config: ModerationConfig
  private piiPatterns: PIIPattern[]
  private slurKeywords: string[]

  constructor(config: ModerationConfig = DEFAULT_CONFIG) {
    this.config = config
    this.piiPatterns = PII_PATTERNS
    this.slurKeywords = SLUR_KEYWORDS
  }

  /**
   * Moderate text content for safety and compliance
   */
  moderate(content: string): ModerationResult {
    const flags: string[] = []
    let sanitizedContent = content
    let isAllowed = true
    let reason: string | undefined

    // Check length
    if (content.length > this.config.maxLength) {
      isAllowed = false
      reason = `Content exceeds maximum length of ${this.config.maxLength} characters`
      flags.push('length_exceeded')
      return { isAllowed, reason, flags }
    }

    // Check for slurs and inappropriate content
    if (this.config.blockSlurs) {
      const slurCheck = this.checkSlurs(content)
      if (!slurCheck.isAllowed) {
        isAllowed = false
        reason = slurCheck.reason
        flags.push(...slurCheck.flags)
        return { isAllowed, reason, flags }
      }
      flags.push(...slurCheck.flags)
    }

    // Check for links
    if (this.config.blockLinks) {
      const linkCheck = this.checkLinks(content)
      if (!linkCheck.isAllowed) {
        isAllowed = false
        reason = linkCheck.reason
        flags.push(...linkCheck.flags)
        return { isAllowed, reason, flags }
      }
      flags.push(...linkCheck.flags)
    }

    // Check for PII
    if (this.config.blockPII) {
      const piiCheck = this.checkPII(content)
      if (!piiCheck.isAllowed) {
        isAllowed = false
        reason = piiCheck.reason
        flags.push(...piiCheck.flags)
        return { isAllowed, reason, flags }
      }
      flags.push(...piiCheck.flags)
      sanitizedContent = piiCheck.sanitizedContent || content
    }

    return {
      isAllowed,
      reason,
      sanitizedContent,
      flags
    }
  }

  /**
   * Check for inappropriate language and slurs
   */
  private checkSlurs(content: string): ModerationResult {
    const flags: string[] = []
    const lowerContent = content.toLowerCase()

    for (const slur of this.slurKeywords) {
      if (lowerContent.includes(slur.toLowerCase())) {
        flags.push('inappropriate_language')
      }
    }

    if (flags.length > 0) {
      return {
        isAllowed: false,
        reason: 'Content contains inappropriate language',
        flags
      }
    }

    return {
      isAllowed: true,
      flags
    }
  }

  /**
   * Check for links and URLs
   */
  private checkLinks(content: string): ModerationResult {
    const flags: string[] = []
    const urlPattern = /https?:\/\/[^\s]+/gi
    const matches = content.match(urlPattern)

    if (matches && matches.length > 0) {
      flags.push('contains_links')
      
      // Check if any links are to allowed domains
      const hasAllowedLinks = matches.some(url => {
        try {
          const domain = new URL(url).hostname.toLowerCase()
          return this.config.allowedDomains?.some(allowed => 
            domain === allowed.toLowerCase() || domain.endsWith(`.${allowed.toLowerCase()}`)
          )
        } catch {
          return false
        }
      })

      if (!hasAllowedLinks) {
        return {
          isAllowed: false,
          reason: 'Messages cannot contain links for safety reasons',
          flags
        }
      }
    }

    return {
      isAllowed: true,
      flags
    }
  }

  /**
   * Check for personally identifiable information
   */
  private checkPII(content: string): ModerationResult {
    const flags: string[] = []
    let sanitizedContent = content

    for (const pattern of this.piiPatterns) {
      const matches = content.match(pattern.pattern)
      if (matches && matches.length > 0) {
        flags.push(`contains_${pattern.name}`)
        sanitizedContent = sanitizedContent.replace(pattern.pattern, pattern.replacement)
      }
    }

    if (flags.length > 0) {
      return {
        isAllowed: false,
        reason: 'Content contains personal information that cannot be shared',
        sanitizedContent,
        flags
      }
    }

    return {
      isAllowed: true,
      flags
    }
  }

  /**
   * Sanitize content by removing PII while preserving readability
   */
  sanitize(content: string): string {
    let sanitized = content

    for (const pattern of this.piiPatterns) {
      sanitized = sanitized.replace(pattern.pattern, pattern.replacement)
    }

    return sanitized
  }

  /**
   * Check if content needs human review
   */
  needsReview(content: string): boolean {
    const result = this.moderate(content)
    
    // Flag for review if multiple issues detected
    return result.flags.length > 2 || 
           result.flags.includes('inappropriate_language') ||
           result.flags.includes('contains_links')
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Add custom PII pattern
   */
  addPIIPattern(pattern: PIIPattern): void {
    this.piiPatterns.push(pattern)
  }

  /**
   * Add custom slur keyword
   */
  addSlurKeyword(keyword: string): void {
    this.slurKeywords.push(keyword.toLowerCase())
  }
}

// Export singleton instance
export const textModerator = new TextModerator()

// Utility functions
export function moderateMessage(content: string): ModerationResult {
  return textModerator.moderate(content)
}

export function sanitizeMessage(content: string): string {
  return textModerator.sanitize(content)
}

export function needsModerationReview(content: string): boolean {
  return textModerator.needsReview(content)
}

// Pre-defined moderation rules for different content types
export const MODERATION_RULES = {
  profile: {
    blockLinks: true,
    blockPII: true,
    blockSlurs: true,
    maxLength: 1000
  },
  message: {
    blockLinks: true,
    blockPII: true,
    blockSlurs: true,
    maxLength: 1000
  },
  forum_post: {
    blockLinks: true,
    blockPII: true,
    blockSlurs: true,
    maxLength: 5000
  },
  forum_comment: {
    blockLinks: true,
    blockPII: true,
    blockSlurs: true,
    maxLength: 1000
  }
} as const

export function moderateByType(content: string, type: keyof typeof MODERATION_RULES): ModerationResult {
  const rules = MODERATION_RULES[type]
  const moderator = new TextModerator(rules)
  return moderator.moderate(content)
}
