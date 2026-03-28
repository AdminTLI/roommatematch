'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useApp } from '@/app/providers'
import { faqMarketingEn } from './faq-en'
import { faqMarketingNl } from './faq-nl'
import type { Locale } from '@/lib/i18n'

const uiCopy: Record<
  Locale,
  {
    eyebrow: string
    title: string
    subtitle: string
    stillTitle: string
    stillBody: string
    emailCta: string
    helpCta: string
  }
> = {
  en: {
    eyebrow: 'Domu Match',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about finding compatible roommates with Domu Match',
    stillTitle: 'Still Have Questions?',
    stillBody: "Can't find the answer you're looking for? Our support team is here to help.",
    emailCta: 'Email Support',
    helpCta: 'Visit Help Center',
  },
  nl: {
    eyebrow: 'Domu Match',
    title: 'Veelgestelde vragen',
    subtitle: 'Alles wat je wilt weten over het vinden van een passende huisgenoot met Domu Match',
    stillTitle: 'Nog vragen?',
    stillBody: 'Staat je antwoord er niet bij? Ons supportteam helpt je graag.',
    emailCta: 'Mail support',
    helpCta: 'Naar het helpcentrum',
  },
}

const faqByLocale = {
  en: faqMarketingEn,
  nl: faqMarketingNl,
} as const

export function FaqMarketingBody() {
  const { locale } = useApp()
  const faqData = faqByLocale[locale]
  const u = uiCopy[locale]

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600/70" aria-hidden />
                {u.eyebrow}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{u.title}</h1>
              <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">{u.subtitle}</p>
            </div>

            {faqData.map((category, categoryIndex) => (
              <div
                key={category.category}
                className="space-y-4 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8"
              >
                <h2 className="text-2xl font-bold text-slate-900 border-b border-white/70 pb-3">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem
                      key={item.question}
                      value={`${categoryIndex}-${itemIndex}`}
                      className="border-white/70"
                    >
                      <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-slate-900 hover:text-slate-800 hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-700 leading-relaxed">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            <div className="border border-white/60 bg-white/45 backdrop-blur-xl rounded-3xl p-8 text-center space-y-4 mt-12 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-2xl font-bold text-slate-900">{u.stillTitle}</h2>
              <p className="text-slate-700">{u.stillBody}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="mailto:support@domumatch.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-900/90 transition-colors font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                >
                  {u.emailCta}
                </a>
                <a
                  href="/help-center"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/70 bg-white/60 text-slate-800 rounded-2xl hover:bg-white/75 transition-colors font-semibold"
                >
                  {u.helpCta}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
