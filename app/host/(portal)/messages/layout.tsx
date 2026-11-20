import '@/app/chat/chat-page.css'
import { ChatPageViewportRoot } from '@/app/chat/_components/chat-page-viewport-root'

/**
 * Host messages mirrors /chat: fixed viewport + messenger chrome.
 * Cancel portal padding so the pane can lock to the viewport.
 */
export default function HostMessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -my-6 flex min-h-0 flex-1 flex-col overflow-hidden sm:-mx-6">
      <ChatPageViewportRoot>{children}</ChatPageViewportRoot>
    </div>
  )
}
