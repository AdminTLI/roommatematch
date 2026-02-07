'use client'

import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { TrendingUp } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function HeroSection() {
  const { locale } = useApp()
  const t = content[locale].hero

  const barHeights = [40, 52, 48, 65, 72, 68, 78, 85, 82, 90]
  const barColors = [
    'bg-blue-500',
    'bg-blue-600',
    'bg-indigo-500',
    'bg-indigo-600',
    'bg-emerald-500',
    'bg-emerald-600',
    'bg-emerald-500',
    'bg-emerald-600',
    'bg-emerald-400',
    'bg-emerald-400',
  ]

  return (
    <Section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
      aria-labelledby="hero-heading"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            >
              {t.headline}
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                asChild
                className="bg-indigo-500 text-white hover:bg-indigo-600 min-h-[48px] px-8 rounded-2xl shadow-lg border-0"
              >
                <a href="#request-demo" aria-label={t.ctaPrimary}>
                  {t.ctaPrimary}
                </a>
              </Button>
              <Button
                size="lg"
                asChild
                className="min-h-[48px] px-8 rounded-2xl border-2 border-indigo-400/80 bg-transparent text-white hover:bg-indigo-500/20 hover:border-indigo-300 hover:text-white"
              >
                <a
                  href="/contact?subject=impact-report"
                  aria-label={t.ctaSecondary}
                >
                  {t.ctaSecondary}
                </a>
              </Button>
            </div>
          </div>

          <div
            className="rounded-2xl border border-indigo-500/30 bg-slate-800/90 backdrop-blur p-6 shadow-xl"
            aria-hidden
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">
                {t.chartLabel}
              </span>
            </div>
            <div className="h-48 flex items-end gap-2">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 min-w-[8px] rounded-t ${barColors[i]} transition-all`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
