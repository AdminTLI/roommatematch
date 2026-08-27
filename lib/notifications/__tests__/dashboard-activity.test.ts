import { describe, expect, it } from 'vitest'
import {
  isAdminModerationNotification,
  isDashboardActivityNotification,
} from '../dashboard-activity'

describe('isDashboardActivityNotification', () => {
  it('includes personal match and message activity', () => {
    expect(
      isDashboardActivityNotification({
        type: 'match_accepted',
        title: 'Match Accepted!',
      })
    ).toBe(true)

    expect(
      isDashboardActivityNotification({
        type: 'chat_message',
        title: 'New message',
      })
    ).toBe(true)
  })

  it('excludes admin_alert flagged-message digests', () => {
    expect(
      isDashboardActivityNotification({
        type: 'admin_alert',
        title: 'Suspicious Message Flagged',
        metadata: { link: '/admin/reports?type=flagged' },
      })
    ).toBe(false)
  })

  it('excludes admin moderation system announcements', () => {
    expect(
      isDashboardActivityNotification({
        type: 'system_announcement',
        title: 'New User Report',
        metadata: { type: 'user_report', link: '/admin/reports' },
      })
    ).toBe(false)

    expect(
      isDashboardActivityNotification({
        type: 'system_announcement',
        title: 'User Blocked',
        metadata: { type: 'user_blocked', link: '/admin/matches?tab=blocklist' },
      })
    ).toBe(false)
  })

  it('keeps non-admin system announcements', () => {
    expect(
      isDashboardActivityNotification({
        type: 'system_announcement',
        title: 'Platform Update',
        metadata: {},
      })
    ).toBe(true)
  })
})

describe('isAdminModerationNotification', () => {
  it('detects admin links even without meta type', () => {
    expect(
      isAdminModerationNotification({
        type: 'system_announcement',
        title: 'Something happened',
        metadata: { link: '/admin/reports' },
      })
    ).toBe(true)
  })
})
