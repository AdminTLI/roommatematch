import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminReportsContent } from './components/admin-reports-content'

export default function AdminReportsPage() {
  return (
    <AdminPageWrapper
      hub="safety"
      title="Safety & Moderation"
      description="Review user reports and automatically flagged messages."
      showComplianceStrip
      compliancePurpose="safety"
    >
      <AdminReportsContent />
    </AdminPageWrapper>
  )
}
