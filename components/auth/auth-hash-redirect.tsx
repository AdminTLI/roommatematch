'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Supabase often lands auth results on the Site URL as hash fragments
 * (recovery sessions, invite sessions, or errors like otp_expired).
 * Route those to the correct auth page instead of leaving users on marketing.
 */
export function AuthHashRedirect() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return
    if (pathname.startsWith('/auth/')) return

    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
    const type = (hashParams.get('type') || '').toLowerCase()
    const errorCode = hashParams.get('error_code') || hashParams.get('error')
    const description = (
      hashParams.get('error_description') ||
      hashParams.get('message') ||
      ''
    ).replace(/\+/g, ' ')
    const descriptionLower = description.toLowerCase()

    const hasSession =
      Boolean(hashParams.get('access_token')) && Boolean(hashParams.get('refresh_token'))

    // Successful recovery / invite sessions arrive as hash tokens on Site URL.
    if (hasSession) {
      if (type === 'recovery') {
        window.location.replace(`/auth/reset-password/confirm${hash}`)
        return
      }
      if (type === 'invite' || type === 'signup') {
        window.location.replace(`/auth/accept-invitation${hash}`)
        return
      }
    }

    if (!errorCode) return

    const target = new URLSearchParams()
    target.set('error', errorCode)
    if (description) target.set('message', description)

    const isInvite =
      type === 'invite' ||
      descriptionLower.includes('invite') ||
      descriptionLower.includes('invitation')

    const isRecovery =
      type === 'recovery' ||
      descriptionLower.includes('recovery') ||
      descriptionLower.includes('reset')

    // Do NOT treat every otp_expired as an invite — password resets use the same error.
    const path = isInvite
      ? '/auth/accept-invitation'
      : isRecovery
        ? '/auth/reset-password'
        : '/auth/sign-in'

    window.location.replace(`${path}?${target.toString()}`)
  }, [pathname])

  return null
}
