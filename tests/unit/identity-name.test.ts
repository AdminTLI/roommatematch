import { describe, expect, it } from 'vitest'
import {
  emailLocalPart,
  isPlaceholderFirstName,
  resolveAuthIdentityName,
  resolveStoredProfileName,
} from '@/lib/auth/identity-name'
import { extractSubmissionDataFromIntro } from '@/lib/onboarding/submission'
import type { User } from '@supabase/supabase-js'

function authUser(overrides: Partial<User> & { user_metadata?: Record<string, unknown> }): User {
  return {
    id: 'user-1',
    email: 'abcdef@gmail.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as User
}

describe('identity name resolution', () => {
  it('reads the local part of an email', () => {
    expect(emailLocalPart('abcdef@gmail.com')).toBe('abcdef')
    expect(emailLocalPart('  Sarah.J@uva.nl ')).toBe('Sarah.J')
  })

  it('treats the email local part as a placeholder first name', () => {
    expect(isPlaceholderFirstName('abcdef', 'abcdef@gmail.com')).toBe(true)
    expect(isPlaceholderFirstName('ABCDEF', 'abcdef@gmail.com')).toBe(true)
    expect(isPlaceholderFirstName('Sarah', 'abcdef@gmail.com')).toBe(false)
    expect(isPlaceholderFirstName('User', 'abcdef@gmail.com')).toBe(true)
  })

  it('prefers sign-up first_name / last_name over full_name and never uses the email local part', () => {
    const resolved = resolveAuthIdentityName({
      email: 'abcdef@gmail.com',
      user_metadata: {
        first_name: 'Sarah',
        last_name: 'Chen',
        full_name: 'abcdef',
      },
    })

    expect(resolved).toEqual({
      firstName: 'Sarah',
      lastName: 'Chen',
      displayName: 'Sarah Chen',
    })
  })

  it('falls back to full_name when first_name was not stored', () => {
    const resolved = resolveAuthIdentityName({
      email: 'abcdef@gmail.com',
      user_metadata: { full_name: 'Sarah Chen' },
    })

    expect(resolved.firstName).toBe('Sarah')
    expect(resolved.lastName).toBe('Chen')
  })

  it('does not invent a first name from the email address', () => {
    const resolved = resolveAuthIdentityName({
      email: 'abcdef@gmail.com',
      user_metadata: {},
    })

    expect(resolved.firstName).toBeNull()
    expect(resolved.displayName).toBe('User')
  })

  it('replaces a stored email-local-part first name with the sign-up name', () => {
    const resolved = resolveStoredProfileName(
      { first_name: 'abcdef', last_name: null },
      {
        email: 'abcdef@gmail.com',
        user_metadata: { first_name: 'Sarah', last_name: 'Chen' },
      }
    )

    expect(resolved.firstName).toBe('Sarah')
    expect(resolved.lastName).toBe('Chen')
    expect(resolved.displayName).toBe('Sarah Chen')
  })

  it('keeps a real stored first name', () => {
    const resolved = resolveStoredProfileName(
      { first_name: 'Sarah', last_name: 'Chen' },
      {
        email: 'abcdef@gmail.com',
        user_metadata: { first_name: 'Other' },
      }
    )

    expect(resolved.firstName).toBe('Sarah')
    expect(resolved.lastName).toBe('Chen')
  })
})

describe('extractSubmissionDataFromIntro name', () => {
  it('uses sign-up first_name instead of the email local part', () => {
    const data = extractSubmissionDataFromIntro(
      [
        { itemId: 'university_id', value: '11111111-1111-1111-1111-111111111111' },
        { itemId: 'degree_level', value: 'bachelor' },
        { itemId: 'study_start_year', value: '2024' },
      ],
      authUser({
        email: 'abcdef@gmail.com',
        user_metadata: { first_name: 'Sarah', last_name: 'Chen' },
      })
    )

    expect(data.first_name).toBe('Sarah')
    expect(data.last_name).toBe('Chen')
  })

  it('does not fall back to the email username when sign-up names are missing', () => {
    const data = extractSubmissionDataFromIntro(
      [
        { itemId: 'university_id', value: '11111111-1111-1111-1111-111111111111' },
        { itemId: 'degree_level', value: 'bachelor' },
        { itemId: 'study_start_year', value: '2024' },
      ],
      authUser({ email: 'abcdef@gmail.com', user_metadata: {} })
    )

    expect(data.first_name).toBe('User')
    expect(data.last_name).toBeUndefined()
  })
})
