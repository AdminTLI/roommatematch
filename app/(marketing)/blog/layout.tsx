import type { ReactNode } from 'react'

/**
 * Blog pages often load Unsplash heroes — preconnect only here so the homepage
 * does not waste early connection slots on unused origins.
 */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      {children}
    </>
  )
}