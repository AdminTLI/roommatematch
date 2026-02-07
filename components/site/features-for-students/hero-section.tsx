'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { AlertTriangle, X, Check, Shield, Users } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function HeroSection() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].hero

  const handleFindMatch = () => {
    router.push('/auth/sign-up')
  }

  const handleHowItWorks = () => {
    router.push('/how-it-works')
  }

  return (
    <Section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
      aria-labelledby="hero-heading"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Copy + CTAs */}
          <div className="space-y-6 text-center lg:text-left">
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            >
              {t.headline}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white min-h-[48px] px-8 rounded-2xl shadow-lg border-0"
                onClick={handleFindMatch}
                aria-label={t.findMatch}
              >
                {t.findMatch}
              </Button>
              <Button
                size="lg"
                className="min-h-[48px] px-8 rounded-2xl border-2 border-indigo-400/80 bg-transparent text-white hover:bg-indigo-500/20 hover:border-indigo-300 border-0"
                onClick={handleHowItWorks}
                aria-label={t.howItWorks}
              >
                {t.howItWorks}
              </Button>
            </div>
          </div>

          {/* Right: Split comparison visual */}
          <div className="grid grid-cols-2 gap-4">
            {/* The Old Way */}
            <div
              className="rounded-2xl border border-amber-500/40 bg-slate-800/80 p-6 shadow-lg flex flex-col"
              aria-label={t.oldWay}
            >
              <div className="flex items-center gap-2 mb-4">
                <X className="h-6 w-6 text-amber-400 flex-shrink-0" aria-hidden />
                <h2 className="text-lg font-bold text-amber-200">{t.oldWay}</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 flex-1">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>Chaos, messy kitchen, stress</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>Random matches, no compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>Unverified strangers</span>
                </li>
              </ul>
            </div>

            {/* The Domu Way */}
            <div
              className="rounded-2xl border border-indigo-500/30 bg-slate-800/90 backdrop-blur p-6 shadow-lg flex flex-col"
              aria-label={t.domuWay}
            >
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-6 w-6 text-emerald-400 flex-shrink-0" aria-hidden />
                <h2 className="text-lg font-bold text-emerald-200">{t.domuWay}</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 flex-1">
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>Peace, studying, harmony</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>Lifestyle-matched roommates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <span>100% ID verified</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
