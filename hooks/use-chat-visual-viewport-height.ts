'use client'

import { useLayoutEffect } from 'react'

const MOBILE_MAX_WIDTH = 1023

let svhProbeCache: number | null = null
let svhProbeCacheInnerW = 0

function read100svhPx(): number | null {
  if (typeof document === 'undefined') return null
  const innerW = window.innerWidth
  if (svhProbeCache != null && svhProbeCacheInnerW === innerW) {
    return svhProbeCache
  }
  try {
    const el = document.createElement('div')
    el.style.cssText =
      'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none;z-index:-1'
    document.documentElement.appendChild(el)
    const h = el.offsetHeight
    el.remove()
    if (h > 0) {
      svhProbeCache = h
      svhProbeCacheInnerW = innerW
      return h
    }
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Mobile chat: sync root height to the visible viewport and expose the layout–visual gap at the
 * bottom (iOS Safari / Chrome often overlay the URL bar while still reporting a tall layout or
 * matching vv.height to innerHeight).
 */
export function useChatVisualViewportHeight() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const root = document.documentElement

    const sync = () => {
      if (!window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches) {
        root.style.removeProperty('--chat-visual-vh')
        root.style.removeProperty('--chat-layout-bottom-obscured')
        return
      }

      const vv = window.visualViewport!
      const innerH = window.innerHeight
      const clientH =
        document.documentElement.clientHeight > 0 ? document.documentElement.clientHeight : innerH

      const obscuredInner = Math.max(0, Math.round(innerH - vv.offsetTop - vv.height))
      const obscuredClient = Math.max(0, Math.round(clientH - vv.offsetTop - vv.height))
      const obscured = Math.max(obscuredInner, obscuredClient)
      root.style.setProperty('--chat-layout-bottom-obscured', `${obscured}px`)

      let h = Math.round(vv.height)

      // When the browser still reports vv.height ≈ full window but chrome overlays the bottom,
      // obscured stays ~0 — clamp using the smallest viewport unit (toolbars expanded).
      if (obscured <= 2 && h >= Math.min(innerH, clientH) - 3) {
        const svh = read100svhPx()
        if (svh != null && svh + 12 < h) {
          h = svh
        }
      } else if (obscured > 0) {
        h = Math.min(h, Math.round(Math.min(innerH, clientH) - obscured))
      }

      h = Math.max(1, h)
      root.style.setProperty('--chat-visual-vh', `${h}px`)
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
    requestAnimationFrame(() => {
      sync()
      requestAnimationFrame(sync)
    })
    const t1 = window.setTimeout(sync, 120)
    const t2 = window.setTimeout(sync, 400)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('pageshow', onPageShow)
      root.style.removeProperty('--chat-visual-vh')
      root.style.removeProperty('--chat-layout-bottom-obscured')
    }
  }, [])
}
