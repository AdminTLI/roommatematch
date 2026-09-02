import { createAdminClient } from '@/lib/supabase/server'
import { createNotificationsForUsers } from '@/lib/notifications/create'
import { canSendLifecycleEmail } from '@/lib/email/onboarding-sequences'
import { sendEmail } from '@/lib/email/workflows'
import { renderEmailLayout, renderButton, escapeHtml } from '@/lib/email/layout'
import { URLS, buildUnsubscribeUrl } from '@/lib/email/brand'
import { createUnsubscribeToken } from '@/lib/email/unsubscribe-token'
import { getUserEmail } from '@/lib/lab/auth'
import { safeLogger } from '@/lib/utils/logger'

interface ShippedWishRow {
  id: string
  user_id: string
  title: string
  shipped_notified_at: string | null
}

/**
 * Idempotent close-the-loop when a wish transitions to shipped.
 */
export async function handleLabWishShipped(
  wish: ShippedWishRow
): Promise<void> {
  if (wish.shipped_notified_at) {
    return
  }

  const admin = createAdminClient()

  const { data: voters } = await admin
    .from('lab_wish_votes')
    .select('user_id')
    .eq('wish_id', wish.id)

  const voterIds = [...new Set((voters ?? []).map(v => v.user_id))]
  const notifyUserIds = [...new Set([wish.user_id, ...voterIds])]

  try {
    await createNotificationsForUsers(
      notifyUserIds,
      'lab_wish_shipped',
      'A wish you cared about shipped',
      `"${wish.title}" is now live on Domu Match.`,
      { wish_id: wish.id, href: '/forum' }
    )
  } catch (error) {
    safeLogger.error('[DomuLab] Failed to create shipped notifications', {
      error,
      wishId: wish.id,
    })
  }

  await admin.from('lab_co_creator_badges').upsert(
    {
      user_id: wish.user_id,
      wish_id: wish.id,
      wish_title: wish.title,
      awarded_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  for (const userId of notifyUserIds) {
    const email = await getUserEmail(userId)
    if (!email) continue
    const allowed = await canSendLifecycleEmail(userId)
    if (!allowed) continue

    const safeTitle = escapeHtml(wish.title)
    let unsubscribeUrl: string | undefined
    try {
      unsubscribeUrl = buildUnsubscribeUrl(createUnsubscribeToken(userId))
    } catch {
      unsubscribeUrl = undefined
    }

    const html = renderEmailLayout({
      preheader: `"${wish.title}" is now live on Domu Match.`,
      title: 'A wish you cared about shipped',
      bodyHtml: `<p>Good news — <strong>${safeTitle}</strong> is now live on Domu Match.</p>${renderButton('See Domu Lab', `${URLS.home}/forum`)}`,
      recipientEmail: email,
      includeUnsubscribe: true,
      unsubscribeUrl,
    })

    await sendEmail({
      to: email,
      subject: `Shipped: ${wish.title}`,
      html,
      text: `Good news — "${wish.title}" is now live on Domu Match. Visit ${URLS.home}/forum`,
    })
  }

  await admin
    .from('lab_wishes')
    .update({ shipped_notified_at: new Date().toISOString() })
    .eq('id', wish.id)
}
