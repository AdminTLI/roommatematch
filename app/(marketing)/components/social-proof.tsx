'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { Brain, Shield, Eye, Zap } from 'lucide-react'

interface SocialProofProps {
  locale?: 'en' | 'nl'
}

export function SocialProof({ locale: localeProp }: SocialProofProps) {
  const { locale: contextLocale } = useApp()
  // Use prop if provided, otherwise use context locale
  const locale = localeProp || contextLocale

  const content = {
    en: {
      title: "Built for better matches",
      subtitle: "Our science-backed approach helps you find roommates as compatible as your best friends",
      stats: [
        { value: "40+", label: "Compatibility Factors", icon: Brain, description: "Science-backed algorithm" },
        { value: "100%", label: "Verified Profiles", icon: Shield, description: "ID-verified community" },
        { value: "100%", label: "Transparent Matching", icon: Eye, description: "See why you're compatible" },
        { value: "10 min", label: "Quick Setup", icon: Zap, description: "Get started fast" }
      ],
      universityLogos: [
        { name: "University of Amsterdam", short: "UvA" },
        { name: "TU Delft", short: "TUD" },
        { name: "Erasmus University", short: "EUR" }
      ]
    },
    nl: {
      title: "Gebouwd voor betere matches",
      subtitle: "Onze wetenschappelijk onderbouwde aanpak helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden",
      stats: [
        { value: "40+", label: "Compatibiliteitsfactoren", icon: Brain, description: "Wetenschappelijk onderbouwd algoritme" },
        { value: "100%", label: "Geverifieerde Profielen", icon: Shield, description: "ID-geverifieerde community" },
        { value: "100%", label: "Transparante Matching", icon: Eye, description: "Zie waarom je compatibel bent" },
        { value: "10 min", label: "Snelle Setup", icon: Zap, description: "Snel aan de slag" }
      ],
      universityLogos: [
        { name: "Universiteit van Amsterdam", short: "UvA" },
        { name: "TU Delft", short: "TUD" },
        { name: "Erasmus Universiteit", short: "EUR" }
      ]
    }
  }

  const text = content[locale]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {text.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {text.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center border-2 border-gray-100 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* University Logos */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Designed for Dutch universities
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {text.universityLogos.map((uni, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{uni.short}</span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
