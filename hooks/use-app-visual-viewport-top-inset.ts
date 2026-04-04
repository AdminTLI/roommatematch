'use client'

import { useLayoutEffect } from 'react'

const MOBILE_MAX = 1023

/**
 * Sets `--app-visual-top-inset` from `visualViewport.offsetTop` so fixed/sticky app chrome clears
 * mobile browser UI (Safari/Chrome URL bar at the top). `env(safe-area-inset-top)` alone does not
 * include that overlap.
 */
export function useAppVisualViewportTopInset() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const root = document.documentElement

    const sync = () => {
      if (!window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches) {
        root.style.removeProperty('--app-visual-top-inset')
        return
      }
      const vv = window.visualViewport!
      root.style.setProperty('--app-visual-top-inset', `${Math.max(0, Math.round(vv.offsetTop))}px`)
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)

    sync()
    requestAnimationFrame(() => {
      sync()
      requestAnimationFrame(sync)
    })

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      root.style.removeProperty('--app-visual-top-inset')
    }
  }, [])
}
