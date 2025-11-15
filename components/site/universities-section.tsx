'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle, Brain, Shield, Clock, Eye, BarChart3 } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Housing done right",
    subtitle: "Our algorithm cuts incompatibility-driven disputes, dropouts, and staff escalations. Intelligent matching means fewer complaints, happier students, better retention.",
    startPilot: "Start Free Pilot",
    scheduleDemo: "Schedule Demo",
    transformTitle: "Ready to transform your housing experience?",
    transformSubtitle: "Start with a free 30-day pilot. No upfront costs, no long-term commitments. See the results for yourself.",
    viewPricing: "View Pricing",
    stats: [
      { icon: Brain, value: '40+', label: 'Compatibility factors analyzed' },
      { icon: Shield, value: '100%', label: 'Verified student profiles' },
      { icon: Eye, value: '100%', label: 'Transparent matching process' },
      { icon: Clock, value: '10 min', label: 'Quick setup time' },
    ],
    benefits: [
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
    ],
    trustTitle: "Designed for Dutch universities",
    trustSubtitle: "Built specifically for university housing departments to improve student accommodation experience",
    trustItems: [
      {
        title: "Science-Backed",
        description: "Our algorithm analyzes 40+ compatibility factors to match students based on lifestyle, study habits, and preferences."
      },
      {
        title: "Transparent Process",
        description: "Students see exactly why they're matched with clear explanations. No black box - just transparent compatibility matching."
      },
      {
        title: "Safe & Verified",
        description: "Every student is verified with government ID. All communication is moderated and logged for safety and peace of mind."
      }
    ]
  },
  nl: {
    title: "Huisvesting goed gedaan",
    subtitle: "Ons algoritme vermindert geschillen door incompatibiliteit, uitval en escalaties door personeel. Intelligente matching betekent minder klachten, gelukkigere studenten, betere retentie.",
    startPilot: "Start Gratis Pilot",
    scheduleDemo: "Plan Demo",
    transformTitle: "Klaar om je huisvestingservaring te transformeren?",
    transformSubtitle: "Begin met een gratis 30-daagse pilot. Geen voorafgaande kosten, geen langetermijnverplichtingen. Zie de resultaten zelf.",
    viewPricing: "Bekijk Prijzen",
    stats: [
      { icon: Brain, value: '40+', label: 'Geanalyseerde compatibiliteitsfactoren' },
      { icon: Shield, value: '100%', label: 'Geverifieerde studentprofielen' },
      { icon: Eye, value: '100%', label: 'Transparant matchingproces' },
      { icon: Clock, value: '10 min', label: 'Snelle opzetttijd' },
    ],
    benefits: [
      {
        title: "Wetenschappelijk Onderbouwde Matching",
        description: "Ons algoritme analyseert 40+ compatibiliteitsfactoren om conflicten te voorkomen voordat ze beginnen, waardoor studenttevredenheid wordt verbeterd en geschillen worden verminderd.",
        icon: Brain,
      },
      {
        title: "Stroomlijn Huisvestingsoperaties",
        description: "Automatiseer het matchingproces met ons beheerdersdashboard. Monitor aanmeldingen, beheer conflicten en genereer rapporten met slechts een paar klikken.",
        icon: BarChart3,
      },
      {
        title: "Verbeter Studentveiligheid",
        description: "Elke student is geverifieerd met overheids-ID en selfie-verificatie. Alle communicatie is gemodereerd en gelogd voor veiligheid.",
        icon: Shield,
      },
      {
        title: "Bespaar Tijd en Middelen",
        description: "Automatiseer het matchingproces zodat je huisvestingsteam zich kan concentreren op activiteiten met hoge waarde in plaats van handmatige huisgenootmatching.",
        icon: Clock,
      },
    ],
    trustTitle: "Ontworpen voor Nederlandse universiteiten",
    trustSubtitle: "Speciaal gebouwd voor universiteitshuisvestingsafdelingen om de studentaccommodatie-ervaring te verbeteren",
    trustItems: [
      {
        title: "Wetenschappelijk Onderbouwd",
        description: "Ons algoritme analyseert 40+ compatibiliteitsfactoren om studenten te matchen op basis van levensstijl, studiegewoonten en voorkeuren."
      },
      {
        title: "Transparant Proces",
        description: "Studenten zien precies waarom ze zijn gematcht met duidelijke uitleg. Geen black box - alleen transparante compatibiliteitsmatching."
      },
      {
        title: "Veilig en Geverifieerd",
        description: "Elke student is geverifieerd met overheids-ID. Alle communicatie is gemodereerd en gelogd voor veiligheid en gemoedsrust."
      }
    ]
  }
}

export function UniversitiesSection() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-gradient-to-b from-white to-slate-50">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto mb-8">
            {t.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              {t.startPilot}
            </Button>
            <Button variant="outline" size="lg">
              {t.scheduleDemo}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {t.stats.map((stat, index) => {
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
          {t.benefits.map((benefit, index) => {
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
              {t.trustTitle}
            </h2>
            <p className="text-lg text-brand-muted">
              {t.trustSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.trustItems.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-semibold text-brand-text mb-2">{item.title}</div>
                <p className="text-sm text-brand-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-brand-text mb-4">
            {t.transformTitle}
          </h2>
          <p className="text-lg text-brand-muted mb-8 max-w-2xl mx-auto">
            {t.transformSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              {t.startPilot}
            </Button>
            <Button variant="outline" size="lg">
              {t.viewPricing}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
