'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Supabase sometimes redirects auth errors to the Site URL as hash fragments
 * (e.g. /#error=access_denied&error_code=otp_expired). Send users to a proper
 * auth page instead of leaving them on the marketing homepage.
 */
export function AuthHashRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return
    if (pathname.startsWith('/auth/')) return

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const errorCode = hashParams.get('error_code') || hashParams.get('error')
    if (!errorCode) return

    const target = new URLSearchParams()
    target.set('error', errorCode)
    const description = hashParams.get('error_description')
    if (description) target.set('message', description)

    const type = hashParams.get('type')
    const isInvite =
      type === 'invite' ||
      errorCode === 'otp_expired' ||
      hashParams.get('error_description')?.toLowerCase().includes('invite')

    const path = isInvite ? '/auth/accept-invitation' : '/auth/sign-in'
    router.replace(`${path}?${target.toString()}`)
  }, [pathname, router])

  return null
}
