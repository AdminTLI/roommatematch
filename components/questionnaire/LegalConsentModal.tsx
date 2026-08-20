'use client'

import { useState } from 'react'
import TermsPage from '@/app/(marketing)/terms/page'
import PrivacyPage from '@/app/(marketing)/privacy/page'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type LegalTab = 'terms' | 'privacy'

interface LegalConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Which document to open first */
  defaultTab?: LegalTab
}

export function LegalConsentModal({
  open,
  onOpenChange,
  defaultTab = 'terms',
}: LegalConsentModalProps) {
  const [tab, setTab] = useState<LegalTab>(defaultTab)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setTab(defaultTab)
        onOpenChange(next)
      }}
    >
      <DialogContent
        className={cn(
          'flex max-h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]',
          'dark:bg-slate-800 dark:shadow-black/50',
          'sm:max-h-[85vh]'
        )}
      >
        <DialogHeader className="shrink-0 space-y-3 border-b border-slate-100 px-5 pb-4 pt-5 pr-12 text-left dark:border-slate-700">
          <DialogTitle className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-slate-50">
            Terms &amp; Privacy Policy
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
            Please review both documents. Switch tabs below to read each one.
          </DialogDescription>

          <div
            role="tablist"
            aria-label="Legal documents"
            className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'terms'}
              onClick={() => setTab('terms')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition',
                tab === 'terms'
                  ? 'bg-white text-[#4F46E5] shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              Terms of Service
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'privacy'}
              onClick={() => setTab('privacy')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition',
                tab === 'privacy'
                  ? 'bg-white text-[#4F46E5] shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              Privacy Policy
            </button>
          </div>
        </DialogHeader>

        {/* Single scroll region — sticky chrome stays put */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {tab === 'terms' ? <TermsPage embedded /> : <PrivacyPage embedded />}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#4F46E5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
