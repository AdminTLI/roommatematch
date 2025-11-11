'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Ready to go from",
    titleStrangers: "strangers",
    titleTo: "to",
    titleRoommates: "roommates",
    titleQuestion: "?",
    subtitle: "Get started today and discover who you're",
    subtitleCompatible: "compatible",
    subtitleWith: "with.",
    subtitleOur: "Our",
    subtitleScienceBacked: "science-backed matching",
    subtitleHelps: "helps you find roommates as compatible as your",
    subtitleBestFriends: "best friends",
    getStarted: "Get started for free",
    learnMore: "Learn more",
    freeForStudents: "Free for students",
    noCreditCard: "No credit card required",
    verifiedStudents: "Verified students only",
    startJourney: "Start your journey today"
  },
  nl: {
    title: "Klaar om van",
    titleStrangers: "vreemden",
    titleTo: "tot",
    titleRoommates: "huisgenoten",
    titleQuestion: "te gaan?",
    subtitle: "Begin vandaag en ontdek met wie je",
    subtitleCompatible: "compatibel",
    subtitleWith: "bent.",
    subtitleOur: "Onze",
    subtitleScienceBacked: "wetenschappelijk onderbouwde matching",
    subtitleHelps: "helpt je huisgenoten te vinden die zo compatibel zijn als je",
    subtitleBestFriends: "beste vrienden",
    getStarted: "Begin gratis",
    learnMore: "Meer informatie",
    freeForStudents: "Gratis voor studenten",
    noCreditCard: "Geen creditcard vereist",
    verifiedStudents: "Alleen geverifieerde studenten",
    startJourney: "Begin je reis vandaag"
  }
}

export function FinalCTA() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  const handleLearnMore = () => {
    router.push('/how-it-works')
  }

  return (
    <Section>
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-tight">
                {t.title} <span className="text-brand-primary">{t.titleStrangers}</span> {t.titleTo} <span className="text-brand-primary">{t.titleRoommates}</span>{t.titleQuestion}
              </h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-brand-muted max-w-prose">
                {t.subtitle} <span className="font-semibold text-brand-text">{t.subtitleCompatible}</span> {t.subtitleWith}{' '}
                {t.subtitleOur} <span className="font-semibold text-brand-text">{t.subtitleScienceBacked}</span> {t.subtitleHelps} <span className="font-semibold text-brand-text">{t.subtitleBestFriends}</span>.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="text-base px-8 py-6"
              >
                {t.getStarted}
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="text-base px-8 py-6"
              >
                {t.learnMore}
              </Button>
            </div>

            {/* Trust indicators */}
            <ul className="flex flex-wrap gap-6 text-sm text-brand-muted pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{t.freeForStudents}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{t.noCreditCard}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{t.verifiedStudents}</span>
              </li>
            </ul>
          </div>

          {/* Right column - Visual placeholder */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md h-72 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-2xl flex items-center justify-center border border-brand-border/20">
              <div className="text-center space-y-4 p-8">
                <div className="text-5xl mb-2">🎓</div>
                <p className="text-brand-muted font-semibold text-lg">
                  {t.startJourney}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}