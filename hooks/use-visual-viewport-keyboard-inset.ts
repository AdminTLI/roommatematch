'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

const MOBILE_MAX_WIDTH = 1023

function resetMobileViewportScroll() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.querySelector('main')?.scrollTo(0, 0)
}

/**
 * Keeps bottom padding on `containerRef` for the obscured strip below the visual viewport
 * while the software keyboard is open. Clears when the keyboard is dismissed; iOS Chrome often
 * omits a reliable final visualViewport resize, so we also use heuristics (viewport height ratio).
 */
export function useVisualViewportKeyboardInset(
  containerRef: RefObject<HTMLElement | null>
): () => void {
  const hadKeyboardPaddingRef = useRef(false)

  const sync = useCallback(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    if (!window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches) {
      if (hadKeyboardPaddingRef.current) {
        hadKeyboardPaddingRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    const vv = window.visualViewport
    // clientHeight often tracks the layout viewport more predictably than innerHeight on iOS Chrome
    // when the URL bar / keyboard chrome is in flux.
    const layoutH =
      document.documentElement?.clientHeight && document.documentElement.clientHeight > 0
        ? document.documentElement.clientHeight
        : window.innerHeight || 1

    const rawInset = Math.max(0, Math.round(layoutH - vv.offsetTop - vv.height))
    const heightRatio = vv.height / layoutH

    // Keyboard dismissed (or never open): visual viewport again fills most of the layout height.
    const keyboardLikelyClosed =
      rawInset < 48 || (heightRatio > 0.82 && vv.offsetTop <= 20)

    if (keyboardLikelyClosed) {
      if (hadKeyboardPaddingRef.current) {
        hadKeyboardPaddingRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    // iOS Chrome sometimes over-reports obscured height (dead band above the keyboard). Bias down
    // slightly; cap so we never reserve more than ~46% of layout height (large phones + keyboard).
    const scaled = Math.max(0, Math.round(rawInset * 0.84 - 28))
    const maxPad = Math.round(layoutH * 0.46)
    const applied = Math.min(scaled, maxPad)

    el.style.paddingBottom = `${applied}px`
    hadKeyboardPaddingRef.current = true
  }, [containerRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
    if (!mq.matches) return

    const vv = window.visualViewport

    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)

    sync()

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      hadKeyboardPaddingRef.current = false
      el.style.removeProperty('padding-bottom')
    }
  }, [containerRef, sync])

  return sync
}
