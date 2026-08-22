import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SecurityDashboard from './components/security-dashboard'
import { AdminPageWrapper } from '../components/admin-page-wrapper'

export default async function AdminSecurityPage() {
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
    <AdminPageWrapper hub="system" title="Security Center" description="Authentication events and platform security signals.">
      <SecurityDashboard admin={adminData} />
    </AdminPageWrapper>
  )
}
