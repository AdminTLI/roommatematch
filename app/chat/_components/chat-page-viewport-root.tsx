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
  document.querySelector('main')?.scrollTo(0, 0)
}

function isMobileThreadLayout() {
  if (typeof document === 'undefined') return false
  return document.body.classList.contains('mobile-chat-active-conversation')
}

/**
 * Publishes the visual viewport *height* to the document root and sizes the chat column.
 *
 * **Active mobile thread** (`mobile-chat-active-conversation`): `globals.css` pins
 * `[data-chat-page]` with `position: fixed; top: 0; left: 0; width: 100%; height: var(--vv-height)`.
 * We intentionally do NOT publish `visualViewport.offsetTop` / `offsetLeft` / `width` here — modern
 * iOS Safari keeps `position: fixed` aligned to the visual viewport on its own, and adding the
 * visual-viewport offset on top of that double-shifts the container (header banner slides down on
 * focus and stays displaced after blur because `vv.offsetTop` doesn't always return to 0 cleanly).
 *
 * To keep the fixed container glued to (0, 0) we also defensively reset `window.scrollTo(0, 0)`
 * whenever the visual viewport scrolls (iOS "scroll-into-view" when focusing the composer) and on
 * every focus / blur of inputs inside this subtree.
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

        const vvHeight = Math.round(vv.height)
        root.style.setProperty('--vv-height', `${vvHeight}px`)
        root.style.setProperty('--chat-visual-vh', `${vvHeight}px`)

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

    const onVisualViewportScroll = () => {
      // iOS Safari may scroll the layout viewport to bring the focused composer into view. Our
      // chat container is `position: fixed; top: 0`, so any document scroll slides the header off
      // screen. Snap the document back to (0, 0) immediately, then re-sync sizing.
      if (isMobileThreadLayout()) {
        resetMobileLayoutScroll()
      }
      sync()
    }

    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return
      if (!el.contains(target)) return
      if (!isMobileThreadLayout()) return

      // Pre-empt iOS scroll-into-view: it always tries to scroll right after focus is dispatched.
      // Repeatedly resetting across the keyboard animation keeps the fixed chat column at the top.
      resetMobileLayoutScroll()
      window.setTimeout(resetMobileLayoutScroll, 0)
      window.setTimeout(resetMobileLayoutScroll, 50)
      window.setTimeout(resetMobileLayoutScroll, 150)
      window.setTimeout(resetMobileLayoutScroll, 350)
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
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 80)
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 250)
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 500)
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', onVisualViewportScroll)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    document.addEventListener('focusin', onFocusIn, true)
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
      vv.removeEventListener('scroll', onVisualViewportScroll)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('focusin', onFocusIn, true)
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
