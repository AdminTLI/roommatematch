'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, Lock } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function PrivacyGdprSection() {
  const { locale } = useApp()
  const t = content[locale].privacy

  return (
    <Section
      id="privacy"
      className="bg-blue-50/40"
      aria-labelledby="privacy-heading"
    >
      <Container>
        <div className="rounded-2xl border-2 border-blue-200 bg-white p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Shield className="h-6 w-6" aria-hidden />
                </div>
                <h2
                  id="privacy-heading"
                  className="text-2xl sm:text-3xl font-bold text-slate-900"
                >
                  {t.heading}
                </h2>
              </div>
              <ul className="space-y-3 text-slate-600">
                {t.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Lock
                      className="h-4 w-4 text-blue-500 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 flex items-center justify-center md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                <Lock className="h-4 w-4" aria-hidden />
                {t.badgeText}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
