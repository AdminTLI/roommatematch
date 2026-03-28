'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { learnPageCopy } from '../learn-page-copy'
import {
  TrendingDown,
  Users,
  Shield,
  BarChart3,
  Settings,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Building2,
  Lock,
  Globe,
  Zap,
  Calculator,
  Euro,
  TrendingUp,
} from 'lucide-react'

const OUTCOME_ICONS = [TrendingDown, Users, Shield] as const
const FEATURE_ICONS = [Building2, Lock, BarChart3, Settings] as const
const ADDON_ICONS = [Globe, MessageSquare, Zap] as const
const OUTCOME_STYLES = [
  { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
] as const

export function UniversitiesPage() {
  const { locale } = useApp()
  const t = learnPageCopy[locale]

  const outcomes = t.outcomes.map((o, i) => ({
    ...o,
    icon: OUTCOME_ICONS[i],
    ...OUTCOME_STYLES[i],
  }))

  const features = t.features.map((f, i) => ({
    ...f,
    icon: FEATURE_ICONS[i],
  }))

  const addons = t.addons.map((a, i) => ({
    ...a,
    icon: ADDON_ICONS[i],
  }))

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">{t.heroTitle}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">{t.heroSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4" asChild>
                <Link href="/contact">
                  {t.bookPilot}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                <Link href="/universities">{t.viewDemo}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.outcomesTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t.outcomesSub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((outcome, index) => (
              <Card key={outcome.title} className={`border-2 ${outcome.bgColor} hover:shadow-lg transition-shadow`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                    <outcome.icon className={`h-8 w-8 ${outcome.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{outcome.title}</CardTitle>
                  <CardDescription className="text-base">{outcome.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className={`text-3xl font-bold ${outcome.color} mb-2`}>{outcome.metric}</div>
                  <Badge variant="outline" className={outcome.color}>
                    {t.typicalImprovement}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.campusTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t.campusSub}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">{feature.description}</CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.addonsTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t.addonsSub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {addons.map((addon) => (
              <Card key={addon.title} className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <addon.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">{addon.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">{addon.description}</CardDescription>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {addon.price}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-indigo-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6">
                <Calculator className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.savingsTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.savingsSub}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              <Card className="border-2 border-indigo-100 dark:border-indigo-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-3 p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 w-fit">
                    <Euro className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">€55.000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.statIntl}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-indigo-100 dark:border-indigo-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-3 p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 w-fit">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Top 3</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.statAttrition}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-indigo-100 dark:border-indigo-900/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-3 p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 w-fit">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2%+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.statRetention}</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">{t.savingsCtaLead}</p>
              <Button size="lg" className="text-lg px-8 py-4" asChild>
                <Link href="/pricing">
                  {t.savingsCtaButton}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.finalTitle}</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">{t.finalSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link href="/contact">
                {t.finalPrimary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/contact">{t.finalSecondary}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
