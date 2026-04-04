'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220

function resetMobileLayoutScroll() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.querySelector('main')?.scrollTo(0, 0)
}

/**
 * Clamps the chat root to the portion of the *visual viewport* that sits below this element's top.
 * Uses the Visual Viewport API (offsetTop/height), not layout `100vh` / `100dvh`, so mobile browser
 * chrome (Safari/Chrome, bar top or bottom) cannot push the composer off-screen.
 *
 * Resets window/main scroll and re-syncs after keyboard blur — iOS often leaves a non-zero layout
 * scroll or stale rects, which caused the header to disappear and a gap under the composer.
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

        const parent = node.parentElement
        if (parent) {
          const pr = parent.getBoundingClientRect()
          const cap = Math.max(MIN_CHAT_HEIGHT, Math.floor(pr.bottom - rect.top))
          h = Math.min(h, cap)
        }

        node.style.setProperty('height', `${h}px`, 'important')
        node.style.setProperty('max-height', `${h}px`, 'important')
      })
    }

    const onFocusOut = (ev: FocusEvent) => {
      const target = ev.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return
      if (!el.contains(target)) return

      resetMobileLayoutScroll()
      sync()
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 0)
      window.setTimeout(sync, 80)
      window.setTimeout(sync, 250)
      window.setTimeout(sync, 500)
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    document.addEventListener('focusout', onFocusOut, true)

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        resetMobileLayoutScroll()
        sync()
      }
    }
    window.addEventListener('pageshow', onPageShow)

    resetMobileLayoutScroll()
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
      document.removeEventListener('focusout', onFocusOut, true)
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
