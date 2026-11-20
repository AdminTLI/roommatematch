import { describe, expect, it } from 'vitest'
import { hrefForHousingUpdate, hrefForNotification } from '@/lib/notifications/live-toast'
import type { Notification } from '@/lib/notifications/types'

function notif(
  partial: Partial<Notification> & Pick<Notification, 'title' | 'type'>
): Notification {
  return {
    id: 'n1',
    user_id: 'u1',
    message: '',
    metadata: {},
    is_read: false,
    created_at: '',
    updated_at: '',
    ...partial,
  }
}

describe('hrefForHousingUpdate', () => {
  it('routes host viewing requests to /host/viewings', () => {
    expect(
      hrefForHousingUpdate({
        title: 'Viewing requested',
        metadata: { listing_id: 'l1', viewing_id: 'v1' },
      })
    ).toBe('/host/viewings')
  })

  it('prefers explicit link metadata', () => {
    expect(
      hrefForHousingUpdate({
        title: 'Viewing requested',
        metadata: { link: '/host/viewings', audience: 'host' },
      })
    ).toBe('/host/viewings')
  })

  it('routes host new applications without listing to /host/applications', () => {
    expect(
      hrefForHousingUpdate({
        title: 'New application',
        metadata: { application_id: 'a1', anonymous: true },
      })
    ).toBe('/host/applications')
  })

  it('routes host new applications with listing_id to the listing', () => {
    expect(
      hrefForHousingUpdate({
        title: 'New application',
        metadata: { application_id: 'a1', listing_id: 'l1', anonymous: true },
      })
    ).toBe('/host/listings/l1')
  })

  it('routes co-applicant included notifications to the student listing', () => {
    expect(
      hrefForHousingUpdate({
        title: 'Included in an application',
        metadata: {
          audience: 'student',
          listing_id: 'l1',
          applied_on_behalf: true,
        },
      })
    ).toBe('/housing/l1')
  })

  it('routes host offer accepted to /host/applications', () => {
    expect(
      hrefForHousingUpdate({
        title: 'Offer accepted',
        metadata: { application_id: 'a1' },
      })
    ).toBe('/host/applications')
  })

  it('routes student viewing updates to /housing/viewings', () => {
    expect(
      hrefForHousingUpdate({
        title: 'Viewing invite',
        metadata: { audience: 'student', listing_id: 'l1', viewing_id: 'v1' },
      })
    ).toBe('/housing/viewings')
  })

  it('uses hrefForNotification for housing_update', () => {
    expect(
      hrefForNotification(
        notif({
          type: 'housing_update',
          title: 'Viewing requested',
          metadata: { viewing_id: 'v1' },
        })
      )
    ).toBe('/host/viewings')
  })
})
