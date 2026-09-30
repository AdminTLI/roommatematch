'use client'

import { cn } from '@/lib/utils'
import {
  getPasswordStrength,
  type PasswordStrengthLevel,
} from '@/lib/auth/password-strength'

const barColorByLevel: Record<PasswordStrengthLevel, string> = {
  empty: 'bg-slate-200',
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-blue-500',
  strong: 'bg-emerald-500',
}

const labelColorByLevel: Record<PasswordStrengthLevel, string> = {
  empty: 'text-slate-500',
  weak: 'text-red-600',
  fair: 'text-amber-700',
  good: 'text-blue-700',
  strong: 'text-emerald-700',
}

type PasswordStrengthIndicatorProps = {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password)

  if (!password) return null

  return (
    <div className={cn('space-y-1.5', className)} aria-live="polite">
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength.score}
          aria-label="Password strength"
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              barColorByLevel[strength.level]
            )}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        {strength.label ? (
          <span
            className={cn(
              'shrink-0 text-xs font-medium tabular-nums',
              labelColorByLevel[strength.level]
            )}
          >
            {strength.label}
          </span>
        ) : null}
      </div>
      {strength.missingSummary ? (
        <p className="text-xs text-slate-600">{strength.missingSummary}</p>
      ) : (
        <p className="text-xs text-emerald-700">Password looks good</p>
      )}
    </div>
  )
}
