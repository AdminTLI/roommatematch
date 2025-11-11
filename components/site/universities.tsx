'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Designed for Dutch universities",
    subtitle: "Built specifically for students at Dutch universities. Available for students across the Netherlands.",
    contactText: "Interested in bringing Domu Match to your university? Get in touch to learn more.",
    buttonText: "Contact us",
    universities: [
      "TU Delft",
      "Eindhoven University of Technology", 
      "University of Amsterdam",
      "Utrecht University",
      "Leiden University",
      "Rotterdam School of Management",
      "VU Amsterdam",
      "University of Groningen",
      "Tilburg University",
      "Maastricht University",
      "Wageningen University & Research",
      "University of Twente"
    ]
  },
  nl: {
    title: "Ontworpen voor Nederlandse universiteiten",
    subtitle: "Speciaal gebouwd voor studenten aan Nederlandse universiteiten. Beschikbaar voor studenten in heel Nederland.",
    contactText: "Geïnteresseerd om Domu Match naar je universiteit te halen? Neem contact op om meer te weten te komen.",
    buttonText: "Neem contact op",
    universities: [
      "TU Delft",
      "Technische Universiteit Eindhoven", 
      "Universiteit van Amsterdam",
      "Universiteit Utrecht",
      "Universiteit Leiden",
      "Rotterdam School of Management",
      "VU Amsterdam",
      "Rijksuniversiteit Groningen",
      "Tilburg University",
      "Universiteit Maastricht",
      "Wageningen University & Research",
      "Universiteit Twente"
    ]
  }
}

export function Universities() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const handleBecomePartner = () => {
    router.push('/contact')
  }

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {t.universities.map((university, index) => (
            <Card 
              key={index}
              className="rounded-xl border border-brand-border/50 bg-white/80 backdrop-blur-sm p-4 text-center shadow-elev-1 hover:shadow-elev-2 transition-shadow duration-200 flex items-center justify-center min-h-[80px]"
            >
              <div className="font-medium text-brand-text text-sm leading-tight">
                {university}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-brand-muted mb-6">
            {t.contactText}
          </p>
          <Button 
            variant="outline"
            size="lg"
            onClick={handleBecomePartner}
          >
            {t.buttonText}
          </Button>
        </div>
      </Container>
    </Section>
  )
}