'use client'

import type { ReactNode } from 'react'

/**
 * Kept for call-site compatibility. Mobile chat chrome context now lives on
 * AppShell so FloatingDock can hide during an active mobile thread (including
 * /host/messages).
 */
export function ChatRouteChrome({ children }: { children: ReactNode }) {
  return <>{children}</>
}
