import { Card, CardContent } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, Brain, Zap, Heart } from 'lucide-react'

const benefits = [
  {
    icon: Brain,
    title: "Science-backed matching",
    description: "Our algorithm analyzes 40+ compatibility factors to predict roommate success before conflicts start. No more gambling on random matches."
  },
  {
    icon: Shield,
    title: "Verified & safe",
    description: "Every student is verified with government ID and selfie verification. You can focus on compatibility, not safety concerns."
  },
  {
    icon: Zap,
    title: "Save time & money",
    description: "Get matched in days, not weeks. Prevent costly move-outs and disputes by finding compatible roommates from the start."
  },
  {
    icon: Heart,
    title: "Find your perfect match",
    description: "See exactly why you're compatible with transparent explanations. Match on lifestyle, study habits, and values that matter."
  }
]

export function Testimonials() {
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Why Domu Match works
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Our compatibility-first approach helps you find roommates as compatible as your best friends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card 
                key={index}
                className="rounded-2xl border border-brand-border/50 shadow-elev-1 p-6 md:p-8 bg-white/80 backdrop-blur-sm h-full flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-brand-text mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-brand-muted leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}