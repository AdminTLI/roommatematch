'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Brain, Filter, MessageSquare, ShieldCheck } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: 'Everything you need to',
    titleHighlight: 'find your ideal roommate',
    subtitle:
      'Our comprehensive platform makes finding the right roommate simple and stress-free for students and young professionals.',
    features: [
      {
        icon: Brain,
        title: 'Smart matching',
        description:
          'AI-powered compatibility analysis based on lifestyle, habits, and personality to connect you with ideal roommates in your cohort.',
      },
      {
        icon: Filter,
        title: 'Advanced filters',
        description:
          'Filter by university, program, budget, lifestyle preferences, and more to find compatible students or professionals.',
      },
      {
        icon: MessageSquare,
        title: 'Conversation starters',
        description:
          'Get personalized ice-breaker questions and compatibility insights to start meaningful conversations with potential roommates.',
      },
      {
        icon: ShieldCheck,
        title: 'Verified & secure',
        description:
          'Students and professionals are verified; your cohort stays segregated. Your data is protected with enterprise-grade security.',
      },
    ],
  },
  nl: {
    title: 'Alles wat je nodig hebt om',
    titleHighlight: 'je ideale huisgenoot te vinden',
    subtitle:
      'Ons uitgebreide platform maakt het vinden van de juiste huisgenoot eenvoudig en stressvrij voor studenten en young professionals.',
    features: [
      {
        icon: Brain,
        title: 'Slimme matching',
        description:
          'AI-gestuurde compatibiliteitsanalyse op basis van levensstijl, studiegewoonten en persoonlijkheidskenmerken om je te helpen verbinden met ideale huisgenoten.',
      },
      {
        icon: Filter,
        title: 'Geavanceerde filters',
        description:
          'Filter op universiteit, programma, budget, levensstijlvoorkeuren en meer om compatibele studenten of professionals te vinden.',
      },
      {
        icon: MessageSquare,
        title: 'Gespreksstarters',
        description:
          'Krijg gepersonaliseerde ijsbrekervragen en compatibiliteitsinzichten om je te helpen betekenisvolle gesprekken te starten met potentiële huisgenoten.',
      },
      {
        icon: ShieldCheck,
        title: 'Geverifieerd en veilig',
        description:
          'Studenten en professionals zijn geverifieerd (universiteits-e-mail of young-professionalverificatie); je cohort blijft gescheiden. Je gegevens zijn beschermd met enterprise-grade beveiliging.',
      },
    ],
  },
}

export function Features() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: reducedMotion ? 0 : i * 0.1,
        duration: 0.45,
        ease: 'easeOut',
      },
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
            {t.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{t.titleHighlight}</span>
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay p-6 md:p-8 flex flex-col min-h-[200px]',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={
                  reducedMotion ? undefined : { scale: 1.02, y: -4 }
                }
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon
                      className="h-6 w-6 text-indigo-400"
                      aria-hidden
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
