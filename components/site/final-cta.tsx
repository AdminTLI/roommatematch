'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Join our",
    titleHighlight: "community of builders",
    subtitle:
      "We’re still founder-led and pre-team. Every contributor shapes safer student housing, ships real work in weeks, and sets the tone for how we grow.",
    primary: "See open tracks",
    secondary: "Why volunteer with us",
    points: [
      "Work directly with the founder—no layers",
      "Scope a project, ship it, and showcase it",
      "First contributors get priority when paid roles open"
    ],
    visualTitle: "Build Domu Match with us"
  },
  nl: {
    title: "Word onderdeel van onze",
    titleHighlight: "community van builders",
    subtitle:
      "We zijn nog founder-led en pre-team. Elke contributor helpt veiliger studentenhuisvesting op te bouwen en levert zichtbaar werk af.",
    primary: "Bekijk de tracks",
    secondary: "Waarom vrijwilligen",
    points: [
      "Werk direct met de founder—zonder lagen",
      "Scope een project, ship het, laat het zien",
      "Eerste contributors krijgen voorrang op betaalde rollen"
    ],
    visualTitle: "Bouw mee aan Domu Match"
  }
}

export function FinalCTA() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const handlePrimary = () => {
    router.push('/careers#roles')
  }

  const handleSecondary = () => {
    router.push('/careers')
  }

  return (
    <Section>
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left column - Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-tight">
                  {t.title} <span className="text-brand-primary">{t.titleHighlight}</span>
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-brand-muted max-w-prose">
                  {t.subtitle}
                </p>
            </div>
            
            {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button variant="primary" size="lg" onClick={handlePrimary}>
                  {t.primary}
                </Button>
                <Button variant="outline" size="lg" onClick={handleSecondary}>
                  {t.secondary}
                </Button>
            </div>

            {/* Trust indicators */}
              <ul className="flex flex-col gap-3 text-sm text-brand-muted pt-2">
                {t.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{point}</span>
                  </li>
                ))}
              </ul>
          </div>

          {/* Right column - Visual placeholder */}
          <div className="flex justify-center items-center">
              <div className="w-full max-w-md h-72 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-2xl flex items-center justify-center border border-brand-border/20">
              <div className="text-center space-y-4 p-8">
                  <div className="text-5xl mb-2">🤝</div>
                  <p className="text-brand-muted font-semibold text-lg">
                    {t.visualTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}