'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Music, Droplets, Ghost } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const icons = [Music, Droplets, Ghost]

export function WhySection() {
  const { locale } = useApp()
  const t = content[locale].why
  const reducedMotion = useReducedMotion()

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: reducedMotion ? 0 : i * 0.1,
        duration: 0.45,
        ease: 'easeOut',
      },
    }),
  }

  const iconStyles = [
    'bg-blue-500/20 border-blue-400/30 text-blue-400',
    'bg-amber-500/20 border-amber-400/30 text-amber-400',
    'bg-violet-500/20 border-violet-400/30 text-violet-400',
  ]

  return (
    <Section
      id="why"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="why-heading"
    >
      <Container className="relative z-10">
        <motion.h2
          id="why-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-14 tracking-tight max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {locale === 'en' ? (
            <>Living with strangers <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">shouldn&apos;t be a gamble.</span></>
          ) : (
            <>Samenwonen met vreemden <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">zou geen gok moeten zijn.</span></>
          )}
        </motion.h2>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.painPoints.map((point, index) => {
            const Icon = icons[index] ?? Music
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay p-6 md:p-8 flex flex-col min-h-[180px]',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 border',
                      iconStyles[index]
                    )}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                      {point.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
