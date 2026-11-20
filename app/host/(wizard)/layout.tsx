import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getHostProfileForUser } from '@/lib/host/auth'

/** Locked chrome for multi-step host flows (no top nav / bottom dock). */
export default async function HostWizardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  return children
}
