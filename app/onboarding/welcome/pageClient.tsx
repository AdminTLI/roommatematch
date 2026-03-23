'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, LayoutGrid, Target, AlertTriangle, CircleAlert } from 'lucide-react'
import { WelcomeMatchBlocksCard } from '@/app/onboarding/components/welcome-match-blocks-card'
import TermsPage from '@/app/(marketing)/terms/page'
import PrivacyPage from '@/app/(marketing)/privacy/page'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

type StudentOrigin = 'dutch' | 'international' | ''
type StudyProgramType = 'dutch_taught' | 'english_taught' | ''

export default function OnboardingWelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isEditMode = mode === 'edit'
  const supabase = createClient()

  const [studentOrigin, setStudentOrigin] = useState<StudentOrigin>('')
  const [studyProgramType, setStudyProgramType] = useState<StudyProgramType>('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [dealbreakerConsent, setDealbreakerConsent] = useState(false)
  const [specialCategoryConsent, setSpecialCategoryConsent] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)

  const canStart =
    studentOrigin !== '' &&
    studyProgramType !== '' &&
    privacyConsent &&
    dealbreakerConsent &&
    specialCategoryConsent

  const handleStart = async () => {
    if (!canStart) return

    // Persist demographic selections + legal consents for future algorithmic use and audit trail
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from('app_events').insert({
        user_id: user?.id ?? null,
        name: 'onboarding_demographics_set',
        props: {
          student_origin: studentOrigin,
          study_program_type: studyProgramType,
          accepted_terms_and_privacy: privacyConsent,
          accepted_dealbreaker_consent: dealbreakerConsent,
          accepted_special_category_consent: specialCategoryConsent,
          source: 'welcome_page',
        },
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      // Failing to save demographics should never block onboarding
      console.error('[OnboardingWelcome] Failed to save demographics selection', error)
    }

    const base = typeof window !== 'undefined' && window.location.pathname.includes('onboarding-professional') ? '/onboarding-professional' : '/onboarding'
    const nextStep = base === '/onboarding-professional' ? 'professional-context' : 'intro'
    const nextUrl = isEditMode ? `${base}/${nextStep}?mode=edit` : `${base}/${nextStep}`
    router.push(nextUrl)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-body text-text-primary">
      {/* Soft gradient background, similar to dashboard discovery feed */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 blur-3xl" />
      </div>

      {/* Subtle grid / noise overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_55%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Keep header styling / brand exactly as is */}
        <header className="border-b border-transparent bg-transparent">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-purple-500 shadow-lg shadow-indigo-500/30">
                <span className="text-xs font-semibold tracking-tight text-white">DM</span>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-text-primary">Domu Match</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
                  Compatibility first, flatmates second
                </p>
              </div>
            </div>
            <div className="hidden text-xs font-medium text-text-secondary sm:block">
              Step 0 of 8 · Welcome &amp; guidelines
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 sm:gap-14 lg:gap-16">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">Welcome &amp; guidelines</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                <span className="block">Let&apos;s set you up</span>
                <span className="mt-1 block bg-gradient-to-r from-sky-400 via-emerald-300 to-purple-400 bg-clip-text text-transparent">
                  for a great roommate match
                </span>
              </h1>
            </div>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="p-5 sm:p-6 lg:p-7">
                <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-text-primary ring-1 ring-white/5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">⏱ Time</p>
                      <p className="text-sm leading-relaxed text-text-primary/90">~10 - 15 mins (Grab a coffee!)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-text-primary ring-1 ring-white/5">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">🧩 Format</p>
                      <p className="text-sm leading-relaxed text-text-primary/90">8 short blocks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-text-primary ring-1 ring-white/5">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">🎯 Goal</p>
                      <p className="text-sm leading-relaxed text-text-primary/90">Your perfect roommate match</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <WelcomeMatchBlocksCard heading="The 8 match blocks" />

            <div className="flex gap-4 rounded-3xl border border-amber-400/25 bg-amber-500/[0.12] p-6 text-sm text-text-primary backdrop-blur-sm sm:p-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/90">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="max-w-4xl leading-relaxed">
                <span className="font-semibold">The Golden Rule: Be brutally honest.</span> Our algorithm matches you based on
                your real habits. If you fake your answers, you&apos;ll match with the wrong roommate.
              </p>
            </div>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
                <div className="max-w-2xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">Your study context</h2>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    Just a bit of context so we can better understand your situation.
                  </p>
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-text-primary">Student origin</legend>
                  <p className="text-xs text-text-primary/90">Please choose one option that best describes you.</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
                      <button
                        type="button"
                        onClick={() => setStudentOrigin('dutch')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-sky-400/80 hover:bg-bg-surface-alt/60',
                          studentOrigin === 'dutch'
                            ? 'border-sky-400 bg-bg-surface-alt/80 shadow-lg shadow-sky-500/30'
                            : 'border-border-subtle/30 bg-bg-surface-alt/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-text-primary">Dutch student</span>
                        <span className="mt-1 text-sm leading-relaxed text-text-primary">
                          You mainly grew up and/or studied within the Netherlands.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentOrigin('international')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-sky-400/80 hover:bg-bg-surface-alt/60',
                          studentOrigin === 'international'
                            ? 'border-sky-400 bg-bg-surface-alt/80 shadow-lg shadow-sky-500/30'
                            : 'border-border-subtle/30 bg-bg-surface-alt/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-text-primary">International student</span>
                        <span className="mt-1 text-sm leading-relaxed text-text-primary">
                          You&apos;re a non-Dutch / non-EEA student who moved here to study.
                        </span>
                      </button>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-text-primary">Study programme</legend>
                    <p className="text-xs text-text-primary/90">
                      Please choose one option that best matches your main degree.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
                      <button
                        type="button"
                        onClick={() => setStudyProgramType('dutch_taught')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-indigo-400/80 hover:bg-bg-surface-alt/60',
                          studyProgramType === 'dutch_taught'
                            ? 'border-indigo-400 bg-bg-surface-alt/80 shadow-lg shadow-indigo-500/30'
                            : 'border-border-subtle/30 bg-bg-surface-alt/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-text-primary">Dutch-taught programme</span>
                        <span className="mt-1 text-sm leading-relaxed text-text-primary">
                          Your main programme is primarily taught in Dutch.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyProgramType('english_taught')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-indigo-400/80 hover:bg-bg-surface-alt/60',
                          studyProgramType === 'english_taught'
                            ? 'border-indigo-400 bg-bg-surface-alt/80 shadow-lg shadow-indigo-500/30'
                            : 'border-border-subtle/30 bg-bg-surface-alt/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-text-primary">
                          International / English-taught programme
                        </span>
                        <span className="mt-1 text-sm leading-relaxed text-text-primary">
                          Your main programme is part of an international or English-taught track.
                        </span>
                      </button>
                    </div>
                  </fieldset>
                </CardContent>
              </Card>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-5 p-5 text-text-primary sm:p-6 lg:p-7">
                <div className="max-w-2xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Privacy &amp; consent</h2>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    Short version: your answers power the matching algorithm, not public profiles.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center self-start">
                      <Checkbox
                        checked={privacyConsent}
                        onCheckedChange={(checked) => setPrivacyConsent(!!checked)}
                        className="rounded border-border-subtle bg-bg-surface-alt/80 data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400 focus-visible:ring-sky-500"
                      />
                    </span>
                    <p className="m-0 min-w-0 flex-1 leading-relaxed sm:text-[15px]">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowLegalModal(true)}
                        className="text-sky-400 underline underline-offset-4 hover:text-sky-300"
                      >
                        Terms &amp; Privacy Policy
                      </button>
                      .
                    </p>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center self-start">
                      <Checkbox
                        checked={dealbreakerConsent}
                        onCheckedChange={(checked) => setDealbreakerConsent(!!checked)}
                        className="rounded border-border-subtle bg-bg-surface-alt/80 data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400 focus-visible:ring-sky-500"
                      />
                    </span>
                    <p className="m-0 min-w-0 flex-1 leading-relaxed sm:text-[15px]">
                      I consent to Domu Match using my lifestyle and dealbreaker answers strictly for the matching algorithm.
                      (Your data is secure and NEVER shared publicly or with universities).
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-amber-400/30 bg-amber-500/[0.12] backdrop-blur-xl">
              <CardContent className="space-y-5 p-5 text-text-primary sm:p-6 lg:p-7">
                <div className="max-w-3xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Special category data questions</h2>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    Some questions show a{' '}
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Sensitive
                    </span>{' '}
                    icon. These are classed as special category data.
                  </p>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    We ask these only to improve matching accuracy and compatibility. We do not use this information
                    for advertising, and we do not show it publicly.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center self-start">
                    <Checkbox
                      checked={specialCategoryConsent}
                      onCheckedChange={(checked) => setSpecialCategoryConsent(!!checked)}
                      className="rounded border-border-subtle bg-bg-surface-alt/80 data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400 focus-visible:ring-sky-500"
                    />
                  </span>
                  <p className="m-0 min-w-0 flex-1 leading-relaxed sm:text-[15px]">
                    I understand what the{' '}
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Sensitive
                    </span>{' '}
                    icon means and I consent to Domu Match processing those answers strictly for roommate matching.
                  </p>
                </label>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle/25 bg-bg-surface-alt/50 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-8 lg:p-10">
              <p className="max-w-3xl text-sm leading-relaxed text-text-primary/95 sm:text-base">
                When you&apos;re ready, start the first block and know you can review and edit your answers before
                anything is final.
              </p>
              <Button
                type="button"
                onClick={handleStart}
                disabled={!canStart}
                className={[
                  'inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl px-8 text-sm font-semibold tracking-tight sm:min-w-[11rem]',
                  'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-text-primary',
                  !canStart ? 'cursor-not-allowed opacity-50' : 'hover:brightness-110',
                ].join(' ')}
              >
                Let&apos;s Begin
              </Button>
            </div>
          </div>
        </main>

        {/* Terms & Privacy modal */}
        <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Terms &amp; Privacy Policy</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="terms" className="mt-2 w-full">
              <div className="w-full flex justify-center">
                <TabsList className="mb-3 w-full max-w-[720px] bg-bg-surface-alt/80 border border-border-subtle/60 rounded-full p-1 overflow-hidden">
                  <TabsTrigger
                    value="terms"
                    className="flex-1 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-text-secondary"
                  >
                    Terms
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="flex-1 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-text-secondary"
                  >
                    Privacy Policy
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="terms">
                <div className="mt-2 h-[60vh] w-full max-w-[720px] mx-auto overflow-y-auto rounded-xl border border-border-subtle/40 bg-bg-surface-alt p-4 [&_nav]:hidden">
                  <TermsPage />
                </div>
              </TabsContent>
              <TabsContent value="privacy">
                <div className="mt-2 h-[60vh] w-full max-w-[720px] mx-auto overflow-y-auto rounded-xl border border-border-subtle/40 bg-bg-surface-alt p-4 [&_nav]:hidden">
                  <PrivacyPage />
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

