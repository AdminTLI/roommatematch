'use client'

import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, Shield, Server, Lock } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

const trustIcons = [Shield, Server, Lock]

export function PilotIncentiveSection() {
  const { locale } = useApp()
  const t = content[locale].pilot

  return (
    <Section
      id="pilot-incentive"
      className="bg-gradient-to-b from-slate-50 to-indigo-50/50"
      aria-labelledby="pilot-heading"
    >
      <Container>
        <div className="rounded-2xl border-2 border-indigo-600/50 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 md:p-12 text-white shadow-xl">
          <h2
            id="pilot-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4"
          >
            {t.title}
          </h2>
          <p className="text-indigo-200 text-center max-w-2xl mx-auto mb-10">
            {t.pitch}
          </p>
          <ul className="space-y-4 max-w-xl mx-auto mb-10">
            {t.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <span className="font-semibold text-white">
                    {benefit.label}:
                  </span>{' '}
                  <span className="text-slate-300">{benefit.detail}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-center mb-10">
            <Button
              size="lg"
              asChild
              className="bg-indigo-500 text-white hover:bg-indigo-400 min-h-[48px] px-8 rounded-2xl border-0 shadow-lg"
            >
              <a href="#request-demo" aria-label={t.title}>
                Request a Pilot
              </a>
            </Button>
          </div>
          <div className="pt-8 border-t border-indigo-500/30">
            <p className="text-xs text-indigo-300/90 text-center mb-4">
              {t.trustPrefix}
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {t.trustItems.map((item, i) => {
                const Icon = trustIcons[i]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-indigo-200 text-sm"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
                    )}
                    <span>
                      {item.name}
                      {item.description ? ` (${item.description})` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
