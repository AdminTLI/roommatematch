'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, MailWarning, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'

type Status = 'loading' | 'success' | 'error'

function readHashParams(): URLSearchParams {
  if (typeof window === 'undefined' || !window.location.hash) {
    return new URLSearchParams()
  }
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export function AcceptInvitationClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let cancelled = false

    async function run() {
      const hashParams = readHashParams()
      const hashError = hashParams.get('error_code') || hashParams.get('error')
      if (hashError) {
        if (!cancelled) {
          setStatus('error')
          setMessage(
            hashParams.get('error_description')?.replace(/\+/g, ' ') ||
              'This invitation link is invalid or has expired. Ask your administrator to send a new invite.'
          )
        }
        return
      }

      const queryError = searchParams.get('error')
      if (queryError) {
        if (!cancelled) {
          setStatus('error')
          setMessage(
            searchParams.get('message')?.replace(/\+/g, ' ') ||
              'This invitation link is invalid or has expired. Ask your administrator to send a new invite.'
          )
        }
        return
      }

      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }
        setStatus('success')
        router.replace('/institution/onboarding')
        return
      }

      const tokenHash = searchParams.get('token_hash')
      const type = (searchParams.get('type') || 'invite') as 'invite' | 'signup' | 'email'

      if (!tokenHash) {
        if (!cancelled) {
          setStatus('error')
          setMessage('Missing invitation token. Use the Accept invitation button in your email.')
        }
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      })

      if (cancelled) return

      if (error) {
        setStatus('error')
        if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
          setMessage(
            'This invitation link has expired or was already used. Ask your administrator to send a new invite from Role Management.'
          )
        } else {
          setMessage(error.message)
        }
        return
      }

      setStatus('success')
      router.replace('/institution/onboarding')
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router, searchParams, supabase.auth])

  return (
    <AuthWrapperLight>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" aria-hidden />
                <p className="text-slate-700 font-medium">Confirming your invitation…</p>
                <p className="text-sm text-slate-500">You&apos;ll be redirected to set up your institution account.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <ShieldCheck className="h-10 w-10 text-emerald-600" aria-hidden />
                <p className="text-slate-700 font-medium">Invitation accepted. Redirecting…</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <MailWarning className="h-10 w-10 text-amber-600" aria-hidden />
                  <h1 className="text-xl font-semibold text-slate-900">Invitation link problem</h1>
                </div>
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <p className="text-sm text-slate-600 text-center">
                  Invitation links are single-use and expire after a short time. Your administrator can resend
                  one from <strong>Admin → Users → Role Management</strong>.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/auth/sign-in">Go to sign in</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Back to home</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </AuthWrapperLight>
  )
}
