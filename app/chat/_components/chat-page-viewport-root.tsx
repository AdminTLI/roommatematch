'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220

function resetMobileLayoutScroll() {
  if (typeof window === 'undefined') return
  // Use a standards-compliant behavior value; some mobile browsers throw on unknown values
  // and then skip the rest of our keyboard-dismissal recovery.
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

function isMobileThreadLayout() {
  if (typeof document === 'undefined') return false
  return document.body.classList.contains('mobile-chat-active-conversation')
}

/**
 * Publishes `visualViewport.height` to the document root and sizes the chat column.
 *
 * **Active mobile thread** (`mobile-chat-active-conversation`):
 *   - `globals.css` locks `<body>` to `position: fixed; height: var(--vv-height)` so iOS has no
 *     scrollable surface — the page literally cannot slide when the keyboard opens.
 *   - `[data-chat-page]` is pinned `position: fixed; top: 0; height: var(--vv-height)` so its
 *     bottom edge hugs the top of the soft keyboard.
 *   - We do NOT publish `vv.offsetTop` here. Adding it as a `top` offset double-shifted the header
 *     on modern iOS Safari, and the locked body makes iOS scroll-into-view a non-issue anyway.
 *
 * **Chat list / desktop**: clamps the column height from the visible viewport bottom minus this
 * node's top so the composer column stays inside the visible viewport.
 */
export function ChatPageViewportRoot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    let raf = 0
    const root = document.documentElement

    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const node = ref.current
        const vv = window.visualViewport
        if (!node || !vv) return

        const mobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
        if (!mobile) {
          root.style.removeProperty('--vv-height')
          root.style.removeProperty('--chat-visual-vh')
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        // Some mobile browsers transiently report 0 during keyboard animations; ignore those
        // samples so we never collapse the chat container to height: 0.
        const measured = Math.round(vv.height)
        if (measured > 0) {
          root.style.setProperty('--vv-height', `${measured}px`)
          root.style.setProperty('--chat-visual-vh', `${measured}px`)
        }

        if (isMobileThreadLayout()) {
          // CSS handles size via --vv-height + position:fixed. Just make sure stale inline
          // height/max-height (left over from chat-list mode) doesn't fight the CSS.
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

      // After blur, repeatedly re-sync because iOS occasionally fires its final visualViewport
      // event *after* the keyboard animation ends. With the body now locked we don't need to
      // fight a scrolling document — a couple of size syncs over the animation window suffice.
      resetMobileLayoutScroll()
      sync()
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

    const observer = new MutationObserver(() => sync())
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

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
      observer.disconnect()
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('focusout', onFocusOut, true)
      root.style.removeProperty('--vv-height')
      root.style.removeProperty('--chat-visual-vh')
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
