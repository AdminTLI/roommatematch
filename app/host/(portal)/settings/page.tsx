import { HostSettingsContent } from '@/components/host/host-settings-content'
import { createClient } from '@/lib/supabase/server'
import { getHostProfileForUser } from '@/lib/host/auth'
import { resolveHostAvatarUrl } from '@/lib/housing/photos'
import { redirect } from 'next/navigation'

export default async function HostSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  const emailVerified = Boolean(user.email_confirmed_at) || host.email_verified
  const avatarUrl = await resolveHostAvatarUrl(host.avatar_path)

  return (
    <HostSettingsContent
      host={host}
      userEmail={user.email || ''}
      emailVerified={emailVerified}
      avatarUrl={avatarUrl}
    />
  )
}
