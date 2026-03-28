'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, Home } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface HousingSectionProps {
  city: CityContent
}

export function UniversityCityHousing({ city }: HousingSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
  const reducedMotion = useReducedMotion()
  const m = city.marketOverview

  return (
    <Section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      aria-labelledby="housing-heading"
    >
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
              className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
            >
              {u.housingHeading(city.nameDisplay)}
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              {city.housingIntro}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className={cn(
                'p-6 md:p-8 space-y-4 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                'transition-all duration-300 hover:bg-white/60'
              )}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-700" aria-hidden />
                {u.marketOverview}
              </h3>
              <div className="space-y-3 text-slate-700 text-sm md:text-base">
                <p>
                  <strong className="text-slate-900">{u.avgRent}</strong> {m.averageRent}
                </p>
                <p>
                  <strong className="text-slate-900">{u.housingType}</strong> {m.housingType}
                </p>
                <p>
                  <strong className="text-slate-900">{u.competition}</strong> {m.competition}
                </p>
                {m.extra && (
                  <p>
                    <strong className="text-slate-900">{u.contracts}</strong> {m.extra}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className={cn(
                'p-6 md:p-8 space-y-4 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                'transition-all duration-300 hover:bg-white/60'
              )}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <Home className="h-6 w-6 text-blue-700" aria-hidden />
                {u.popularNeighborhoods}
              </h3>
              <ul className="space-y-3 text-slate-700 text-sm md:text-base">
                {city.neighborhoods.map((n, i) => (
                  <li key={i}>
                    <strong className="text-slate-900">{n.name}:</strong> {n.description}  - {' '}
                    <span className="text-blue-700 font-semibold">{n.priceRange}</span>
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
