'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { OnboardingChromeHeader } from '@/components/questionnaire/OnboardingChromeHeader'
import { ModuleTracker } from '@/components/questionnaire/ModuleTracker'
import { CenterBurstConfetti } from '@/components/celebration/center-burst-confetti'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const SHORT_LABELS = [
  'Logistics',
  'Environment',
  'Cleanliness',
  'Communication',
  'Social Life',
] as const

const MODULE_INTROS: Record<
  number,
  { next: string | null; intro: string }
> = {
  0: {
    next: null,
    intro: 'You can explore matches on context scores now. Harmony unlocks after four more modules.',
  },
  1: {
    next: 'Cleanliness and Operations',
    intro: 'Kitchen habits, chores, and household upkeep.',
  },
  2: {
    next: 'Communication and Resolution',
    intro: 'How you give feedback and handle conflict.',
  },
  3: {
    next: 'Social Life and Spaces',
    intro: 'Guests, gatherings, and how you use shared areas.',
  },
  4: {
    next: null,
    intro: "You've completed all 5 modules.",
  },
}

export type ContextSubmitConfig = {
  userType: 'student' | 'professional'
}

interface ModuleCompletionScreenProps {
  moduleIndex: number
  moduleLabel: string
  nextUrl: string
  answeredCount: number
  totalCount: number
  chrome?: {
    titleOverride: string
    moduleIndex: number
    moduleTotal: number
    hideModuleTracker?: boolean
    showExit?: boolean
  }
  /** When set, show terms + submit-to-dashboard inline (skips a separate context-submit page). */
  contextSubmit?: ContextSubmitConfig
  /** Return to the last questionnaire card without remounting the flow. */
  onBack?: () => void
}

export function ModuleCompletionScreen({
  moduleIndex,
  moduleLabel,
  nextUrl,
  answeredCount,
  totalCount,
  chrome,
  contextSubmit,
  onBack,
}: ModuleCompletionScreenProps) {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const { next, intro } = MODULE_INTROS[moduleIndex] ?? { next: null, intro: '' }
  const isLast = moduleIndex === 4
  const displayModule = moduleIndex + 1
  const headerLabel = SHORT_LABELS[moduleIndex] ?? moduleLabel
  const isContextStep = Boolean(chrome)
  const headerModuleIndex = chrome?.moduleIndex ?? displayModule
  const headerTotal = chrome?.moduleTotal ?? 5
  const doneTitle = isContextStep
    ? 'Head to your dashboard'
    : `Module ${displayModule} of 5 done`

  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitContext = async () => {
    if (!contextSubmit || !agreed || isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await fetchWithCSRF('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_terms_consent: true,
          beta_user_type_confirmed: contextSubmit.userType,
          completion_stage: 'context',
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        showErrorToast(result.title || 'Submission Failed', result.error || 'Unknown error')
        return
      }
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Context submit error:', error)
      showErrorToast('Network Error', 'Unable to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const termsLabel =
    contextSubmit?.userType === 'professional'
      ? 'I agree to the Beta Terms and confirm I am a young professional using Domu Match.'
      : 'I agree to the Beta Terms and confirm I am a student using Domu Match.'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <CenterBurstConfetti originRef={cardRef} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingChromeHeader
          moduleIndex={headerModuleIndex}
          moduleTotal={headerTotal}
          moduleLabel={contextSubmit ? 'Ready' : headerLabel}
          titleOverride={contextSubmit ? 'Almost done' : chrome?.titleOverride}
          showExit={chrome?.showExit ?? true}
          belowProgress={
            chrome?.hideModuleTracker ? undefined : (
              <ModuleTracker
                currentModuleIndex={isLast ? moduleIndex : Math.min(moduleIndex + 1, 4)}
                answeredInCurrent={isLast ? totalCount : 0}
                totalInCurrent={totalCount}
              />
            )
          }
        />

        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-8">
          <div
            ref={cardRef}
            className={cn(
              'relative z-20 w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80 sm:p-10',
              contextSubmit ? 'text-left' : 'text-center'
            )}
          >
            {!contextSubmit ? (
              <div className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500">
                <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden />
              </div>
            ) : null}

            <h2 className="text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[1.75rem]">
              {contextSubmit ? (
                <>
                  Head to your <span className="text-indigo-500">dashboard</span>
                </>
              ) : (
                doneTitle
              )}
            </h2>

            {contextSubmit ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                You have finished the context questions. You can already see potential matches based on
                university and logistics. Harmony scores unlock after you complete the remaining four
                modules on the Matches page.
              </p>
            ) : !isLast && next && !isContextStep ? (
              <div className="mt-5 rounded-xl bg-[#F8FAFC] px-4 py-3.5 text-left ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Up next
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A] dark:text-slate-50">
                  {next}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {intro}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {isContextStep
                  ? 'Next you can head to your dashboard and start browsing matches.'
                  : intro}
              </p>
            )}

            {contextSubmit ? (
              <>
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/80 dark:bg-slate-900/50 dark:ring-slate-700">
                  <Checkbox
                    id="beta-terms-context-inline"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="beta-terms-context-inline"
                    className="text-sm leading-relaxed text-slate-700 dark:text-slate-200"
                  >
                    {termsLabel}
                  </Label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {onBack ? (
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={isSubmitting}
                      className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    >
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={!agreed || isSubmitting}
                    onClick={submitContext}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Go to dashboard
                        <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push(nextUrl)}
                className={cn(
                  'mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                  'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
                )}
              >
                {isLast ? 'Review your answers' : isContextStep ? 'Continue to dashboard' : 'Continue'}
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
