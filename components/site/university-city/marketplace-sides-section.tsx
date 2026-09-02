'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface MarketplaceSidesSectionProps {
  city: CityContent
}

export function UniversityCityMarketplaceSides({ city }: MarketplaceSidesSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
  const reducedMotion = useReducedMotion()

  const sides = [
    {
      icon: Search,
      title: u.marketplaceSeekerTitle,
      body: u.marketplaceSeekerBody,
      cta: u.marketplaceSeekerCta,
      href: '/auth/sign-up',
      accent: 'from-blue-600 to-violet-600',
    },
    {
      icon: Home,
      title: u.marketplaceSupplyTitle,
      body: u.marketplaceSupplyBody,
      cta: u.marketplaceSupplyCta,
      href: '/auth/sign-up',
      accent: 'from-violet-600 to-fuchsia-600',
    },
  ] as const

  return (
    <Section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      aria-labelledby="marketplace-sides-heading"
    >
      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <motion.h2
              id="marketplace-sides-heading"
              className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
              initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {u.marketplaceHeading(city.nameDisplay)}
            </motion.h2>
            <motion.p
              className="text-slate-700 text-base md:text-lg"
              initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              {u.marketplaceSub}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sides.map((side, i) => {
              const Icon = side.icon
              return (
                <motion.div
                  key={side.title}
                  className={cn(
                    'flex flex-col p-6 md:p-8 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl',
                    'shadow-[0_18px_50px_rgba(15,23,42,0.08)] space-y-5'
                  )}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-md',
                      side.accent
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{side.title}</h3>
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed">{side.body}</p>
                  </div>
                  <Link
                    href={side.href}
                    className={cn(
                      'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold',
                      'bg-indigo-500 text-white hover:bg-indigo-600 transition-colors',
                      'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20'
                    )}
                  >
                    {side.cta}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
