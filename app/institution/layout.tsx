import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InstitutionShell } from './components/institution-shell'
import { getInstitutionScopeForUser } from '@/lib/auth/institution'

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/institution/dashboard')
  }

  const { role, institutionId, institutionName } = await getInstitutionScopeForUser(user.id)
  if (!institutionId || role === 'super_admin') {
    redirect('/dashboard?reason=institution_access_denied')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('institution_admin_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Admin'

  return (
    <InstitutionShell
      user={{
        id: user.id,
        email: user.email || '',
        name: displayName,
        avatar: user.user_metadata?.avatar_url,
      }}
      institutionName={institutionName || 'Your institution'}
    >
      {children}
    </InstitutionShell>
  )
}
