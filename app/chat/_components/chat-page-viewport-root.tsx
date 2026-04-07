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
 * Publishes Visual Viewport metrics to the document root and sizes the chat column.
 *
 * **Active mobile thread** (`mobile-chat-active-conversation`): `globals.css` pins `[data-chat-page]`
 * with `position: fixed` to `--vv-*`, matching the visible rectangle (keyboard + Safari/Chrome bars).
 *
 * **Chat list / desktop**: Clamps height from visual bottom minus this node's top so the composer
 * column stays inside the visible viewport.
 *
 * Resets window/main scroll after keyboard blur — iOS often leaves stale layout scroll so the
 * conversation header appears "gone" until pinch-zoom.
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
          root.style.removeProperty('--vv-offset-top')
          root.style.removeProperty('--vv-offset-left')
          root.style.removeProperty('--vv-width')
          root.style.removeProperty('--vv-height')
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        root.style.setProperty('--vv-offset-top', `${Math.round(vv.offsetTop)}px`)
        root.style.setProperty('--vv-offset-left', `${Math.round(vv.offsetLeft)}px`)
        root.style.setProperty('--vv-width', `${Math.round(vv.width)}px`)
        root.style.setProperty('--vv-height', `${Math.round(vv.height)}px`)
        root.style.setProperty('--chat-visual-vh', `${Math.round(vv.height)}px`)

        if (isMobileThreadLayout()) {
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
      root.style.removeProperty('--vv-offset-top')
      root.style.removeProperty('--vv-offset-left')
      root.style.removeProperty('--vv-width')
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
