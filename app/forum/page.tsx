import { ForumInterface } from './components/forum-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check if user is verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.verification_status !== 'verified') {
    redirect('/verify')
  }

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <ForumInterface user={user} />
    </AppShell>
  )
}
