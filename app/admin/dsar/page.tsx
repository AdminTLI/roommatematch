import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminDSARContent } from './components/admin-dsar-content'

export default function AdminDSARPage() {
  return (
    <AdminPageWrapper
      hub="system"
      title="Privacy & DSAR"
      description="Manage data subject access requests within GDPR SLA deadlines."
      showComplianceStrip
      compliancePurpose="operations"
    >
      <AdminDSARContent />
    </AdminPageWrapper>
  )
}
