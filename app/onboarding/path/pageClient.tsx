'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Briefcase, GraduationCap, Lightbulb } from 'lucide-react'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import type { UserType } from '@/types/profile'
import { pathSelectionSchema } from '@/lib/validation/profile-schema'
import { AcademicVerificationGate } from '@/app/(components)/academic-verification-gate'
import { OnboardingHeader } from '@/components/questionnaire/OnboardingHeader'
import { cn } from '@/lib/utils'

const PATH_OPTIONS: {
  value: UserType
  title: string
  description: string
  Icon: typeof GraduationCap
}[] = [
  {
    value: 'student',
    title: 'I am a student',
    description: 'Match exclusively with other students and unlock university-specific features.',
    Icon: GraduationCap,
  },
  {
    value: 'professional',
    title: 'I am a young professional',
    description: 'Match with other working professionals and graduates.',
    Icon: Briefcase,
  },
]

export default function PathSelectionClient({ preview = false }: { preview?: boolean }) {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showStudentGate, setShowStudentGate] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canContinue = Boolean(selected) && !isLoading

  const handleNext = async () => {
    const parsed = pathSelectionSchema.safeParse({ user_type: selected })
    if (!parsed.success || !selected) {
      showErrorToast('Please select an option', 'Choose whether you are a student or a young professional.')
      return
    }

    if (preview) {
      if (selected === 'student') {
        setShowStudentGate(true)
        return
      }
      showSuccessToast(
        'Preview only',
        'Professionals would continue to /onboarding-professional/welcome. This route does not save or redirect.'
      )
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user?.id) {
        showErrorToast('Session expired', 'Please sign in again.')
        return
      }

      const response = await fetchWithCSRF('/api/onboarding/path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id, user_type: selected }),
      })

      const data: { ok?: boolean; isVerifiedStudent?: boolean; error?: string } = await response.json().catch(
        () => ({})
      )

      if (!response.ok || !data.ok) {
        const message =
          data.error ||
          'We could not save your selection. Please try again. If the problem persists, contact support.'
        showErrorToast('Could not save selection', message)
        return
      }

      if (selected === 'professional') {
        router.push('/onboarding-professional/welcome')
        return
      }

      if (data.isVerifiedStudent) {
        router.push('/onboarding/welcome')
        return
      }

      setShowStudentGate(true)
    } catch (e) {
      console.error('[PathSelection] Failed to save user_type:', e)
      showErrorToast(
        'Something went wrong',
        e instanceof Error && e.message
          ? e.message
          : 'Please try again. If the problem persists, contact support.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentVerified = () => {
    if (preview) {
      setShowStudentGate(false)
      return
    }
    router.push('/onboarding/welcome')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingHeader
          statusMode="welcome"
          chipLabel={preview ? 'Preview' : showStudentGate ? 'Verify' : 'Get started'}
          exitHref={preview ? '/' : '/dashboard'}
        />

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
          <div
            className={cn(
              'flex w-full max-w-[540px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 transition-all duration-500 sm:gap-6 sm:p-8',
              'dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            )}
          >
            {showStudentGate ? (
              <AcademicVerificationGate
                preview={preview}
                onVerified={handleStudentVerified}
                onBack={() => setShowStudentGate(false)}
              />
            ) : (
              <>
                <div className="space-y-2.5 text-center">
                  <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[2rem]">
                    Which best describes you?
                  </h1>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                    We match you only with people in the same cohort
                  </p>
                </div>

                <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Choose your path">
                  {PATH_OPTIONS.map(({ value, title, description, Icon }) => {
                    const isSelected = selected === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelected(value)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] dark:border-indigo-400 dark:bg-indigo-500/15'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700/50'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            isSelected
                              ? 'bg-white text-[#6366F1] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:bg-slate-800 dark:text-indigo-300'
                              : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700'
                          )}
                          aria-hidden
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.25} />
                        </span>
                        <span className="min-w-0 space-y-0.5">
                          <span
                            className={cn(
                              'block text-sm font-semibold',
                              isSelected
                                ? 'text-[#6366F1] dark:text-indigo-300'
                                : 'text-[#0F172A] dark:text-slate-50'
                            )}
                          >
                            {title}
                          </span>
                          <span
                            className={cn(
                              'block text-sm leading-relaxed',
                              isSelected
                                ? 'text-indigo-700/80 dark:text-indigo-200/80'
                                : 'text-slate-600 dark:text-slate-300'
                            )}
                          >
                            {description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/70">
                  <Lightbulb
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <p className="text-left text-xs font-medium leading-relaxed text-amber-950 dark:text-amber-100 sm:text-[13px]">
                    Students and professionals are matched separately for a safer, more relevant
                    experience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all',
                    canContinue
                      ? 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
                      : 'cursor-not-allowed bg-indigo-500/40 dark:bg-indigo-500/40'
                  )}
                >
                  {isLoading ? 'Saving…' : 'Continue'}
                  {!isLoading && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
