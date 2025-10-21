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
    <div className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-lg font-medium text-gray-900 mb-1">{label}</div>
          {helperText && <div className="text-sm text-gray-600">{helperText}</div>}
        </div>
        {showDealBreaker && (
          <DealBreakerToggle isDealBreaker={dealBreaker} onChange={(v) => onDealBreakerChange?.(v)} />
        )}
      </div>
      <div className="mt-4">
        {children}
      </div>
      {errorText && <div className="text-sm text-red-600 mt-2">{errorText}</div>}
    </div>
  )
}


