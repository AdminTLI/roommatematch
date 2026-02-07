'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { HelpCircle, Percent, EyeOff } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

const icons = [HelpCircle, Percent, EyeOff]

export function SolutionSection() {
  const { locale } = useApp()
  const t = content[locale].solution

  const cardStyles = [
    'rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 bg-white p-6 shadow-elev-1 hover:border-blue-200 transition-all',
    'rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-elev-1 hover:border-emerald-200 transition-all',
    'rounded-2xl border-l-4 border-l-violet-500 border border-slate-200 bg-white p-6 shadow-elev-1 hover:border-violet-200 transition-all',
  ]
  const iconStyles = [
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-violet-500 text-white',
  ]

  return (
    <Section
      id="solution"
      className="bg-gradient-to-b from-blue-50/50 to-slate-50"
      aria-labelledby="solution-heading"
    >
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-2">
            {t.blueprintLabel}
          </p>
          <h2
            id="solution-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3"
          >
            {t.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {t.features.map((feature, index) => {
            const Icon = icons[index] ?? HelpCircle
            return (
              <div
                key={index}
                className={cardStyles[index]}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${iconStyles[index]}`}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
