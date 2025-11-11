'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'

const universities = [
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

export function Universities() {
  const router = useRouter()

  const handleBecomePartner = () => {
    router.push('/contact')
  }

  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Designed for Dutch universities
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Built specifically for students at Dutch universities. Available for students across the Netherlands.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {universities.map((university, index) => (
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
            Interested in bringing Domu Match to your university? Get in touch to learn more.
          </p>
          <Button 
            variant="outline"
            size="lg"
            onClick={handleBecomePartner}
          >
            Contact us
          </Button>
        </div>
      </Container>
    </Section>
  )
}