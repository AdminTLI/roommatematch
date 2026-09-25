'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, X } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { LAB_PROMPT_COPY } from '@/lib/lab/constants'
import type { LabPromptKey } from '@/lib/lab/types'
import { cn } from '@/lib/utils'

interface LabPromptCardProps {
  /** Milestone keys the user has reached (parent computes). */
  eligibleKeys: LabPromptKey[]
  /** `centered` keeps the card and centers copy + actions. */
  variant?: 'card' | 'centered'
}

export function LabPromptCard({ eligibleKeys, variant = 'card' }: LabPromptCardProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const isCentered = variant === 'centered'

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
    <Card
      className={cn(
        'border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 to-white',
        'dark:border-indigo-800/60 dark:from-indigo-950/30 dark:to-zinc-900',
      )}
    >
      <CardContent className="relative px-4 py-5 sm:px-6 sm:py-6">
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            'absolute right-3 top-3 rounded-md p-1.5 text-zinc-400 transition-colors sm:right-4 sm:top-4',
            'hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300',
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className={cn(
            'flex gap-3',
            isCentered
              ? 'flex-col items-center text-center'
              : 'items-start text-left',
          )}
        >
          <div className="shrink-0 rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/50">
            <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className={cn('min-w-0 flex-1', isCentered ? 'w-full max-w-sm' : 'pr-6')}>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {copy.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {copy.description}
            </p>
            <div
              className={cn(
                'mt-3.5 flex gap-2',
                isCentered && 'w-full justify-center',
              )}
            >
              <Button
                size="sm"
                className={cn(isCentered && 'w-full max-w-[220px] sm:w-auto')}
                asChild
              >
                <Link href="/forum?compose=1">{copy.cta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
