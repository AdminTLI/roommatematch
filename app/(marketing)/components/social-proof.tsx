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
      title: "Built for better connections",
      subtitle: "Our science-backed approach helps you find roommates as compatible as your best friends",
      stats: [
        { value: "40+", label: "Compatibility Factors", icon: Brain, description: "Science-backed algorithm" },
        { value: "100%", label: "Verified Profiles", icon: Shield, description: "Secure platform with verified students only" },
        { value: "100%", label: "Transparent Matching", icon: Eye, description: "See why you're compatible" },
        { value: "10 min", label: "Quick Setup", icon: Zap, description: "Get started fast" }
      ],

    },
    nl: {
      title: "Gebouwd voor betere verbindingen",
      subtitle: "Onze wetenschappelijk onderbouwde aanpak helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden",
      stats: [
        { value: "40+", label: "Compatibiliteitsfactoren", icon: Brain, description: "Wetenschappelijk onderbouwd algoritme" },
        { value: "100%", label: "Geverifieerde Profielen", icon: Shield, description: "Veilig platform met alleen geverifieerde studenten" },
        { value: "100%", label: "Transparante Matching", icon: Eye, description: "Zie waarom je compatibel bent" },
        { value: "10 min", label: "Snelle Setup", icon: Zap, description: "Snel aan de slag" }
      ],

    }
  }

  const text = content[locale]

  return (
    <Section className="bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4 leading-tight">
            {locale === 'nl' ? (
              <>Gebouwd voor <span className="text-brand-primary">betere verbindingen</span></>
            ) : (
              <>Built for <span className="text-brand-primary">better connections</span></>
            )}
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {text.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {text.stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200">
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-brand-text mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-brand-muted leading-tight">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>


      </Container>
    </Section>
  )
}
