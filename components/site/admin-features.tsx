'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  BarChart3, 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  MessageSquare, 
  RefreshCw,
  Palette,
  Database,
  HeadphonesIcon
} from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Control without chaos",
    subtitle: "View signups by university, moderation queue, emerging conflict hotspots. One-click re-sync of programmes. Built by housing teams, for housing teams.",
    supportTitle: "Dedicated Support Team",
    supportSubtitle: "Get help from housing experts who understand your unique challenges. From setup to ongoing support, we're here to ensure your success.",
    contactSupport: "Contact Support",
    viewDocumentation: "View Documentation",
    features: [
      {
        icon: BarChart3,
        title: "Real-time Analytics Dashboard",
        description: "Monitor signups by university, compatibility scores, dispute resolution metrics, and housing satisfaction trends. Spot issues before they escalate.",
        details: [
          "Signup rates and user engagement metrics",
          "Compatibility score distributions",
          "Dispute resolution tracking",
          "Housing satisfaction surveys",
          "Custom reporting and exports"
        ]
      },
      {
        icon: Shield,
        title: "Moderation & Safety Tools",
        description: "Built-in moderation queue, content filtering, and escalation paths. Keep your platform safe with automated and manual oversight.",
        details: [
          "Real-time chat moderation",
          "Automated content filtering",
          "User reporting system",
          "Escalation workflows",
          "Safety incident tracking"
        ]
      },
      {
        icon: Users,
        title: "Student Management",
        description: "Comprehensive user management with verification status, profile completeness, and academic integration tracking.",
        details: [
          "User verification status",
          "Profile completeness tracking",
          "Academic program enrollment",
          "Match history and preferences",
          "Bulk user operations"
        ]
      },
      {
        icon: Database,
        title: "Academic Integration",
        description: "Seamlessly integrate with your university's academic data. Import programs, link students to their studies, and enhance matching.",
        details: [
          "Program and course imports",
          "Academic year tracking",
          "Faculty and department mapping",
          "Study progress monitoring",
          "Academic compatibility scoring"
        ]
      },
      {
        icon: Palette,
        title: "White-label Branding",
        description: "Customize the platform with your university's branding. Students see your colors, logo, and messaging throughout.",
        details: [
          "Custom color schemes",
          "University logo integration",
          "Branded email templates",
          "Custom domain support",
          "Personalized messaging"
        ]
      },
      {
        icon: RefreshCw,
        title: "One-click Program Sync",
        description: "Keep your academic data up-to-date with automated imports from your student information system.",
        details: [
          "Automated program imports",
          "Real-time data synchronization",
          "Error handling and validation",
          "Import history and logs",
          "Custom field mapping"
        ]
      }
    ]
  },
  nl: {
    title: "Controle zonder chaos",
    subtitle: "Bekijk aanmeldingen per universiteit, moderatiewachtrij, opkomende conflict hotspots. Eén-klik her-synchronisatie van programma's. Gebouwd door huisvestingsteams, voor huisvestingsteams.",
    supportTitle: "Toegewijd Ondersteuningsteam",
    supportSubtitle: "Krijg hulp van huisvestingsexperts die je unieke uitdagingen begrijpen. Van setup tot doorlopende ondersteuning, we zijn er om je succes te waarborgen.",
    contactSupport: "Neem Contact Op",
    viewDocumentation: "Bekijk Documentatie",
    features: [
      {
        icon: BarChart3,
        title: "Real-time Analytics Dashboard",
        description: "Monitor aanmeldingen per universiteit, compatibiliteitsscores, geschiloplossingsmetrieken en huisvestingstevredenheidstrends. Signaleer problemen voordat ze escaleren.",
        details: [
          "Aanmeldingspercentages en gebruikersengagementmetrieken",
          "Compatibiliteitsscore distributies",
          "Geschiloplossing tracking",
          "Huisvestingstevredenheidsenquêtes",
          "Aangepaste rapportage en exports"
        ]
      },
      {
        icon: Shield,
        title: "Moderatie- en Veiligheidstools",
        description: "Ingebouwde moderatiewachtrij, contentfiltering en escalatiepaden. Houd je platform veilig met geautomatiseerd en handmatig toezicht.",
        details: [
          "Real-time chatmoderatie",
          "Geautomatiseerde contentfiltering",
          "Gebruikersrapportagesysteem",
          "Escalatieworkflows",
          "Veiligheidsincident tracking"
        ]
      },
      {
        icon: Users,
        title: "Studentbeheer",
        description: "Uitgebreid gebruikersbeheer met verificatiestatus, profielvolledigheid en academische integratietracking.",
        details: [
          "Gebruikersverificatiestatus",
          "Profielvolledigheid tracking",
          "Academische programma-inschrijving",
          "Matchgeschiedenis en voorkeuren",
          "Bulk gebruikersoperaties"
        ]
      },
      {
        icon: Database,
        title: "Academische Integratie",
        description: "Integreer naadloos met de academische gegevens van je universiteit. Importeer programma's, koppel studenten aan hun studies en verbeter matching.",
        details: [
          "Programma- en cursusimports",
          "Academisch jaar tracking",
          "Faculteits- en afdelingsmapping",
          "Studievoortgang monitoring",
          "Academische compatibiliteitsscore"
        ]
      },
      {
        icon: Palette,
        title: "White-label Branding",
        description: "Pas het platform aan met de branding van je universiteit. Studenten zien je kleuren, logo en berichten overal.",
        details: [
          "Aangepaste kleurenschema's",
          "Universiteitslogo-integratie",
          "Gebrandmerkte e-mailsjablonen",
          "Aangepaste domeinondersteuning",
          "Gepersonaliseerde berichten"
        ]
      },
      {
        icon: RefreshCw,
        title: "Eén-klik Programma Synchronisatie",
        description: "Houd je academische gegevens up-to-date met geautomatiseerde imports uit je studentinformatiesysteem.",
        details: [
          "Geautomatiseerde programma-imports",
          "Real-time gegevenssynchronisatie",
          "Foutafhandeling en validatie",
          "Importgeschiedenis en logs",
          "Aangepaste veldmapping"
        ]
      }
    ]
  }
}

export function AdminFeatures() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-brand-muted max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {t.features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-brand-border hover:border-brand-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-brand-muted mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-sm text-brand-text">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Support Section */}
        <div className="bg-slate-50 rounded-2xl p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
            <HeadphonesIcon className="h-8 w-8 text-brand-primary" />
          </div>
          <h3 className="text-2xl font-bold text-brand-text mb-4">
            {t.supportTitle}
          </h3>
          <p className="text-brand-muted mb-6 max-w-2xl mx-auto">
            {t.supportSubtitle}
          </p>
        </div>
      </Container>
    </Section>
  )
}
