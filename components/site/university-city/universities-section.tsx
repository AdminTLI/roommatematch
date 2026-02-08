'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'

interface UniversitiesSectionProps {
  city: CityContent
}

export function UniversityCityUniversities({ city }: UniversitiesSectionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <Section
      className="relative overflow-hidden bg-slate-950/90 py-16 md:py-24 border-y border-white/10"
      aria-labelledby="universities-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-4"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="universities-heading"
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
            >
              {city.nameDisplay} Universities
            </h2>
            <p className="text-lg text-white/80">
              We work with all major universities and institutions in {city.nameDisplay}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {city.universities.map((uni, i) => (
              <motion.div
                key={i}
                className={cn(
                  'glass noise-overlay p-6 rounded-2xl',
                  'transition-all duration-300 hover:border-white/30'
                )}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{uni.name}</h3>
                <p className="text-white/80 mb-4">{uni.description}</p>
                {uni.programs && (
                  <p className="text-sm text-white/60">{uni.programs}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
