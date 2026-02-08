'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function FAQSection() {
  const { locale } = useApp()
  const t = content[locale].faq

  return (
    <Section
      id="faq"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-indigo-950/15 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        <motion.h2
          id="faq-heading"
          className="text-3xl md:text-4xl font-bold text-white text-center mb-10 md:mb-12 tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t.title}
        </motion.h2>
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {t.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className={cn(
                  'glass noise-overlay border-0 rounded-2xl overflow-hidden',
                  'transition-all duration-300 hover:border-white/30',
                  '[&[data-state=open]]:border-white/30 [&[data-state=open]]:bg-white/10'
                )}
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-white hover:text-indigo-300 hover:no-underline py-5 px-4 sm:px-6 [&>svg]:text-white/70">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 leading-relaxed pb-5 px-4 sm:px-6 pt-0">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Container>
    </Section>
  )
}
