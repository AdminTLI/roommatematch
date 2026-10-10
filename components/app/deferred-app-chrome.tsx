'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const CookieConsentBanner = dynamic(
  () =>
    import('@/components/privacy/cookie-consent-banner').then((m) => ({
      default: m.CookieConsentBanner,
    })),
  { ssr: false }
)

const AppToaster = dynamic(
  () =>
    import('@/components/app/app-toaster').then((m) => ({
      default: m.AppToaster,
    })),
  { ssr: false }
)

/**
 * Cookie banner + toaster are not needed for LCP; mount after idle.
 */
export function DeferredAppChrome() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const enable = () => setReady(true)
    const ric = window.requestIdleCallback
    if (typeof ric === 'function') {
      idleId = ric(enable, { timeout: 3000 })
    } else {
      timeoutId = setTimeout(enable, 1500)
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  if (!ready) return null

  return (
    <>
      <CookieConsentBanner />
      <AppToaster />
    </>
  )
}
