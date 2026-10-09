'use client'

import dynamic from 'next/dynamic'
import { useMemo, type ReactNode } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { SocialHeroCopy } from '@/components/site/social-hero-copy'
import type { SocialHeroPreviewCardData } from '@/components/site/social-hero-preview-card'

const SocialHeroPreviewCard = dynamic(
  () =>
    import('@/components/site/social-hero-preview-card').then((m) => ({
      default: m.SocialHeroPreviewCard,
    })),
  {
    loading: () => (
      <div
        className="relative mx-auto max-w-[420px] h-[660px] w-full rounded-3xl bg-white/50 animate-pulse"
        aria-hidden
      />
    ),
  }
)

/**
 * Client shell: locale-aware copy swap + deferred preview card.
 * Pass server-rendered English copy as `englishCopy` for a fast LCP text path.
 */
export function SocialHero({ englishCopy }: { englishCopy: ReactNode }) {
  const { locale } = useApp()

  const previewData: SocialHeroPreviewCardData = useMemo(() => {
    const isNl = locale === 'nl'
    return {
      name: 'Noor van Dijk',
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
        environment: 90,
        cleanliness: 92,
        communication: 88,
        social: 86,
        logistics_context: 91,
      },
    }
  }, [locale])

  return (
    <Section className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center py-8 md:py-10">
      <Container className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:-mt-10">
          {locale === 'nl' ? <SocialHeroCopy locale="nl" /> : englishCopy}

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
