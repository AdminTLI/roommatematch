'use client'

import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface FinalCTAProps {
  locale?: 'en' | 'nl'
}

export function FinalCTA({ locale: localeProp }: FinalCTAProps) {
  const { locale: contextLocale } = useApp()
  const locale = localeProp || contextLocale

  const text = locale === 'nl'
    ? {
        headline: 'Word onderdeel van onze community van builders',
        subtext:
          'We zijn nog pre-team en founder-led. Elke vrijwilliger helpt ons platform vooruit en werkt direct aan echte projecten die studenten veiliger laten wonen.',
        button: 'Bekijk vrijwilligersrollen'
      }
    : {
        headline: 'Join our community of builders',
        subtext:
          'We’re still founder-led and pre-team. Every volunteer ships real work in weeks, helps students live safer together, and sets the tone for how we grow.',
        button: 'See volunteer roles'
      }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Join our <span className="text-brand-primary">Community of Builders</span>
        </h2>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {text.subtext}
        </p>
        <div className="flex justify-center pt-2">
          <Link href="/careers">
            <Button size="lg" className="px-8 py-3 text-base">
              {text.button}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

