'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, BarChart3, Users } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function SolutionSection() {
  const { locale } = useApp()
  const t = content[locale].solution

  return (
    <Section
      id="solution"
      className="bg-gradient-to-b from-blue-50/50 to-slate-50"
      aria-labelledby="solution-heading"
    >
      <Container>
        <h2
          id="solution-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 md:mb-14"
        >
          The Solution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 bg-white p-6 md:p-8 shadow-elev-1 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                <Shield className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t.feature1.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t.feature1.description}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-elev-1 hover:border-emerald-200 hover:shadow-md transition-all">
            <div className="flex flex-col h-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white mb-4">
                <BarChart3 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t.feature2.title}
              </h3>
              <p className="text-slate-600 leading-relaxed flex-1">
                {t.feature2.description}
              </p>
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-1 rounded-2xl border-l-4 border-l-violet-500 border border-slate-200 bg-white p-6 md:p-8 shadow-elev-1 hover:border-violet-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                <Users className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t.feature3.title}
                </h3>
                <p className="text-slate-600 leading-relaxed max-w-2xl">
                  {t.feature3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
