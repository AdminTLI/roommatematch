'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { content } from './content'
import type { MarketingStatsResponse } from '@/app/api/marketing/stats/route'
import { cn } from '@/lib/utils'

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
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 py-3 safe-bottom',
        'bg-white/65 backdrop-blur-xl',
        'border-t border-white/60 shadow-[0_-10px_30px_rgba(15,23,42,0.10)]'
      )}
    >
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-base font-medium text-slate-800 text-center sm:text-left">
          {t.copy.replace('{count}', displayCount)}
        </p>
        <button
          onClick={handleGetStarted}
          className={cn(
            'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold min-h-[44px] w-full sm:w-auto shrink-0',
            'bg-slate-900 text-white hover:bg-slate-900/90',
            'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-105 transition-all duration-200',
            'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
          )}
        >
          {t.button}
        </button>
      </Container>
    </div>
  )
}
