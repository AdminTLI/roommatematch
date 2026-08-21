/**
 * Dev-only preview for the live notification toast redesign.
 * Local: always open. Production: admin only.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import { LiveNotificationPreviewClient } from './LiveNotificationPreviewClient'

export const dynamic = 'force-dynamic'

export default async function LiveNotificationPreviewPage() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV

  if (isProd) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/auth/sign-in?redirect=/dev/live-notification-preview')
    const admin = await isAdmin(user.id)
    if (!admin) redirect('/dashboard')
  }

  return <LiveNotificationPreviewClient />
}
