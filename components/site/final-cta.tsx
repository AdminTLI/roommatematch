'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
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
    <Section>
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-tight">
                Ready to go from <span className="text-brand-primary">strangers</span> to <span className="text-brand-primary">roommates</span>?
              </h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-brand-muted max-w-prose">
                Get started today and discover who you're <span className="font-semibold text-brand-text">compatible</span> with.{' '}
                Our <span className="font-semibold text-brand-text">science-backed matching</span> helps you find roommates as compatible as your <span className="font-semibold text-brand-text">best friends</span>.
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
                Get started for free
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="text-base px-8 py-6"
              >
                Learn more
              </Button>
            </div>

            {/* Trust indicators */}
            <ul className="flex flex-wrap gap-6 text-sm text-brand-muted pt-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">Free for students</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">No credit card required</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">Verified students only</span>
              </li>
            </ul>
          </div>

          {/* Right column - Visual placeholder */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md h-72 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-2xl flex items-center justify-center border border-brand-border/20">
              <div className="text-center space-y-4 p-8">
                <div className="text-5xl mb-2">🎓</div>
                <p className="text-brand-muted font-semibold text-lg">
                  Start your journey today
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}