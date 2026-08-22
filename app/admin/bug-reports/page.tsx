import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminBugReportsContent } from './components/admin-bug-reports-content'

export default function AdminBugReportsPage() {
  return (
    <AdminPageWrapper hub="system" title="Bug Reports" description="Triage user-submitted bug reports.">
      <AdminBugReportsContent />
    </AdminPageWrapper>
  )
}
