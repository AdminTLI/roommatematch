import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportDashboard } from './components/support-dashboard'

export default async function AdminSupportPage() {
  const supabase = await createClient()
  
  // Force refresh the user session to get latest data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, role, university_id, permissions')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminData) {
    redirect('/dashboard')
  }

  return (
    <SupportDashboard admin={adminData} />
  )
}

