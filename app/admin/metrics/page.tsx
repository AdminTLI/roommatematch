import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth/roles'
import { AdminMetricsContent } from './components/admin-metrics-content'
import { AdminPageWrapper } from '../components/admin-page-wrapper'

export default async function AdminMetricsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const userRole = await getUserRole(user.id)
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    redirect('/dashboard')
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('role, university_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    redirect('/dashboard')
  }

  const isPlatformSuper = adminRow.role === 'super_admin' || userRole === 'super_admin'
  const initialUniversityId = (adminRow.university_id as string | null) ?? null

  if (!isPlatformSuper && !initialUniversityId) {
    redirect('/dashboard')
  }

  let initialUniversityName: string | null = null
  if (initialUniversityId) {
    const { data: uniRow } = await supabase
      .from('universities')
      .select('name')
      .eq('id', initialUniversityId)
      .maybeSingle()
    initialUniversityName = (uniRow?.name as string | undefined) ?? null
  }

  return (
    <AdminPageWrapper
      hub="insights"
      title="Institutional Metrics"
      description="A high-level snapshot of the selected institution. Use the tabs to explore each area in detail."
    >
      <AdminMetricsContent
        isPlatformSuper={isPlatformSuper}
        initialUniversityId={initialUniversityId}
        initialUniversityName={initialUniversityName}
      />
    </AdminPageWrapper>
  )
}
