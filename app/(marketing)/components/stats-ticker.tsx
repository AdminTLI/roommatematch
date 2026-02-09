'use client'

import { useApp } from '@/app/providers'

const content = {
  en: [
    'Incubated at Tilburg University and Avans',
    'GDPR Compliant',
    'Powered by Persona™',
    'Developed in The Netherlands',
    'Science-Backed Matching',
  ],
  nl: [
    'Incubaat bij Tilburg University en Avans',
    'AVG-conform',
    'Powered by Persona™',
    'Ontwikkeld in Nederland',
    'Wetenschappelijk onderbouwde matching',
  ],
}

const NBSP = '\u00A0' // non-breaking space to prevent collapse
const separator = `${NBSP.repeat(6)}•${NBSP.repeat(6)}`

export function StatsTicker() {
  const { locale } = useApp()
  const items = content[locale]
  const line = items.join(separator)
  const strip = [line, line].join(separator) + separator

  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-white/5 backdrop-blur-lg py-4"
      aria-hidden
    >
      <div className="ticker-scroll flex w-max whitespace-nowrap text-slate-200 text-sm md:text-base font-medium">
        <span>{strip}</span>
        <span>{strip}</span>
      </div>
    </div>
  )
}
