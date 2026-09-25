'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { consumeIntentionalSignOutFlag } from '@/lib/auth/intentional-sign-out'
import { SESSION_TERMINATED_MESSAGE } from '@/lib/auth/session-terminated'
import {
  useOnboardingStore,
  waitForOnboardingStoreHydration,
} from '@/store/onboarding'

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
 *
 * Also binds the onboarding zustand store to the signed-in user so questionnaire drafts in
 * localStorage never leak across accounts on the same browser.
 */
export function AuthSessionTerminationListener() {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  useEffect(() => {
    let cancelled = false

    const bindStore = async (userId: string | null) => {
      await waitForOnboardingStoreHydration()
      if (cancelled) return
      useOnboardingStore.getState().bindToUser(userId)
    }

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!cancelled) await bindStore(user?.id ?? null)
    })()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        void bindStore(session?.user?.id ?? null)
      } else if (event === 'SIGNED_OUT') {
        void bindStore(null)
        if (session) return
        if (consumeIntentionalSignOutFlag()) return
        const p = pathnameRef.current || ''
        if (!isAppShellPath(p)) return
        toast.error(SESSION_TERMINATED_MESSAGE)
        router.replace('/auth/sign-in')
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return null
}
