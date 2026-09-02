import { Suspense } from 'react'
import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminUsersContent } from './components/admin-users-content'

export default function AdminUsersPage() {
  return (
    <AdminPageWrapper
      hub="people"
      title="User Management"
      description="Search accounts, manage access, and track registration progress."
      showComplianceStrip
      compliancePurpose="support"
    >
      <Suspense fallback={<div className="text-sm text-slate-600 dark:text-slate-300">Loading users...</div>}>
        <AdminUsersContent />
      </Suspense>
    </AdminPageWrapper>
  )
}
