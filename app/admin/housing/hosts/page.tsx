import { AdminPageWrapper } from '../../components/admin-page-wrapper'
import { AdminHousingHostsContent } from '../components/admin-housing-hosts-content'

export default function AdminHousingHostsPage() {
  return (
    <AdminPageWrapper
      hub="housing"
      title="Hosts"
      description="Landlord and agency directory with listing and decision aggregates."
      showComplianceStrip
      compliancePurpose="support"
    >
      <AdminHousingHostsContent />
    </AdminPageWrapper>
  )
}
