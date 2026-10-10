'use client'

import { useEffect } from 'react'

/** Adds `.dm-mesh-animated` after idle so mesh drift does not compete with LCP. */
export function MeshAnimateOnIdle({ targetId = 'dm-pastel-mesh' }: { targetId?: string }) {
  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const enable = () => {
      document.getElementById(targetId)?.classList.add('dm-mesh-animated')
    }

    const ric = window.requestIdleCallback
    if (typeof ric === 'function') {
      idleId = ric(enable, { timeout: 2500 })
    } else {
      timeoutId = setTimeout(enable, 1200)
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [targetId])

  return null
}
