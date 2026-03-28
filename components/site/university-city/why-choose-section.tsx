'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Users, Shield, Check } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface WhyChooseSectionProps {
  city: CityContent
}

const ICONS = [Users, Shield, Check] as const
const ICON_COLORS = ['text-indigo-400', 'text-purple-400', 'text-emerald-400'] as const

export function UniversityCityWhyChoose({ city }: WhyChooseSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
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
            {u.whyHeading(city.nameDisplay)}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {u.whyPoints.map((item, i) => {
              const Icon = ICONS[i]
              return (
                <motion.div
                  key={item.title}
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
                    <Icon className={cn('h-7 w-7', ICON_COLORS[i])} aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-700 text-sm md:text-base">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
