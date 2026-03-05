'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: 'Strictly Segregated Pools',
    body: 'Your safety and comfort come first. Students only match with other students; young professionals only with other young professionals. You control your network.',
  },
  nl: {
    title: 'Strikt Gescheiden Pools',
    body: 'Je veiligheid en comfort staan voorop. Studenten matchen alleen met andere studenten; young professionals alleen met andere young professionals. Jij bepaalt je netwerk.',
  },
}

export function SegregatedPoolsSection() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]

  return (
    <Section className="relative overflow-hidden py-10 md:py-14">
      <Container className="relative z-10">
        <motion.div
          className={cn(
            'glass noise-overlay rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 md:p-10',
            'shadow-xl shadow-black/20'
          )}
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/30">
              <ShieldCheck className="h-7 w-7 text-emerald-400" aria-hidden />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
                {t.title}
              </h3>
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
                {t.body}
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
