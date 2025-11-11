import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle, Brain, Shield, Clock, Eye, BarChart3 } from 'lucide-react'

export function UniversitiesSection() {
  const stats = [
    { icon: Brain, value: '40+', label: 'Compatibility factors analyzed' },
    { icon: Shield, value: '100%', label: 'Verified student profiles' },
    { icon: Eye, value: '100%', label: 'Transparent matching process' },
    { icon: Clock, value: '10 min', label: 'Quick setup time' },
  ]

  const benefits = [
    {
      title: "Science-Backed Matching",
      description: "Our algorithm analyzes 40+ compatibility factors to prevent conflicts before they start, improving student satisfaction and reducing disputes.",
      icon: Brain,
    },
    {
      title: "Streamline Housing Operations",
      description: "Automate the matching process with our admin dashboard. Monitor signups, manage conflicts, and generate reports with just a few clicks.",
      icon: BarChart3,
    },
    {
      title: "Enhance Student Safety",
      description: "Every student is verified with government ID and selfie verification. All communication is moderated and logged for safety.",
      icon: Shield,
    },
    {
      title: "Save Time & Resources",
      description: "Automate the matching process so your housing team can focus on high-value activities instead of manual roommate matching.",
      icon: Clock,
    },
  ]

  return (
    <Section className="bg-gradient-to-b from-white to-slate-50">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Housing done right
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto mb-8">
            Our algorithm cuts incompatibility-driven disputes, dropouts, and staff escalations. 
            Intelligent matching means fewer complaints, happier students, better retention.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              Start Free Pilot
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center border-brand-border">
                <CardContent className="p-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                    <Icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div className="text-2xl font-bold text-brand-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-brand-muted">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="border-brand-border hover:border-brand-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                        <Icon className="h-6 w-6 text-brand-primary" />
                      </div>
                    </div>
                    <div>
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

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              Designed for Dutch universities
            </h2>
            <p className="text-lg text-brand-muted">
              Built specifically for university housing departments to improve student accommodation experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">Science-Backed</div>
              <p className="text-sm text-brand-muted">
                Our algorithm analyzes 40+ compatibility factors to match students based on lifestyle, study habits, and preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">Transparent Process</div>
              <p className="text-sm text-brand-muted">
                Students see exactly why they're matched with clear explanations. No black box—just transparent compatibility matching.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">Safe & Verified</div>
              <p className="text-sm text-brand-muted">
                Every student is verified with government ID. All communication is moderated and logged for safety and peace of mind.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-brand-text mb-4">
            Ready to transform your housing experience?
          </h2>
          <p className="text-lg text-brand-muted mb-8 max-w-2xl mx-auto">
            Start with a free 30-day pilot. No upfront costs, no long-term commitments. 
            See the results for yourself.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              Start Free Pilot
            </Button>
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
