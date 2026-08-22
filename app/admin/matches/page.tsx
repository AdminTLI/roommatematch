import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminMatchesContent } from './components/admin-matches-content'

export default function AdminMatchesPage() {
  return (
    <AdminPageWrapper hub="platform" title="Matches" description="Overview of platform match activity.">
      <AdminMatchesContent />
    </AdminPageWrapper>
  )
}
