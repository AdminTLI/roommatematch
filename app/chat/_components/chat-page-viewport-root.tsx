'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220

/**
 * Clamps the chat root to the portion of the *visual viewport* that sits below this element's top.
 * Uses the Visual Viewport API (offsetTop/height), not layout `100vh` / `100dvh`, so mobile browser
 * chrome (Safari/Chrome, bar top or bottom) cannot push the composer off-screen.
 *
 * Uses `!important` so we override `globals.css` chat rules that also use `!important`.
 */
export function ChatPageViewportRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    let raf = 0

    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const node = ref.current
        const vv = window.visualViewport
        if (!node || !vv) return

        const mobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
        if (!mobile) {
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        const rect = node.getBoundingClientRect()
        const visualBottom = vv.offsetTop + vv.height
        let h = Math.floor(visualBottom - rect.top)
        h = Math.max(MIN_CHAT_HEIGHT, h)

        node.style.setProperty('height', `${h}px`, 'important')
        node.style.setProperty('max-height', `${h}px`, 'important')
      })
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) sync()
    }
    window.addEventListener('pageshow', onPageShow)

    sync()
    requestAnimationFrame(sync)
    const t1 = window.setTimeout(sync, 100)
    const t2 = window.setTimeout(sync, 350)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('pageshow', onPageShow)
      el.style.removeProperty('height')
      el.style.removeProperty('max-height')
    }
  }, [])

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
