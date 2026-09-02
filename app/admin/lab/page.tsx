import { Suspense } from 'react'
import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminLabContent } from './components/admin-lab-content'

export default function AdminLabPage() {
  return (
    <AdminPageWrapper
      hub="insights"
      title="Domu Lab"
      description="Ranked feature wishes and focus-group pipeline."
    >
      <Suspense fallback={<div className="text-sm text-slate-600 dark:text-slate-300">Loading Domu Lab...</div>}>
        <AdminLabContent />
      </Suspense>
    </AdminPageWrapper>
  )
}
