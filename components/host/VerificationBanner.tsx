'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import {
  formatCountdown,
  getVerificationDeadline,
  verificationCountdownMs,
} from '@/lib/host/verification'

type Props = {
  emailVerified: boolean
  verificationDeadlineAt?: string | null
  createdAt: string
}

export function HostVerificationBanner({
  emailVerified,
  verificationDeadlineAt,
  createdAt,
}: Props) {
  const deadline = getVerificationDeadline({
    verification_deadline_at: verificationDeadlineAt,
    created_at: createdAt,
  })
  const [msLeft, setMsLeft] = useState(() => verificationCountdownMs(deadline))

  useEffect(() => {
    if (emailVerified) return
    const id = setInterval(() => setMsLeft(verificationCountdownMs(deadline)), 30_000)
    return () => clearInterval(id)
  }, [deadline, emailVerified])

  if (emailVerified) return null

  const expired = msLeft <= 0

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 shadow-sm backdrop-blur-sm dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-300" />
      <div className="space-y-1">
        <p className="font-semibold">
          {expired
            ? 'Verify your email so students can apply'
            : `Verify your email within ${formatCountdown(msLeft)}`}
        </p>
        <p className="text-rose-800/90 dark:text-rose-200/90">
          Students can browse your listings, but Apply and viewing stay disabled until your email is
          confirmed. Verified hosts get more responses.
        </p>
      </div>
    </div>
  )
}
