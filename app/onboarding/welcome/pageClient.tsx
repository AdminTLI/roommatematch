'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock,
  LayoutGrid,
  Target,
  AlertTriangle,
  Home,
  Moon,
  Sparkles,
  Battery,
  Coffee,
  BookOpen,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react'
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
  const [showLegalModal, setShowLegalModal] = useState(false)

  const canStart =
    studentOrigin !== '' &&
    studyProgramType !== '' &&
    privacyConsent &&
    dealbreakerConsent

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
          source: 'welcome_page',
        },
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      // Failing to save demographics should never block onboarding
      console.error('[OnboardingWelcome] Failed to save demographics selection', error)
    }

    const nextUrl = isEditMode ? '/onboarding/intro?mode=edit' : '/onboarding/intro'
    router.push(nextUrl)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
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
        <header className="border-b border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-purple-500 shadow-lg shadow-indigo-500/30">
                <span className="text-xs font-semibold tracking-tight text-white">DM</span>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-50">Domu Match</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Compatibility first, flatmates second
                </p>
              </div>
            </div>
            <div className="hidden text-xs font-medium text-slate-400 sm:block">
              Step 0 of 8 · Welcome &amp; guidelines
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
            {/* Left column: hero + quick stats + what's inside + honesty */}
            <section className="flex-1 space-y-5 sm:space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                  Welcome &amp; guidelines
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
                  <span className="block">Let&apos;s set you up</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-purple-400">
                    for a great roommate match
                  </span>
                </h1>
              </div>

              {/* Card 1: Quick stats */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-2xl">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/70 text-slate-50">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">⏱ Time</p>
                        <p className="text-sm leading-relaxed text-slate-200">~10–15 mins (Grab a coffee!)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/70 text-slate-50">
                        <LayoutGrid className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">🧩 Format</p>
                        <p className="text-sm leading-relaxed text-slate-200">8 short blocks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/70 text-slate-50">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">🎯 Goal</p>
                        <p className="text-sm leading-relaxed text-slate-200">Your perfect roommate match</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: The 8 Match Blocks */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-2xl">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-slate-50">The 8 Match Blocks</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <Home className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Logistics</p>
                        <p className="text-sm leading-relaxed text-slate-200">Budget, locations &amp; lease types</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <Moon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Routines</p>
                        <p className="text-sm leading-relaxed text-slate-200">Sleep schedules &amp; morning alarms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Cleanliness</p>
                        <p className="text-sm leading-relaxed text-slate-200">Chore division &amp; mess tolerance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <Battery className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Social Battery</p>
                        <p className="text-sm leading-relaxed text-slate-200">Guests, parties &amp; quiet time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <Coffee className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Lifestyle</p>
                        <p className="text-sm leading-relaxed text-slate-200">Diet, smoking &amp; drinking habits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Study Habits</p>
                        <p className="text-sm leading-relaxed text-slate-200">Home vs. library &amp; noise levels</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Communication</p>
                        <p className="text-sm leading-relaxed text-slate-200">
                          Conflict resolution &amp; shared expenses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/50 text-sky-400">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50">Dealbreakers</p>
                        <p className="text-sm leading-relaxed text-slate-200">Your absolute non-negotiables</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Honesty rule callout */}
              <div className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/20 p-4 text-sm text-amber-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/90">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="leading-relaxed">
                  <span className="font-semibold">The Golden Rule: Be brutally honest.</span> Our algorithm matches you based on
                  your real habits. If you fake your answers, you&apos;ll match with the wrong roommate.
                </p>
              </div>
            </section>

            {/* Right column: demographic selection + consents */}
            <section className="flex-1 space-y-5 sm:space-y-6">
              {/* Card 2: Demographic selection */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-2xl">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-50">Your study context</h2>
                    <p className="text-sm leading-relaxed text-slate-200">
                      Just a bit of context so we can better understand your situation.
                    </p>
                  </div>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-slate-50">Student origin</legend>
                    <p className="text-xs text-slate-300">
                      Please choose one option that best describes you.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setStudentOrigin('dutch')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-sky-400/80 hover:bg-slate-900/60',
                          studentOrigin === 'dutch'
                            ? 'border-sky-400 bg-slate-900/80 shadow-lg shadow-sky-500/30'
                            : 'border-white/15 bg-slate-900/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-slate-50">Dutch student</span>
                        <span className="mt-1 text-sm leading-relaxed text-slate-200">
                          You mainly grew up and/or studied within the Netherlands.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentOrigin('international')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-sky-400/80 hover:bg-slate-900/60',
                          studentOrigin === 'international'
                            ? 'border-sky-400 bg-slate-900/80 shadow-lg shadow-sky-500/30'
                            : 'border-white/15 bg-slate-900/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-slate-50">International student</span>
                        <span className="mt-1 text-sm leading-relaxed text-slate-200">
                          You&apos;re a non-Dutch / non-EEA student who moved here to study.
                        </span>
                      </button>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-slate-50">Study programme</legend>
                    <p className="text-xs text-slate-300">
                      Please choose one option that best matches your main degree.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setStudyProgramType('dutch_taught')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-indigo-400/80 hover:bg-slate-900/60',
                          studyProgramType === 'dutch_taught'
                            ? 'border-indigo-400 bg-slate-900/80 shadow-lg shadow-indigo-500/30'
                            : 'border-white/15 bg-slate-900/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-slate-50">Dutch-taught programme</span>
                        <span className="mt-1 text-sm leading-relaxed text-slate-200">
                          Your main programme is primarily taught in Dutch.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyProgramType('english_taught')}
                        className={[
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition',
                          'hover:border-indigo-400/80 hover:bg-slate-900/60',
                          studyProgramType === 'english_taught'
                            ? 'border-indigo-400 bg-slate-900/80 shadow-lg shadow-indigo-500/30'
                            : 'border-white/15 bg-slate-900/50'
                        ].join(' ')}
                      >
                        <span className="text-sm font-semibold text-slate-50">
                          International / English-taught programme
                        </span>
                        <span className="mt-1 text-sm leading-relaxed text-slate-200">
                          Your main programme is part of an international or English-taught track.
                        </span>
                      </button>
                    </div>
                  </fieldset>
                </CardContent>
              </Card>

              {/* Card 3: Privacy & consents */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-2xl">
                <CardContent className="space-y-4 p-5 sm:p-6 text-sm text-slate-200">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-50">Privacy &amp; consent</h2>
                    <p className="text-sm leading-relaxed text-slate-200">
                      Short version: your answers power the matching algorithm, not public profiles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={privacyConsent}
                        onCheckedChange={(checked) => setPrivacyConsent(!!checked)}
                        className="h-4 w-4 shrink-0 rounded border-slate-400/70 bg-slate-900/80 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400 focus-visible:ring-sky-500"
                      />
                      <p className="text-sm leading-relaxed text-slate-100">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowLegalModal(true)}
                          className="underline underline-offset-4 text-sky-300 hover:text-sky-200"
                        >
                          Terms &amp; Privacy Policy
                        </button>
                        .
                      </p>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={dealbreakerConsent}
                        onCheckedChange={(checked) => setDealbreakerConsent(!!checked)}
                        className="h-4 w-4 shrink-0 rounded border-slate-400/70 bg-slate-900/80 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400 focus-visible:ring-sky-500"
                      />
                      <p className="text-sm leading-relaxed text-slate-100">
                        I consent to Domu Match using my lifestyle and dealbreaker answers strictly for the matching algorithm.
                        (Your data is secure and NEVER shared publicly or with universities).
                      </p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* CTA now moved below both columns */}
            </section>
          </div>

          {/* CTA spanning full width under both columns */}
          <div className="mt-6 w-full">
            <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-50 backdrop-blur-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-slate-100">
                When you&apos;re ready, start the first block and know you can review and edit your answers before anything is final.
              </p>
              <Button
                type="button"
                onClick={handleStart}
                disabled={!canStart}
                className={[
                  'mt-1 inline-flex min-h-[44px] items-center justify-center rounded-xl px-6 text-xs sm:text-sm font-semibold tracking-tight whitespace-normal break-words text-center',
                  'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-slate-50',
                  !canStart ? 'cursor-not-allowed opacity-50' : 'hover:brightness-110'
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
                <TabsList className="mb-3 w-full max-w-[720px] bg-slate-800/90 border border-slate-700 rounded-full p-1 overflow-hidden">
                  <TabsTrigger
                    value="terms"
                    className="flex-1 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-200"
                  >
                    Terms
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="flex-1 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-200"
                  >
                    Privacy Policy
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="terms">
                <div className="mt-2 h-[60vh] w-full max-w-[720px] mx-auto overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 [&_nav]:hidden">
                  <TermsPage />
                </div>
              </TabsContent>
              <TabsContent value="privacy">
                <div className="mt-2 h-[60vh] w-full max-w-[720px] mx-auto overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 [&_nav]:hidden">
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

