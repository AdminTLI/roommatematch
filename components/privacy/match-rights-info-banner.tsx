'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'

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
    <div
      role="status"
      className="relative mb-4 overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-r from-violet-50/90 via-white/80 to-indigo-50/70 px-3.5 py-3 shadow-sm backdrop-blur-sm dark:border-violet-800/40 dark:from-violet-950/40 dark:via-slate-900/60 dark:to-indigo-950/30"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-400/15 blur-2xl dark:bg-violet-500/10"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Compatibility scores are suggestions, not automatic decisions. You can request a human
            review in{' '}
            <Link
              href="/settings?tab=privacy"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            >
              Privacy settings
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-violet-100/80 hover:text-slate-700 dark:hover:bg-violet-900/50 dark:hover:text-slate-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
