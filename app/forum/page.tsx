import { Suspense } from 'react'
import { DomuLabInterface } from './components/domu-lab-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { isDomuLabEnabled } from '@/lib/feature-flags'

export default async function ForumPage() {
  if (!isDomuLabEnabled()) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.verification_status !== 'verified') {
    redirect('/verify')
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 'User',
        avatar: user.user_metadata?.avatar_url,
      }}
    >
      <Suspense fallback={<div className="max-w-4xl mx-auto animate-pulse h-96 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />}>
        <DomuLabInterface />
      </Suspense>
    </AppShell>
  )
}
