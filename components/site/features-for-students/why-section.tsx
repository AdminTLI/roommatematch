'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Music, Droplets, Ghost } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

const icons = [Music, Droplets, Ghost]

export function WhySection() {
  const { locale } = useApp()
  const t = content[locale].why

  const cardStyles = [
    'rounded-2xl border border-blue-200 bg-blue-50/70 p-6',
    'rounded-2xl border border-amber-200 bg-amber-50/70 p-6',
    'rounded-2xl border border-violet-200 bg-violet-50/70 p-6',
  ]
  const iconBgStyles = [
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
  ]

  return (
    <Section
      id="why"
      className="bg-white"
      aria-labelledby="why-heading"
    >
      <Container>
        <h2
          id="why-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 md:mb-14"
        >
          {t.title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.painPoints.map((point, index) => {
            const Icon = icons[index] ?? Music
            return (
              <div
                key={index}
                className={cardStyles[index]}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${iconBgStyles[index]}`}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {point.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
