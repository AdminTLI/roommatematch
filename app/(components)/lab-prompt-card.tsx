'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, X } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { LAB_PROMPT_COPY } from '@/lib/lab/constants'
import type { LabPromptKey } from '@/lib/lab/types'

interface LabPromptCardProps {
  /** Milestone keys the user has reached (parent computes). */
  eligibleKeys: LabPromptKey[]
}

export function LabPromptCard({ eligibleKeys }: LabPromptCardProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (eligibleKeys.length === 0) {
      setLoaded(true)
      return
    }

    fetch('/api/lab/prompts')
      .then(r => (r.ok ? r.json() : { dismissed: [] }))
      .then(data => {
        setDismissed(new Set(data.dismissed ?? []))
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [eligibleKeys.length])

  if (!loaded || eligibleKeys.length === 0) {
    return null
  }

  const activeKey = eligibleKeys.find(k => !dismissed.has(k))
  if (!activeKey) return null

  const copy = LAB_PROMPT_COPY[activeKey]
  if (!copy) return null

  const dismiss = async () => {
    setDismissed(prev => new Set([...prev, activeKey]))
    try {
      await fetchWithCSRF('/api/lab/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_key: activeKey }),
      })
    } catch {
      // optimistic dismiss is fine
    }
  }

  return (
    <Card className="border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-zinc-900">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/50 p-2 shrink-0">
            <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {copy.title}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {copy.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" asChild>
                <Link href="/forum?compose=1">{copy.cta}</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/forum">See what others posted</Link>
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
