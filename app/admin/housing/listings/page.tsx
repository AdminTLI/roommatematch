import { Suspense } from 'react'
import { AdminPageWrapper } from '../../components/admin-page-wrapper'
import { AdminHousingListingsContent } from '../components/admin-housing-listings-content'

export default function AdminHousingListingsPage() {
  return (
    <AdminPageWrapper
      hub="housing"
      title="Housing listings"
      description="Review and approve landlord/agency listings before they appear to students."
      showComplianceStrip
      compliancePurpose="support"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <AdminHousingListingsContent />
      </Suspense>
    </AdminPageWrapper>
  )
}
