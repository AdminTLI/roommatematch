import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkQuestionnaireCompletion } from '@/lib/onboarding/validation'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn()
      }))
    }))
  }))
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('Questionnaire Completion Check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return complete when submission exists and all responses present', async () => {
    // Mock submission exists
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'submission-1' },
            error: null
          })
        }))
      }))
    })

    // Mock responses exist for all required keys
    const requiredKeys = Object.keys(require('@/lib/onboarding/validation').questionSchemas)
    const mockResponses = requiredKeys.map(key => ({ question_key: key }))
    
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: mockResponses,
          error: null
        })
      }))
    })

    const result = await checkQuestionnaireCompletion('user-1')
    
    expect(result.isComplete).toBe(true)
    expect(result.hasSubmission).toBe(true)
    expect(result.missingKeys).toHaveLength(0)
    expect(result.responseCount).toBe(requiredKeys.length)
  })

  it('should return incomplete when submission exists but responses missing', async () => {
    // Mock submission exists
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'submission-1' },
            error: null
          })
        }))
      }))
    })

    // Mock only some responses exist
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: [
            { question_key: 'degree_level' },
            { question_key: 'program' }
          ],
          error: null
        })
      }))
    })

    const result = await checkQuestionnaireCompletion('user-1')
    
    expect(result.isComplete).toBe(false)
    expect(result.hasSubmission).toBe(true)
    expect(result.missingKeys.length).toBeGreaterThan(0)
    expect(result.responseCount).toBe(2)
  })

  it('should return incomplete when no submission exists', async () => {
    // Mock no submission
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }))
      }))
    })

    // Mock responses exist
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: [{ question_key: 'degree_level' }],
          error: null
        })
      }))
    })

    const result = await checkQuestionnaireCompletion('user-1')
    
    expect(result.isComplete).toBe(false)
    expect(result.hasSubmission).toBe(false)
    expect(result.responseCount).toBe(1)
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        }))
      }))
    })

    const result = await checkQuestionnaireCompletion('user-1')
    
    expect(result.isComplete).toBe(false)
    expect(result.hasSubmission).toBe(false)
    expect(result.responseCount).toBe(0)
  })
})
