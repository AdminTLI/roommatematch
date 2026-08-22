'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Bug, X, Send, Lightbulb } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { BUG_REPORT_CATEGORIES, type BugReportCategory } from '@/lib/bugs/categories'
import {
  installBugDiagnosticsCapture,
  collectBugDiagnosticsSnapshot,
  capDiagnosticsPayload,
} from '@/lib/bugs/diagnostics'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-onboarding',
  display: 'swap',
})

const MIN_DESCRIPTION = 20
const MAX_DESCRIPTION = 4000

const selectTriggerClass = (hasValue: boolean) =>
  cn(
    'h-12 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-3 text-sm shadow-none',
    'focus:ring-2 focus:ring-[#4F46E5]/30',
    '[&_svg]:h-5 [&_svg]:w-5 [&_svg]:opacity-70 [&_svg]:text-slate-500',
    'dark:border-slate-500 dark:bg-slate-700/80 dark:focus:ring-indigo-400/30 dark:[&_svg]:text-slate-300',
    // Override SelectTrigger base styles that hardcode light-mode span colours
    '[&>span]:text-slate-900 [&>span[data-placeholder]]:text-slate-500',
    'dark:[&>span]:text-slate-100 dark:[&>span[data-placeholder]]:text-slate-400',
    hasValue ? 'font-medium' : 'font-normal',
  )

const selectContentClass = cn(
  'z-[200] rounded-2xl border border-slate-200 bg-white text-[#0F172A]',
  'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)]',
  'dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/40',
)

export function BugReportWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<BugReportCategory | ''>('')
  const [description, setDescription] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return installBugDiagnosticsCapture()
  }, [])

  // Prevent background scroll while the mobile sheet is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    const mq = window.matchMedia('(max-width: 767px)')
    if (mq.matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const reset = useCallback(() => {
    setCategory('')
    setDescription('')
    setConsent(false)
  }, [])

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const canSubmit =
    !!category && consent && description.trim().length >= MIN_DESCRIPTION && !isSubmitting

  const handleSubmit = async () => {
    if (!category) {
      showErrorToast('Select a category', 'Please choose what kind of issue you ran into.')
      return
    }
    const trimmed = description.trim()
    if (trimmed.length < MIN_DESCRIPTION) {
      showErrorToast(
        'Add more detail',
        `Please describe the issue in at least ${MIN_DESCRIPTION} characters.`,
      )
      return
    }
    if (!consent) {
      showErrorToast('Consent required', 'Please confirm you understand what we collect.')
      return
    }

    setIsSubmitting(true)
    try {
      const diagnostics = capDiagnosticsPayload(collectBugDiagnosticsSnapshot())
      const response = await fetchWithCSRF('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: trimmed,
          consent: true,
          diagnostics,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit bug report')
      }

      showSuccessToast('Bug report sent', 'Thanks — we will look into this.')
      handleClose()
    } catch (e: unknown) {
      const err = e as { message?: string }
      showErrorToast('Could not send report', err.message || 'Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const panelInner = (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -bottom-14 -right-12 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] ring-1 ring-indigo-200/80 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800/80">
            <Bug className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Help us improve
            </p>
            <h2
              id="bug-report-title"
              className="text-base font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50"
            >
              Report a bug
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
            aria-label="Close bug report form"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 ring-1 ring-amber-200/80 dark:bg-indigo-950/50 dark:ring-indigo-500/25">
            <Lightbulb
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400"
              strokeWidth={2.25}
              aria-hidden
            />
            <p className="text-left text-xs font-medium leading-relaxed text-amber-950 dark:text-slate-200">
              Include what you were doing, what you expected, and what happened instead. Steps to
              reproduce help us fix it faster.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#334155] dark:text-slate-200">Issue type</p>
            <Select
              value={category || undefined}
              onValueChange={(v) => setCategory(v as BugReportCategory)}
            >
              <SelectTrigger id="bug-category" className={selectTriggerClass(!!category)}>
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} className={selectContentClass}>
                {BUG_REPORT_CATEGORIES.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[#0F172A] focus:bg-slate-50 focus:text-[#0F172A] dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-50"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#334155] dark:text-slate-200">Description</p>
            <Textarea
              id="bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
              placeholder="What went wrong? What did you expect?"
              rows={3}
              className={cn(
                'min-h-[88px] resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#0F172A]',
                'shadow-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30',
                'dark:border-slate-500 dark:bg-slate-700/80 dark:text-slate-100 dark:placeholder:!text-slate-400',
                'dark:focus-visible:ring-indigo-400/30',
              )}
            />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {description.trim().length}/{MAX_DESCRIPTION} (min {MIN_DESCRIPTION})
            </p>
          </div>

          <div
            className={cn(
              'flex gap-3 rounded-2xl px-3.5 py-3 ring-1',
              consent
                ? 'bg-slate-50 ring-slate-200/70 dark:bg-slate-700/50 dark:ring-slate-500/50'
                : 'bg-slate-50 ring-amber-200/80 dark:bg-slate-700/40 dark:ring-indigo-500/30',
            )}
          >
            <Checkbox
              id="bug-consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5 shrink-0 rounded border-slate-300 data-[state=checked]:border-[#4F46E5] data-[state=checked]:bg-[#4F46E5] dark:border-slate-400 dark:data-[state=checked]:border-indigo-400 dark:data-[state=checked]:bg-indigo-500"
            />
            <label
              htmlFor="bug-consent"
              className="cursor-pointer text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300"
            >
              I understand Domu Match will collect this report along with{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">page URL</span>,{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">
                device/browser info
              </span>
              ,{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">viewport size</span>,
              my{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">account id</span>,{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">
                recent console and network errors
              </span>
              , and a{' '}
              <span className="font-semibold text-[#0F172A] dark:text-slate-100">timestamp</span> to
              diagnose the issue. No screenshot image is taken.
            </label>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-700/80 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all',
              canSubmit
                ? 'bg-[#4F46E5] text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.45)] dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400'
                : 'cursor-not-allowed bg-[#4F46E5]/40 text-white/70 dark:bg-indigo-500/35 dark:text-slate-300',
            )}
          >
            <Send className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            {isSubmitting ? 'Sending…' : 'Submit report'}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        plusJakarta.variable,
        'font-[family-name:var(--font-onboarding)] antialiased',
      )}
    >
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.button
              key="bug-report-backdrop"
              type="button"
              aria-label="Dismiss bug report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto fixed inset-0 z-[56] bg-slate-900/40 md:hidden"
              onClick={handleClose}
            />

            {/*
              Desktop: full-height rail beside the FAB, flex-centered so the panel
              midpoint lines up with the floating bug button. Framer Motion must NOT
              own translateY on the same node as CSS centering.
            */}
            <div
              className={cn(
                'pointer-events-none fixed z-[57]',
                // Mobile: fill the sheet frame
                'inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] bottom-[max(0.75rem,env(safe-area-inset-bottom))]',
                // Desktop: vertical strip left of FAB (right-6 + 56px + gap)
                'md:inset-y-0 md:left-auto md:right-[calc(1.5rem+3.5rem+0.75rem)] md:flex md:w-[min(380px,calc(100vw-7rem))] md:items-center',
              )}
            >
              <motion.div
                key="bug-report-panel"
                role="dialog"
                aria-labelledby="bug-report-title"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  'pointer-events-auto flex h-full max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-[#0F172A]',
                  'shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80',
                  'dark:bg-slate-800 dark:text-slate-50 dark:shadow-black/50 dark:ring-slate-700',
                  // Desktop: height from content, capped to viewport so center stays on FAB
                  'md:h-auto md:max-h-[calc(100dvh-2rem)]',
                )}
              >
                {panelInner}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* FAB: mid-right, aligned with Domu; hidden on mobile while sheet is open */}
      <button
        type="button"
        onClick={() => (open ? handleClose() : setOpen(true))}
        className={cn(
          'pointer-events-auto fixed right-4 top-1/2 z-[55] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full md:right-6',
          'bg-[#4F46E5] text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.45)]',
          'transition hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.55)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400/50 dark:focus-visible:ring-offset-slate-900',
          'dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400',
          open && 'max-md:pointer-events-none max-md:invisible',
        )}
        aria-label={open ? 'Close bug report form' : 'Report a bug'}
        title="Report a bug"
        aria-expanded={open}
      >
        <Bug className="h-6 w-6" strokeWidth={2.25} />
      </button>
    </div>
  )
}
