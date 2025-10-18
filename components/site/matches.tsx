'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Container } from '@/components/ui/primitives/container'
import { Eyebrow } from '@/components/ui/primitives/eyebrow'

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

export function Matches() {
  const router = useRouter()

  return (
    <section className="py-14 md:pydrawer-20 lg:py-28 bg-white">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow>See who you could match with</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 md:mt-4">
            Real students, real compatibility scores
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-slate-600 mt-4">
            Our AI analyzes hundreds of factors to find your perfect roommate match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {mockMatches.map((match, index) => (
            <Card 
              key={match.name}
              className="group rounded-2xl border shadow-lg p-6 md:p-8 h-full flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
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
              
              <div className="space-y-2 flex-1">
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

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => router.push('/matches')}
            className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
          >
            View all matches
          </Button>
        </div>
      </Container>
    </section>
  )
}
