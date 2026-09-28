'use client'

import { useEffect, useRef } from 'react'
import { showInfoToast, showWarningToast } from '@/lib/toast'

export type VerificationFeedbackReason =
  | 'email_verification_required'
  | 'persona_verification_required'
  | 'verification_required'
  | 'admin_access_denied'
  | (string & {})

interface VerificationFeedbackProps {
  /** Prefer server-provided search params so this never depends on useSearchParams. */
  reason?: string | null
  redirect?: string | null
}

/**
 * Shows user-friendly feedback when redirected due to verification requirements.
 * Reasons must be passed as props (from the Server Component searchParams or a
 * Suspense-wrapped parent) so /verify never opts into a CSR-bailout hydration path.
 */
export function VerificationFeedback({ reason, redirect }: VerificationFeedbackProps) {
  const shownReasonRef = useRef<string | null>(null)

  useEffect(() => {
    if (!reason || shownReasonRef.current === reason) return
    shownReasonRef.current = reason

    switch (reason) {
      case 'email_verification_required':
        showWarningToast(
          'Email Verification Required',
          'Please verify your email address to continue. Check your inbox for a verification link.'
        )
        break
      case 'persona_verification_required':
        showInfoToast(
          'Identity Verification Required',
          'Please complete identity verification to access this feature. This helps us keep the platform safe.'
        )
        break
      case 'verification_required':
        showInfoToast(
          'Verification Required',
          redirect
            ? "Please complete verification to access this page. You'll be redirected back after verification."
            : 'Please complete verification to continue.'
        )
        break
      case 'admin_access_denied':
        showWarningToast(
          'Access Denied',
          "You don't have permission to access this page."
        )
        break
      default:
        break
    }
  }, [reason, redirect])

  return null
}
