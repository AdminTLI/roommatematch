import { describe, it, expect, vi } from 'vitest'
import { upsertProfileAndAcademic, submitCompleteOnboarding } from '@/lib/onboarding/submission'

describe('Onboarding Submission', () => {
  it('should upsert profile and academic records', async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'profile-1' },
              error: null
            }))
          }))
        }))
      }))
    }

    const data = {
      user_id: 'user-1',
      university_id: 'uni-1',
      first_name: 'John',
      degree_level: 'master',
      program_id: 'prog-1',
      campus: 'main-campus'
    }

    await upsertProfileAndAcademic(mockSupabase as any, data)
    
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase.from).toHaveBeenCalledWith('user_academic')
  })

  describe('submitCompleteOnboarding', () => {
    it('should successfully submit complete onboarding data', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: 'profile-1' },
                error: null
              }))
            }))
          }))
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        program_id: 'prog-1',
        program: 'Computer Science',
        campus: 'main-campus',
        languages_daily: ['en', 'nl'],
        study_start_year: 2024,
        undecided_program: false,
        responses: [
          { question_key: 'sleep_start', value: 22 },
          { question_key: 'sleep_end', value: 8 },
          { question_key: 'social_level', value: 7 }
        ]
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // Verify all database operations were called
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_academic')
      expect(mockSupabase.from).toHaveBeenCalledWith('responses')
      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_submissions')
    })

    it('should handle profile upsert failure', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { message: 'Profile upsert failed' }
              }))
            }))
          }))
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        responses: []
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Profile upsert failed')
    })

    it('should handle responses upsert failure', async () => {
      let callCount = 0
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: vi.fn(() => {
            callCount++
            if (callCount === 3) { // responses table call
              return {
                error: { message: 'Responses upsert failed' }
              }
            }
            return {
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { id: 'profile-1' },
                  error: null
                }))
              }))
            }
          })
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        responses: [
          { question_key: 'sleep_start', value: 22 }
        ]
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Responses upsert failed')
    })

    it('should handle submission record creation failure', async () => {
      let callCount = 0
      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: vi.fn(() => {
            callCount++
            if (callCount === 3) { // onboarding_submissions table call (3rd call for empty responses)
              return {
                error: { message: 'Submission record creation failed' }
              }
            }
            return {
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { id: 'profile-1' },
                  error: null
                }))
              }))
            }
          })
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        responses: []
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Submission record creation failed')
    })

    it('should preserve all fields including campus and languages', async () => {
      const mockUpsert = vi.fn()
      const mockSupabase = {
        from: vi.fn((table) => ({
          upsert: mockUpsert.mockImplementation(() => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { id: 'profile-1' },
                    error: null
                  }))
                }))
              }
            }
            return { error: null }
          })
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        program_id: 'prog-1',
        program: 'Computer Science',
        campus: 'science-park-campus',
        languages_daily: ['en', 'nl', 'de'],
        study_start_year: 2024,
        undecided_program: false,
        responses: [
          { question_key: 'campus', value: 'science-park-campus' },
          { question_key: 'languages_daily', value: ['en', 'nl', 'de'] }
        ]
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(true)
      
      // Verify profile upsert was called with campus and languages
      const profileCall = mockUpsert.mock.calls.find(call => 
        call[0] && call[0].campus === 'science-park-campus'
      )
      expect(profileCall).toBeDefined()
      expect(profileCall[0]).toMatchObject({
        campus: 'science-park-campus',
        languages: ['en', 'nl', 'de']
      })
    })

    it('should handle empty responses array', async () => {
      const mockUpsert = vi.fn()
      const mockSupabase = {
        from: vi.fn((table) => ({
          upsert: mockUpsert.mockImplementation(() => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { id: 'profile-1' },
                    error: null
                  }))
                }))
              }
            }
            return { error: null }
          })
        }))
      }

      const data = {
        user_id: 'user-1',
        university_id: 'uni-1',
        first_name: 'John',
        degree_level: 'master',
        responses: []
      }

      const result = await submitCompleteOnboarding(mockSupabase as any, data)
      
      expect(result.success).toBe(true)
      
      // Should call profiles, user_academic, and onboarding_submissions (3 calls)
      // Should not call responses upsert when array is empty
      expect(mockUpsert).toHaveBeenCalledTimes(3)
    })
  })
})
