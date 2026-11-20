'use client'

/** Mobile chat keyboard / visual-viewport sync (thread shell uses 100dvh, not vv.height). */
import { useLayoutEffect, type RefObject } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220
/** Bust stale Turbopack client cache after keyboard shell fix. */
const CHAT_VIEWPORT_SYNC_REV = 'thread-v2'
/** Ignore sub-pixel / toolbar noise when estimating an overlay keyboard. */
const KB_INSET_FLOOR = 48
/** If layout height already tracks the visual viewport, interactive-widget resized us. */
const LAYOUT_RESIZED_SLOP = 48

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

/**
 * Overlay-keyboard gap below the visual viewport (layout coords).
 * When `interactive-widget: resizes-content` is active, layout already shrank and this is ~0.
 */
function overlayKeyboardInsetPx(vv: VisualViewport): number {
  const innerH = window.innerHeight || 0
  const clientH =
    document.documentElement?.clientHeight && document.documentElement.clientHeight > 0
      ? document.documentElement.clientHeight
      : innerH
  const layoutH = Math.max(innerH, clientH)
  if (layoutH <= 0) return 0

  // Layout already matches the visual viewport → do not add a second keyboard inset.
  if (Math.abs(layoutH - vv.height) <= LAYOUT_RESIZED_SLOP) return 0

  const obscured = Math.max(0, Math.round(layoutH - vv.offsetTop - vv.height))
  if (obscured < KB_INSET_FLOOR) return 0

  // Cap so a stuck offsetTop cannot collapse the thread to a sliver.
  return Math.min(obscured, Math.round(layoutH * 0.55))
}

function publishListViewportVars(root: HTMLElement, vv: VisualViewport) {
  const measured = Math.round(vv.height)
  if (measured > 0) {
    root.style.setProperty('--chat-visual-vh', `${measured}px`)
  }
  root.style.setProperty('--kb-inset', '0px')
  root.style.removeProperty('--vv-height')
  root.style.setProperty('--vv-top', '0px')
}

function publishThreadViewportVars(root: HTMLElement, vv: VisualViewport) {
  // Active thread uses CSS 100dvh / inset:0 — never publish vv.height as the shell height.
  // Sizing body/[data-chat-page] to vv.height while offsetTop > 0 parks the UI above the
  // visible viewport (blank white/dark page) on iOS Chrome and some Safari builds.
  root.style.removeProperty('--vv-height')
  root.style.removeProperty('--chat-visual-vh')
  root.style.setProperty('--vv-top', '0px')
  root.style.setProperty('--kb-inset', `${overlayKeyboardInsetPx(vv)}px`)
  root.dataset.chatViewportSync = 'thread-v3'
}

function clearViewportVars(root: HTMLElement) {
  root.style.removeProperty('--vv-height')
  root.style.removeProperty('--chat-visual-vh')
  root.style.removeProperty('--vv-top')
  root.style.removeProperty('--kb-inset')
}

/**
 * Mobile chat viewport sync:
 * - Chat list: size the column to the visual viewport (browser chrome).
 * - Open thread: keep a full-bleed in-flow/fixed shell on 100dvh; only publish `--kb-inset`
 *   when the keyboard overlays without resizing the layout (no vv.height shell shrink).
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

        if (isMobileThreadLayout()) {
          // If iOS scrolled the layout/visual viewport while focusing the composer, pin back
          // to the top so a fixed full-bleed shell stays on-screen (without translating by offsetTop).
          if (vv.offsetTop > 0 || window.scrollY > 0 || document.documentElement.scrollTop > 0) {
            resetMobileLayoutScroll()
          }
          publishThreadViewportVars(root, vv)
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        publishListViewportVars(root, vv)

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

    const focusSyncTimers = new Set<number>()
    const scheduleFocusResync = () => {
      const delays = [50, 120, 240, 400, 650, 900]
      for (const delay of delays) {
        const timer = window.setTimeout(() => {
          focusSyncTimers.delete(timer)
          sync()
        }, delay)
        focusSyncTimers.add(timer)
      }
    }
    const clearFocusResyncTimers = () => {
      focusSyncTimers.forEach((timer) => window.clearTimeout(timer))
      focusSyncTimers.clear()
    }

    const onFocusOut = (ev: FocusEvent) => {
      const target = ev.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return
      if (!el.contains(target)) return

      clearFocusResyncTimers()
      // After the keyboard closes, pin scroll and resync inset — do not fight focus-open.
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 0)
      window.setTimeout(sync, 120)
      window.setTimeout(sync, 320)
      window.setTimeout(() => {
        resetMobileLayoutScroll()
        sync()
      }, 520)
    }

    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') return
      if (!el.contains(target)) return

      // Do not scrollTo(0) here — it races Safari/Chrome keyboard scroll and blanks the thread.
      sync()
      requestAnimationFrame(sync)
      scheduleFocusResync()
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
      clearFocusResyncTimers()
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




