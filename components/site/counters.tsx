import { Card, CardContent } from '@/components/ui/card'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Brain, Shield, Eye, Zap } from 'lucide-react'

const stats = [
  {
    icon: Brain,
    value: "40+",
    label: "Compatibility factors",
    description: "Science-backed matching algorithm"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Verified profiles",
    description: "ID-verified community only"
  },
  {
    icon: Eye,
    value: "100%",
    label: "Transparent matching",
    description: "See why you're compatible"
  },
  {
    icon: Zap,
    value: "10 min",
    label: "Quick setup",
    description: "Get matched in days, not weeks"
  }
]

export function Counters() {
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Built for better matches
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-prose mx-auto text-brand-muted">
            Our science-backed approach helps you find roommates as compatible as your best friends
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card 
                key={index}
                className="rounded-2xl border border-brand-border/50 shadow-elev-1 p-6 md:p-8 bg-white/80 backdrop-blur-sm min-h-[140px] flex flex-col justify-center text-center transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elev-2"
              >
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-semibold text-brand-text">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-brand-text">
                      {stat.label}
                    </div>
                    <div className="text-xs text-brand-muted">
                      {stat.description}
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