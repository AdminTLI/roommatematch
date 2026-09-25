'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Lock,
  Zap,
  Clock,
  GraduationCap,
  BookOpen,
  Home,
  Lightbulb,
  type LucideProps,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { OnboardingHeader } from '@/components/questionnaire/OnboardingHeader'
import { LegalConsentModal } from '@/components/questionnaire/LegalConsentModal'
import { useOnboardingStore } from '@/store/onboarding'
import { cn } from '@/lib/utils'

type StepIcon = ComponentType<LucideProps>

/** Context-only first step — university, study, and living basics before dashboard access. */
const CONTEXT_STEPS: {
  label: string
  detail: string
  Icon: StepIcon
  iconClass: string
}[] = [
  {
    label: 'Your university',
    detail: 'Where you study',
    Icon: GraduationCap,
    iconClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Your programme',
    detail: 'Degree and course',
    Icon: BookOpen,
    iconClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    label: 'Living basics',
    detail: 'Move-in and logistics',
    Icon: Home,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
]

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === '1' || searchParams.get('mode') === 'edit'
  const supabase = createClient()
  const setLastSavedAt = useOnboardingStore((s) => s.setLastSavedAt)

  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadSavedSelections = async () => {
      try {
        const loadResponse = await fetch('/api/onboarding/load?section=intro')
        if (!loadResponse.ok) return

        const { answers } = await loadResponse.json()
        if (!Array.isArray(answers)) return

        const byId = answers.reduce<Record<string, unknown>>(
          (acc, answer: { itemId?: string; value?: unknown }) => {
            if (answer?.itemId) acc[String(answer.itemId)] = answer.value
            return acc
          },
          {}
        )

        if (typeof byId.accepted_terms_and_privacy === 'boolean') {
          setPrivacyConsent(byId.accepted_terms_and_privacy)
        }
      } catch (error) {
        console.error('[OnboardingWelcome] Failed to load saved consent', error)
      }
    }

    loadSavedSelections()
  }, [])

  const canStart = privacyConsent && !isStarting

  const handleStart = async () => {
    if (!privacyConsent || isStarting) return
    setIsStarting(true)

    try {
      const loadResponse = await fetch('/api/onboarding/load?section=intro')
      const existingAnswers = loadResponse.ok ? ((await loadResponse.json()).answers ?? []) : []
      const existingById = new Map<string, { itemId: string; value: unknown }>()
      for (const answer of existingAnswers) {
        if (answer?.itemId) {
          existingById.set(String(answer.itemId), answer)
        }
      }

      // Preserve demographics / deferred consents if already collected elsewhere.
      // Welcome only requires Terms & Privacy — special-category & dealbreaker
      // consent is collected in-situ when those questions appear.
      existingById.set('accepted_terms_and_privacy', {
        itemId: 'accepted_terms_and_privacy',
        value: privacyConsent,
      })

      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'intro',
          answers: Array.from(existingById.values()),
        }),
      })

      setLastSavedAt(new Date().toISOString())

      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from('app_events').insert({
        user_id: user?.id ?? null,
        name: 'onboarding_welcome_started',
        props: {
          accepted_terms_and_privacy: privacyConsent,
          source: 'welcome_page',
          stage: 'context',
        },
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('[OnboardingWelcome] Failed to save welcome consent', error)
    }

    const base =
      typeof window !== 'undefined' && window.location.pathname.includes('onboarding-professional')
        ? '/onboarding-professional'
        : '/onboarding'
    const nextStep = base === '/onboarding-professional' ? 'professional-context' : 'intro'
    const nextUrl = isEditMode ? `${base}/${nextStep}?mode=edit` : `${base}/${nextStep}`
    router.push(nextUrl)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingHeader statusMode="welcome" />

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
          <div
            className={cn(
              'flex w-full max-w-[540px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/70 transition-all duration-500 sm:gap-6 sm:p-8',
              'dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            )}
          >
            {/* Hero — dating-app style: short ask, clear payoff */}
            <div className="space-y-2.5 text-center">
              <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[2rem]">
                A few basics, then you&apos;re in
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
                Tell us where you study and how you want to live. Then you can browse matches right
                away.
              </p>
            </div>

            {/* Scope badge */}
            <div className="mx-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 sm:w-auto sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#6366F1] dark:text-indigo-400" strokeWidth={2.25} aria-hidden />
                Super quick
              </span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden>
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.25} aria-hidden />
                About 2 minutes
              </span>
            </div>

            {/* What to fill — three clear steps */}
            <div className="space-y-3">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Fill in real quick
              </p>

              <ul className="space-y-2">
                {CONTEXT_STEPS.map(({ label, detail, Icon, iconClass }, index) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80 dark:bg-slate-900/60 dark:ring-slate-700"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800',
                        iconClass
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold text-[#0F172A] dark:text-slate-50">
                        {label}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:ring-amber-800/70">
              <Lightbulb
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                strokeWidth={2.25}
                aria-hidden
              />
              <p className="text-left text-xs font-medium leading-relaxed text-amber-950 dark:text-amber-100 sm:text-[13px]">
                Tip: You can add living-habit details later to unlock fuller match scores
              </p>
            </div>

            {/* Privacy */}
            <div className="flex gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#6366F1] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:bg-slate-800 dark:text-indigo-400 dark:shadow-black/30">
                <Lock className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-slate-50">
                  Privacy Guarantee
                </p>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Your exact answers are never public. Only compatibility scores are shown to
                  potential matches.
                </p>
              </div>
            </div>

            {/* Legal + CTA */}
            <div className="space-y-3.5">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(!!checked)}
                  className="shrink-0 rounded border-slate-300 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500 dark:border-slate-500"
                />
                <span className="leading-none text-slate-700 dark:text-slate-200">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowLegalModal(true)
                    }}
                    className="font-semibold text-[#6366F1] underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Terms &amp; Privacy Policy
                  </button>
                </span>
              </label>

              <button
                type="button"
                onClick={handleStart}
                disabled={!canStart}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all',
                  canStart
                    ? 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:bg-indigo-500 dark:hover:bg-indigo-400'
                    : 'cursor-not-allowed bg-indigo-500/40 dark:bg-indigo-500/40'
                )}
              >
                {isStarting ? 'Starting…' : 'Continue'}
                {!isStarting && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
              </button>
            </div>
          </div>
        </main>
      </div>

      <LegalConsentModal open={showLegalModal} onOpenChange={setShowLegalModal} />
    </div>
  )
}
