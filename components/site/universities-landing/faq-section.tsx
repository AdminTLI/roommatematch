'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function FAQSection() {
  const { locale } = useApp()
  const faqs = content[locale].faq

  return (
    <Section
      id="faq"
      className="bg-blue-50/30"
      aria-labelledby="faq-heading"
    >
      <Container>
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8 md:mb-10"
        >
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
            >
              <Collapsible>
                <CollapsibleTrigger className="w-full min-h-[44px]">
                  <CardHeader className="text-left p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 text-left">
                        {faq.question}
                      </CardTitle>
                      <ChevronDown
                        className="h-5 w-5 text-indigo-500 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
