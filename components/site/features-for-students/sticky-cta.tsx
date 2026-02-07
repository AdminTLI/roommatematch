'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { content } from './content'
import type { MarketingStatsResponse } from '@/app/api/marketing/stats/route'

async function fetchMarketingStats(): Promise<MarketingStatsResponse> {
  const response = await fetch('/api/marketing/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch marketing stats')
  }
  return response.json()
}

const SCROLL_THRESHOLD = 400

export function StickyCTA() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].stickyCta
  const [isVisible, setIsVisible] = useState(false)

  const { data } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: fetchMarketingStats,
    staleTime: 60_000,
    retry: 2,
  })

  const count = data?.totalUsers ?? 1000
  const displayCount = count >= 1000 ? `${Math.floor(count / 1000)}k+` : `${count}+`

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  if (!isVisible) return null

  return (
    <div
      role="banner"
      aria-label={t.button}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg py-3 safe-bottom"
    >
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-base font-medium text-slate-900 text-center sm:text-left">
          {t.copy.replace('{count}', displayCount)}
        </p>
        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] px-6 rounded-2xl w-full sm:w-auto shrink-0 border-0"
          onClick={handleGetStarted}
        >
          {t.button}
        </Button>
      </Container>
    </div>
  )
}
