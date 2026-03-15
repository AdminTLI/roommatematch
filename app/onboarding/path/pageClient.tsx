'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Briefcase } from 'lucide-react'
import { showErrorToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import type { UserType } from '@/types/profile'
import { pathSelectionSchema } from '@/lib/validation/profile-schema'
import { motion } from 'framer-motion'
import { AcademicVerificationGate } from '@/app/(components)/academic-verification-gate'

export default function PathSelectionClient() {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showStudentGate, setShowStudentGate] = useState(false)

  const handleNext = async () => {
    const parsed = pathSelectionSchema.safeParse({ user_type: selected })
    if (!parsed.success || !selected) {
      showErrorToast('Please select an option', 'Choose whether you are a student or a young professional.')
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user?.id) {
        showErrorToast('Session expired', 'Please sign in again.')
        return
      }

      const response = await fetchWithCSRF('/api/onboarding/path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id, user_type: selected }),
      })

      const data: { ok?: boolean; isVerifiedStudent?: boolean; error?: string } = await response.json().catch(
        () => ({})
      )

      if (!response.ok || !data.ok) {
        const message =
          data.error ||
          'We could not save your selection. Please try again. If the problem persists, contact support.'
        showErrorToast('Could not save selection', message)
        return
      }

      if (selected === 'professional') {
        router.push('/onboarding-professional/welcome')
        return
      }

      if (data.isVerifiedStudent) {
        router.push('/onboarding/welcome')
        return
      }

      setShowStudentGate(true)
    } catch (e) {
      console.error('[PathSelection] Failed to save user_type:', e)
      showErrorToast(
        'Something went wrong',
        e instanceof Error && e.message
          ? e.message
          : 'Please try again. If the problem persists, contact support.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentVerified = () => {
    router.push('/onboarding/welcome')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-72 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_55%)] mix-blend-screen" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-purple-500 shadow-lg shadow-indigo-500/30">
                <span className="text-xs font-semibold tracking-tight text-white">DM</span>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-50">Domu Match</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Compatibility first, flatmates second
                </p>
              </div>
            </div>
            <div className="hidden text-xs font-medium text-slate-400 sm:block">
              Step 0 · Choose your path
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {showStudentGate ? (
              <div className="max-w-md mx-auto">
                <AcademicVerificationGate onVerified={handleStudentVerified} />
              </div>
            ) : (
              <>
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                Get started
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
                Which best describes{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                  your current stage
                </span>{' '}
                in life?
              </h1>
              <p className="mt-3 text-slate-300">
                We match you only with people in the same cohort for a safe and relevant experience.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected('student')}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected('student')}
                  className={[
                    'cursor-pointer transition-all duration-300 rounded-2xl border backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.85)]',
                    'bg-white/10 border-white/20 hover:bg-white/16 hover:border-white/40 hover:shadow-[0_22px_80px_rgba(15,23,42,0.95)]',
                    selected === 'student'
                      ? 'ring-2 ring-primary border-primary/60 bg-white/18 shadow-[0_24px_90px_rgba(56,189,248,0.75)]'
                      : ''
                  ].join(' ')}
                >
                  <CardHeader className="space-y-3 pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-slate-50">I am a Student</CardTitle>
                    <CardDescription className="text-slate-300">
                      Match exclusively with other students and unlock university-specific features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected('professional')}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected('professional')}
                  className={[
                    'cursor-pointer transition-all duration-300 rounded-2xl border backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.85)]',
                    'bg-white/10 border-white/20 hover:bg-white/16 hover:border-white/40 hover:shadow-[0_22px_80px_rgba(15,23,42,0.95)]',
                    selected === 'professional'
                      ? 'ring-2 ring-primary border-primary/60 bg-white/18 shadow-[0_24px_90px_rgba(129,140,248,0.75)]'
                      : ''
                  ].join(' ')}
                >
                  <CardHeader className="space-y-3 pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl text-slate-50">I am a Young Professional</CardTitle>
                    <CardDescription className="text-slate-300">
                      Match with other working professionals and graduates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </motion.div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleNext}
                disabled={!selected || isLoading}
                className="min-h-[48px] rounded-xl px-8 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-slate-50 hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? 'Saving…' : 'Next'}
              </Button>
            </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
