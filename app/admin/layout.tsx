import { AppShell } from '@/components/app/shell'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './components/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check if user is an admin
  const admin = await createAdminClient()
  const { data: adminRecord } = await admin
    .from('admins')
    .select('role, university_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRecord) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar user={user} adminRole={adminRecord.role} />
      <div className="flex-1 overflow-auto">
        <AppShell 
          user={{
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || 'User',
            avatar: user.user_metadata?.avatar_url
          }}
          hideSidebar={true}
        >
          {children}
        </AppShell>
      </div>
    </div>
  )
}


