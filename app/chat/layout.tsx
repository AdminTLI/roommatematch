import type { ReactNode } from 'react'
import './chat-page.css'

/** Chat-only CSS stays off the marketing critical path. */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return children
}
