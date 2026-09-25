'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LabPromptCard } from '@/app/(components)/lab-prompt-card'
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
    <div
      className={cn(
        'mx-auto w-full max-w-md px-1 sm:max-w-lg sm:px-0 lg:max-w-xl xl:max-w-2xl',
        'py-6 sm:py-8 lg:py-10',
        'transition-all duration-500',
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 sm:mb-6">
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-[2px] shadow-[0_0_20px_-5px_rgba(99,102,241,0.45)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white dark:bg-slate-900 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]">
              <Users
                className="h-7 w-7 text-indigo-600 dark:text-indigo-400 sm:h-8 sm:w-8"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-2xl">
          No matches yet
        </h3>

        {hasCompletedQuestionnaire ? (
          <>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-[15px]">
              Matching can take a few hours after your questionnaire. We only surface strong
              compatibility fits. Quality over quantity.
            </p>

            <Button
              onClick={onRefresh}
              className={cn(
                'mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all sm:mt-7 sm:w-auto sm:min-w-[180px]',
                'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]',
                'hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]',
                'active:scale-[0.98]',
              )}
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Refresh Matches
            </Button>

            <div className="mt-8 w-full sm:mt-10">
              <LabPromptCard eligibleKeys={['empty_matches']} variant="centered" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-[15px]">
              Complete your questionnaire to start finding compatible roommates. The more you
              answer, the better your matches.
            </p>

            <Button
              onClick={() => router.push('/onboarding')}
              className={cn(
                'mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all sm:mt-7 sm:w-auto sm:min-w-[200px]',
                'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]',
                'hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]',
                'active:scale-[0.98]',
              )}
            >
              Complete Questionnaire
            </Button>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-5 sm:text-[13px]">
              It only takes a few minutes, and you can update your answers anytime.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
