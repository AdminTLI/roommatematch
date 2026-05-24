/**
 * Dev-only email preview gallery.
 *
 * Lists every template (Supabase Auth + app-sent) with a live HTML iframe
 * and a "copy raw HTML" action for Supabase paste-in.
 *
 * Production access requires an admin role (so an on-call engineer can
 * inspect what real users see); local dev is always open.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import { PREVIEW_KINDS } from '@/app/api/dev/email-preview/route'
import { EmailPreviewClient } from './EmailPreviewClient'

export const dynamic = 'force-dynamic'

export default async function EmailPreviewPage() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV

  if (isProd) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/sign-in?redirect=/dev/email-preview')
    const admin = await isAdmin(user.id)
    if (!admin) redirect('/dashboard')
  }

  return <EmailPreviewClient kinds={PREVIEW_KINDS} />
}
