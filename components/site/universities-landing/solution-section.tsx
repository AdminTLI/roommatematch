'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, BarChart3, Users } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const iconStyles = [
  'bg-blue-500/20 border-blue-400/30 text-blue-400',
  'bg-emerald-500/20 border-emerald-400/30 text-emerald-400',
  'bg-violet-500/20 border-violet-400/30 text-violet-400',
]

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
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight text-center mb-10 md:mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Solution</span>
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
              'glass noise-overlay md:col-span-2 p-6 md:p-8 flex flex-col min-h-[200px]',
              'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
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
                <h3 className="text-xl font-semibold text-white tracking-tight mb-2">{t.feature1.title}</h3>
                <p className="text-white/70 leading-relaxed">{t.feature1.description}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className={cn(
              'glass noise-overlay p-6 md:p-8 flex flex-col min-h-[200px]',
              'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
            )}
            variants={itemVariants}
            custom={1}
            whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
          >
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border mb-4', iconStyles[1])}>
              <BarChart3 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight mb-2">{t.feature2.title}</h3>
            <p className="text-white/70 leading-relaxed flex-1">{t.feature2.description}</p>
          </motion.div>
          <motion.div
            className={cn(
              'glass noise-overlay md:col-span-3 p-6 md:p-8 flex flex-col',
              'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
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
                <h3 className="text-xl font-semibold text-white tracking-tight mb-2">{t.feature3.title}</h3>
                <p className="text-white/70 leading-relaxed">{t.feature3.description}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  )
}
