'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, CheckCircle } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function TrustSection() {
  const { locale } = useApp()
  const t = content[locale].trust
  const socialProof = content[locale].socialProof

  return (
    <Section
      id="trust"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="trust-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        <motion.div
          className={cn(
            'glass noise-overlay p-8 md:p-12',
            'transition-all duration-300 hover:border-white/30'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left: Copy + Badge */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <Shield className="h-6 w-6 text-emerald-400" aria-hidden />
                </div>
                <div>
                  <h2
                    id="trust-heading"
                    className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                  >
                    {t.badge}
                  </h2>
                </div>
              </div>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
                {t.copy}
              </p>
              <p className="text-sm text-white/60">
                Used by students at {socialProof.universities.length <= 2
                  ? socialProof.universities.join(' and ')
                  : socialProof.universities.slice(0, -1).join(', ') + ', and ' + socialProof.universities[socialProof.universities.length - 1]}
              </p>
            </div>

            {/* Right: Verified User mockup card */}
            <div className="flex justify-center">
              <div
                className={cn(
                  'glass-dark noise-overlay p-6 rounded-2xl max-w-sm w-full',
                  'border-white/20'
                )}
                role="img"
                aria-label={t.verifiedLabel}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-300">JD</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Jane Doe</span>
                      <CheckCircle
                        className="h-5 w-5 text-emerald-400"
                        aria-label="Verified"
                      />
                    </div>
                    <p className="text-sm text-white/60">Tilburg University • Economics</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                    {t.verifiedLabel}
                  </p>
                  <p className="text-sm text-white/80 mt-1">
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
