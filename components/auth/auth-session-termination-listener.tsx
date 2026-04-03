'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { consumeIntentionalSignOutFlag } from '@/lib/auth/intentional-sign-out'
import { SESSION_TERMINATED_MESSAGE } from '@/lib/auth/session-terminated'

const APP_AREA_PREFIXES = [
  '/dashboard',
  '/settings',
  '/matches',
  '/chat',
  '/onboarding',
  '/forum',
  '/notifications',
  '/housing',
  '/move-in',
  '/reputation',
  '/safety',
  '/admin',
  '/verify',
]

function isAppShellPath(pathname: string): boolean {
  return APP_AREA_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * If the session ends unexpectedly while the user is in the app (e.g. revoked after login elsewhere),
 * show a toast and send them to sign-in. Intentional sign-outs set a sessionStorage flag first.
 */
export function AuthSessionTerminationListener() {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_OUT' || session) return
      if (consumeIntentionalSignOutFlag()) return
      const p = pathnameRef.current || ''
      if (!isAppShellPath(p)) return
      toast.error(SESSION_TERMINATED_MESSAGE)
      router.replace('/auth/sign-in')
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return null
}
