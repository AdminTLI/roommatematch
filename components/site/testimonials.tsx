'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, Brain, Zap, Heart } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: 'Why Domu Match works',
    titleHighlight: 'Domu Match',
    subtitle:
      'Our compatibility-first approach helps you find roommates as compatible as your best friends.',
    benefits: [
      {
        icon: Brain,
        title: 'Science-backed matching',
        description:
          'Our algorithm analyzes 40+ compatibility factors to predict roommate success before conflicts start. No more guessing - find your perfect fit.',
      },
      {
        icon: Shield,
        title: 'Verified & safe',
        description:
          'Every student is verified with government ID and selfie verification. You can focus on compatibility, not safety concerns.',
      },
      {
        icon: Zap,
        title: 'Save time & money',
        description:
          'Find compatible students in days, not weeks. Prevent conflicts and disputes by connecting with ideal roommates from the start.',
      },
      {
        icon: Heart,
        title: 'Find your ideal roommate',
        description:
          "See exactly why you're compatible with transparent explanations. Connect based on lifestyle, study habits, and values that matter.",
      },
    ],
  },
  nl: {
    title: 'Waarom Domu Match werkt',
    titleHighlight: 'Domu Match',
    subtitle:
      'Onze compatibiliteit-eerst aanpak helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden.',
    benefits: [
      {
        icon: Brain,
        title: 'Wetenschappelijk onderbouwde matching',
        description:
          'Ons algoritme analyseert 40+ compatibiliteitsfactoren om het succes van huisgenoten te voorspellen voordat conflicten beginnen. Geen gokken meer - vind je perfecte match.',
      },
      {
        icon: Shield,
        title: 'Geverifieerd en veilig',
        description:
          'Elke student is geverifieerd met overheids-ID en selfie-verificatie. Je kunt je focussen op compatibiliteit, niet op veiligheidszorgen.',
      },
      {
        icon: Zap,
        title: 'Bespaar tijd en geld',
        description:
          'Vind compatibele studenten in dagen, niet weken. Voorkom conflicten en geschillen door vanaf het begin verbinding te maken met ideale huisgenoten.',
      },
      {
        icon: Heart,
        title: 'Vind je ideale huisgenoot',
        description:
          'Zie precies waarom je compatibel bent met transparante uitleg. Verbind op basis van levensstijl, studiegewoonten en waarden die ertoe doen.',
      },
    ],
  },
}

export function Testimonials() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reducedMotion ? 0 : i * 0.1, duration: 0.45, ease: 'easeOut' },
    }),
  }

  return (
    <Section className="relative overflow-hidden py-16 md:py-24">
      <Container className="relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 max-w-3xl mx-auto">
            {locale === 'nl' ? (
              <>Waarom <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{t.titleHighlight}</span> werkt</>
            ) : (
              <>Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{t.titleHighlight}</span> works</>
            )}
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay flex flex-col h-full p-6 md:p-6',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
              >
                {/* Fixed-height icon block so headings align across the row */}
                <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mb-4">
                  <Icon className="h-6 w-6 text-indigo-400" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight mb-2 leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1 min-h-0">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
