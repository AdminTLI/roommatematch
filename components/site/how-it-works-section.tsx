'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
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

const content = {
  en: {
    title: 'How Domu Match works',
    subtitle:
      'Sign up, complete a short quiz, and get matched with verified students who share your lifestyle. From profile to move-in in five clear steps.',
    featuresTitle: 'Why our process works',
    featuresSubtitle: 'Built on science, backed by universities, designed for safety',
    ctaTitle: 'Ready to find your perfect match?',
    ctaSubtitle:
      'Set up your profile in about 10 minutes. No commitment—just better matches.',
    ctaButton: 'Get started for free',
    steps: [
      {
        step: '01',
        icon: UserPlus,
        title: 'Sign up & verify',
        description:
          'Create your account with your university email and verify your identity so everyone on the platform is a real, verified student.',
        details: [
          'Government ID and selfie verification',
          'University email confirmation',
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
          'Answer questions about how you study, live, and relax. Your answers shape your profile so we can match you with people who fit.',
        details: [
          '40+ factors: study schedule, cleanliness, social style',
          'Quiet hours, guests, and lifestyle preferences',
          'Takes about 10 minutes',
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
          'We show you compatible roommates with a clear score and reasoning—no black box. You see why you match before you message.',
        details: [
          'Compatibility score and short explanation',
          'Academic program and study year considered',
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
          '40+ compatibility factors help us suggest roommates who are more likely to click—before any conflict starts.',
      },
      {
        icon: Shield,
        title: 'Verified students only',
        description:
          'Everyone verifies with government ID and selfie. You know you’re talking to real students, not randoms.',
      },
      {
        icon: CheckCircle,
        title: 'Transparent matches',
        description:
          'You see your compatibility score and why you matched. No mystery—just clear, explainable results.',
      },
    ],
  },
  nl: {
    title: 'Hoe Domu Match werkt',
    subtitle:
      'Meld je aan, vul een korte quiz in en krijg matches met geverifieerde studenten die bij je levensstijl passen. Van profiel tot verhuizing in vijf duidelijke stappen.',
    featuresTitle: 'Waarom ons proces werkt',
    featuresSubtitle: 'Gebouwd op wetenschap, ondersteund door universiteiten, ontworpen voor veiligheid',
    ctaTitle: 'Klaar om je perfecte match te vinden?',
    ctaSubtitle:
      'Zet je profiel in ongeveer 10 minuten op. Geen verplichting—alleen betere matches.',
    ctaButton: 'Begin gratis',
    steps: [
      {
        step: '01',
        icon: UserPlus,
        title: 'Aanmelden en verifiëren',
        description:
          'Maak je account aan met je universiteits-e-mail en verifieer je identiteit, zodat iedereen op het platform een echte, geverifieerde student is.',
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
          'Beantwoord vragen over hoe je studeert, leeft en ontspant. Je antwoorden bepalen je profiel zodat we je kunnen matchen met mensen die bij je passen.',
        details: [
          '40+ factoren: studierooster, netheid, sociale stijl',
          'Stilte-uren, gasten en levensstijlvoorkeuren',
          'Duurt ongeveer 10 minuten',
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
          'We tonen je compatibele huisgenoten met een duidelijke score en uitleg—geen black box. Je ziet waarom je matcht voordat je bericht stuurt.',
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
          '40+ compatibiliteitsfactoren helpen ons huisgenoten voor te stellen die beter bij elkaar passen—voordat er conflicten ontstaan.',
      },
      {
        icon: Shield,
        title: 'Alleen geverifieerde studenten',
        description:
          'Iedereen verifieert met overheids-ID en selfie. Je weet dat je met echte studenten praat, niet met vreemden.',
      },
      {
        icon: CheckCircle,
        title: 'Transparante matches',
        description:
          'Je ziet je compatibiliteitsscore en waarom je matcht. Geen mysterie—alleen duidelijke, uitlegbare resultaten.',
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
    <Section className="relative overflow-hidden bg-slate-950 py-16 md:py-24">
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 max-w-4xl mx-auto">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Steps — single column of cards */}
        <div className="space-y-6 mb-20">
          {t.steps.map((step) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                className={cn(
                  'glass noise-overlay p-6 md:p-8 transition-all duration-300',
                  'hover:border-white/30 hover:bg-white/15'
                )}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={itemVariants}
                custom={0}
              >
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                      step.iconBg
                    )}
                  >
                    <Icon className={cn('h-6 w-6', step.iconColor)} aria-hidden />
                  </div>
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums rounded-lg border px-2.5 py-1 bg-gradient-to-br',
                      step.gradient,
                      'text-white'
                    )}
                  >
                    {step.step}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-white/80 mb-4 text-base md:text-lg leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="flex items-start gap-2 text-sm md:text-base text-white/90"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0"
                        aria-hidden
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
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
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
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
                    'glass noise-overlay p-6 md:p-8 flex flex-col text-center transition-all duration-300',
                    'hover:border-white/30 hover:bg-white/15'
                  )}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={itemVariants}
                  custom={index}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                    <Icon className="h-7 w-7 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">
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
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>
          <Link
            href="/auth/sign-up"
            className={cn(
              'inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold',
              'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
              'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
              'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
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
