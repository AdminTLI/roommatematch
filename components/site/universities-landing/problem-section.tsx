'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Users, AlertCircle, EyeOff } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const icons = [Users, AlertCircle, EyeOff]

const iconBoxStyles = [
  'bg-blue-500/20 border-blue-400/30 text-blue-400',
  'bg-amber-500/20 border-amber-400/30 text-amber-400',
  'bg-violet-500/20 border-violet-400/30 text-violet-400',
]

export function ProblemSection() {
  const { locale } = useApp()
  const t = content[locale].problem
  const reducedMotion = useReducedMotion()
  const columns = [
    { title: t.isolation.title, description: t.isolation.description },
    { title: t.conflict.title, description: t.conflict.description },
    { title: t.void.title, description: t.void.description },
  ]

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
      id="problem"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="problem-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-transparent to-purple-950/15 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <motion.h2
          id="problem-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight text-center mb-10 md:mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t.title}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {columns.map((col, index) => {
            const Icon = icons[index]
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay p-6 md:p-8 flex flex-col items-center text-center min-h-[200px]',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
              >
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl border mb-4',
                    iconBoxStyles[index]
                  )}
                >
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight mb-2">{col.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm md:text-base">{col.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
