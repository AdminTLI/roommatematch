'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { ProfessionalComingSoonDialog } from '@/components/auth/professional-coming-soon-dialog'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GraduationCap, Briefcase, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { UserType } from '@/types/profile'

const welcomeCopy: Record<UserType, { title: string; subtitle: string }> = {
  student: {
    title: 'Made for students.',
    subtitle: 'Match only with other verified students. We look at how you live - not just your budget.',
  },
  professional: {
    title: 'Made for young professionals.',
    subtitle: 'Match with other working professionals and graduates. Find people who fit your schedule and priorities.',
  },
}

const leftColumnDefault = {
  brand: 'Domu Match',
  headline: "Find your roommate.",
  headlineHighlight: "your roommate.",
  body: 'Join a verified community of students and young professionals. We match you on how you live - not just your budget.',
  bullets: [
    { strong: 'Real people:', text: 'Everyone is ID verified.' },
    { strong: 'Living habits that fit:', text: 'Find people who get your routine.' },
    { strong: 'Chat in the app:', text: 'Plan viewings and meetups without the awkward scramble.' },
  ] as const,
}

export function SignUpSection() {
  const searchParams = useSearchParams()
  const typeFromUrl = useMemo(() => {
    const t = searchParams?.get('type')
    // Professional cohort is locked / coming soon – ignore deep-links
    if (t === 'student') return t
    return null
  }, [searchParams])

  const [selectedType, setSelectedType] = useState<UserType | null>(null)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const userType = typeFromUrl ?? selectedType
  const showPathSelection = !typeFromUrl && selectedType === null
  const leftSubtitle = userType ? welcomeCopy[userType].subtitle : leftColumnDefault.body

  const openProfessionalWaitlist = () => setWaitlistOpen(true)

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: brand / welcome (dynamic by type) */}
        <div className="hidden lg:block">
          <p className="text-sm font-semibold tracking-wide text-slate-700">
            {leftColumnDefault.brand}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {userType ? (
              welcomeCopy[userType].title
            ) : (
              <>
                Find{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                  {leftColumnDefault.headlineHighlight}
                </span>
              </>
            )}
          </h1>
          <p className="mt-4 text-lg text-slate-700 max-w-md">
            {leftSubtitle}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            {leftColumnDefault.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600/70" />
                <span><strong>{b.strong}</strong> {b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: path selection or form */}
        <div className="mx-auto w-full max-w-md">
          {showPathSelection ? (
            <div className="space-y-6">
              <p className="text-center text-sm text-slate-700">
                Choose your path to get started. You’ll only match with others in the same cohort.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedType('student')}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedType('student')}
                    className="cursor-pointer rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl hover:bg-white/60 transition-all duration-300 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                  >
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 border border-white/80 text-blue-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg text-slate-900">I am a Student</CardTitle>
                      <CardDescription className="text-slate-700 text-sm">
                        Match with other verified students.
                      </CardDescription>
                    </CardHeader>
                    <CardContent />
                  </Card>
                </motion.div>

                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Card
                          role="button"
                          tabIndex={0}
                          aria-disabled="true"
                          aria-haspopup="dialog"
                          aria-label="I am a Professional, coming soon"
                          onClick={openProfessionalWaitlist}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              openProfessionalWaitlist()
                            }
                          }}
                          className={cn(
                            'relative cursor-not-allowed rounded-3xl border border-white/60 bg-white/35 backdrop-blur-xl',
                            'opacity-70 shadow-[0_18px_50px_rgba(15,23,42,0.06)]',
                            'transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20'
                          )}
                        >
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                            <Lock className="h-3 w-3" aria-hidden />
                            Coming soon
                          </span>
                          <CardHeader className="space-y-2 pb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 border border-white/80 text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-lg text-slate-700">I am a Professional</CardTitle>
                            <CardDescription className="text-slate-600 text-sm">
                              Match with other young professionals.
                            </CardDescription>
                          </CardHeader>
                          <CardContent />
                        </Card>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-center">
                      This feature is coming soon. Click to join the waitlist
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <SignUpForm userType={userType} />
          )}
        </div>
      </div>

      <ProfessionalComingSoonDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </section>
  )
}
