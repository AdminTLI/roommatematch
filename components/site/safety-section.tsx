'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Shield,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Users,
  Lock,
} from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: 'Your safety is our priority',
    subtitle:
      "Chat without worry. Text-only, rate-limited, moderated. If something feels off, flag it instantly. We're here to help resolve concerns before move-in.",
    guidelinesTitle: 'Safety Guidelines',
    guidelinesSubtitle:
      'Follow these guidelines to ensure a safe and positive experience for everyone',
    forStudents: 'For Students',
    forUniversities: 'For Universities',
    needHelp: 'Need help or have concerns?',
    needHelpSubtitle:
      'Our safety team is here 24/7 to help resolve any issues or concerns.',
    contactSafety: 'Contact Safety Team',
    viewSafetyCenter: 'View Safety Center',
    safetyFeatures: [
      {
        icon: Shield,
        title: 'Verified Students Only',
        description: 'Government ID + selfie verification before anyone can use the platform.',
      },
      {
        icon: MessageSquare,
        title: 'Safe Communication',
        description: 'Text-only, moderated chat with rate limits so conversations stay respectful.',
      },
      {
        icon: Eye,
        title: 'Transparent Matches',
        description: "You see why you're matched - compatibility score and reasoning, no black box.",
      },
      {
        icon: AlertTriangle,
        title: 'Report & Block',
        description: 'One-click reporting and block; we escalate to universities and support when needed.',
      },
    ],
    safetyStats: [
      { value: '100%', label: 'Verified profiles' },
      { value: '0', label: 'Safety incidents' },
      { value: '<1%', label: 'Report rate' },
      { value: '24/7', label: 'Moderation support' },
    ],
    studentGuidelines: [
      'Keep personal information private until you meet in person',
      'Meet in public places for the first time',
      'Trust your instincts - if something feels off, report it',
      'Use our chat system for all communication initially',
    ],
    universityGuidelines: [
      'Monitor the moderation queue regularly',
      'Respond to safety reports within 24 hours',
      'Provide clear escalation paths for students',
      'Work with our support team on complex issues',
    ],
  },
  nl: {
    title: 'Je veiligheid is onze prioriteit',
    subtitle:
      'Chat zonder zorgen. Alleen tekst, beperkt in frequentie, gemodereerd. Als iets niet goed aanvoelt, meld het direct. We zijn er om zorgen op te lossen vóór de verhuizing.',
    guidelinesTitle: 'Veiligheidsrichtlijnen',
    guidelinesSubtitle:
      'Volg deze richtlijnen om een veilige en positieve ervaring voor iedereen te garanderen',
    forStudents: 'Voor Studenten',
    forUniversities: 'Voor Universiteiten',
    needHelp: 'Hulp nodig of zorgen?',
    needHelpSubtitle:
      'Ons veiligheidsteam is 24/7 beschikbaar om eventuele problemen of zorgen op te lossen.',
    contactSafety: 'Neem Contact Op met Veiligheidsteam',
    viewSafetyCenter: 'Bekijk Veiligheidscentrum',
    safetyFeatures: [
      {
        icon: Shield,
        title: 'Alleen Geverifieerde Studenten',
        description: 'Overheids-ID + selfie-verificatie voordat iemand het platform kan gebruiken.',
      },
      {
        icon: MessageSquare,
        title: 'Veilige Communicatie',
        description: 'Alleen tekst, gemodereerde chat met limieten zodat gesprekken respectvol blijven.',
      },
      {
        icon: Eye,
        title: 'Transparante Matches',
        description: 'Je ziet waarom je matcht - compatibiliteitsscore en uitleg, geen black box.',
      },
      {
        icon: AlertTriangle,
        title: 'Rapporteer en Blokkeer',
        description: 'Eén-klik rapportage en blokkeren; we escaleren naar universiteiten en support wanneer nodig.',
      },
    ],
    safetyStats: [
      { value: '100%', label: 'Geverifieerde profielen' },
      { value: '0', label: 'Veiligheidsincidenten' },
      { value: '<1%', label: 'Rapportagepercentage' },
      { value: '24/7', label: 'Moderatieondersteuning' },
    ],
    studentGuidelines: [
      'Houd persoonlijke informatie privé totdat je elkaar persoonlijk ontmoet',
      'Ontmoet op openbare plaatsen voor de eerste keer',
      'Vertrouw op je instincten - als iets niet goed aanvoelt, meld het',
      'Gebruik ons chatsysteem voor alle communicatie in eerste instantie',
    ],
    universityGuidelines: [
      'Monitor de moderatiewachtrij regelmatig',
      'Reageer op veiligheidsrapporten binnen 24 uur',
      'Bied duidelijke escalatiepaden voor studenten',
      'Werk samen met ons ondersteuningsteam bij complexe problemen',
    ],
  },
}

export function SafetySection() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
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
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            {locale === 'en' ? (
              <>Your safety is our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">priority</span></>
            ) : (
              <>Je veiligheid is onze <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">prioriteit</span></>
            )}
          </h2>
          <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Safety Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {t.safetyStats.map((stat, index) => (
            <motion.div
              key={index}
              className={cn(
                'glass noise-overlay p-6 text-center transition-all duration-300',
                'hover:border-white/30 hover:bg-white/15'
              )}
              variants={itemVariants}
              custom={index}
            >
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {stat.value}
              </div>
              <div className="text-sm text-white/70 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Safety Features — short, scannable cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {t.safetyFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay p-6 md:p-7 transition-all duration-300',
                  'hover:border-white/30 hover:bg-white/15'
                )}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={itemVariants}
                custom={index}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Safety Guidelines */}
        <motion.div
          className={cn(
            'glass noise-overlay p-6 md:p-10 mb-12 md:mb-16',
            'border-white/20'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
              {t.guidelinesTitle}
            </h3>
            <p className="text-sm md:text-base text-white/70">
              {t.guidelinesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-400" aria-hidden />
                {t.forStudents}
              </h4>
              <ul className="space-y-3 text-sm text-white/90">
                {t.studentGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle
                      className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0"
                      aria-hidden
                    />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" aria-hidden />
                {t.forUniversities}
              </h4>
              <ul className="space-y-3 text-sm text-white/90">
                {t.universityGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle
                      className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0"
                      aria-hidden
                    />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
            {t.needHelp}
          </h3>
          <p className="text-sm md:text-base text-white/70 mb-6 max-w-xl mx-auto">
            {t.needHelpSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/support"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold min-h-[44px]',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.contactSafety}
            </Link>
            <Link
              href="/safety"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold min-h-[44px]',
                'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.viewSafetyCenter}
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
