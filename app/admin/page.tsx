import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminContent } from './components/admin-content'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check if user is an admin
  const { data: adminRecord } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRecord) {
    redirect('/dashboard')
  }

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <AdminContent />
    </AppShell>
  )
}