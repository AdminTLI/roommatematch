'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { LabCoCreatorBadge } from '@/lib/lab/types'

export function CoCreatorBadgeSettings() {
  const [badge, setBadge] = useState<LabCoCreatorBadge | null>(null)

  useEffect(() => {
    fetch('/api/lab/co-creator')
      .then(r => (r.ok ? r.json() : { badge: null }))
      .then(data => setBadge(data.badge ?? null))
      .catch(() => {})
  }, [])

  if (!badge) return null

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 mb-6">
      <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/50 p-2">
        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="font-semibold text-zinc-900 dark:text-white">
          Co-Creator
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
          You helped ship &ldquo;{badge.wish_title}&rdquo; on Domu Match.
        </p>
      </div>
    </div>
  )
}
