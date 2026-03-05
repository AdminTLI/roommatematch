'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { GraduationCap, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import type { UserType } from '@/types/profile'

const welcomeCopy: Record<UserType, { title: string; subtitle: string }> = {
  student: {
    title: 'Join the Student Network.',
    subtitle: 'Match exclusively with other verified students. We match you with roommates who fit your lifestyle, not just your budget.',
  },
  professional: {
    title: 'Join the Professional Network.',
    subtitle: 'Match with other working professionals and graduates. Find roommates who get your schedule and priorities.',
  },
}

const leftColumnDefault = {
  brand: 'Domu Match',
  headline: "Find your roommate.",
  headlineHighlight: "your roommate.",
  body: 'Join a verified community of students and young professionals. We match you with roommates who fit your lifestyle, not just your budget.',
  bullets: [
    { strong: 'Real Humans:', text: 'A 100% verified community.' },
    { strong: 'Deeper Connections:', text: 'Find people who truly "get" your routine.' },
    { strong: 'Seamless Chat:', text: 'Coordinate viewings and meetups instantly.' },
  ] as const,
}

export function SignUpSection() {
  const searchParams = useSearchParams()
  const typeFromUrl = useMemo(() => {
    const t = searchParams?.get('type')
    if (t === 'student' || t === 'professional') return t
    return null
  }, [searchParams])

  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const userType = typeFromUrl ?? selectedType
  const showPathSelection = !typeFromUrl && selectedType === null
  const leftSubtitle = userType ? welcomeCopy[userType].subtitle : leftColumnDefault.body

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: brand / welcome (dynamic by type) */}
        <div className="hidden lg:block">
          <p className="text-sm font-semibold tracking-wide text-white/70">
            {leftColumnDefault.brand}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            {userType ? (
              welcomeCopy[userType].title
            ) : (
              <>
                Find{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {leftColumnDefault.headlineHighlight}
                </span>
              </>
            )}
          </h1>
          <p className="mt-4 text-lg text-white/75 max-w-md">
            {leftSubtitle}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {leftColumnDefault.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300/80" />
                <span><strong>{b.strong}</strong> {b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: path selection or form */}
        <div className="mx-auto w-full max-w-md">
          {showPathSelection ? (
            <div className="space-y-6">
              <p className="text-center text-sm text-white/70">
                Choose your path to get started. You’ll only match with others in the same cohort.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedType('student')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedType('student')}
                    className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                  >
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg text-white">I am a Student</CardTitle>
                      <CardDescription className="text-white/70 text-sm">
                        Match with other verified students.
                      </CardDescription>
                    </CardHeader>
                    <CardContent />
                  </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedType('professional')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedType('professional')}
                    className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                  >
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg text-white">I am a Professional</CardTitle>
                      <CardDescription className="text-white/70 text-sm">
                        Match with other young professionals.
                      </CardDescription>
                    </CardHeader>
                    <CardContent />
                  </Card>
                </motion.div>
              </div>
            </div>
          ) : (
            <SignUpForm userType={userType} />
          )}
        </div>
      </div>
    </section>
  )
}
