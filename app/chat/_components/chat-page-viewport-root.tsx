'use client'

import { useRef, type ReactNode } from 'react'
import { useChatViewportSync } from '@/hooks/use-chat-viewport-sync'

/**
 * Publishes visual viewport CSS vars and sizes the chat column on mobile.
 * See `useChatViewportSync` and chat rules in `globals.css`.
 */
export function ChatPageViewportRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useChatViewportSync(ref)

  return (
    <div
      ref={ref}
      data-chat-page
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
    >
      {children}
    </div>
  )
}
