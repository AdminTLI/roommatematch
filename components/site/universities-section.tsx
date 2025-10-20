import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle, TrendingDown, Users, BarChart3, Shield, Clock } from 'lucide-react'

export function UniversitiesSection() {
  const stats = [
    { icon: TrendingDown, value: '40%', label: 'Reduction in housing disputes' },
    { icon: Users, value: '10,000+', label: 'Students matched successfully' },
    { icon: BarChart3, value: '4.8★', label: 'Average satisfaction rating' },
    { icon: Shield, value: '100%', label: 'Verified student profiles' },
  ]

  const benefits = [
    {
      title: "Reduce Housing Disputes by 40%",
      description: "Our intelligent matching algorithm prevents compatibility issues before they start, reducing staff workload and improving student satisfaction.",
      icon: TrendingDown,
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
      description: "Reduce manual matching time by 80%. Your housing team can focus on high-value activities instead of endless roommate disputes.",
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
              Trusted by leading universities
            </h2>
            <p className="text-lg text-brand-muted">
              Join housing departments who've transformed their student accommodation experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">TU Delft</div>
              <p className="text-sm text-brand-muted">
                "Reduced housing disputes by 45% in our pilot program. Students love the transparency of the matching process."
              </p>
              <div className="text-sm font-medium text-brand-primary mt-2">— Housing Department</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">University of Amsterdam</div>
              <p className="text-sm text-brand-muted">
                "The admin dashboard gives us insights we never had before. We can proactively address housing issues."
              </p>
              <div className="text-sm font-medium text-brand-primary mt-2">— Student Services</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text mb-2">Maastricht University</div>
              <p className="text-sm text-brand-muted">
                "Integration was seamless. Our international students feel safer with the verification process."
              </p>
              <div className="text-sm font-medium text-brand-primary mt-2">— Accommodation Office</div>
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
