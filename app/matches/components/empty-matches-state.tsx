'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, RefreshCw, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface EmptyMatchesStateProps {
  hasCompletedQuestionnaire: boolean
  onRefresh?: () => void
}

export function EmptyMatchesState({
  hasCompletedQuestionnaire,
  onRefresh,
}: EmptyMatchesStateProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-purple-200/25 blur-3xl dark:bg-purple-500/10" />
      </div>

      <div
        className={cn(
          'relative rounded-2xl bg-white p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 transition-all duration-500',
          'dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80',
          'sm:p-10',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-md" />
            <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-[2px] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-white dark:bg-slate-800 sm:h-20 sm:w-20">
                <Users
                  className="h-8 w-8 text-indigo-600 dark:text-indigo-400 sm:h-9 sm:w-9"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <h3 className="mb-2 text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-2xl">
            No matches yet
          </h3>

          {hasCompletedQuestionnaire ? (
            <>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                We&apos;re working on finding your perfect roommate matches. This can take a few
                hours after completing your questionnaire.
              </p>

              <div className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Scanning for compatible roommates
              </div>

              <Button
                onClick={onRefresh}
                className={cn(
                  'inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                  'bg-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)]',
                  'hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.45)]',
                  'active:scale-[0.98]',
                )}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                Refresh Matches
              </Button>

              <div className="mt-6 flex w-full max-w-md items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/70">
                <Lightbulb
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <p className="text-left text-xs font-medium leading-relaxed text-amber-950 dark:text-amber-100 sm:text-[13px]">
                  We only surface matches when there&apos;s a strong compatibility fit. Quality
                  over quantity.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                Complete your questionnaire to start finding compatible roommates. The more
                questions you answer, the better your matches will be.
              </p>

              <Button
                onClick={() => router.push('/onboarding')}
                className={cn(
                  'inline-flex h-11 min-w-[200px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                  'bg-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)]',
                  'hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.45)]',
                  'active:scale-[0.98]',
                )}
              >
                Complete Questionnaire
              </Button>

              <div className="mt-6 flex w-full max-w-md items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/70">
                <Lightbulb
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <p className="text-left text-xs font-medium leading-relaxed text-amber-950 dark:text-amber-100 sm:text-[13px]">
                  It only takes a few minutes to complete, and you can always update your answers
                  later.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
