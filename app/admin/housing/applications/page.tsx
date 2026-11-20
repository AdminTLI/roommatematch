import { Suspense } from 'react'
import { AdminPageWrapper } from '../../components/admin-page-wrapper'
import { AdminHousingApplicationsContent } from '../components/admin-housing-applications-content'

export default function AdminHousingApplicationsPage() {
  return (
    <AdminPageWrapper
      hub="housing"
      title="Applications"
      description="Cross-listing pipeline oversight. Prefer anonymous labels; reveal IDs only for support."
      showComplianceStrip
      compliancePurpose="support"
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <AdminHousingApplicationsContent />
      </Suspense>
    </AdminPageWrapper>
  )
}
