'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { BETA_SIGNUP_GOOGLE_FORM_URL } from '@/lib/marketing/beta-signup'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import {
  SocialHeroPreviewCard,
  type SocialHeroPreviewCardData,
} from '@/components/site/social-hero-preview-card'

const content = {
  en: {
    headline: 'Find a roommate you actually click with.',
    subline: 'Meet verified people and see clear reasons.',
    ctaPrimary: 'Get started',
    ctaSecondary: 'See how it works',
    trustLine: 'No catfish. No awkward interviews. Just verified matches.',
  },
  nl: {
    headline: 'Vind een huisgenoot waar je echt mee klikt.',
    subline: 'Ontmoet geverifieerde mensen en zie duidelijke redenen.',
    ctaPrimary: 'Begin nu',
    ctaSecondary: 'Bekijk hoe het werkt',
    trustLine: 'Geen catfish. Geen awkward interviews. Wel geverifieerde matches.',
  },
}

export function SocialHero() {
  const { locale } = useApp()
  const t = content[locale]

  const previewData: SocialHeroPreviewCardData = useMemo(() => {
    const isNl = locale === 'nl'
    return {
      name: isNl ? 'Noor van Dijk' : 'Noor van Dijk',
      matchPercent: 89,
      harmonyPercent: 92,
      contextPercent: 86,
      contextLine: isNl
        ? 'Universiteit van Amsterdam • Psychologie • Jaar 2'
        : 'University of Amsterdam • Psychology • Year 2',
      highlights: isNl
        ? ['Beiden open voor cross-city indien nodig', 'Zelfde niveau: bachelor', 'Vergelijkbaar afstudeerjaar']
        : ['Both open to cross-city if needed', 'Same degree level: bachelor', 'Similar graduation year'],
      dimensions: {
        cleanliness: 90,
        noise: 94,
        guests: 86,
        sleep: 88,
        shared_spaces: 91,
        substances: 84,
        study_social: 89,
        home_vibe: 92,
      },
    }
  }, [locale])

  return (
    <Section className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center py-8 md:py-10">
      <Container className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:-mt-10">
          <div className="max-w-xl space-y-6">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.02]">
              {t.headline}
            </h1>

            <p className="text-lg sm:text-xl text-slate-700">
              {t.subline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-4 shadow-lg transition-transform hover:-translate-y-1"
                asChild
              >
                <a href={BETA_SIGNUP_GOOGLE_FORM_URL}>{t.ctaPrimary}</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/90 backdrop-blur-2xl border-white/80 text-slate-900 hover:bg-white dark:bg-white/90 dark:hover:bg-white dark:text-slate-900 dark:border-white/80 rounded-full px-8 py-4 shadow-sm"
                asChild
              >
                <Link href="/how-it-works">{t.ctaSecondary}</Link>
              </Button>
            </div>

            <p className="text-sm sm:text-base text-slate-700">
              {t.trustLine}
            </p>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-[420px] h-[660px] overflow-visible scale-[0.86] lg:scale-95 origin-center">
              <SocialHeroPreviewCard
                locale={locale}
                data={previewData}
                heightClassName="h-[660px]"
                className="w-full"
                autoFlip
                flipIntervalMs={6500}
                float
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 blur-3xl opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.16),transparent_55%),radial-gradient(circle_at_55%_80%,rgba(251,146,60,0.14),transparent_55%)]"
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

