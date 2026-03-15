'use client'

import { ReactNode } from 'react'
import { DealBreakerToggle } from './DealBreakerToggle'

interface Props {
  label: string
  helperText?: string
  errorText?: string
  children: ReactNode
  showDealBreaker?: boolean
  dealBreaker?: boolean
  onDealBreakerChange?: (v: boolean) => void
}

export function QuestionRow({
  label,
  helperText,
  errorText,
  children,
  showDealBreaker,
  dealBreaker,
  onDealBreakerChange,
}: Props) {
  return (
    <div className="space-y-5 sm:space-y-4 pb-8 sm:pb-6 last:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xl sm:text-lg font-semibold text-slate-50 mb-2 sm:mb-1 break-words leading-tight">
            {label}
          </div>
          {helperText && (
            <div className="text-base sm:text-sm text-slate-200/90 break-words">
              {helperText}
            </div>
          )}
        </div>
        {showDealBreaker && (
          <div className="flex-shrink-0 sm:flex-shrink">
            <DealBreakerToggle isDealBreaker={dealBreaker} onChange={(v) => onDealBreakerChange?.(v)} />
          </div>
        )}
      </div>
      <div className="mt-5 sm:mt-4 rounded-2xl border border-white/20 bg-slate-950/70 px-4 py-3 sm:px-5 sm:py-4 shadow-lg shadow-slate-900/60 backdrop-blur-xl">
        {children}
      </div>
      {errorText && <div className="text-sm text-rose-300 mt-2">{errorText}</div>}
    </div>
  )
}


