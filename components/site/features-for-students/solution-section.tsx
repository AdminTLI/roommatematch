'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { HelpCircle, Percent, EyeOff } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const icons = [HelpCircle, Percent, EyeOff]

export function SolutionSection() {
  const { locale } = useApp()
  const t = content[locale].solution
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
    'bg-emerald-500/20 border-emerald-400/30 text-emerald-400',
    'bg-violet-500/20 border-violet-400/30 text-violet-400',
  ]

  return (
    <Section
      id="solution"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="solution-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-2">
            {t.blueprintLabel}
          </p>
          <h2
            id="solution-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight max-w-3xl mx-auto"
          >
            {locale === 'en' ? (
              <>The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Compatibility</span> Blueprint</>
            ) : (
              <>Het <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Compatibiliteits</span>plan</>
            )}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.features.map((feature, index) => {
            const Icon = icons[index] ?? HelpCircle
            return (
              <motion.div
                key={index}
                className={cn(
                  'glass noise-overlay p-6 md:p-8 flex flex-col min-h-[200px]',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 border',
                      iconStyles[index]
                    )}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white/70 leading-relaxed flex-1">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </Section>
  )
}
