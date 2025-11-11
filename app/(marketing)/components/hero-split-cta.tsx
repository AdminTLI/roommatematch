'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { ArrowRight, Users, Shield, CheckCircle } from 'lucide-react'

interface HeroSplitCTAProps {
  locale?: 'en' | 'nl'
}

export function HeroSplitCTA({ locale = 'en' }: HeroSplitCTAProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "From strangers to roommates",
      subtitle: "Campus-verified community, ID-checked accounts, and a scientific match that prevents conflicts.",
      microcopy: "No listings, no spam—just people you'll actually live well with.",
      primaryCta: "Start as a student",
      secondaryCta: "For universities",
      secondaryLink: "See how it works"
    },
    nl: {
      title: "Van vreemden tot huisgenoten",
      subtitle: "Campus-geverifieerde community, ID-gecontroleerde accounts en een wetenschappelijke match die conflicten voorkomt.",
      microcopy: "Geen advertenties, geen spam—alleen mensen waarmee je echt goed kunt samenwonen.",
      primaryCta: "Start als student",
      secondaryCta: "Voor universiteiten",
      secondaryLink: "Bekijk hoe het werkt"
    }
  }

  const text = content[locale]

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {text.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                {text.subtitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {text.microcopy}
              </p>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  {text.primaryCta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              {/* Secondary CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/learn" className="inline-flex">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {text.secondaryCta}
                  </Button>
                </Link>
                <Link href="/learn" className="text-sm text-primary hover:underline self-center">
                  {text.secondaryLink} →
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div className="space-y-6">
            {/* Match Compatibility Demo */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Compatibility Match
                </CardTitle>
                <CardDescription>
                  See how we match lifestyle preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compatibility Bars */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sleep Schedule</span>
                    <span className="text-sm text-green-600 font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cleanliness</span>
                    <span className="text-sm text-blue-600 font-semibold">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out delay-100" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Social Level</span>
                    <span className="text-sm text-purple-600 font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out delay-200" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Excellent match
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Suggestion Demo */}
            <Card className="border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Group Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                      E
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                      L
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                      S
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">3 compatible roommates</div>
                    <div className="text-xs text-gray-500">Avg. compatibility: 85%</div>
                  </div>
                  <div className="text-xs text-green-600 font-semibold">✓ All constraints met</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
