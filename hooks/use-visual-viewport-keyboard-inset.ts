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

export type VisualViewportInsetOptions = {
  /** When false, padding is cleared (e.g. composer hidden behind a full-screen sheet). */
  enabled?: boolean
}

/**
 * Bottom padding on `containerRef` equal to the strip of the *layout* viewport that sits below
 * the visual viewport (iOS/Android browser toolbars, home indicator overlap, software keyboard).
 *
 * Previously we cleared this whenever the keyboard “looked” closed, which left the composer under
 * Chrome’s bottom URL bar. We always apply the visual-viewport gap on mobile when it is meaningful.
 */
export function useVisualViewportKeyboardInset(
  containerRef: RefObject<HTMLElement | null>,
  options?: VisualViewportInsetOptions
): () => void {
  const enabled = options?.enabled ?? true
  const hadInsetRef = useRef(false)

  const sync = useCallback(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    // Chat route sizes html/body to visualViewport.height via --chat-visual-vh; extra padding here
    // would double-compensate and shrink the message area / composer band.
    if (document.documentElement.style.getPropertyValue('--chat-visual-vh').trim()) {
      if (hadInsetRef.current) {
        hadInsetRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    if (!enabled) {
      if (hadInsetRef.current) {
        hadInsetRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    if (!window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches) {
      if (hadInsetRef.current) {
        hadInsetRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    const vv = window.visualViewport
    // innerHeight tracks the layout viewport height; pair it with visualViewport for a stable
    // “obscured bottom” value across Safari, Chrome iOS, and Android.
    const innerH = window.innerHeight || 1
    const clientH =
      document.documentElement?.clientHeight && document.documentElement.clientHeight > 0
        ? document.documentElement.clientHeight
        : innerH
    // Use the larger of the two "obscured bottom" estimates — Chrome iOS sometimes disagrees between
    // innerHeight and clientHeight relative to visualViewport.
    const insetInner = Math.max(0, Math.round(innerH - vv.offsetTop - vv.height))
    const insetClient = Math.max(0, Math.round(clientH - vv.offsetTop - vv.height))
    const rawInset = Math.max(insetInner, insetClient)
    const layoutH = Math.max(innerH, clientH)
    const heightRatio = vv.height / layoutH

    // Large inset: usually keyboard; iOS Chrome sometimes over-reports — bias down slightly.
    const keyboardHeavy =
      rawInset >= 110 || (rawInset >= 56 && heightRatio < 0.58 && vv.offsetTop > 8)

    let applied = rawInset
    if (keyboardHeavy) {
      applied = Math.max(0, Math.round(rawInset * 0.88 - 16))
    }

    const maxPad = Math.round(layoutH * 0.5)
    applied = Math.min(applied, maxPad)

    // Ignore sub-pixel noise; tiny values look like a glitchy strip.
    if (applied < 6) {
      if (hadInsetRef.current) {
        hadInsetRef.current = false
        resetMobileViewportScroll()
      }
      el.style.removeProperty('padding-bottom')
      return
    }

    el.style.paddingBottom = `${applied}px`
    hadInsetRef.current = true
  }, [containerRef, enabled])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined' || !window.visualViewport) return

    const vv = window.visualViewport

    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)

    sync()

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      hadInsetRef.current = false
      el.style.removeProperty('padding-bottom')
    }
  }, [containerRef, sync])

  return sync
}
