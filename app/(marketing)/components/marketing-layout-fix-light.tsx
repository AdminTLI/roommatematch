'use client'

import { useLayoutEffect } from 'react'

/**
 * Adds a scoped body class for the redesigned light landing page only.
 * Inline script applies the HTML marker before paint; layout effect keeps
 * SPA navigations in sync without waiting for useEffect.
 */
export function MarketingLayoutFixLight() {
  useLayoutEffect(() => {
    document.documentElement.dataset.mkt = 'light'
    document.body.classList.add('marketing-page-light')
    return () => {
      delete document.documentElement.dataset.mkt
      document.body.classList.remove('marketing-page-light')
    }
  }, [])

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.dataset.mkt="light";`,
      }}
    />
  )
}
