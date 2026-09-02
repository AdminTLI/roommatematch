import { Suspense } from 'react'
import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminReportsContent } from './components/admin-reports-content'

export default function AdminReportsPage() {
  return (
    <AdminPageWrapper
      hub="safety"
      title="Safety & Moderation"
      description="Review chat reports, flagged messages, and Lab wish reports."
      showComplianceStrip
      compliancePurpose="safety"
    >
      <Suspense fallback={<div className="text-sm text-slate-600 dark:text-slate-300">Loading reports...</div>}>
        <AdminReportsContent />
      </Suspense>
    </AdminPageWrapper>
  )
}
