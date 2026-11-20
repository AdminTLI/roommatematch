import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getHostProfileForUser } from '@/lib/host/auth'

export default async function HostPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || host.display_name || 'Host',
        avatar: user.user_metadata?.avatar_url,
      }}
      context="host"
      showQuestionnairePrompt={false}
      hideVerificationBanner
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute top-40 right-1/5 h-64 w-64 rounded-full bg-rose-400/15 blur-3xl" />
        </div>
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-6 pb-28 sm:px-6">
          {children}
        </div>
      </div>
    </AppShell>
  )
}
