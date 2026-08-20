'use client'

import { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { OnboardingChromeHeader } from '@/components/questionnaire/OnboardingChromeHeader'
import { cn } from '@/lib/utils'

interface OnboardingModuleShellProps {
  children: ReactNode
  /** 0 = Setup (intro); 1–5 = questionnaire modules */
  moduleIndex: number
  moduleTotal?: number
  moduleLabel?: string
  onBack?: () => void
  onContinue?: () => void
  continueDisabled?: boolean
  continueLabel?: string
  isContinuing?: boolean
  title: string
  subtitle?: string
  exitHref?: string
  /** Max width of the content card */
  maxWidthClassName?: string
}

export function OnboardingModuleShell({
  children,
  moduleIndex,
  moduleTotal = 5,
  moduleLabel,
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = 'Continue',
  isContinuing,
  title,
  subtitle,
  exitHref = '/dashboard',
  maxWidthClassName = 'max-w-[540px]',
}: OnboardingModuleShellProps) {
  const resolvedLabel =
    moduleLabel ?? (moduleIndex === 0 ? 'Setup' : `Module ${moduleIndex}`)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <OnboardingChromeHeader
          moduleIndex={moduleIndex}
          moduleTotal={moduleTotal}
          moduleLabel={resolvedLabel}
          exitHref={exitHref}
        />

        <main className="flex flex-1 justify-center px-4 py-6 sm:py-8">
          <div
            className={cn(
              'h-fit w-full rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/70',
              maxWidthClassName
            )}
          >
            <div className="space-y-2">
              <h1 className="text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#0F172A] sm:text-[1.75rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
              )}
            </div>

            <div className="mt-6 min-w-0">{children}</div>

            {(onBack || onContinue) && (
              <div className="mt-7 flex items-center gap-3 sm:mt-8">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                    Back
                  </button>
                )}
                {onContinue && (
                  <button
                    type="button"
                    onClick={onContinue}
                    disabled={continueDisabled || isContinuing}
                    className={cn(
                      'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                      continueDisabled || isContinuing
                        ? 'cursor-not-allowed bg-[#4F46E5]/40'
                        : 'bg-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:bg-indigo-600 hover:shadow-[0_12px_28px_-5px_rgba(79,70,229,0.45)]'
                    )}
                  >
                    {isContinuing ? 'Saving…' : continueLabel}
                    {!isContinuing && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
