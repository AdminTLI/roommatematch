'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { V2_SECTION_KEYS } from '@/types/questionnaire'
import { cn } from '@/lib/utils'

const MODULE_LABELS = [
  'Logistics',
  'Environment',
  'Cleanliness',
  'Communication',
  'Social Life',
] as const

export const V2_MODULE_PATHS = [
  '/onboarding/logistics-context',
  '/onboarding/environment-rhythms',
  '/onboarding/cleanliness-operations',
  '/onboarding/communication-resolution',
  '/onboarding/social-spaces',
] as const

const MODULE_ACCENTS = [
  'bg-sky-100 text-sky-800 ring-sky-200/80 hover:brightness-[0.98] dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800',
  'bg-violet-100 text-violet-800 ring-violet-200/80 hover:brightness-[0.98] dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800',
  'bg-emerald-100 text-emerald-800 ring-emerald-200/80 hover:brightness-[0.98] dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800',
  'bg-orange-100 text-orange-800 ring-orange-200/80 hover:brightness-[0.98] dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800',
  'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200/80 hover:brightness-[0.98] dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:ring-fuchsia-800',
] as const

const QUESTIONS_PER_MODULE = 12

interface ModuleTrackerProps {
  currentModuleIndex: number
  answeredInCurrent: number
  totalInCurrent: number
  /** Highlight the Review chip (review page) */
  reviewActive?: boolean
}

function navigationQuerySuffix(): string {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  const next = new URLSearchParams()
  if (params.get('from') === 'review') next.set('from', 'review')
  if (params.get('mode') === 'edit') next.set('mode', 'edit')
  const q = next.toString()
  return q ? `?${q}` : ''
}

function reviewHref(): string {
  if (typeof window === 'undefined') return '/onboarding/review'
  const params = new URLSearchParams(window.location.search)
  return params.get('mode') === 'edit'
    ? '/onboarding/review?mode=edit'
    : '/onboarding/review'
}

export function isV2QuestionnaireComplete(
  sections: Record<string, Record<string, unknown>>,
  options?: { currentSectionKey?: string; answeredInCurrent?: number; totalInCurrent?: number }
): boolean {
  return V2_SECTION_KEYS.every((key) => {
    if (options?.currentSectionKey === key) {
      const total = options.totalInCurrent ?? QUESTIONS_PER_MODULE
      return (options.answeredInCurrent ?? 0) >= total
    }
    return Object.keys(sections[key] ?? {}).length >= QUESTIONS_PER_MODULE
  })
}

export function ModuleTracker({
  currentModuleIndex,
  answeredInCurrent,
  totalInCurrent,
  reviewActive = false,
}: ModuleTrackerProps) {
  const sections = useOnboardingStore((s) => s.sections)
  const querySuffix = navigationQuerySuffix()
  const showReview = isV2QuestionnaireComplete(sections, {
    currentSectionKey:
      currentModuleIndex >= 0 && currentModuleIndex < V2_SECTION_KEYS.length
        ? V2_SECTION_KEYS[currentModuleIndex]
        : undefined,
    answeredInCurrent,
    totalInCurrent,
  })

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="navigation"
      aria-label="Module progress"
    >
      {V2_SECTION_KEYS.map((key, idx) => {
        const sectionAnswers = sections[key] ?? {}
        const answeredCount =
          idx === currentModuleIndex && !reviewActive
            ? answeredInCurrent
            : Object.keys(sectionAnswers).length

        // Completion from real answers only. For the in-progress module use totalInCurrent;
        // for other modules (and all modules on review) use QUESTIONS_PER_MODULE.
        const completionThreshold =
          idx === currentModuleIndex && !reviewActive
            ? totalInCurrent || QUESTIONS_PER_MODULE
            : QUESTIONS_PER_MODULE
        const isCompleted = answeredCount >= completionThreshold
        const isActive = !reviewActive && idx === currentModuleIndex
        const href = `${V2_MODULE_PATHS[idx]}${querySuffix}`

        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ring-1 sm:text-[13px]',
              isActive &&
                'bg-[#4F46E5] text-white shadow-[0_4px_10px_-2px_rgba(79,70,229,0.28)] ring-[#4F46E5] dark:bg-indigo-500 dark:ring-indigo-400',
              isCompleted && !isActive && MODULE_ACCENTS[idx],
              !isActive &&
                !isCompleted &&
                'bg-white text-[#475569] ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700'
            )}
            title={`Go to ${MODULE_LABELS[idx]}`}
          >
            {isCompleted && !isActive && (
              <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
            )}
            <span className="whitespace-nowrap">{MODULE_LABELS[idx]}</span>
          </Link>
        )
      })}

      {showReview || reviewActive ? (
        <Link
          href={reviewHref()}
          aria-current={reviewActive ? 'page' : undefined}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ring-1 sm:text-[13px]',
            reviewActive
              ? 'bg-[#4F46E5] text-white shadow-[0_4px_10px_-2px_rgba(79,70,229,0.28)] ring-[#4F46E5] dark:bg-indigo-500 dark:ring-indigo-400'
              : 'bg-white text-[#4F46E5] ring-indigo-200 hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 dark:ring-indigo-800 dark:hover:bg-indigo-950/50'
          )}
          title="Go to review"
        >
          Review
        </Link>
      ) : null}
    </div>
  )
}
