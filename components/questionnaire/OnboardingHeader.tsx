'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingHeaderProps {
  className?: string
  /** Override exit destination (defaults to /dashboard) */
  exitHref?: string
  /**
   * Center status chip.
   * - `autosave` (default): shows live Autosaved state
   * - `welcome`: static badge (no fake save indicator)
   * - `none`: hide the status chip
   */
  statusMode?: 'autosave' | 'welcome' | 'none'
  /** Override the welcome-chip label (defaults to "Welcome") */
  chipLabel?: string
  /** Force a specific save label when statusMode is autosave */
  saveLabel?: string
}

export function OnboardingHeader({
  className,
  exitHref = '/dashboard',
  statusMode = 'autosave',
  chipLabel = 'Welcome',
  saveLabel,
}: OnboardingHeaderProps) {
  const router = useRouter()
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt)

  const autosaveLabel =
    saveLabel ??
    (lastSavedAt
      ? `Autosaved ${new Date(lastSavedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : 'Autosaved')

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-transparent',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[540px] items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="Domu Match"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-xl object-cover shadow-sm"
            priority
          />
          <span className="truncate text-sm font-semibold tracking-tight text-[#0F172A] dark:text-slate-50">
            Domu Match
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {statusMode === 'welcome' && (
            <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 sm:text-xs">
              {chipLabel}
            </span>
          )}

          {statusMode === 'autosave' && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span className="max-w-[9.5rem] truncate sm:max-w-none">{autosaveLabel}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => router.push(exitHref)}
            aria-label="Exit onboarding"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200/70 transition hover:bg-slate-50 hover:text-[#0F172A] dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
