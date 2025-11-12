'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Discover compatible students",
    subtitle: "Our AI analyzes hundreds of factors to help you find your ideal roommate",
    buttonText: "Find roommates",
    matches: [
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
      },
      {
        name: "Sofia",
        match: 87,
        university: "Rotterdam School of Management",
        program: "Business Administration", 
        avatar: "S",
        traits: ["Communication", "House rules", "Guest policy"]
      }
    ]
  },
  nl: {
    title: "Ontdek compatibele studenten",
    subtitle: "Onze AI analyseert honderden factoren om je te helpen je ideale huisgenoot te vinden",
    buttonText: "Vind huisgenoten",
    matches: [
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
      },
      {
        name: "Sofia",
        match: 87,
        university: "Rotterdam School of Management",
        program: "Bedrijfskunde", 
        avatar: "S",
        traits: ["Communicatie", "Huisregels", "Beleid voor gasten"]
      }
    ]
  }
}

export function Matches() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]
  const mockMatches = t.matches

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {mockMatches.map((match, index) => (
            <Card 
              key={match.name}
              className="rounded-2xl border border-brand-border/50 shadow-elev-1 p-6 md:p-8 bg-white/80 backdrop-blur-sm h-full flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-sm font-semibold">
                  {match.match}%
                </span>
                <div className="h-12 w-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-brand-primary">
                    {match.avatar}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 flex-1">
                <h3 className="text-2xl font-semibold text-brand-text">
                  {match.name}
                </h3>
                <div className="text-brand-muted">
                  <div>{match.program}</div>
                  <div>{match.university}</div>
                </div>
                <ul className="text-sm text-brand-muted list-disc pl-5 space-y-1">
                  {match.traits.map((trait, traitIndex) => (
                    <li key={traitIndex}>{trait}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="primary"
            size="lg"
            onClick={() => router.push('/matches')}
          >
            {t.buttonText}
          </Button>
        </div>
      </Container>
    </Section>
  )
}