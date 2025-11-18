'use client'

import dynamic from 'next/dynamic'

// Only load React Query DevTools in development
// Using dynamic import with ssr: false to prevent it from being bundled in production
export const ReactQueryDevtools = 
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@tanstack/react-query-devtools').then((mod) => ({
            default: mod.ReactQueryDevtools,
          })),
        { ssr: false }
      )
    : () => null

