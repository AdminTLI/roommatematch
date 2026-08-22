import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminSettingsContent } from './components/admin-settings-content'

export default function AdminSettingsPage() {
  return (
    <AdminPageWrapper
      hub="system"
      title="Platform Settings"
      description="Maintenance mode, registration, and notification controls (super admin only)."
    >
      <AdminSettingsContent />
    </AdminPageWrapper>
  )
}
