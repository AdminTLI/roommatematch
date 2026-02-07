'use client'

import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'

export function OfferSection() {
  const { locale } = useApp()
  const t = content[locale].offer

  return (
    <Section
      id="offer"
      className="bg-white"
      aria-labelledby="offer-heading"
    >
      <Container>
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-8 md:p-12 text-center">
          <h2
            id="offer-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4"
          >
            {t.heading}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.copy}
          </p>
          <Button
            size="lg"
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-700 min-h-[48px] px-8 rounded-2xl border-0 shadow-md"
          >
            <a href="#request-demo" aria-label={t.cta}>
              {t.cta}
            </a>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
