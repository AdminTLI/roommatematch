import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminHousingOverviewContent } from './components/admin-housing-overview-content'

export default function AdminHousingPage() {
  return (
    <AdminPageWrapper
      hub="housing"
      title="Housing overview"
      description="Marketplace supply, demand, funnel health, and decision fairness for intermediary oversight."
      showComplianceStrip
      compliancePurpose="support"
    >
      <AdminHousingOverviewContent />
    </AdminPageWrapper>
  )
}
