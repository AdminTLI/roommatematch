/**
 * Dev/admin page to preview and test the /unsubscribe flow.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import { UnsubscribePreviewClient } from './UnsubscribePreviewClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ mock?: string }>
}

export default async function UnsubscribePreviewPage({ searchParams }: PageProps) {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV
  const params = await searchParams
  const startMock = params.mock === '1'

  if (isProd) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/sign-in?redirect=/dev/unsubscribe-preview')
    const admin = await isAdmin(user.id)
    if (!admin) redirect('/dashboard')
  }

  return <UnsubscribePreviewClient startMock={startMock} />
}
