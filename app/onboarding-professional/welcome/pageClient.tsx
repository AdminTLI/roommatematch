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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  professionalWelcomeDemographicsSchema,
  type ProfessionalEmploymentStatus,
  type ProfessionalWorkModel,
} from '@/lib/onboarding/professional-welcome-schema'
import { LINKEDIN_INDUSTRIES, LINKEDIN_INDUSTRY_SKIP } from '@/lib/constants/linkedin-industries'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

const EMPLOYMENT_LABELS: Record<ProfessionalEmploymentStatus, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  freelance_contractor: 'Freelance/Contractor',
  looking_for_work: 'Looking for work',
}

const WORK_MODEL_LABELS: Record<ProfessionalWorkModel, string> = {
  fully_remote: 'Fully Remote',
  hybrid: 'Hybrid',
  fully_office: 'Fully On-site',
}

export default function OnboardingProfessionalWelcomeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isEditMode = mode === 'edit'
  const supabase = createClient()

  const [employmentStatus, setEmploymentStatus] = useState<ProfessionalEmploymentStatus | ''>('')
  const [workModel, setWorkModel] = useState<ProfessionalWorkModel | ''>('')
  const [industry, setIndustry] = useState<string>(LINKEDIN_INDUSTRY_SKIP)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [dealbreakerConsent, setDealbreakerConsent] = useState(false)
  const [specialCategoryConsent, setSpecialCategoryConsent] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const canStart =
    employmentStatus !== '' &&
    workModel !== '' &&
    privacyConsent &&
    dealbreakerConsent &&
    specialCategoryConsent

  const handleContinue = async () => {
    setFormError(null)
    if (!canStart) return

    const industryValue = industry === LINKEDIN_INDUSTRY_SKIP ? undefined : industry

    const parsed = professionalWelcomeDemographicsSchema.safeParse({
      employment_status: employmentStatus,
      work_model: workModel,
      industry: industryValue,
    })

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Please check your answers.'
      setFormError(msg)
      return
    }

    setIsSaving(true)
    try {
      const answers: Array<{ itemId: string; value: unknown }> = [
        { itemId: 'employment_status', value: parsed.data.employment_status },
        { itemId: 'wfh_status', value: parsed.data.work_model },
      ]
      if (parsed.data.industry) {
        answers.push({ itemId: 'industry', value: parsed.data.industry })
      }

      await fetchWithCSRF('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'professional-context',
          answers,
        }),
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from('app_events').insert({
        user_id: user?.id ?? null,
        name: 'onboarding_demographics_set',
        props: {
          cohort: 'professional',
          employment_status: parsed.data.employment_status,
          work_model: parsed.data.work_model,
          ...(parsed.data.industry ? { industry: parsed.data.industry } : {}),
          accepted_terms_and_privacy: privacyConsent,
          accepted_dealbreaker_consent: dealbreakerConsent,
          accepted_special_category_consent: specialCategoryConsent,
          source: 'professional_welcome_page',
        },
        created_at: new Date().toISOString(),
      })

      const base = '/onboarding-professional'
      const nextUrl = isEditMode ? `${base}/professional-context?mode=edit` : `${base}/professional-context`
      router.push(nextUrl)
    } catch (error) {
      console.error('[OnboardingProfessionalWelcome] Failed to save', error)
      setFormError(error instanceof Error ? error.message : 'Could not save your answers. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectTriggerClass =
    'border-border-subtle/30 bg-bg-surface-alt/80 text-text-primary shadow-none backdrop-blur-xl [&>span]:text-text-primary [&>span[data-placeholder]]:text-text-secondary'

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-body text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_55%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-transparent bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 text-center sm:px-8 sm:py-6 lg:px-12">
            <p className="text-xs font-medium text-text-secondary sm:text-sm">
              Step 0 of 8 · Welcome &amp; guidelines
            </p>
          </div>
        </header>

        <main className="flex-1 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 sm:gap-14 lg:gap-16">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                <span className="block">Welcome to Domu Match</span>
                <span className="mt-1 block bg-gradient-to-r from-sky-400 via-emerald-300 to-purple-400 bg-clip-text text-transparent">
                  for professionals
                </span>
              </h1>
              <p className="text-base leading-relaxed text-text-primary/95 sm:text-lg">
                You&apos;ve graduated and you&apos;re building your career - we match you with like-minded working adults
                who value stable logistics, reliability, and a calm home that supports your professional life.
              </p>
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
                      <p className="text-sm leading-relaxed text-text-primary/90">~10 - 15 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-text-primary ring-1 ring-white/5">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">🧩 Format</p>
                      <p className="text-sm leading-relaxed text-text-primary/90">8 focused blocks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-text-primary ring-1 ring-white/5">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-primary">🎯 Goal</p>
                      <p className="text-sm leading-relaxed text-text-primary/90">
                        A low-drama home that fits your work rhythm
                      </p>
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
                <span className="font-semibold">Be honest about your real routines.</span> Stability matters most when
                you&apos;re working - accurate answers help us match you with someone whose lifestyle actually fits
                yours.
              </p>
            </div>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
                <div className="max-w-2xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">Your professional context</h2>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    A quick snapshot of how you work so we can contextualize your living preferences.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employment-status" className="text-sm font-semibold text-text-primary">
                      Employment status
                    </Label>
                    <Select
                      value={employmentStatus === '' ? undefined : employmentStatus}
                      onValueChange={(v) => setEmploymentStatus(v as ProfessionalEmploymentStatus)}
                    >
                      <SelectTrigger id="employment-status" className={selectTriggerClass} aria-label="Employment status">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent disableScrollLock className="border-border-subtle/40 bg-bg-surface-alt text-text-primary">
                        {(Object.keys(EMPLOYMENT_LABELS) as ProfessionalEmploymentStatus[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {EMPLOYMENT_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work-model" className="text-sm font-semibold text-text-primary">
                      Work model
                    </Label>
                    <Select
                      value={workModel === '' ? undefined : workModel}
                      onValueChange={(v) => setWorkModel(v as ProfessionalWorkModel)}
                    >
                      <SelectTrigger id="work-model" className={selectTriggerClass} aria-label="Work model">
                        <SelectValue placeholder="Select work model" />
                      </SelectTrigger>
                      <SelectContent disableScrollLock className="border-border-subtle/40 bg-bg-surface-alt text-text-primary">
                        {(Object.keys(WORK_MODEL_LABELS) as ProfessionalWorkModel[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {WORK_MODEL_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-semibold text-text-primary">
                    Industry <span className="font-normal text-text-secondary">(optional)</span>
                  </Label>
                  <Select value={industry} onValueChange={(v) => setIndustry(v)}>
                    <SelectTrigger id="industry" className={selectTriggerClass} aria-label="Industry">
                      <SelectValue placeholder="Select industry (optional)" />
                    </SelectTrigger>
                    <SelectContent disableScrollLock className="max-h-[min(320px,70vh)] border-border-subtle/40 bg-bg-surface-alt text-text-primary">
                      <SelectItem value={LINKEDIN_INDUSTRY_SKIP}>Prefer not to say</SelectItem>
                      {LINKEDIN_INDUSTRIES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
              <CardContent className="space-y-5 p-5 text-text-primary sm:p-6 lg:p-7">
                <div className="max-w-2xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Privacy &amp; consent</h2>
                  <p className="text-sm leading-relaxed text-text-primary/90 sm:text-base">
                    Your answers power the matching algorithm; they are not shown on a public profile.
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
                      I consent to Domu Match using my lifestyle and dealbreaker answers strictly for the matching
                      algorithm. Your data is kept secure and is not sold or shared publicly.
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
                    We use these answers only to improve roommate matching accuracy. They are not used for
                    advertising and are not shown publicly.
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

            {formError && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle/25 bg-bg-surface-alt/50 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-8 lg:p-10">
              <p className="max-w-3xl text-sm leading-relaxed text-text-primary/95 sm:text-base">
                When you&apos;re ready, continue to the next step - you can review and edit answers before anything is
                final.
              </p>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!canStart || isSaving}
                className={[
                  'inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl px-8 text-sm font-semibold tracking-tight sm:min-w-[11rem]',
                  'bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white',
                  !canStart || isSaving ? 'cursor-not-allowed opacity-50' : 'hover:brightness-110',
                ].join(' ')}
              >
                {isSaving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </main>

        <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Terms &amp; Privacy Policy</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="terms" className="mt-2 w-full">
              <div className="flex w-full justify-center">
                <TabsList className="mb-3 w-full max-w-[720px] overflow-hidden rounded-full border border-border-subtle/60 bg-bg-surface-alt/80 p-1">
                  <TabsTrigger
                    value="terms"
                    className="flex-1 rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-text-secondary sm:text-sm"
                  >
                    Terms
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="flex-1 rounded-full px-4 py-2 text-xs font-semibold data-[state=active]:bg-sky-400 data-[state=active]:text-slate-950 data-[state=inactive]:bg-transparent data-[state=inactive]:text-text-secondary sm:text-sm"
                  >
                    Privacy Policy
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="terms">
                <div className="mx-auto mt-2 h-[60vh] w-full max-w-[720px] overflow-y-auto rounded-xl border border-border-subtle/40 bg-bg-surface-alt p-4 [&_nav]:hidden">
                  <TermsPage />
                </div>
              </TabsContent>
              <TabsContent value="privacy">
                <div className="mx-auto mt-2 h-[60vh] w-full max-w-[720px] overflow-y-auto rounded-xl border border-border-subtle/40 bg-bg-surface-alt p-4 [&_nav]:hidden">
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
