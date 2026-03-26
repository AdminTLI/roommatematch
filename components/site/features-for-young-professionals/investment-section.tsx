'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function InvestmentSection() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].investment

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  return (
    <Section
      id="investment"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="investment-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className={cn(
            GLASS,
            'p-8 md:p-12 text-center',
            'transition-all duration-300 hover:bg-white/75'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-200/80"
              aria-hidden
            >
              <Clock className="h-7 w-7 text-indigo-700" />
            </div>
          </div>
          <h2
            id="investment-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.copy}
          </p>
          <button
            onClick={handleGetStarted}
            className={cn(
              'inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold',
              'bg-slate-900 text-white hover:bg-slate-900/90',
              'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-105 transition-all duration-200',
              'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
            )}
          >
            {locale === 'nl' ? 'Begin de quiz' : 'Start the quiz'}
          </button>
        </motion.div>
      </Container>
    </Section>
  )
}
