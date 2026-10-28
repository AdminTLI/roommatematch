import { describe, expect, it } from 'vitest'
import {
  isDiscoverableSuggestion,
  isPendingForUser,
  isSuggestedForUser,
} from './suggestion-tabs'

const userA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const userB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

describe('suggestion tab helpers', () => {
  it('keeps one-sided accepts out of Suggested for the acceptor', () => {
    const suggestion = {
      status: 'accepted',
      acceptedBy: [userA],
      memberIds: [userA, userB],
    }
    expect(isSuggestedForUser(suggestion, userA)).toBe(false)
    expect(isPendingForUser(suggestion, userA)).toBe(true)
    expect(isSuggestedForUser(suggestion, userB)).toBe(true)
  })

  it('still shows pending suggestions the user has not accepted', () => {
    const suggestion = {
      status: 'pending',
      acceptedBy: [],
      memberIds: [userA, userB],
    }
    expect(isSuggestedForUser(suggestion, userA)).toBe(true)
    expect(isDiscoverableSuggestion(suggestion, userA, new Set())).toBe(true)
  })

  it('hides discoverable cards when a 1:1 chat already exists', () => {
    const suggestion = {
      status: 'pending',
      acceptedBy: [],
      memberIds: [userA, userB],
    }
    expect(
      isDiscoverableSuggestion(suggestion, userA, new Set([userB]))
    ).toBe(false)
  })
})
