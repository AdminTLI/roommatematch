'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, CheckCircle } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function TrustSection() {
  const { locale } = useApp()
  const t = content[locale].trust

  return (
    <Section
      id="trust"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="trust-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className={cn(
            GLASS,
            'p-8 md:p-12',
            'transition-all duration-300 hover:bg-white/75'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                  <Shield className="h-6 w-6 text-emerald-700" aria-hidden />
                </div>
                <div>
                  <h2
                    id="trust-heading"
                    className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight"
                  >
                    {t.badge}
                  </h2>
                </div>
              </div>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
                {t.copy}
              </p>
              <p className="text-sm text-slate-600">
                {t.proofLine}
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className={cn(
                  'bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl',
                  'p-6 max-w-sm w-full'
                )}
                role="img"
                aria-label={t.verifiedLabel}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-700">JD</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {locale === 'nl' ? 'Julia de Vries' : 'Julia de Vries'}
                      </span>
                      <CheckCircle
                        className="h-5 w-5 text-emerald-600"
                        aria-label="Verified"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {locale === 'nl' ? 'Young professional • Amsterdam' : 'Young Professional • Amsterdam'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/60">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {t.verifiedLabel}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Government ID verified via Persona
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
