'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Users, AlertCircle, EyeOff } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

const icons = [Users, AlertCircle, EyeOff]

export function ProblemSection() {
  const { locale } = useApp()
  const t = content[locale].problem
  const columns = [
    { title: t.isolation.title, description: t.isolation.description },
    { title: t.conflict.title, description: t.conflict.description },
    { title: t.void.title, description: t.void.description },
  ]

  const cardStyles = [
    'rounded-2xl border border-blue-200 bg-blue-50/70 p-6 text-center',
    'rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center',
    'rounded-2xl border border-violet-200 bg-violet-50/70 p-6 text-center',
  ]
  const iconBgStyles = [
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
  ]

  return (
    <Section
      id="problem"
      className="bg-white"
      aria-labelledby="problem-heading"
    >
      <Container>
        <h2
          id="problem-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 md:mb-14"
        >
          {t.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {columns.map((col, index) => {
            const Icon = icons[index]
            return (
              <div key={index} className={cardStyles[index]}>
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBgStyles[index]}`}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {col.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{col.description}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
