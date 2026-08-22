import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminVerificationsContent } from './components/admin-verifications-content'

export default function AdminVerificationsPage() {
  return (
    <AdminPageWrapper
      hub="people"
      title="Identity Verifications"
      description="Review pending ID verification submissions."
      showComplianceStrip
      compliancePurpose="support"
    >
      <AdminVerificationsContent />
    </AdminPageWrapper>
  )
}
