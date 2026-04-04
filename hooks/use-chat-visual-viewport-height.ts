'use client'

import { useLayoutEffect } from 'react'

const MOBILE_MAX_WIDTH = 1023

/**
 * Mobile chat: `100dvh` / layout viewport height often extends under the browser URL/toolbar
 * (top or bottom). `visualViewport.height` tracks the actually visible area, so we mirror it
 * into `--chat-visual-vh` for html/body (see globals.css).
 */
export function useChatVisualViewportHeight() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const root = document.documentElement

    const sync = () => {
      if (!window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches) {
        root.style.removeProperty('--chat-visual-vh')
        return
      }
      const h = Math.max(0, Math.round(window.visualViewport!.height))
      root.style.setProperty('--chat-visual-vh', `${h}px`)
    }

    const vv = window.visualViewport
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)

    sync()

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      root.style.removeProperty('--chat-visual-vh')
    }
  }, [])
}
