import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminAuditLogContent } from './components/admin-audit-log-content'

export default function AdminAuditPage() {
  return (
    <AdminPageWrapper
      hub="system"
      title="Audit Log"
      description="GDPR Art. 30 record of admin access to personal data and configuration changes."
      showComplianceStrip
      compliancePurpose="operations"
    >
      <AdminAuditLogContent />
    </AdminPageWrapper>
  )
}
