'use client'

import { useEffect } from 'react'

/**
 * Adds a scoped body class for the redesigned light landing page only.
 * This avoids disturbing the existing dark marketing pages that rely on `marketing-page`.
 */
export function MarketingLayoutFixLight() {
  useEffect(() => {
    document.body.classList.add('marketing-page-light')
    return () => {
      document.body.classList.remove('marketing-page-light')
    }
  }, [])

  return null
}

