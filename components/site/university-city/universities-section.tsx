'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface UniversitiesSectionProps {
  city: CityContent
}

export function UniversityCityUniversities({ city }: UniversitiesSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
  const reducedMotion = useReducedMotion()

  return (
    <Section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      aria-labelledby="universities-heading"
    >
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
              className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
            >
              {u.universitiesHeading(city.nameDisplay)}
            </h2>
            <p className="text-lg text-slate-700">{u.universitiesSub(city.nameDisplay)}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {city.universities.map((uni, i) => (
              <motion.div
                key={i}
                className={cn(
                  'p-6 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                  'transition-all duration-300 hover:bg-white/60'
                )}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{uni.name}</h3>
                <p className="text-slate-700 mb-4">{uni.description}</p>
                {uni.programs && (
                  <p className="text-sm text-slate-600">{uni.programs}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
