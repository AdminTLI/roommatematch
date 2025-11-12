'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "From strangers to roommates",
    subtitle: "Domu Match pairs you with compatible students based on lifestyle, study habits, and personality. Our science-backed algorithm analyzes 40+ factors to prevent conflicts before they start—so moving in feels easy.",
    getMatched: "Get matched",
    seeHowItWorks: "See how it works",
    verified: "Verified students only",
    free: "Free for students",
    scienceBacked: "Science-backed matching",
    transparent: "Transparent compatibility"
  },
  nl: {
    title: "Van vreemden tot huisgenoten",
    subtitle: "Domu Match koppelt je aan compatibele studenten op basis van levensstijl, studiegewoonten en persoonlijkheid. Ons wetenschappelijk onderbouwde algoritme analyseert 40+ factoren om conflicten te voorkomen voordat ze beginnen—zodat verhuizen gemakkelijk aanvoelt.",
    getMatched: "Krijg matches",
    seeHowItWorks: "Bekijk hoe het werkt",
    verified: "Alleen geverifieerde studenten",
    free: "Gratis voor studenten",
    scienceBacked: "Wetenschappelijk onderbouwde matching",
    transparent: "Transparante compatibiliteit"
  }
}

export function Hero() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const handleGetMatched = () => {
    router.push('/auth/sign-up')
  }

  const handleSeeHowItWorks = () => {
    router.push('/how-it-works')
  }

  // Mock match cards for the right side - translated
  const mockMatches = locale === 'nl' ? [
    {
      name: "Emma",
      match: 94,
      university: "TU Delft",
      program: "Informatica",
      avatar: "E",
      traits: ["Studierooster", "Netheid", "Stilte uren"]
    },
    {
      name: "Lucas", 
      match: 89,
      university: "Universiteit van Amsterdam",
      program: "Economie",
      avatar: "L",
      traits: ["Sociaal leven", "Budgetteren", "Gedeelde ruimtes"]
    }
  ] : [
    {
      name: "Emma",
      match: 94,
      university: "TU Delft",
      program: "Computer Science",
      avatar: "E",
      traits: ["Study schedule", "Cleanliness", "Quiet hours"]
    },
    {
      name: "Lucas", 
      match: 89,
      university: "University of Amsterdam",
      program: "Economics",
      avatar: "L",
      traits: ["Social life", "Budgeting", "Shared spaces"]
    }
  ]

  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white">
      {/* Subtle background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-brand-primary/10 via-accent/10 to-brand-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gradient-to-tr from-accent/10 via-brand-primary/10 to-accent/5 blur-3xl opacity-50" />
      </div>
      <Container>
        <div className="grid items-center gap-12 lg:gap-16 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="relative z-10 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-sm font-medium text-brand-primary">
              <span className="text-xs">✨</span>
              {locale === 'nl' ? 'Aangedreven door AI' : 'Powered by AI'}
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-brand-text">
              {t.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-brand-muted max-w-2xl">
              {t.subtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                onClick={handleGetMatched}
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primaryHover text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-200 px-8 py-6 text-base font-semibold"
              >
                {t.getMatched}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSeeHowItWorks}
                className="w-full sm:w-auto border-2 border-brand-border hover:border-brand-primary text-brand-text hover:bg-brand-primary/5 transition-all duration-200 px-8 py-6 text-base font-semibold"
              >
                {t.seeHowItWorks}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{t.verified}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{t.free}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{t.scienceBacked}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{t.transparent}</span>
              </div>
            </div>
          </div>

          {/* Right column - Match Cards */}
          <div className="relative z-10 grid gap-6 lg:gap-8">
            {mockMatches.map((match, index) => (
              <Card 
                key={match.name}
                className="rounded-2xl border-2 border-brand-border/50 bg-white shadow-elev-2 p-6 lg:p-8 transition-all duration-300 hover:shadow-elev-2 hover:-translate-y-1 hover:border-brand-primary/30"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 text-base font-bold">
                    {match.match}%
                  </span>
                  <div className="h-14 w-14 bg-gradient-to-br from-brand-primary/20 to-accent/20 rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                    <span className="text-xl font-bold text-brand-primary">
                      {match.avatar}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl lg:text-3xl font-bold text-brand-text">
                    {match.name}
                  </h3>
                  <div className="space-y-1 text-base text-brand-muted">
                    <div className="font-medium">{match.program}</div>
                    <div>{match.university}</div>
                  </div>
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {match.traits.map((trait, traitIndex) => (
                        <span 
                          key={traitIndex}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-sm font-medium text-brand-text"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}