'use client'

import { MobileChatChromeProvider } from '@/components/app/mobile-chat-chrome-context'
import type { ReactNode } from 'react'

/** Wraps /chat so FloatingDock + Domu can hide during an active mobile thread. */
export function ChatRouteChrome({ children }: { children: ReactNode }) {
  return <MobileChatChromeProvider>{children}</MobileChatChromeProvider>
}
