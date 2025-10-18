'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/primitives/container'
import { Check } from 'lucide-react'

export function FinalCTA() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  const handleLearnMore = () => {
    router.push('/how-it-works')
  }

  return (
    <section className="py-14 md:py-20 lg:py-28 bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Ready to find your perfect roommate?
            </h2>
            <p className="text-base md:text-lg leading-relaxed max-w-prose text-slate-600">
              Join thousands of students who found their ideal roommate match. 
              Get started today and discover who you're compatible with.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                size="lg" 
                className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleGetStarted}
              >
                Get started for free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-6 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleLearnMore}
              >
                Learn more
              </Button>
            </div>

            {/* Trust indicators */}
            <ul className="flex flex-wrap gap-4 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Free for students
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                No credit card required
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Verified students only
              </li>
            </ul>
          </div>

          {/* Right column - Visual placeholder */}
          <div className="flex justify-center">
            <div className="w-full max-w-md h-64 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <p className="text-slate-600 font-medium">
                  Start your journey today
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
