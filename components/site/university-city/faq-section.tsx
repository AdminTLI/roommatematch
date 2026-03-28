'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface FAQSectionProps {
  city: CityContent
}

export function UniversityCityFAQ({ city }: FAQSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
  const reducedMotion = useReducedMotion()

  return (
    <Section
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      aria-labelledby="faq-heading"
    >
      <Container className="relative z-10">
        <motion.h2
          id="faq-heading"
          className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 md:mb-12 tracking-tight"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {u.faqTitle}
        </motion.h2>
        <motion.div
          className="max-w-3xl mx-auto"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {city.faqs.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className={cn(
                  'rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] overflow-hidden',
                  'transition-all duration-300 hover:bg-white/60'
                )}
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-slate-900 hover:text-slate-800 hover:no-underline py-5 px-4 sm:px-6 [&>svg]:text-slate-500">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-700 leading-relaxed pb-5 px-4 sm:px-6 pt-0">
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
