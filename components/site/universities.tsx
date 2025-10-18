'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/primitives/container'
import { Eyebrow } from '@/components/ui/primitives/eyebrow'

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
    <section className="py-14 md:py-20 lg:py-28 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow>Partnered with leading Dutch universities</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 md:mt-4">
            Trusted by top institutions
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-slate-600 mt-4">
            We work closely with universities to provide the best roommate matching experience for their students
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {universities.map((university, index) => (
            <Card 
              key={index}
              className="rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="font-medium text-slate-900 text-sm leading-tight">
                {university}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-600 mb-6">
            Want to partner with us? Join our network of trusted universities.
          </p>
          <Button 
            variant="outline"
            onClick={handleBecomePartner}
            className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
          >
            Become a partner
          </Button>
        </div>
      </Container>
    </section>
  )
}
