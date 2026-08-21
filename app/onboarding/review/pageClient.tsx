'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, FileDown, Pencil, ShieldCheck } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { OnboardingChromeHeader } from '@/components/questionnaire/OnboardingChromeHeader'
import { ModuleTracker } from '@/components/questionnaire/ModuleTracker'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { useOnboardingStore } from '@/store/onboarding'
import v1ItemsJson from '@/data/item-bank.v1.json'
import v2ItemsJson from '@/data/item-bank.v2.json'
import type { Item, SectionKey } from '@/types/questionnaire'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { downloadBlob } from '@/lib/pdf/download-blob'

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: [
    'Very uncomfortable',
    'Uncomfortable',
    'Neutral',
    'Comfortable',
    'Very comfortable',
  ],
}

function humanize(item: Item, value: any): string {
  if (!value) return ''
  switch (item.kind) {
    case 'likert': {
      const likertScale = item.scale as 'agreement' | 'frequency' | 'comfort'
      return scaleAnchors[likertScale][value.value - 1] || String(value.value)
    }
    case 'bipolar': {
      const v = Number(value.value)
      const left = item.bipolarLabels?.left ?? ''
      const right = item.bipolarLabels?.right ?? ''
      if (v === 1) return left
      if (v === 5) return right
      if (v === 3) return 'Neutral'
      if (v === 2) return item.bipolarLabels?.softLeft ?? `More ${left.toLowerCase()}`
      if (v === 4) return item.bipolarLabels?.softRight ?? `More ${right.toLowerCase()}`
      return `${v}/5`
    }
    case 'mcq':
      return item.options?.find((o) => o.value === value.value)?.label || value.value
    case 'toggle':
      return value.value ? 'Yes' : 'No'
    case 'timeRange':
      return `${value.start} - ${value.end}`
    case 'number':
      return String(value.value)
    default:
      return String(value?.value ?? value ?? '')
  }
}

const V2_SECTION_LABELS: Record<string, string> = {
  'logistics-context': 'Logistics and Context',
  'environment-rhythms': 'Environment and Rhythms',
  'cleanliness-operations': 'Cleanliness and Operations',
  'communication-resolution': 'Communication and Resolution',
  'social-spaces': 'Social Life and Spaces',
}

const SECTION_EDIT_PATHS: Record<string, string> = {
  'logistics-context': '/onboarding/logistics-context',
  'environment-rhythms': '/onboarding/environment-rhythms',
  'cleanliness-operations': '/onboarding/cleanliness-operations',
  'communication-resolution': '/onboarding/communication-resolution',
  'social-spaces': '/onboarding/social-spaces',
}

function ReviewClientContent() {
  const sections = useOnboardingStore((s) => s.sections)
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setLastSavedAt = useOnboardingStore((s) => s.setLastSavedAt)
  const isV2User = useOnboardingStore((s) => s.isV2User)
  const allItems = isV2User() ? (v2ItemsJson as Item[]) : (v1ItemsJson as Item[])
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isProfessionalPath =
    pathname === '/onboarding-professional/review' ||
    pathname?.startsWith('/onboarding-professional/review/') ||
    (typeof window !== 'undefined' && window.location.pathname.includes('onboarding-professional'))

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSection, setOpenSection] = useState<string>('')
  const [hasHydrated, setHasHydrated] = useState(false)

  const isEditMode = searchParams.get('mode') === 'edit'

  // Hydrate all v2 modules from the API so review is not limited to localStorage.
  // Also push any local-only answers that never made it to the DB.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/onboarding/load-all')
        if (!res.ok) throw new Error('Failed to load sections')
        const data = (await res.json()) as {
          sections?: Record<
            string,
            {
              answers?: Array<{
                itemId?: string
                value?: unknown
                marksImportant?: boolean
                userSetGate?: boolean
              }>
              lastSavedAt?: string | null
            }
          >
          lastSavedAt?: string | null
        }

        for (const [sectionKey, payload] of Object.entries(data.sections ?? {})) {
          const answers = Array.isArray(payload?.answers) ? payload.answers : []
          for (const a of answers) {
            if (!a?.itemId || a.value == null) continue
            setAnswer(sectionKey as SectionKey, {
              itemId: a.itemId,
              value: a.value as any,
              marksImportant: a.marksImportant,
              userSetGate: a.userSetGate,
            })
          }
        }
        if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt)

        // Persist local sections that are missing or thinner than the local store
        const localSections = useOnboardingStore.getState().sections
        for (const sectionKey of Object.keys(V2_SECTION_LABELS)) {
          const localAnswers = Object.values(localSections[sectionKey as SectionKey] ?? {})
          if (localAnswers.length === 0) continue
          const remoteAnswers = data.sections?.[sectionKey]?.answers ?? []
          if (remoteAnswers.length >= localAnswers.length) continue

          const saveRes = await fetchWithCSRF('/api/onboarding/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: sectionKey, answers: localAnswers }),
          })
          if (saveRes.ok) {
            const saved = (await saveRes.json().catch(() => ({}))) as { lastSavedAt?: string }
            if (saved.lastSavedAt) setLastSavedAt(saved.lastSavedAt)
          }
        }
      } catch (error) {
        console.error('[Review] Failed to hydrate sections from API:', error)
      } finally {
        if (!cancelled) setHasHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setAnswer, setLastSavedAt])

  const grouped = useMemo(() => {
    const bySection: Record<string, Item[]> = {}
    for (const it of allItems) {
      bySection[it.section] ??= []
      bySection[it.section].push(it)
    }
    return bySection
  }, [allItems])

  const sectionEntries = useMemo(() => {
    // Preserve module order from the item bank / V2 labels
    const preferredOrder = Object.keys(V2_SECTION_LABELS)
    const entries = Object.entries(grouped)
      .map(([section, items]) => {
        const answeredItems = items.filter((it) => sections[section as SectionKey]?.[it.id])
        if (answeredItems.length === 0) return null
        return { section, answeredItems }
      })
      .filter(Boolean) as Array<{ section: string; answeredItems: Item[] }>

    return entries.sort((a, b) => {
      const ai = preferredOrder.indexOf(a.section)
      const bi = preferredOrder.indexOf(b.section)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }, [grouped, sections])

  const totalAnswered = useMemo(
    () => sectionEntries.reduce((sum, e) => sum + e.answeredItems.length, 0),
    [sectionEntries]
  )

  const downloadPreview = async () => {
    setIsDownloadingPdf(true)
    try {
      const response = await fetchWithCSRF('/api/pdf/generate-onboarding-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
          details?: string
        }
        showErrorToast(
          'PDF generation failed',
          data.error || data.details || 'Failed to generate PDF.'
        )
        return
      }

      const blob = await response.blob()
      await downloadBlob(
        blob,
        `domu-match-compatibility-profile-${new Date().toISOString().split('T')[0]}.pdf`,
      )
    } catch (error) {
      console.error('[Review] PDF generation failed:', error)
      showErrorToast(
        'PDF generation failed',
        error instanceof Error ? error.message : 'Unable to generate PDF. Please try again.'
      )
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const submit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const betaUserTypeConfirmed = isProfessionalPath ? 'professional' : 'student'
      const response = await fetchWithCSRF('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_terms_consent: true,
          beta_user_type_confirmed: betaUserTypeConfirmed,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        if (result.technicalError) {
          console.error('Technical error details:', result.technicalError)
        }
        const title = result.title || 'Submission Failed'
        let message = result.error || 'Unknown error occurred'
        if (response.status === 429 || message.includes('Too many requests')) {
          const retryAfter = result.retryAfter
          if (retryAfter) {
            message += ` Please wait ${Math.ceil(Number(retryAfter) / 60)} minute(s) before trying again.`
          } else {
            message += ' Please wait a few minutes before trying again.'
          }
        }
        if (process.env.NODE_ENV === 'development' && result.technicalError) {
          message += `\n\n[DEV] Technical: ${result.technicalError}`
        }
        showErrorToast(title, message)
        return
      }

      if (result.isDemo) {
        localStorage.setItem('demo-questionnaire-completed', 'true')
      }

      if (isEditMode) {
        window.location.href = '/settings'
      } else {
        window.location.href = isProfessionalPath
          ? '/onboarding-professional/complete'
          : '/onboarding/complete'
      }
    } catch (error) {
      console.error('Submit error:', error)
      showErrorToast(
        'Network Error',
        'Unable to submit questionnaire. Please check your internet connection and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = () => {
    const base = isProfessionalPath ? '/onboarding-professional' : '/onboarding'
    window.location.href = isEditMode
      ? `${base}/social-spaces?mode=edit`
      : `${base}/social-spaces`
  }

  const editHref = (section: string, itemId: string) => {
    const path = SECTION_EDIT_PATHS[section]
    if (!path) return '#'
    const params = new URLSearchParams({ q: itemId, from: 'review' })
    if (isEditMode) params.set('mode', 'edit')
    return `${path}?${params.toString()}`
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0F172A] dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingChromeHeader
          moduleIndex={5}
          moduleTotal={5}
          moduleLabel="Review"
          titleOverride="Review"
          belowProgress={
            <ModuleTracker
              currentModuleIndex={5}
              answeredInCurrent={totalAnswered}
              totalInCurrent={12}
              reviewActive
            />
          }
        />

        <main className="flex flex-1 justify-center px-4 py-6 sm:py-8">
          <div className="flex w-full max-w-[640px] flex-col gap-4">
            <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:shadow-black/40 dark:ring-slate-700/80 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Final step
                  </p>
                  <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[1.75rem]">
                    {isEditMode ? 'Review your updated answers' : 'Review your answers'}
                  </h1>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {isEditMode
                      ? 'Check your changes, then save to update your profile.'
                      : !hasHydrated
                        ? 'Loading your answers…'
                        : `${totalAnswered} answers across ${sectionEntries.length} modules. Submit when you are ready.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadPreview}
                  disabled={isDownloadingPdf}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-50 px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  <FileDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  {isDownloadingPdf ? 'PDF...' : 'PDF'}
                </button>
              </div>

              <Accordion
                type="single"
                collapsible
                value={openSection}
                onValueChange={setOpenSection}
                className="mt-6 space-y-2.5"
              >
                {sectionEntries.map(({ section, answeredItems }) => {
                  const sectionTitle = V2_SECTION_LABELS[section] ?? section.replace(/-/g, ' ')

                  return (
                    <AccordionItem
                      key={section}
                      value={section}
                      className="overflow-hidden rounded-xl border-0 bg-[#F8FAFC] ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80"
                    >
                      <AccordionTrigger className="px-4 py-3.5 hover:no-underline sm:px-5">
                        <p className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          {sectionTitle}
                        </p>
                      </AccordionTrigger>

                      <AccordionContent className="px-0 pb-0">
                        <ul className="divide-y divide-slate-200/70 border-t border-slate-200/70 dark:divide-slate-700/80 dark:border-slate-700/80">
                          {answeredItems.map((it) => {
                            const ans = sections[section as SectionKey]?.[it.id]
                            if (!ans) return null
                            return (
                              <li
                                key={it.id}
                                className="flex items-start gap-3 px-4 py-3.5 sm:px-5"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium leading-snug text-[#0F172A] dark:text-slate-50">
                                    {it.label}
                                  </p>
                                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    {humanize(it, ans.value)}
                                    {ans.userSetGate ? (
                                      <span className="ml-2 inline-flex items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#92400E] dark:bg-amber-950 dark:text-amber-200">
                                        Dealbreaker
                                      </span>
                                    ) : null}
                                  </p>
                                </div>
                                <Link
                                  href={editHref(section, it.id)}
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-[#4F46E5] dark:hover:bg-slate-800 dark:hover:text-indigo-300"
                                  aria-label={`Edit answer: ${it.label}`}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>

              <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-6 dark:border-slate-700">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:ring-slate-700/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:bg-slate-800 dark:text-indigo-400 dark:shadow-black/30">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    By clicking{' '}
                    <span className="font-semibold text-[#0F172A] dark:text-slate-50">
                      {isEditMode ? 'Save & finish' : 'Submit & finish'}
                    </span>
                    , I agree to the{' '}
                    <Link
                      href="/legal/beta-terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#4F46E5] underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Beta Terms &amp; Conditions
                    </Link>{' '}
                    and confirm my user status (Student/Professional) is accurate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting}
                  className={cn(
                    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                    isSubmitting
                      ? 'cursor-not-allowed bg-[#4F46E5]/40 dark:bg-indigo-500/40'
                      : 'bg-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  )}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : isEditMode
                      ? 'Save & finish'
                      : 'Submit & finish'}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center px-1">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                Previous
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ReviewClient() {
  return (
    <SuspenseWrapper>
      <ReviewClientContent />
    </SuspenseWrapper>
  )
}
