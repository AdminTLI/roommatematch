'use client'

import { useLayoutEffect, type RefObject } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220

function resetMobileLayoutScroll() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

function isMobileThreadLayout() {
  if (typeof document === 'undefined') return false
  return document.body.classList.contains('mobile-chat-active-conversation')
}

function publishViewportVars(root: HTMLElement, vv: VisualViewport) {
  const measured = Math.round(vv.height)
  if (measured > 0) {
    root.style.setProperty('--vv-height', `${measured}px`)
    root.style.setProperty('--chat-visual-vh', `${measured}px`)
  }

  const vvTop = Math.max(0, Math.round(vv.offsetTop))
  root.style.setProperty('--vv-top', `${vvTop}px`)

  const innerH = window.innerHeight || 0
  const kbInset = Math.max(0, Math.round(innerH - vv.height - vv.offsetTop))
  root.style.setProperty('--kb-inset', `${kbInset}px`)
}

function clearViewportVars(root: HTMLElement) {
  root.style.removeProperty('--vv-height')
  root.style.removeProperty('--chat-visual-vh')
  root.style.removeProperty('--vv-top')
  root.style.removeProperty('--kb-inset')
}

/**
 * Publishes `--vv-height`, `--vv-top`, and `--kb-inset` for mobile chat layout/keyboard handling.
 * Also sizes the chat list column when not in an active thread (inline height on `containerRef`).
 */
export function useChatViewportSync(containerRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    let raf = 0
    const root = document.documentElement

    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const node = containerRef.current
        const vv = window.visualViewport
        if (!node || !vv) return

        const mobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
        if (!mobile) {
          clearViewportVars(root)
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        publishViewportVars(root, vv)

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
      window.setTimeout(sync, 80)
      window.setTimeout(sync, 250)
      window.setTimeout(sync, 500)
    }

    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return
      if (!el.contains(target)) return

      sync()
      requestAnimationFrame(sync)
      window.setTimeout(sync, 50)
      window.setTimeout(sync, 200)
      window.setTimeout(sync, 450)
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    document.addEventListener('focusout', onFocusOut, true)
    document.addEventListener('focusin', onFocusIn, true)

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
      document.removeEventListener('focusin', onFocusIn, true)
      clearViewportVars(root)
      el.style.removeProperty('height')
      el.style.removeProperty('max-height')
    }
  }, [containerRef])
}
