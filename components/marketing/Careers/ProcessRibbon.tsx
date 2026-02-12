'use client'

import { CheckCircle2, Clock, Rocket, Users } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: [
    { icon: Users, title: 'Apply', note: '5 min form + track selection' },
    { icon: CheckCircle2, title: 'Foundersync', note: '30‑min alignment call' },
    { icon: Rocket, title: 'Project sprint', note: '3–5 hrs/wk commitment' },
    { icon: Clock, title: 'Showcase', note: 'Deliverable in 2–3 weeks' },
  ],
  nl: [
    { icon: Users, title: 'Aanmelden', note: '5 min formulier + track selectie' },
    { icon: CheckCircle2, title: 'Foundersync', note: '30 min afstemmingsgesprek' },
    { icon: Rocket, title: 'Project sprint', note: '3–5 uur/week commitment' },
    { icon: Clock, title: 'Showcase', note: 'Resultaat in 2–3 weken' },
  ],
}

export function ProcessRibbon() {
  const { locale } = useApp()
  const steps = content[locale]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-4 sm:p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/15 px-3 py-2.5 text-white"
            >
              <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium leading-tight">{step.title}</div>
                <div className="text-xs text-white/70 leading-snug">{step.note}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


