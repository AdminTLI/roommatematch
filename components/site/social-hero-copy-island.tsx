'use client'

import type { ReactNode } from 'react'
import { useApp } from '@/app/app-context'
import { SocialHeroCopy } from '@/components/site/social-hero-copy'

/**
 * Thin client island for locale swap only. English copy is server-rendered and
 * passed in so the LCP H1 is present in the initial HTML outside heavier client trees.
 */
export function SocialHeroCopyIsland({ englishCopy }: { englishCopy: ReactNode }) {
  const { locale } = useApp()
  if (locale === 'nl') return <SocialHeroCopy locale="nl" />
  return <>{englishCopy}</>
}
