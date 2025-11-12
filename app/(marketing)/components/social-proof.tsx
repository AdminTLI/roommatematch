'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import { Brain, Shield, Eye, Zap } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'

interface SocialProofProps {
  locale?: 'en' | 'nl'
}

export function SocialProof({ locale: localeProp }: SocialProofProps) {
  const { locale: contextLocale } = useApp()
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
    <Section className="bg-gradient-to-b from-white to-slate-50/50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4 leading-tight">
            {text.title}
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {text.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {text.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-brand-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-brand-text mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* University Logos */}
        <div className="text-center pt-8 border-t border-brand-border/30">
          <h3 className="text-base md:text-lg font-semibold text-brand-text mb-6">
            {locale === 'nl' ? 'Ontworpen voor Nederlandse universiteiten' : 'Designed for Dutch universities'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {text.universityLogos.map((uni, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20">
                  <span className="text-sm font-bold text-brand-primary">{uni.short}</span>
                </div>
                <span className="text-sm font-medium text-brand-muted">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
