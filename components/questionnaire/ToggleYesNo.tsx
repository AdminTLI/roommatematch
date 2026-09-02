'use client'

import { cn } from '@/lib/utils'

/** Shared choice-button styles for questionnaire answers */
export function choiceButtonClass(selected: boolean) {
  return cn(
    'flex h-[54px] w-full items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ',
    selected
      ? 'border-indigo-500 bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] dark:border-indigo-400 dark:bg-indigo-500 dark:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.35)]'
      : 'border-slate-200 bg-white text-[#0F172A] hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10'
  )
}

interface Props {
  id: string
  label: string
  helperText?: string
  checked?: boolean
  onChange: (v: boolean) => void
  yesLabel?: string
  noLabel?: string
}

export function ToggleYesNo({
  id,
  label,
  helperText,
  checked,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: Props) {
  return (
    <div className="space-y-3" role="group" aria-label={label || id}>
      {label ? (
        <p className="text-base font-semibold leading-snug text-[#0F172A] dark:text-slate-50">
          {label}
        </p>
      ) : null}
      {helperText && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{helperText}</p>
      )}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          aria-pressed={checked === true}
          onClick={() => onChange(true)}
          className={choiceButtonClass(checked === true)}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base',
              checked === true
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            )}
            aria-hidden
          >
            ✓
          </span>
          <span className="min-w-0 flex-1 leading-snug">{yesLabel}</span>
        </button>
        <button
          type="button"
          aria-pressed={checked === false}
          onClick={() => onChange(false)}
          className={choiceButtonClass(checked === false)}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base',
              checked === false
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            )}
            aria-hidden
          >
            ✕
          </span>
          <span className="min-w-0 flex-1 leading-snug">{noLabel}</span>
        </button>
      </div>
    </div>
  )
}
