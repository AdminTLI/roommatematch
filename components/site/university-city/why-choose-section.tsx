'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Users, Shield, Check } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'

interface WhyChooseSectionProps {
  city: CityContent
}

const points = [
  {
    icon: Users,
    title: 'Verified Users Only',
    description: 'All users verified (university email or young-professional verification). Connect safely with compatible roommates.',
    gradient: 'from-indigo-500/20 to-indigo-600/10 border-indigo-400/30',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Shield,
    title: 'Science-Backed Matching',
    description: '40+ compatibility factors analyzed to find your perfect roommate match.',
    gradient: 'from-purple-500/20 to-purple-600/10 border-purple-400/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: Check,
    title: 'Free Forever',
    description: 'No hidden fees, no premium tiers. Completely free for students and young professionals.',
    gradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30',
    iconColor: 'text-emerald-400',
  },
] as const

export function UniversityCityWhyChoose({ city }: WhyChooseSectionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <Section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      aria-labelledby="why-choose-heading"
    >
      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl font-bold text-slate-900 text-center tracking-tight"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why {city.nameDisplay} Students Choose Domu Match
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {points.map((item, i) => (
              <motion.div
                key={i}
                className={cn(
                  'p-6 md:p-8 text-center space-y-4 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                  'transition-all duration-300 hover:bg-white/60'
                )}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className={cn(
                    'w-14 h-14 mx-auto rounded-2xl border border-white/80 bg-white/70 flex items-center justify-center shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                  )}
                >
                  <item.icon className="h-7 w-7 text-blue-700" aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="text-slate-700 text-sm md:text-base">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
