'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check } from 'lucide-react'

export function Hero() {
  const router = useRouter()

  const handleGetMatched = () => {
    router.push('/auth/sign-up')
  }

  const handleSeeHowItWorks = () => {
    router.push('#how-it-works')
  }

  // Mock match cards for the right side
  const mockMatches = [
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
    <Section className="bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-brand-text">
              Find roommates who actually fit your life
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-prose text-brand-muted">
              Roommate Match pairs you with compatible students based on lifestyle, study habits, and personality. 
              Join thousands of students who found their perfect roommate match.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleGetMatched}
              >
                Get matched
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={handleSeeHowItWorks}
              >
                See how it works
              </Button>
            </div>

            {/* Trust indicators */}
            <ul className="flex flex-wrap gap-4 text-sm text-brand-muted">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Verified students only
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Free for students
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                University partnerships
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Proven results
              </li>
            </ul>
          </div>

          {/* Right column - Visual */}
          <div className="relative z-10 grid gap-4 md:gap-6">
            {mockMatches.map((match, index) => (
              <Card 
                key={match.name}
                className="rounded-2xl border border-brand-border bg-white shadow-elev-1 p-6 md:p-8 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
                style={{
                  transform: `translateY(${index * 4}px) rotate(${index % 2 === 0 ? '1deg' : '-1deg'})`,
                }}
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
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-brand-text">
                    {match.name}
                  </h3>
                  <p className="text-brand-muted">
                    {match.program} • {match.university}
                  </p>
                  <ul className="text-sm text-brand-muted list-disc pl-5 space-y-1">
                    {match.traits.map((trait, traitIndex) => (
                      <li key={traitIndex}>{trait}</li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="mt-6 self-start"
                  onClick={() => router.push('/matches')}
                >
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}