'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { showInfoToast, showWarningToast } from '@/lib/toast'

/**
 * Component that shows user-friendly feedback when redirected due to verification requirements
 * Should be added to pages that users might be redirected to (verify-email, verify, etc.)
 */
export function VerificationFeedback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get('reason')
    const redirect = searchParams.get('redirect')

    if (reason) {
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
              ? 'Please complete verification to access this page. You\'ll be redirected back after verification.'
              : 'Please complete verification to continue.'
          )
          break
        case 'admin_access_denied':
          showWarningToast(
            'Access Denied',
            'You don\'t have permission to access this page.'
          )
          break
        default:
          // Unknown reason - don't show anything
          break
      }
    }
  }, [searchParams])

  return null // This component doesn't render anything
}















