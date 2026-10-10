'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Mounts children only when near the viewport to avoid fetching every
 * below-fold chunk on first enable of the deferred homepage tree.
 */
export function LazySection({
  children,
  minHeight = '20rem',
  rootMargin = '280px 0px',
}: {
  children: ReactNode
  minHeight?: string
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShow(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref}>
      {show ? (
        children
      ) : (
        <div
          className="w-full animate-pulse rounded-3xl bg-white/40 mx-auto max-w-7xl my-8"
          style={{ minHeight }}
          aria-hidden
        />
      )}
    </div>
  )
}
