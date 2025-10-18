'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Container } from '@/components/ui/primitives/container'
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

  return (
    <section className="py-14 md:py-20 lg:py-28 bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-slate-900">
              Find roommates who actually fit your life
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-prose text-slate-600">
              Roommate Match pairs you with compatible students based on lifestyle, study habits, and personality. 
              Join thousands of students who found their perfect roommate match.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                size="lg" 
                className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleGetMatched}
              >
                Get matched
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleSeeHowItWorks}
              >
                See how it works
              </Button>
            </div>

            {/* Trust indicators */}
            <ul className="flex flex-wrap gap-4 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Verified students only
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Free for students
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                University partnerships
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Proven results
              </li>
            </ul>
          </div>

          {/* Right column - Visual */}
          <div className="grid gap-4 md:gap-6">
            {mockMatches.map((match, index) => (
              <Card 
                key={match.name}
                className="group rounded-2xl border shadow-lg p-6 md:p-8 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  transform: `translateY(${index * 4}px) rotate(${index % 2 === 0 ? '1deg' : '-1deg'})`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge className="text-sm bg-green-100 text-green-800">
                    {match.match}%
                  </Badge>
                  <Avatar className="h-12 w-12">
                    <span className="text-lg font-semibold text-slate-700">
                      {match.avatar}
                    </span>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {match.name}
                  </h3>
                  <p className="text-slate-600">
                    {match.program} • {match.university}
                  </p>
                  <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                    {match.traits.map((trait, traitIndex) => (
                      <li key={traitIndex}>{trait}</li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant="outline" 
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
    </section>
  )
}
