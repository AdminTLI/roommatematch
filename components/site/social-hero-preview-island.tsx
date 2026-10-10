'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/app/app-context'
import type { SocialHeroPreviewCardData } from '@/components/site/social-hero-preview-card'

const SocialHeroPreviewCard = dynamic(
  () =>
    import('@/components/site/social-hero-preview-card').then((m) => ({
      default: m.SocialHeroPreviewCard,
    })),
  {
    ssr: false,
    loading: () => <PreviewPlaceholder />,
  }
)

function PreviewPlaceholder() {
  return (
    <div
      className="relative mx-auto max-w-[420px] h-[660px] w-full rounded-3xl bg-white/50 animate-pulse"
      aria-hidden
    />
  )
}

/**
 * Defers the animated preview card until after first paint so LCP text is not
 * competing with framer-free card JS on the main thread.
 */
export function SocialHeroPreviewIsland() {
  const { locale } = useApp()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const enable = () => setReady(true)
    const ric = window.requestIdleCallback
    if (typeof ric === 'function') {
      idleId = ric(enable, { timeout: 1200 })
    } else {
      timeoutId = setTimeout(enable, 400)
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

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
        ? [
            'Beiden open voor cross-city indien nodig',
            'Zelfde niveau: bachelor',
            'Vergelijkbaar afstudeerjaar',
          ]
        : [
            'Both open to cross-city if needed',
            'Same degree level: bachelor',
            'Similar graduation year',
          ],
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
    <div className="relative">
      <div className="relative mx-auto max-w-[420px] h-[660px] overflow-visible scale-[0.86] lg:scale-95 origin-center">
        {ready ? (
          <SocialHeroPreviewCard
            locale={locale}
            data={previewData}
            heightClassName="h-[660px]"
            className="w-full"
            autoFlip
            flipIntervalMs={6500}
            float
          />
        ) : (
          <PreviewPlaceholder />
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 blur-3xl opacity-50 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.16),transparent_55%),radial-gradient(circle_at_55%_80%,rgba(251,146,60,0.14),transparent_55%)]"
      />
    </div>
  )
}
