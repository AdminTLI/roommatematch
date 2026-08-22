import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportDashboard } from './components/support-dashboard'
import { AdminPageWrapper } from '../components/admin-page-wrapper'

export default async function AdminSupportPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, role, university_id, permissions')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminData) {
    redirect('/dashboard')
  }

  return (
    <AdminPageWrapper hub="system" title="Support Tickets" description="User support queue and ticket management.">
      <SupportDashboard admin={adminData} />
    </AdminPageWrapper>
  )
}

