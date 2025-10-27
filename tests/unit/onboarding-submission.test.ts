import { describe, it, expect, vi } from 'vitest'
import { upsertProfileAndAcademic } from '@/lib/onboarding/submission'

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
})
