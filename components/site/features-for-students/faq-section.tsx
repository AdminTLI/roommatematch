'use client'

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

export function FAQSection() {
  const { locale } = useApp()
  const t = content[locale].faq

  return (
    <Section
      id="faq"
      className="bg-blue-50/30"
      aria-labelledby="faq-heading"
    >
      <Container>
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10"
        >
          {t.title}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {t.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-slate-200 bg-white hover:border-indigo-200 transition-colors rounded-lg overflow-hidden mb-3 last:mb-0"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-slate-900 hover:text-indigo-600 py-5 px-4 sm:px-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-5 px-4 sm:px-6 pt-0">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  )
}
