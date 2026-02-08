'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, Home } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'

interface HousingSectionProps {
  city: CityContent
}

export function UniversityCityHousing({ city }: HousingSectionProps) {
  const reducedMotion = useReducedMotion()
  const m = city.marketOverview

  return (
    <Section
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="housing-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-indigo-950/15 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div
            className="text-center space-y-4"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="housing-heading"
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
            >
              Student Housing in {city.nameDisplay}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {city.housingIntro}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className={cn(
                'glass noise-overlay p-6 md:p-8 space-y-4',
                'transition-all duration-300 hover:border-white/30'
              )}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-indigo-400" aria-hidden />
                Market Overview
              </h3>
              <div className="space-y-3 text-white/80 text-sm md:text-base">
                <p>
                  <strong className="text-white/90">Average Rent:</strong> {m.averageRent}
                </p>
                <p>
                  <strong className="text-white/90">Housing Type:</strong> {m.housingType}
                </p>
                <p>
                  <strong className="text-white/90">Competition:</strong> {m.competition}
                </p>
                {m.extra && (
                  <p>
                    <strong className="text-white/90">Contracts:</strong> {m.extra}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className={cn(
                'glass noise-overlay p-6 md:p-8 space-y-4',
                'transition-all duration-300 hover:border-white/30'
              )}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <Home className="h-6 w-6 text-indigo-400" aria-hidden />
                Popular Neighborhoods
              </h3>
              <ul className="space-y-3 text-white/80 text-sm md:text-base">
                {city.neighborhoods.map((n, i) => (
                  <li key={i}>
                    <strong className="text-white/90">{n.name}:</strong> {n.description} —{' '}
                    <span className="text-indigo-300">{n.priceRange}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
