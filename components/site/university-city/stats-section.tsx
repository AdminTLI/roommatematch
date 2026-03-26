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
    <Section className="relative overflow-hidden py-10 md:py-12">
      <Container className="relative z-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 md:p-8"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {city.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                {stat.value}
              </div>
              <div className="text-sm text-slate-700 mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}
