/**
 * Local UI preview for /onboarding/path.
 * Open at http://localhost:3000/dev/onboarding-path — no login required.
 *
 * Works with `pnpm dev` and local `pnpm start`. On Vercel it is admin-only.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import PathSelectionClient from '@/app/onboarding/path/pageClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingPathPreviewPage() {
  const isDeployed = Boolean(process.env.VERCEL || process.env.VERCEL_ENV)

  if (isDeployed) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/auth/sign-in?redirect=/dev/onboarding-path')
    const admin = await isAdmin(user.id)
    if (!admin) redirect('/dashboard')
  }

  return <PathSelectionClient preview />
}
