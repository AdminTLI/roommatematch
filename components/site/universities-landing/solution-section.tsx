'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, BarChart3, Users } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const iconStyles = [
  'bg-blue-50/80 border-blue-200/80 text-blue-700',
  'bg-emerald-50/80 border-emerald-200/80 text-emerald-700',
  'bg-violet-50/80 border-violet-200/80 text-violet-700',
]

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function SolutionSection() {
  const { locale } = useApp()
  const t = content[locale].solution
  const reducedMotion = useReducedMotion()

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reducedMotion ? 0 : i * 0.1, duration: 0.45, ease: 'easeOut' },
    }),
  }

  return (
    <Section
      id="solution"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="solution-heading"
    >
      <Container className="relative z-10">
        <motion.h2
          id="solution-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight text-center mb-10 md:mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {locale === 'nl' ? (
            <>
              De{' '}
              <span className="text-slate-800">
                oplossing
              </span>
            </>
          ) : (
            <>
              The{' '}
              <span className="text-slate-800">
                solution
              </span>
            </>
          )}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div
            className={cn(
              GLASS,
              'md:col-span-2 p-6 md:p-8 flex flex-col min-h-[200px]',
              'transition-all duration-300 hover:bg-white/75'
            )}
            variants={itemVariants}
            custom={0}
            whileHover={reducedMotion ? undefined : { scale: 1.01, y: -2 }}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                  iconStyles[0]
                )}
              >
                <Shield className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 tracking-tight mb-2">{t.feature1.title}</h3>
                <p className="text-slate-600 leading-relaxed">{t.feature1.description}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className={cn(
              GLASS,
              'p-6 md:p-8 flex flex-col min-h-[200px]',
              'transition-all duration-300 hover:bg-white/75'
            )}
            variants={itemVariants}
            custom={1}
            whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
          >
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border mb-4', iconStyles[1])}>
              <BarChart3 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-2">{t.feature2.title}</h3>
            <p className="text-slate-600 leading-relaxed flex-1">{t.feature2.description}</p>
          </motion.div>
          <motion.div
            className={cn(
              GLASS,
              'md:col-span-3 p-6 md:p-8 flex flex-col',
              'transition-all duration-300 hover:bg-white/75'
            )}
            variants={itemVariants}
            custom={2}
            whileHover={reducedMotion ? undefined : { scale: 1.01, y: -2 }}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                  iconStyles[2]
                )}
              >
                <Users className="h-6 w-6" aria-hidden />
              </div>
              <div className="max-w-2xl">
                <h3 className="text-xl font-semibold text-slate-800 tracking-tight mb-2">{t.feature3.title}</h3>
                <p className="text-slate-600 leading-relaxed">{t.feature3.description}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}
