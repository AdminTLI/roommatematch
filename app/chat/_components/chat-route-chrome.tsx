'use client'

import { MobileChatChromeProvider } from '@/components/app/mobile-chat-chrome-context'
import { useChatVisualViewportHeight } from '@/hooks/use-chat-visual-viewport-height'
import type { ReactNode } from 'react'

/** Wraps /chat so FloatingDock + Domu can hide during an active mobile thread. */
export function ChatRouteChrome({ children }: { children: ReactNode }) {
  useChatVisualViewportHeight()
  return <MobileChatChromeProvider>{children}</MobileChatChromeProvider>
}
