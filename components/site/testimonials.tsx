'use client'

import { Card, CardContent } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, Brain, Zap, Heart } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Why Domu Match works",
    subtitle: "Our compatibility-first approach helps you find roommates as compatible as your best friends",
    benefits: [
      {
        icon: Brain,
        title: "Science-backed matching",
        description: "Our algorithm analyzes 40+ compatibility factors to predict roommate success before conflicts start. No more guessing - find your perfect fit."
      },
      {
        icon: Shield,
        title: "Verified & safe",
        description: "Every student is verified with government ID and selfie verification. You can focus on compatibility, not safety concerns."
      },
      {
        icon: Zap,
        title: "Save time & money",
        description: "Find compatible students in days, not weeks. Prevent conflicts and disputes by connecting with ideal roommates from the start."
      },
      {
        icon: Heart,
        title: "Find your ideal roommate",
        description: "See exactly why you're compatible with transparent explanations. Connect based on lifestyle, study habits, and values that matter."
      }
    ]
  },
  nl: {
    title: "Waarom Domu Match werkt",
    subtitle: "Onze compatibiliteit-eerst aanpak helpt je huisgenoten te vinden die zo compatibel zijn als je beste vrienden",
    benefits: [
      {
        icon: Brain,
        title: "Wetenschappelijk onderbouwde matching",
        description: "Ons algoritme analyseert 40+ compatibiliteitsfactoren om het succes van huisgenoten te voorspellen voordat conflicten beginnen. Geen gokken meer - vind je perfecte match."
      },
      {
        icon: Shield,
        title: "Geverifieerd en veilig",
        description: "Elke student is geverifieerd met overheids-ID en selfie-verificatie. Je kunt je focussen op compatibiliteit, niet op veiligheidszorgen."
      },
      {
        icon: Zap,
        title: "Bespaar tijd en geld",
        description: "Vind compatibele studenten in dagen, niet weken. Voorkom conflicten en geschillen door vanaf het begin verbinding te maken met ideale huisgenoten."
      },
      {
        icon: Heart,
        title: "Vind je ideale huisgenoot",
        description: "Zie precies waarom je compatibel bent met transparante uitleg. Verbind op basis van levensstijl, studiegewoonten en waarden die ertoe doen."
      }
    ]
  }
}

export function Testimonials() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            {t.title}
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card 
                key={index}
                className="rounded-2xl border border-brand-border/50 shadow-elev-1 p-6 md:p-8 bg-white/80 backdrop-blur-sm h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-brand-text mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-brand-muted leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
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