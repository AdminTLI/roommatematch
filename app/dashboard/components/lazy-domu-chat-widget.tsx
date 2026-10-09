'use client'

import dynamic from 'next/dynamic'

/** Defer chat widget JS until after hydration (app INP). */
export const LazyDomuChatWidget = dynamic(
  () =>
    import('./domu-chat-widget').then((m) => ({
      default: m.DomuChatWidget,
    })),
  { ssr: false }
)
