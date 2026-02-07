'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, CheckCircle } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function TrustSection() {
  const { locale } = useApp()
  const t = content[locale].trust
  const socialProof = content[locale].socialProof

  return (
    <Section
      id="trust"
      className="bg-blue-50/40"
      aria-labelledby="trust-heading"
    >
      <Container>
        <div className="rounded-2xl border-2 border-blue-200 bg-white p-8 md:p-12 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left: Copy + Badge */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Shield className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h2
                    id="trust-heading"
                    className="text-xl sm:text-2xl font-bold text-slate-900"
                  >
                    {t.badge}
                  </h2>
                </div>
              </div>
              <p className="text-lg sm:text-xl text-slate-900 leading-relaxed">
                {t.copy}
              </p>
              <p className="text-sm text-slate-600">
                Used by students at {socialProof.universities.join(', ')}
              </p>
            </div>

            {/* Right: Verified User mockup card */}
            <div className="flex justify-center">
              <div
                className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6 shadow-elev-1 max-w-sm w-full"
                role="img"
                aria-label={t.verifiedLabel}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-700">JD</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">Jane Doe</span>
                      <CheckCircle
                        className="h-5 w-5 text-emerald-500"
                        aria-label="Verified"
                      />
                    </div>
                    <p className="text-sm text-slate-600">UvA • Computer Science</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {t.verifiedLabel}
                  </p>
                  <p className="text-sm text-slate-900 mt-1">
                    Government ID verified via Persona
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
