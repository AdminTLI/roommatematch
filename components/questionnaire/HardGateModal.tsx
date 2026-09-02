'use client'

import { useEffect, useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ShieldAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-onboarding',
  display: 'swap',
})

interface HardGateModalProps {
  open: boolean
  userSetGate: boolean
  onConfirm: (userSetGate: boolean) => void
  /** Close without confirming (X / Escape / outside click) - does not auto-advance */
  onDismiss: () => void
}

const COUNTDOWN_SECONDS = 2

export function HardGateModal({
  open,
  userSetGate,
  onConfirm,
  onDismiss,
}: HardGateModalProps) {
  const [checked, setChecked] = useState(userSetGate)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (open) {
      setChecked(userSetGate)
      setCountdown(COUNTDOWN_SECONDS)
    }
  }, [open, userSetGate])

  useEffect(() => {
    if (!open || countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [open, countdown])

  const canContinue = countdown <= 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
    >
      <DialogContent
        className={cn(
          plusJakarta.variable,
          'font-[family-name:var(--font-onboarding)] antialiased',
          'max-w-md gap-0 rounded-2xl border-0 bg-white p-0',
          'shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80',
          'dark:bg-slate-800 dark:shadow-black/50 dark:ring-slate-700',
          // Hide the default absolute close; we place one in the header row
          '[&>button]:hidden'
        )}
      >
        <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] ring-1 ring-amber-200/80 dark:bg-amber-950 dark:ring-amber-800/80">
              <ShieldAlert className="h-4 w-4 text-[#92400E] dark:text-amber-200" strokeWidth={2.25} />
            </span>
            <DialogTitle className="min-w-0 flex-1 text-base font-bold leading-snug tracking-tight text-[#0F172A] dark:text-slate-50">
              This is a dealbreaker question
            </DialogTitle>
            <DialogClose
              type="button"
              aria-label="Close"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50 "
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#0F172A] dark:text-slate-50">
              Dealbreaker matching
            </span>{' '}
            means you will only be shown roommates who gave the{' '}
            <span className="font-semibold text-[#0F172A] dark:text-slate-50">
              exact same answer
            </span>{' '}
            as you on this question.
          </p>

          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(!!v)}
              className="shrink-0 border-slate-300 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500 dark:border-slate-500"
            />
            <span className="text-sm font-semibold text-[#0F172A] dark:text-slate-50">
              Make this a dealbreaker
            </span>
          </label>

          {!checked && (
            <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              If you skip this, your answer will still be considered in matching, just not as a
              strict filter.
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => onConfirm(checked)}
            className={cn(
              'w-full rounded-xl py-2.5 text-sm font-semibold tracking-tight transition-all',
              canContinue
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                : 'cursor-not-allowed bg-slate-100 text-slate-400 ring-1 ring-slate-200/70 dark:bg-slate-700 dark:text-slate-500 dark:ring-slate-600'
            )}
          >
            {canContinue ? 'Continue' : `Continue in ${countdown}s`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
