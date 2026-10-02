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
      'We start with how you live - so home feels easier from day one.',
    benefits: [
      {
        icon: Brain,
        title: 'Matching on how you live',
        description:
          'Sleep, cleanliness, guests, study rhythm, and more - so you see fit before conflicts start. No more guessing.',
      },
      {
        icon: Shield,
        title: 'Verified & safe',
        description:
          'Students and young professionals are verified with government ID and selfie verification. You can focus on finding people you’d want to share a kitchen with.',
      },
      {
        icon: Zap,
        title: 'Save time & money',
        description:
          'Find housemates in days, not weeks. Skip the endless group chats and awkward interviews.',
      },
      {
        icon: Heart,
        title: 'See why you’d click',
        description:
          "Transparent reasons based on lifestyle, habits, and values that matter at home.",
      },
    ],
  },
  nl: {
    title: 'Waarom Domu Match werkt',
    titleHighlight: 'Domu Match',
    subtitle:
      'We beginnen bij hoe je woont - zodat thuis vanaf dag één fijner voelt.',
    benefits: [
      {
        icon: Brain,
        title: 'Matching op hoe je woont',
        description:
          'Slaap, netheid, gasten, studieritme en meer - zodat je de fit ziet vóór er gedoe ontstaat. Geen gokken meer.',
      },
      {
        icon: Shield,
        title: 'Geverifieerd en veilig',
        description:
          'Studenten en young professionals zijn geverifieerd met overheids-ID en selfie-verificatie. Jij focust op mensen met wie je een keuken wilt delen.',
      },
      {
        icon: Zap,
        title: 'Bespaar tijd en geld',
        description:
          'Vind huisgenoten in dagen, niet weken. Skip eindeloze groepschats en awkward interviews.',
      },
      {
        icon: Heart,
        title: 'Zie waarom jullie klikken',
        description:
          'Duidelijke redenen op basis van levensstijl, gewoonten en waarden die thuis ertoe doen.',
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
      transition: { delay: reducedMotion ? 0 : i * 0.1, duration: 0.45, ease: 'easeOut' as const },
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
