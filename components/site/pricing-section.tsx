import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, Star, Users, BarChart3, Shield, HeadphonesIcon } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Pilot',
      description: 'Perfect for testing our platform with a small cohort',
      price: 'Free',
      period: 'for 3 months',
      badge: 'Most Popular',
      icon: Star,
      features: [
        'Up to 500 students',
        'Basic matching algorithm',
        'Email support',
        'Admin dashboard',
        '30-day pilot period',
        'Basic analytics',
        'White-label branding',
      ],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'University',
      description: 'Complete solution for university housing departments',
      price: '€2,500',
      period: 'per semester',
      badge: 'Best Value',
      icon: Users,
      features: [
        'Unlimited students',
        'Advanced matching algorithm',
        'Priority support',
        'Full admin dashboard',
        'Academic integration',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Moderation tools',
        'Conflict resolution support',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
    {
      name: 'Enterprise',
      description: 'For large universities with complex housing needs',
      price: 'Custom',
      period: 'annual contract',
      badge: 'Custom',
      icon: BarChart3,
      features: [
        'Everything in University',
        'Multi-campus support',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced reporting',
        'SLA guarantees',
        'Training & onboarding',
        'Custom development',
        '24/7 support',
        'Compliance reporting',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Reduce Housing Disputes by 40%',
      description: 'Our intelligent matching algorithm prevents compatibility issues before they start.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Monitor housing satisfaction, identify trends, and make data-driven decisions.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Dedicated Support',
      description: 'Get help from our housing experts who understand your unique challenges.',
    },
  ]

  return (
    <Section className="bg-gradient-to-b from-white to-slate-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Choose the plan that fits your university's needs. All plans include our core matching technology 
            and are backed by our satisfaction guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-elev-3 ${
                  plan.highlight 
                    ? 'border-brand-primary shadow-elev-2 scale-105' 
                    : 'border-brand-border hover:border-brand-primary/50'
                }`}
              >
                {plan.badge && (
                  <Badge 
                    variant={plan.highlight ? "default" : "secondary"}
                    className="absolute top-4 right-4"
                  >
                    {plan.badge}
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    plan.highlight ? 'bg-brand-primary/10' : 'bg-brand-accent/10'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.highlight ? 'text-brand-primary' : 'text-brand-accent'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-brand-text">
                      {plan.price}
                    </span>
                    <span className="text-brand-muted ml-2">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-brand-text">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.highlight 
                        ? 'bg-brand-primary hover:bg-brand-primary/90' 
                        : 'bg-brand-accent hover:bg-brand-accent/90'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-brand-text mb-12">
            Why universities choose Roommate Match
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                    <Icon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-text mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-brand-muted">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <p className="text-brand-muted mb-6">
            Trusted by housing departments at leading universities
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-lg font-semibold text-brand-text">TU Delft</div>
            <div className="text-lg font-semibold text-brand-text">UvA</div>
            <div className="text-lg font-semibold text-brand-text">Maastricht</div>
            <div className="text-lg font-semibold text-brand-text">Utrecht</div>
            <div className="text-lg font-semibold text-brand-text">Groningen</div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
