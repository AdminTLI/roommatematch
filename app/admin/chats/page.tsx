import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { AdminChatsContent } from './components/admin-chats-content'

export default function AdminChatsPage() {
  return (
    <AdminPageWrapper
      hub="platform"
      title="Chat Moderation"
      description="Review and export chat conversations for safety investigations."
      showComplianceStrip
      compliancePurpose="safety"
    >
      <AdminChatsContent />
    </AdminPageWrapper>
  )
}
