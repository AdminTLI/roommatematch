'use client'

import { cn } from '@/lib/utils'

type ProgressiveProfileLockHintProps = {
  partnerFirstName: string | null | undefined
  /** Short noun phrase, e.g. "their bio", "their housing preferences" */
  what: string
  className?: string
}

export function ProgressiveProfileLockHint({ partnerFirstName, what, className }: ProgressiveProfileLockHintProps) {
  const name = partnerFirstName?.trim() || 'your match'
  return (
    <p
      className={cn(
        'text-xs leading-relaxed text-gray-800 not-italic dark:text-slate-200',
        className,
      )}
      role="status"
    >
      <span aria-hidden>🔒 </span>
      Keep chatting with <span className="font-medium text-gray-900 dark:text-slate-100">{name}</span> to unlock {what} once you both reveal profile details in this chat.
    </p>
  )
}
