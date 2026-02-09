'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, Star, Users, BarChart3, Shield, HeadphonesIcon } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Simple, transparent pricing",
    subtitle: "Choose the plan that fits your university's needs. All plans include our core matching technology and are backed by our satisfaction guarantee.",
    benefitsTitle: "Why universities choose Domu Match",
    plans: [
      {
        name: 'Pilot',
        description: 'Perfect for testing our platform with a small cohort',
        price: 'Free',
        period: 'for 3 months',
        badge: 'Most Popular',
        icon: Star,
        features: [
          'Up to 100 students',
          'Advanced matching algorithm',
          'Email support',
          'Admin dashboard',
          '30-day pilot period',
          'Advanced analytics',
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
          'Up to 500 students',
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
        period: 'per year',
        badge: 'Custom',
        icon: BarChart3,
        features: [
          'Everything in University',
          'Unlimited students',
          'Regional deployment support',
          'Customer success team',
          'Custom integrations',
          'Advanced reporting',
          'SLA guarantees',
          'Training & onboarding',
          'Custom development',
          'Priority response SLAs',
          'Compliance reporting',
        ],
        cta: 'Contact Sales',
        highlight: false,
      },
    ],
    benefits: [
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
  },
  nl: {
    title: "Eenvoudige, transparante prijzen",
    subtitle: "Kies het plan dat past bij de behoeften van je universiteit. Alle plannen bevatten onze kern matchingtechnologie en worden ondersteund door onze tevredenheidsgarantie.",
    benefitsTitle: "Waarom universiteiten voor Domu Match kiezen",
    plans: [
      {
        name: 'Pilot',
        description: 'Perfect voor het testen van ons platform met een kleine groep',
        price: 'Gratis',
        period: 'voor 3 maanden',
        badge: 'Meest Populair',
        icon: Star,
        features: [
          'Tot 100 studenten',
          'Geavanceerd matchingalgoritme',
          'E-mailondersteuning',
          'Beheerdersdashboard',
          '30-daagse proefperiode',
          'Geavanceerde analyses',
          'White-label branding',
        ],
        cta: 'Start Gratis Proefperiode',
        highlight: true,
      },
      {
        name: 'Universiteit',
        description: 'Volledige oplossing voor universiteitshuisvestingsafdelingen',
        price: '€2.500',
        period: 'per semester',
        badge: 'Beste Waarde',
        icon: Users,
        features: [
          'Tot 500 studenten',
          'Geavanceerd matchingalgoritme',
          'Prioriteitsondersteuning',
          'Volledig beheerdersdashboard',
          'Academische integratie',
          'Geavanceerde analyses',
          'Aangepaste branding',
          'API-toegang',
          'Moderatietools',
          'Ondersteuning bij conflictoplossing',
        ],
        cta: 'Neem Contact Op',
        highlight: false,
      },
      {
        name: 'Enterprise',
        description: 'Voor grote universiteiten met complexe huisvestingsbehoeften',
        price: 'Op Maat',
        period: 'per jaar',
        badge: 'Op Maat',
        icon: BarChart3,
        features: [
          'Alles in Universiteit',
          'Onbeperkte studenten',
          'Regionale uitrolondersteuning',
          'Customer success team',
          'Aangepaste integraties',
          'Geavanceerde rapportage',
          'SLA-garanties',
          'Training & onboarding',
          'Aangepaste ontwikkeling',
          'Prioriteits-SLA’s',
          'Nalevingsrapportage',
        ],
        cta: 'Neem Contact Op',
        highlight: false,
      },
    ],
    benefits: [
      {
        icon: Shield,
        title: 'Verminder huisvestingsgeschillen met 40%',
        description: 'Ons intelligente matchingalgoritme voorkomt compatibiliteitsproblemen voordat ze beginnen.',
      },
      {
        icon: BarChart3,
        title: 'Real-time analyses',
        description: 'Monitor huisvestingstevredenheid, identificeer trends en maak datagestuurde beslissingen.',
      },
      {
        icon: HeadphonesIcon,
        title: 'Toegewijd ondersteuningsteam',
        description: 'Krijg hulp van onze huisvestingsexperts die je unieke uitdagingen begrijpen.',
      },
    ]
  }
}

export function PricingSection() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-slate-950">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {t.plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 border ${
                  plan.highlight 
                    ? 'border-violet-500 bg-slate-800/50 scale-105' 
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
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
                    plan.highlight ? 'bg-violet-500/20' : 'bg-rose-500/20'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.highlight ? 'text-violet-400' : 'text-rose-400'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-base text-slate-400">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 ml-2">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-200">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full min-h-[44px] ${
                      plan.highlight 
                        ? 'bg-violet-600 hover:bg-violet-500' 
                        : 'bg-rose-600 hover:bg-rose-500'
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
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
            {t.benefitsTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {t.benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20">
                    <Icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
