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
    const ih = window.innerHeight || 1
    const inset = Math.max(0, Math.round(ih - vv.offsetTop - vv.height))
    const heightRatio = vv.height / ih

    // Keyboard dismissed (or never open): visual viewport again fills most of the layout height.
    // Rely on ratio + inset so stale post-dismiss values do not keep a full-keyboard pad.
    const keyboardLikelyClosed =
      inset < 48 || (heightRatio > 0.82 && vv.offsetTop <= 20)

    if (keyboardLikelyClosed) {
      if (hadKeyboardPaddingRef.current) {
        hadKeyboardPaddingRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    el.style.paddingBottom = `${inset}px`
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
