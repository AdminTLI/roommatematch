import { describe, expect, it } from 'vitest'
import {
  DELETED_PROFILE_DISPLAY_NAME,
  isAnonymizedDeletedProfile,
  isDeletedPartnerLabel,
} from './deleted-profile'

describe('isAnonymizedDeletedProfile', () => {
  it('detects Deleted User anonymization', () => {
    expect(
      isAnonymizedDeletedProfile({ first_name: 'Deleted', last_name: 'User' }),
    ).toBe(true)
  })

  it('detects Deleted Profile label', () => {
    expect(
      isAnonymizedDeletedProfile({ first_name: 'Deleted', last_name: 'Profile' }),
    ).toBe(true)
  })

  it('detects first name Deleted with empty last name', () => {
    expect(
      isAnonymizedDeletedProfile({ first_name: 'Deleted', last_name: '' }),
    ).toBe(true)
  })

  it('detects is_deleted flag', () => {
    expect(
      isAnonymizedDeletedProfile({
        first_name: 'Ada',
        last_name: 'Lovelace',
        is_deleted: true,
      }),
    ).toBe(true)
  })

  it('detects UUID program anonymization marker', () => {
    expect(
      isAnonymizedDeletedProfile({
        first_name: 'Ada',
        last_name: 'Lovelace',
        program: '4492964e-646b-476b-b5a6-7766dbd46dca',
      }),
    ).toBe(true)
  })

  it('ignores normal and ghost-style User names', () => {
    expect(
      isAnonymizedDeletedProfile({ first_name: 'Ada', last_name: 'Lovelace' }),
    ).toBe(false)
    expect(isAnonymizedDeletedProfile({ first_name: 'User', last_name: '' })).toBe(
      false,
    )
    expect(isAnonymizedDeletedProfile(null)).toBe(false)
  })

  it('exports a stable display name', () => {
    expect(DELETED_PROFILE_DISPLAY_NAME).toBe('Deleted Profile')
  })
})

describe('isDeletedPartnerLabel', () => {
  it('detects sidebar/chat labels for deleted partners', () => {
    expect(isDeletedPartnerLabel('Deleted Profile')).toBe(true)
    expect(isDeletedPartnerLabel('Deleted User')).toBe(true)
    expect(isDeletedPartnerLabel('Deleted')).toBe(true)
    expect(isDeletedPartnerLabel('Ada Lovelace')).toBe(false)
  })
})
