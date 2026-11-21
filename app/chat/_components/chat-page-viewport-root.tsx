'use client'

import { useRef, type ReactNode } from 'react'
import { useChatViewportSync } from '@/hooks/use-chat-viewport-sync'

/**
 * Publishes visual viewport CSS vars and sizes the chat column on mobile.
 * List mode keeps html/body on 100svh (avoids Topbar/Search clipping) and sizes
 * this column; open threads use `--vv-height` / `--vv-top` for the composer.
 * See `useChatViewportSync` and chat rules in `chat-page.css`.
 * (viewport-sync-v5)
 */
export function ChatPageViewportRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useChatViewportSync(ref)

  return (
    <div
      ref={ref}
      data-chat-page
      data-chat-viewport="v5"
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden"
    >
      {children}
    </div>
  )
}
