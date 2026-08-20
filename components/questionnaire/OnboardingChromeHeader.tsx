'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingChromeHeaderProps {
  /** Displayed as "Module {moduleIndex} of {moduleTotal}" */
  moduleIndex: number
  moduleTotal?: number
  moduleLabel: string
  /**
   * When set, replaces the default "Module X of Y · label" center text
   * (e.g. review is not a module: pass "Review").
   */
  titleOverride?: string
  exitHref?: string
  /** Optional row rendered under the progress bar (e.g. module stepper) */
  belowProgress?: React.ReactNode
  className?: string
}

/**
 * Shared sticky header used across intro + questionnaire modules.
 * Logo left · Module label center · Autosaved + Exit right · fill progress bar
 */
export function OnboardingChromeHeader({
  moduleIndex,
  moduleTotal = 5,
  moduleLabel,
  titleOverride,
  exitHref = '/dashboard',
  belowProgress,
  className,
}: OnboardingChromeHeaderProps) {
  const router = useRouter()
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt)

  // Setup (module 0) stays empty; fill starts at Module 1 of 5
  const progress =
    moduleIndex <= 0
      ? 0
      : Math.round((moduleIndex / moduleTotal) * 100)

  const autosaveLabel = lastSavedAt
    ? `Autosaved ${new Date(lastSavedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : 'Autosaved'

  const centerTitle =
    titleOverride ??
    `Module ${moduleIndex} of ${moduleTotal}`
  const centerSubtitle = titleOverride ? null : moduleLabel

  return (
    <header
      className={cn(
        'sticky top-0 z-40 overflow-visible bg-transparent',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-6xl overflow-visible px-4 pt-3 sm:px-6',
          belowProgress ? 'pb-5' : 'pb-2.5'
        )}
      >
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Domu Match"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-xl object-cover shadow-sm"
              priority
            />
            <span className="truncate text-sm font-semibold tracking-tight text-[#0F172A]">
              Domu Match
            </span>
          </div>

          <p className="absolute left-1/2 hidden -translate-x-1/2 text-center text-sm font-semibold tracking-tight text-slate-600 md:block">
            {centerTitle}
            {centerSubtitle ? (
              <span className="text-slate-400"> · {centerSubtitle}</span>
            ) : null}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/70 sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span className="max-w-[7rem] truncate sm:max-w-none">{autosaveLabel}</span>
            </span>
            <button
              type="button"
              onClick={() => router.push(exitHref)}
              aria-label="Exit onboarding"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200/70 transition hover:bg-slate-50 hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs font-semibold tracking-tight text-slate-600 md:hidden">
          {centerTitle}
          {centerSubtitle ? (
            <span className="text-slate-400"> · {centerSubtitle}</span>
          ) : null}
        </p>

        <div
          className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-200/80"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={titleOverride ?? `Module ${moduleIndex} of ${moduleTotal}`}
        >
          <div
            className="h-full rounded-full bg-[#4F46E5] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {belowProgress ? <div className="mt-3">{belowProgress}</div> : null}
      </div>
    </header>
  )
}
