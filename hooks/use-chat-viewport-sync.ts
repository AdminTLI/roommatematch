'use client'

/** Mobile chat keyboard / visual-viewport sync for list + open-thread shells. */
import { useLayoutEffect, type RefObject } from 'react'

const MOBILE_MAX = 1023
const MIN_CHAT_HEIGHT = 220
/** Bust stale Turbopack client cache after list top-clip + composer fixes. */
const CHAT_VIEWPORT_SYNC_REV = 'list-v5'

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

function publishListViewportVars(root: HTMLElement, vv: VisualViewport) {
  const measured = Math.round(vv.height)
  const top = Math.max(0, Math.round(vv.offsetTop))
  if (measured > 0) {
    // Used by the chat column height math below; not applied to html/body (that clipped the topbar).
    root.style.setProperty('--chat-visual-vh', `${measured}px`)
  }
  root.style.setProperty('--kb-inset', '0px')
  root.style.removeProperty('--vv-height')
  // Pad .safe-area-inset when the visual viewport is shifted (see chat-page.css list rules).
  root.style.setProperty('--vv-top', `${top}px`)
  root.dataset.chatViewportSync = CHAT_VIEWPORT_SYNC_REV
}

function publishThreadViewportVars(root: HTMLElement, vv: VisualViewport) {
  // Size the open-thread shell to the *visual* viewport so the in-flow composer stays above
  // iOS Safari / Chrome bottom chrome. 100dvh alone often extends under that chrome and the
  // composer looks "missing".
  //
  // When the keyboard opens, iOS may set visualViewport.offsetTop > 0. Pin `top` to that
  // offset (see chat-page.css) so a vv.height-tall shell is not parked above the visible
  // area (blank page). Do not also apply --kb-inset — that double-counts against vv.height.
  const measured = Math.round(vv.height)
  const top = Math.max(0, Math.round(vv.offsetTop))
  if (measured > 0) {
    root.style.setProperty('--vv-height', `${measured}px`)
  }
  root.style.removeProperty('--chat-visual-vh')
  root.style.setProperty('--vv-top', `${top}px`)
  root.style.setProperty('--kb-inset', '0px')
  root.dataset.chatViewportSync = CHAT_VIEWPORT_SYNC_REV
}

function clearViewportVars(root: HTMLElement) {
  root.style.removeProperty('--vv-height')
  root.style.removeProperty('--chat-visual-vh')
  root.style.removeProperty('--vv-top')
  root.style.removeProperty('--kb-inset')
}

/**
 * Mobile chat viewport sync:
 * - Chat list: keep html/body on 100svh; size the column to the visual viewport; publish
 *   `--vv-top` so sticky Topbar/Search are not clipped under browser chrome on navigate-in.
 * - Open thread: size the fixed shell to `--vv-height` and pin `--vv-top` so the composer
 *   stays in the visible viewport (including above overlay browser chrome / keyboard).
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
          // Keep document scroll pinned; visualViewport.offsetTop is applied via --vv-top.
          if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
            resetMobileLayoutScroll()
          }
          publishThreadViewportVars(root, vv)
          node.style.removeProperty('height')
          node.style.removeProperty('max-height')
          return
        }

        // List: pin document scroll so a leftover offset from the previous route cannot hide the Topbar.
        // (offsetTop is handled via --vv-top padding — do not scrollTo-fight the visual viewport.)
        if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
          resetMobileLayoutScroll()
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
    // Extra pass after client navigations finish painting (Topbar sticky + route chrome).
    const t3 = window.setTimeout(sync, 700)

    return () => {
      cancelAnimationFrame(raf)
      clearFocusResyncTimers()
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
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
