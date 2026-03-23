'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { useOnboardingStore } from '@/store/onboarding'
import itemsJson from '@/data/item-bank.v1.json'
import type { Item } from '@/types/questionnaire'
import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FileDown, AlertCircle, ShieldCheck } from 'lucide-react'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast } from '@/lib/toast'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
}

function humanize(item: Item, value: any): string {
  if (!value) return ''
  switch (item.kind) {
    case 'likert':
      const likertScale = item.scale as 'agreement' | 'frequency' | 'comfort'
      return scaleAnchors[likertScale][value.value - 1] || String(value.value)
    case 'bipolar':
      return `${value.value}/5 (${item.bipolarLabels?.left} ↔ ${item.bipolarLabels?.right})`
    case 'mcq':
      return item.options?.find((o) => o.value === value.value)?.label || value.value
    case 'toggle':
      return value.value ? 'Yes' : 'No'
    case 'timeRange':
      return `${value.start} – ${value.end}`
    case 'number':
      return String(value.value)
  }
}

function ReviewClientContent() {
  const sections = useOnboardingStore((s) => s.sections)
  const allItems = itemsJson as Item[]
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isProfessionalReview =
    pathname === '/onboarding-professional/review' ||
    pathname?.startsWith('/onboarding-professional/review/')
  const [isAgreed, setIsAgreed] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [reviewQuery, setReviewQuery] = useState('')
  const [dealbreakersOnly, setDealbreakersOnly] = useState(false)
  const [openSectionValues, setOpenSectionValues] = useState<string[]>([])
  
  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'
  const grouped = useMemo(() => {
    const bySection: Record<string, Item[]> = {}
    for (const it of allItems) {
      bySection[it.section] ??= []
      bySection[it.section].push(it)
    }
    return bySection
  }, [allItems])

  const normalizedQuery = reviewQuery.trim().toLowerCase()
  const hasActiveFilters = normalizedQuery.length > 0 || dealbreakersOnly

  const filteredSectionEntries = useMemo(() => {
    return Object.entries(grouped)
      .map(([section, items]) => {
        const answeredItems = items.filter((it) => sections[section]?.[it.id])
        if (answeredItems.length === 0) return null

        const dealBreakerCount = answeredItems.filter(
          (it) => sections[section]?.[it.id]?.dealBreaker
        ).length

        const visibleItems = answeredItems.filter((it) => {
          const ans = sections[section]?.[it.id]
          if (!ans) return false

          if (dealbreakersOnly && !ans.dealBreaker) return false
          if (!normalizedQuery) return true

          const labelMatch = it.label.toLowerCase().includes(normalizedQuery)
          const valueMatch = humanize(it, ans.value).toLowerCase().includes(normalizedQuery)
          return labelMatch || valueMatch
        })

        return {
          section,
          answeredCount: answeredItems.length,
          dealBreakerCount,
          visibleItems,
        }
      })
      .filter(Boolean) as Array<{
        section: string
        answeredCount: number
        dealBreakerCount: number
        visibleItems: Item[]
      }>
  }, [grouped, sections, dealbreakersOnly, normalizedQuery])

  const matchingSectionValues = useMemo(
    () => filteredSectionEntries.filter((e) => e.visibleItems.length > 0).map((e) => e.section),
    [filteredSectionEntries]
  )

  useEffect(() => {
    // When filters are active, auto-open the sections that have matches.
    // When filters are cleared, collapse back into an overview.
    if (!hasActiveFilters) {
      setOpenSectionValues([])
      return
    }
    setOpenSectionValues(matchingSectionValues)
  }, [hasActiveFilters, matchingSectionValues])
  const downloadPreview = async () => {
    setIsDownloadingPdf(true)

    try {
      const response = await fetch('/api/pdf/generate-onboarding-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
          details?: string
          retryAfter?: number
        }

        const message =
          data.error ||
          data.details ||
          (response.status === 429 ? 'Please try again later.' : 'Failed to generate PDF.')

        showErrorToast('PDF generation failed', message)
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `domu-match-onboarding-agreement-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
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
    try {
      // The submit endpoint reads all sections from the database (onboarding_sections table)
      // Autosave should have already saved all sections with its 800ms debounce
      // We don't need to pre-save here as it causes rate limiting issues
      // Instead, we'll rely on autosave and the submit endpoint's ability to read from DB
      
      console.log('[Review] Submitting questionnaire...')
      
      // Submit directly - the API will read sections from database
      const isProfessionalPath =
        typeof window !== 'undefined' && window.location.pathname.includes('onboarding-professional')
      const betaUserTypeConfirmed = isProfessionalPath ? 'professional' : 'student'

      const response = await fetchWithCSRF('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_terms_consent: isAgreed,
          beta_user_type_confirmed: betaUserTypeConfirmed
        })
      })
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Submit failed:', result.error)
        
        // Only log technical error if it exists
        if (result.technicalError) {
          console.error('Technical error details:', result.technicalError)
        }
        
        // Show user-friendly error message with title
        const title = result.title || 'Submission Failed'
        let message = result.error || 'Unknown error occurred'
        
        // Handle rate limiting errors with better messaging
        if (response.status === 429 || message.includes('Too many requests')) {
          const retryAfter = result.retryAfter
          if (retryAfter) {
            const retryMinutes = Math.ceil(Number(retryAfter) / 60)
            message += ` Please wait ${retryMinutes} minute(s) before trying again.`
          } else {
            message += ' Please wait a few minutes before trying again.'
          }
        }
        
        // In development, also log the technical error to console for debugging
        if (process.env.NODE_ENV === 'development' && result.technicalError) {
          console.error('Full technical error:', result.technicalError)
          // Append technical details to message in dev mode
          message += `\n\n[DEV] Technical: ${result.technicalError}`
        }
        
        showErrorToast(title, message)
        return
      }
      
      // For demo users, mark completion in localStorage
      if (result.isDemo) {
        localStorage.setItem('demo-questionnaire-completed', 'true')
      }
      
      // Navigate based on mode and cohort (student vs young professional)
      if (isEditMode) {
        window.location.href = '/settings'
      } else {
        window.location.href = isProfessionalPath ? '/onboarding-professional/complete' : '/onboarding/complete'
      }
    } catch (error) {
      console.error('Submit error:', error)
      showErrorToast('Network Error', 'Unable to submit questionnaire. Please check your internet connection and try again.')
    }
  }

  return (
    <QuestionnaireLayout
      stepIndex={10}
      totalSteps={11}
      title={isEditMode ? "Review your updated answers" : "Review your answers"}
      subtitle={isEditMode ? "Review your changes before saving. Submit to update your profile." : "Read-only summary. Submit to finish."}
      onPrev={() => {
        const base = typeof window !== 'undefined' && window.location.pathname.includes('onboarding-professional') ? '/onboarding-professional' : '/onboarding'
        window.location.href = isEditMode ? `${base}/reliability-logistics?mode=edit` : `${base}/reliability-logistics`
      }}
      onNext={undefined}
      hideSaveAndExit
      prevButtonClassName="bg-white text-gray-700 border-transparent hover:bg-white/95 hover:text-gray-700 dark:bg-white dark:text-gray-700 dark:hover:bg-white/95 dark:hover:text-gray-700"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-1">
          <div className="rounded-2xl border border-border-subtle/30 bg-bg-surface-alt/55 backdrop-blur-xl p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Your Responses</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Review your answers before submitting. Deal-breakers are highlighted.
                </p>
              </div>

              <Button
                onClick={downloadPreview}
                size="lg"
                disabled={isDownloadingPdf}
                className="w-full min-h-[44px] whitespace-nowrap sm:w-auto"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <input
                    value={reviewQuery}
                    onChange={(e) => setReviewQuery(e.target.value)}
                    placeholder="Search questions or answers…"
                    className="w-full rounded-xl border border-border-subtle/30 bg-bg-surface-alt/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/90 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  id="dealbreakers-only"
                  checked={dealbreakersOnly}
                  onCheckedChange={(checked) => setDealbreakersOnly(checked === true)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-text-primary leading-relaxed">
                  Deal-breakers only
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenSectionValues(filteredSectionEntries.map((e) => e.section))}
                  className="inline-flex items-center rounded-xl border border-border-subtle/30 bg-bg-surface-alt/60 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-bg-surface-alt/80"
                >
                  Expand all sections
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewQuery('')
                      setDealbreakersOnly(false)
                    }}
                    className="inline-flex items-center rounded-xl border border-border-subtle/30 bg-bg-surface-alt/60 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-bg-surface-alt/80"
                  >
                    Clear filters
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        <Accordion
          type="multiple"
          value={openSectionValues}
          onValueChange={(values) => setOpenSectionValues(values as string[])}
          className="space-y-3"
        >
          {filteredSectionEntries.map(({ section, answeredCount, dealBreakerCount, visibleItems }) => {
            const sectionTitle = section.replace(/-/g, ' ')
            const shownCount = visibleItems.length
            const showCountText =
              hasActiveFilters && shownCount !== answeredCount
                ? `${shownCount}/${answeredCount} responses`
                : `${answeredCount} ${answeredCount === 1 ? 'response' : 'responses'}`

            return (
              <AccordionItem
                key={section}
                value={section}
                className="border-b-0 rounded-xl border border-border-subtle/30 overflow-hidden bg-bg-surface-alt/75"
              >
                <AccordionTrigger className="px-5 hover:no-underline">
                  <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-base font-semibold text-text-primary capitalize truncate leading-tight text-left">
                        {sectionTitle}
                      </div>
                      <div className="text-xs text-text-secondary leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-left">
                        {showCountText}
                        {dealBreakerCount > 0 ? ` • ${dealBreakerCount} deal-breaker${dealBreakerCount === 1 ? '' : 's'}` : ''}
                      </div>
                    </div>

                    {/* Reserve right-side space so the title/count never drift visually */}
                    <span
                      className={[
                        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold bg-bg-surface-alt/75',
                        'border-border-subtle/30 text-text-secondary self-center whitespace-nowrap',
                        hasActiveFilters && shownCount === 0 ? 'opacity-100' : 'opacity-0',
                        'w-[110px]',
                      ].join(' ')}
                      aria-hidden={!(hasActiveFilters && shownCount === 0)}
                    >
                      No matches
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-0">
                  <div className="border-t border-border-subtle/30">
                    {visibleItems.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-text-secondary">
                        No matching answers in this section.
                      </div>
                    ) : (
                      <div className="divide-y divide-border-subtle/30">
                        {visibleItems.map((it) => {
                          const ans = sections[section]?.[it.id]
                          if (!ans) return null

                          return (
                            <div key={it.id} className="px-5 py-4 hover:bg-bg-surface-alt/80 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary mb-2">{it.label}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/35 text-indigo-950">
                                      {humanize(it, ans.value)}
                                    </span>
                                    {ans.dealBreaker && (
                                      <Badge variant="destructive" className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Deal Breaker
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <div className="rounded-2xl border border-border-subtle/30 bg-bg-surface-alt/70 backdrop-blur-xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary">
                Beta terms & status confirmation
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Required to submit your compatibility profile.
              </p>
            </div>
          </div>

          <div className="mt-4 flex-1">
            <label
              htmlFor="beta-terms-consent"
              className="flex cursor-pointer items-start gap-3"
            >
              <Checkbox
                id="beta-terms-consent"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(!!checked)}
                className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm leading-relaxed text-text-primary">
                I agree to the{' '}
                <Link
                  href="/legal/beta-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Beta Terms &amp; Conditions
                </Link>
                {' '}and confirm my user status (Student/Professional) is accurate.
              </span>
            </label>

            <div className="mt-auto pt-4">
              <Button
                onClick={submit}
                disabled={!isAgreed}
                className="w-full min-h-[44px] rounded-xl"
              >
                {isEditMode ? 'Save & finish' : 'Submit & finish'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </QuestionnaireLayout>
  )
}

export default function ReviewClient() {
  return (
    <SuspenseWrapper>
      <ReviewClientContent />
    </SuspenseWrapper>
  )
}
