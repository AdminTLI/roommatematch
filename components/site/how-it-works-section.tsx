'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  UserPlus,
  FileText,
  Users,
  MessageSquare,
  Home,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
} from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    title: 'How Domu Match works',
    subtitle:
      'Sign up, complete a short quiz, and get matched with verified users who share your lifestyle. Students and young professionals are in separate pools. From profile to move-in in five clear steps.',
    featuresTitle: 'Why our process works',
    featuresSubtitle: 'Built on science, backed by universities, designed for safety',
    ctaTitle: 'Ready to find your perfect match?',
    ctaSubtitle:
      'Set up your profile in about 10 minutes. No commitment - just better matches.',
    ctaButton: 'Get started for free',
    steps: [
      {
        step: '01',
        icon: UserPlus,
        title: 'Sign up & verify',
        description:
          'Create your account and verify your identity so everyone on the platform is real and verified. Students use a university email; young professionals use their email. Both complete government ID verification.',
        details: [
          'Government ID and selfie verification',
          'University email for students, or email for young professionals',
          'Basic profile and privacy settings',
        ],
        gradient: 'from-blue-500/20 to-blue-600/10 border-blue-400/30',
        iconBg: 'bg-blue-500/20 border-blue-400/30',
        iconColor: 'text-blue-400',
      },
      {
        step: '02',
        icon: FileText,
        title: 'Complete the compatibility quiz',
        description:
          'Answer questions about how you study or work, live, and unwind. Your answers shape your profile so we can match you with people who truly fit.',
        details: [
          '40+ factors: study/work schedule, cleanliness, social style',
          'Quiet hours, guests, and lifestyle preferences',
          'Takes about 15 minutes',
        ],
        gradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30',
        iconBg: 'bg-emerald-500/20 border-emerald-400/30',
        iconColor: 'text-emerald-400',
      },
      {
        step: '03',
        icon: Users,
        title: 'Get your matches',
        description:
          'We show you compatible roommates with a clear score and reasoning - no black box. You see why you match before you message.',
        details: [
          'Compatibility score and short explanation',
          'Life stage (student or professional) and lifestyle considered',
          'Shared interests and habits highlighted',
        ],
        gradient: 'from-purple-500/20 to-purple-600/10 border-purple-400/30',
        iconBg: 'bg-purple-500/20 border-purple-400/30',
        iconColor: 'text-purple-400',
      },
      {
        step: '04',
        icon: MessageSquare,
        title: 'Chat safely on the platform',
        description:
          'Message your matches inside Domu Match. Text-only, moderated, and rate-limited so conversations stay respectful and safe.',
        details: [
          'In-app text messaging only',
          'Report and block always available',
          'Moderation and rate limits to prevent abuse',
        ],
        gradient: 'from-amber-500/20 to-amber-600/10 border-amber-400/30',
        iconBg: 'bg-amber-500/20 border-amber-400/30',
        iconColor: 'text-amber-400',
      },
      {
        step: '05',
        icon: Home,
        title: 'Plan your move-in together',
        description:
          'Once you’ve found your match, coordinate housing and move-in. We’re here with tips and support so you can start the year on the right foot.',
        details: [
          'Coordinate housing and move-in',
          'Safety and etiquette guidelines',
          'Ongoing support when you need it',
        ],
        gradient: 'from-rose-500/20 to-rose-600/10 border-rose-400/30',
        iconBg: 'bg-rose-500/20 border-rose-400/30',
        iconColor: 'text-rose-400',
      },
    ],
    features: [
      {
        icon: Zap,
        title: 'Smart matching',
        description:
          '40+ compatibility factors help us suggest roommates who are more likely to click - before any conflict starts.',
      },
      {
        icon: Shield,
        title: 'Verified users only',
        description:
          'Everyone verifies with government ID and selfie. You know you’re talking to real people in your pool - students or young professionals - not randoms.',
      },
      {
        icon: CheckCircle,
        title: 'Transparent matches',
        description:
          'You see your compatibility score and why you matched. No mystery - just clear, explainable results.',
      },
    ],
  },
  nl: {
    title: 'Hoe Domu Match werkt',
    subtitle:
      'Meld je aan, vul een korte quiz in en krijg matches met geverifieerde gebruikers die bij je levensstijl passen. Studenten en young professionals zitten in aparte pools. Van profiel tot verhuizing in vijf duidelijke stappen.',
    featuresTitle: 'Waarom ons proces werkt',
    featuresSubtitle: 'Gebouwd op wetenschap, ondersteund door universiteiten, ontworpen voor veiligheid',
    ctaTitle: 'Klaar om je perfecte match te vinden?',
    ctaSubtitle:
      'Zet je profiel in ongeveer 10 minuten op. Geen verplichting - alleen betere matches.',
    ctaButton: 'Begin gratis',
    steps: [
      {
        step: '01',
        icon: UserPlus,
        title: 'Aanmelden en verifiëren',
        description:
          'Maak je account aan en verifieer je identiteit. Studenten gebruiken een universiteits-e-mail; young professionals hun e-mail. Iedereen verifieert met overheids-ID.',
        details: [
          'Verificatie met overheids-ID en selfie',
          'Bevestiging universiteits-e-mail',
          'Basisprofiel en privacy-instellingen',
        ],
        gradient: 'from-blue-500/20 to-blue-600/10 border-blue-400/30',
        iconBg: 'bg-blue-500/20 border-blue-400/30',
        iconColor: 'text-blue-400',
      },
      {
        step: '02',
        icon: FileText,
        title: 'Voltooi de compatibiliteitsquiz',
        description:
          'Beantwoord vragen over hoe je studeert of werkt, leeft en ontspant. Je antwoorden vormen je profiel zodat we je kunnen matchen met mensen die echt bij je passen.',
        details: [
          '40+ factoren: studie/werkschema, netheid, sociale stijl',
          'Stilte-uren, gasten en levensstijlvoorkeuren',
          'Duurt ongeveer 15 minuten',
        ],
        gradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30',
        iconBg: 'bg-emerald-500/20 border-emerald-400/30',
        iconColor: 'text-emerald-400',
      },
      {
        step: '03',
        icon: Users,
        title: 'Krijg je matches',
        description:
          'We tonen je compatibele huisgenoten met een duidelijke score en uitleg - geen black box. Je ziet waarom je matcht voordat je bericht stuurt.',
        details: [
          'Compatibiliteitsscore en korte uitleg',
          'Studierichting en jaar meegenomen',
          'Gedeelde interesses en gewoonten uitgelicht',
        ],
        gradient: 'from-purple-500/20 to-purple-600/10 border-purple-400/30',
        iconBg: 'bg-purple-500/20 border-purple-400/30',
        iconColor: 'text-purple-400',
      },
      {
        step: '04',
        icon: MessageSquare,
        title: 'Chat veilig op het platform',
        description:
          'Stuur berichten naar je matches binnen Domu Match. Alleen tekst, gemodereerd en met limieten zodat gesprekken respectvol en veilig blijven.',
        details: [
          'Alleen tekstberichten in de app',
          'Rapporteren en blokkeren altijd mogelijk',
          'Moderatie en limieten tegen misbruik',
        ],
        gradient: 'from-amber-500/20 to-amber-600/10 border-amber-400/30',
        iconBg: 'bg-amber-500/20 border-amber-400/30',
        iconColor: 'text-amber-400',
      },
      {
        step: '05',
        icon: Home,
        title: 'Plan jullie verhuizing samen',
        description:
          'Zodra je je match hebt gevonden, stem huisvesting en verhuizing op elkaar af. Wij helpen met tips en ondersteuning zodat je het jaar goed kunt starten.',
        details: [
          'Huisvesting en verhuizing coördineren',
          'Richtlijnen voor veiligheid en etiquette',
          'Doorlopende ondersteuning wanneer je die nodig hebt',
        ],
        gradient: 'from-rose-500/20 to-rose-600/10 border-rose-400/30',
        iconBg: 'bg-rose-500/20 border-rose-400/30',
        iconColor: 'text-rose-400',
      },
    ],
    features: [
      {
        icon: Zap,
        title: 'Slimme matching',
        description:
          '40+ compatibiliteitsfactoren helpen ons huisgenoten voor te stellen die beter bij elkaar passen - voordat er conflicten ontstaan.',
      },
      {
        icon: Shield,
        title: 'Alleen geverifieerde gebruikers',
        description:
          'Iedereen verifieert met overheids-ID en selfie. Je weet dat je met echte mensen in jouw pool praat - studenten of young professionals - niet met vreemden.',
      },
      {
        icon: CheckCircle,
        title: 'Transparante matches',
        description:
          'Je ziet je compatibiliteitsscore en waarom je matcht. Geen mysterie - alleen duidelijke, uitlegbare resultaten.',
      },
    ],
  },
}

export function HowItWorksSection() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: reducedMotion ? 0 : i * 0.08,
        duration: 0.45,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <Section className="relative overflow-hidden py-16 md:py-24">
      <Container className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight mb-6 max-w-4xl mx-auto">
            {locale === 'en' ? (
              <>
                How{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Domu Match
                </span>{' '}
                Works
              </>
            ) : (
              <>
                Hoe{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Domu Match
                </span>{' '}
                Werkt
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Steps  -  interactive stepper */}
        <div className="mb-20">
          <InteractiveSteps steps={t.steps} reducedMotion={reducedMotion} />
        </div>

        {/* Features - Why our process works */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-4">
              {locale === 'nl' ? (
                <>
                  Waarom ons{' '}
                  <span className="text-slate-800">
                    proces werkt
                  </span>
                </>
              ) : (
                <>
                  Why our{' '}
                  <span className="text-slate-800">
                    process works
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {t.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className={cn(
                    GLASS,
                    'p-6 md:p-8 flex flex-col text-center transition-all duration-300',
                    'hover:bg-white/75'
                  )}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={itemVariants}
                  custom={index}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                    <Icon className="h-7 w-7 text-indigo-700" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-4">
            {locale === 'nl' ? (
              <>
                Klaar om je{' '}
                <span className="text-slate-800">
                  perfecte match
                </span>{' '}
                te vinden?
              </>
            ) : (
              <>
                Ready to find your{' '}
                <span className="text-slate-800">
                  perfect match
                </span>
                ?
              </>
            )}
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>
          <Link
            href="/auth/sign-up"
            className={cn(
              'inline-flex items-center justify-center font-medium transition-all',
              'px-6 text-base h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700',
              'shadow-[0_12px_30px_rgba(15,23,42,0.16)] active:translate-y-[1px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none'
            )}
          >
            {t.ctaButton}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}

type Step = (typeof content)['en']['steps'][number]

interface InteractiveStepsProps {
  steps: Step[]
  reducedMotion: boolean
}

function InteractiveSteps({ steps, reducedMotion }: InteractiveStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeStep = steps[activeIndex]
  const ActiveIcon = activeStep.icon

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] items-start">
      {/* Step selector */}
      <motion.ol
        className="relative space-y-3 md:space-y-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div
          className="pointer-events-none absolute left-[1.5rem] top-6 bottom-6 hidden md:block"
          aria-hidden
        >
          <div className="h-full w-px bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-transparent" />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === activeIndex

          return (
            <li key={step.step}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'group relative flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                  'backdrop-blur-xl',
                  isActive
                    ? 'border-white/80 bg-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]'
                    : 'border-white/55 bg-white/40 hover:border-white/80 hover:bg-white/60'
                )}
              >
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-slate-800 tabular-nums">
                  {step.step}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0 text-slate-600 transition-colors duration-200',
                        isActive && step.iconColor
                      )}
                      aria-hidden
                    />
                    <p className="truncate text-sm font-semibold text-slate-800 md:text-base">
                      {step.title}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className={cn(
                    'hidden h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 md:block',
                    isActive && 'translate-x-0.5 text-slate-800'
                  )}
                  aria-hidden
                />

                {isActive && (
                  <span
                    className={cn(
                      'pointer-events-none absolute inset-0 -z-10 rounded-2xl border bg-gradient-to-br opacity-80',
                      step.gradient
                    )}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          )
        })}
      </motion.ol>

      {/* Active step detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.step}
          className={cn(
            GLASS,
            'relative h-full overflow-hidden rounded-2xl border px-6 py-6 md:px-8 md:py-8',
            'flex flex-col justify-between'
          )}
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }
          }
          animate={
            reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.99 }
          }
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <div
            className={cn(
              'pointer-events-none absolute inset-px rounded-[1rem] bg-gradient-to-br opacity-70',
              activeStep.gradient
            )}
            aria-hidden
          />

          <div className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70',
                  activeStep.iconBg
                )}
              >
                <ActiveIcon
                  className={cn('h-6 w-6', activeStep.iconColor)}
                  aria-hidden
                />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-800 md:text-2xl">
                  {activeStep.title}
                </h2>
              </div>
            </div>

            <p className="mb-5 text-sm text-slate-700 md:text-base md:leading-relaxed">
              {activeStep.description}
            </p>

            <ul className="space-y-2.5 md:space-y-3">
              {activeStep.details.map((detail, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-800 md:text-base"
                >
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-6 flex items-center text-xs text-slate-500 md:text-sm">
            <span>
              {activeIndex + 1} of {steps.length}{' '}
              {steps.length === 1 ? 'step' : 'steps'}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
