'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function FAQSection() {
  const { locale } = useApp()
  const faqs = content[locale].faq

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
        <h2
          id="faq-heading"
          className="text-3xl md:text-4xl font-bold text-white text-center tracking-tight mb-8 md:mb-10"
        >
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <Collapsible key={index}>
              <div
                className={cn(
                  'glass noise-overlay rounded-2xl overflow-hidden',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
                )}
              >
                <CollapsibleTrigger className="w-full min-h-[44px] group">
                  <div className="flex items-center justify-between gap-4 p-4 sm:p-6 text-left">
                    <span className="text-base sm:text-lg font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className="h-5 w-5 text-indigo-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </Container>
    </Section>
  )
}
