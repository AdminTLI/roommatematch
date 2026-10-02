import { describe, expect, it } from 'vitest'
import {
  classifyPersonaInquiryForReuse,
  extractPersonaInquiryStatus,
} from '@/lib/verification/persona-client'

describe('extractPersonaInquiryStatus', () => {
  it('reads nested Persona inquiry status', () => {
    expect(
      extractPersonaInquiryStatus({
        data: { attributes: { status: 'pending' } },
      })
    ).toBe('pending')
  })

  it('returns null for malformed payloads', () => {
    expect(extractPersonaInquiryStatus(null)).toBeNull()
    expect(extractPersonaInquiryStatus({})).toBeNull()
  })
})

describe('classifyPersonaInquiryForReuse', () => {
  it('resumes incomplete inquiries', () => {
    expect(classifyPersonaInquiryForReuse(null)).toBe('resume')
    expect(classifyPersonaInquiryForReuse('created')).toBe('resume')
    expect(classifyPersonaInquiryForReuse('pending')).toBe('resume')
    expect(classifyPersonaInquiryForReuse('expired')).toBe('resume')
  })

  it('maps terminal outcomes', () => {
    expect(classifyPersonaInquiryForReuse('approved')).toBe('approved')
    expect(classifyPersonaInquiryForReuse('completed')).toBe('approved')
    expect(classifyPersonaInquiryForReuse('failed')).toBe('rejected')
    expect(classifyPersonaInquiryForReuse('declined')).toBe('rejected')
    expect(classifyPersonaInquiryForReuse('needs_review')).toBe('awaiting_review')
    expect(classifyPersonaInquiryForReuse('redacted')).toBe('create_new')
  })
})
