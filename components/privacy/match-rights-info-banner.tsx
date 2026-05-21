'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X, Info } from 'lucide-react'

const STORAGE_KEY = 'domu_match_rights_banner_dismissed'

export function MatchRightsInfoBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Alert className="mb-4 border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/30">
      <Info className="h-4 w-4 text-violet-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-violet-900 dark:text-violet-100">
        <span>
          Compatibility scores are suggestions, not automatic decisions. You can request a human review in{' '}
          <Link href="/settings?tab=privacy" className="underline font-medium">
            Privacy settings
          </Link>
          .
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={dismiss}>
          <X className="h-4 w-4 mr-1" />
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  )
}
