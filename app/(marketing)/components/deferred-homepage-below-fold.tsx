'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const HomepageBelowFold = dynamic(
  () =>
    import('./homepage-below-fold').then((m) => ({
      default: m.HomepageBelowFold,
    })),
  {
    ssr: false,
    loading: () => <BelowFoldPlaceholder />,
  }
)

function BelowFoldPlaceholder() {
  return (
    <div
      className="w-full min-h-[70vh] rounded-3xl bg-white/30 mx-auto max-w-7xl my-8"
      aria-hidden
    />
  )
}

/**
 * Keeps below-fold marketing sections off the critical path until the hero
 * has had a chance to paint (idle) or the user scrolls near them.
 */
export function DeferredHomepageBelowFold() {
  const [ready, setReady] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let io: IntersectionObserver | undefined

    const enable = () => {
      if (!cancelled) setReady(true)
    }

    const arm = () => {
      const el = sentinelRef.current
      if (el && typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              enable()
              io?.disconnect()
            }
          },
          { rootMargin: '240px 0px' }
        )
        io.observe(el)
      }

      const ric = window.requestIdleCallback
      if (typeof ric === 'function') {
        idleId = ric(() => enable(), { timeout: 3500 })
      } else {
        timeoutId = setTimeout(enable, 2200)
      }
    }

    // Prefer arming after load so hero LCP is not competing with below-fold chunks.
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', arm)
      io?.disconnect()
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div ref={sentinelRef}>
      {ready ? <HomepageBelowFold /> : <BelowFoldPlaceholder />}
    </div>
  )
}
