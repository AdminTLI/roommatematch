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
      <AdminUsersContent />
    </AdminPageWrapper>
  )
}
