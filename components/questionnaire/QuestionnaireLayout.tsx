'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/store/onboarding'
import { useRouter } from 'next/navigation'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import type { SectionKey } from '@/types/questionnaire'

interface Props {
  children: ReactNode
  stepIndex: number
  totalSteps: number
  onPrev?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  title: string
  subtitle?: string
  hideSaveAndExit?: boolean
  prevButtonClassName?: string
}

export function QuestionnaireLayout({
  children,
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  nextDisabled,
  title,
  subtitle,
  hideSaveAndExit = false,
  prevButtonClassName,
}: Props) {
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100)
  const router = useRouter()
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt)
  const sections = useOnboardingStore((s) => s.sections)
  const [isSavingAll, setIsSavingAll] = useState(false)

  const handleSaveAndExit = async () => {
    setIsSavingAll(true)
    try {
      const allSections = Object.keys(sections) as SectionKey[]
      const sectionsWithAnswers = allSections.filter((sectionKey) => {
        const sectionAnswers = sections[sectionKey]
        return sectionAnswers && Object.keys(sectionAnswers).length > 0
      })

      if (sectionsWithAnswers.length === 0) {
        router.push('/dashboard')
        return
      }

      const saveResults = await Promise.allSettled(
        sectionsWithAnswers.map(async (sectionKey) => {
          const sectionAnswers = sections[sectionKey]
          const answersArray = Object.values(sectionAnswers)

          if (answersArray.length === 0) {
            return { sectionKey, success: true }
          }

          try {
            const res = await fetchWithCSRF('/api/onboarding/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ section: sectionKey, answers: answersArray }),
            })

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}))
              throw new Error(errorData.error || `Failed to save ${sectionKey}`)
            }

            return { sectionKey, success: true }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to save ${sectionKey}`
            return { sectionKey, success: false, error: errorMessage }
          }
        })
      )

      const failures: Array<{ section: string; error: string }> = []
      saveResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          failures.push({
            section: sectionsWithAnswers[index],
            error: result.reason?.message || 'Unknown error',
          })
        } else if (result.value && !result.value.success) {
          failures.push({
            section: result.value.sectionKey,
            error: result.value.error || 'Save failed',
          })
        }
      })

      if (failures.length > 0) {
        const failedSections = failures.map((f) => f.section).join(', ')
        showErrorToast(
          'Failed to save some sections',
          `Could not save: ${failedSections}. Please try again or contact support if the problem persists.`
        )
        setIsSavingAll(false)
        return
      }

      showSuccessToast('All sections saved', 'Your progress has been saved successfully.')
      await new Promise((resolve) => setTimeout(resolve, 200))
      router.push('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showErrorToast(
        'Failed to save progress',
        `${errorMessage}. Please try again or contact support if the problem persists.`
      )
    } finally {
      setIsSavingAll(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-body text-text-primary">
      {/* Ambient gradient background to match welcome / dashboard aesthetics */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-44 -right-10 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/15 blur-3xl" />
      </div>

      {/* Subtle texture / overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),_transparent_55%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-transparent bg-transparent backdrop-blur-xl">
          {/* sm+: step + progress centered, Save & exit top-right */}
          <div className="mx-auto hidden max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:grid sm:px-6 lg:px-8">
            {/* Left spacer intentionally empty so the step counter can be truly centered */}
            <div />

            <div className="flex flex-col items-center gap-1 justify-self-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-40">
                  <Progress value={progress} className="h-1.5 rounded-full bg-border-subtle/60" />
                </div>
                <span className="text-xs text-text-secondary">{progress}%</span>
              </div>
            </div>

            {!hideSaveAndExit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndExit}
                disabled={isSavingAll}
                className="justify-self-end rounded-full border-border-subtle/50 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white/90 dark:bg-bg-surface-alt/70 dark:text-text-primary dark:hover:bg-bg-surface-alt/85"
              >
                {isSavingAll ? 'Saving...' : 'Save & exit'}
              </Button>
            )}
          </div>

          {/* Mobile: progress first, then Save & exit underneath */}
          <div className="border-border-subtle/40 px-4 pb-3 pt-3 sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span className="text-[11px] text-text-secondary">{progress}%</span>
            </div>
            <div className="mt-2">
              <Progress value={progress} className="h-1.5 rounded-full bg-border-subtle/60" />
            </div>
            {!hideSaveAndExit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndExit}
                disabled={isSavingAll}
                className="mt-3 w-full min-h-[44px] rounded-full border-border-subtle/50 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white/90 dark:bg-bg-surface-alt/70 dark:text-text-primary dark:hover:bg-bg-surface-alt/85"
              >
                {isSavingAll ? 'Saving...' : 'Save & exit'}
              </Button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full flex max-w-7xl flex-col gap-6">
            {/* Step context */}
            <section className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  Match questionnaire
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="max-w-md text-sm leading-relaxed text-text-secondary">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-border-subtle/30 bg-bg-surface-alt/50 px-3 py-2 text-xs text-text-primary backdrop-blur-lg sm:text-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-medium">Progress autosaves while you answer.</span>
                {lastSavedAt && (
                  <span className="text-[11px] text-text-secondary">
                    Last saved{' '}
                    {new Date(lastSavedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </section>

            {/* Question card */}
            <section className="w-full">
              <Card className="rounded-2xl border border-border-subtle/30 bg-bg-surface-alt/55 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
                  {children}
                </CardContent>
              </Card>
            </section>
          </div>
        </main>

        {/* Bottom navigation */}
        <div className="sticky bottom-0 z-40 border-t border-transparent bg-transparent">
          <div
            className={
              onNext
                ? 'mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4'
                : 'mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-3 sm:px-6 sm:py-4'
            }
          >
            {!onNext && (
              <Button
                variant="outline"
                onClick={onPrev}
                disabled={!onPrev}
                className={[
                  'min-h-[44px] rounded-xl bg-white px-4 text-sm font-medium text-text-primary hover:bg-neutral-100 hover:text-text-primary disabled:opacity-50',
                  prevButtonClassName ?? '',
                ].join(' ')}
              >
                Previous
              </Button>
            )}

            {onNext && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrev}
                  disabled={!onPrev}
                  className={[
                    'min-h-[44px] shrink-0 rounded-xl bg-white px-4 text-sm font-medium text-text-primary hover:bg-neutral-100 hover:text-text-primary disabled:opacity-50',
                    prevButtonClassName ?? '',
                  ].join(' ')}
                >
                  Back
                </Button>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                  {lastSavedAt && (
                    <span className="hidden truncate text-xs text-text-secondary sm:inline">
                      Last saved{' '}
                      {new Date(lastSavedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  <Button
                    onClick={onNext}
                    disabled={!!nextDisabled}
                    className="min-h-[44px] shrink-0 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-indigo-500/40 hover:brightness-110 disabled:opacity-60"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


