'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import type { CityContent } from './content'

interface StatsSectionProps {
  city: CityContent
}

export function UniversityCityStats({ city }: StatsSectionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <Section className="relative overflow-hidden bg-slate-950/80 py-12 md:py-16 border-y border-white/10">
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {city.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {stat.value}
              </div>
              <div className="text-sm text-white/70 mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}
