'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  Shield, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Users,
  Lock,
  FileText
} from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Your safety is our priority",
    subtitle: "Chat without worry. Text-only, rate-limited, moderated. If something feels off, flag it instantly. We're here to help resolve concerns before move-in.",
    guidelinesTitle: "Safety Guidelines",
    guidelinesSubtitle: "Follow these guidelines to ensure a safe and positive experience for everyone",
    forStudents: "For Students",
    forUniversities: "For Universities",
    needHelp: "Need help or have concerns?",
    needHelpSubtitle: "Our safety team is here 24/7 to help resolve any issues or concerns.",
    contactSafety: "Contact Safety Team",
    viewSafetyCenter: "View Safety Center",
    safetyFeatures: [
      {
        icon: Shield,
        title: "Verified Students Only",
        description: "Every student must complete government ID + selfie verification before accessing the platform.",
        details: [
          "Government ID verification",
          "Selfie matching technology", 
          "University email confirmation",
          "Real identity verification"
        ]
      },
      {
        icon: MessageSquare,
        title: "Safe Communication",
        description: "Text-only messaging with built-in moderation and rate limiting to prevent harassment.",
        details: [
          "Text-only chat system",
          "Rate-limited conversations",
          "Automated content filtering",
          "Human moderation oversight"
        ]
      },
      {
        icon: Eye,
        title: "Transparent Process",
        description: "All matching decisions are explainable. You'll understand exactly why you're matched with someone.",
        details: [
          "Compatibility score breakdown",
          "Shared interests explanation",
          "Academic program matching",
          "Clear reasoning display"
        ]
      },
      {
        icon: AlertTriangle,
        title: "Report & Block",
        description: "Easy reporting system with immediate escalation to university housing teams and our support staff.",
        details: [
          "One-click reporting",
          "Block and unmatch options",
          "University team notifications",
          "Support staff escalation"
        ]
      }
    ],
    safetyStats: [
      { value: "100%", label: "Verified profiles" },
      { value: "0", label: "Safety incidents" },
      { value: "<1%", label: "Report rate" },
      { value: "24/7", label: "Moderation support" }
    ],
    studentGuidelines: [
      "Keep personal information private until you meet in person",
      "Meet in public places for the first time",
      "Trust your instincts - if something feels off, report it",
      "Use our chat system for all communication initially"
    ],
    universityGuidelines: [
      "Monitor the moderation queue regularly",
      "Respond to safety reports within 24 hours",
      "Provide clear escalation paths for students",
      "Work with our support team on complex issues"
    ]
  },
  nl: {
    title: "Je veiligheid is onze prioriteit",
    subtitle: "Chat zonder zorgen. Alleen tekst, beperkt in frequentie, gemodereerd. Als iets niet goed aanvoelt, meld het direct. We zijn er om zorgen op te lossen vóór de verhuizing.",
    guidelinesTitle: "Veiligheidsrichtlijnen",
    guidelinesSubtitle: "Volg deze richtlijnen om een veilige en positieve ervaring voor iedereen te garanderen",
    forStudents: "Voor Studenten",
    forUniversities: "Voor Universiteiten",
    needHelp: "Hulp nodig of zorgen?",
    needHelpSubtitle: "Ons veiligheidsteam is 24/7 beschikbaar om eventuele problemen of zorgen op te lossen.",
    contactSafety: "Neem Contact Op met Veiligheidsteam",
    viewSafetyCenter: "Bekijk Veiligheidscentrum",
    safetyFeatures: [
      {
        icon: Shield,
        title: "Alleen Geverifieerde Studenten",
        description: "Elke student moet overheids-ID + selfie-verificatie voltooien voordat hij toegang krijgt tot het platform.",
        details: [
          "Overheids-ID verificatie",
          "Selfie matching technologie", 
          "Universiteits-e-mailbevestiging",
          "Echte identiteitsverificatie"
        ]
      },
      {
        icon: MessageSquare,
        title: "Veilige Communicatie",
        description: "Alleen tekstberichten met ingebouwde moderatie en frequentiebeperking om intimidatie te voorkomen.",
        details: [
          "Alleen tekst chatsysteem",
          "Beperkte conversaties",
          "Geautomatiseerde contentfiltering",
          "Menselijke moderatietoezicht"
        ]
      },
      {
        icon: Eye,
        title: "Transparant Proces",
        description: "Alle matchingbeslissingen zijn uitlegbaar. Je begrijpt precies waarom je met iemand bent gematcht.",
        details: [
          "Compatibiliteitsscore uitsplitsing",
          "Uitleg gedeelde interesses",
          "Academische programma-matching",
          "Duidelijke redeneringsweergave"
        ]
      },
      {
        icon: AlertTriangle,
        title: "Rapporteer en Blokkeer",
        description: "Eenvoudig rapporteersysteem met directe escalatie naar universiteitshuisvestingsteams en ons ondersteuningsteam.",
        details: [
          "Eén-klik rapportage",
          "Blokkeer- en ontkoppelopties",
          "Universiteitsteam meldingen",
          "Ondersteuningsteam escalatie"
        ]
      }
    ],
    safetyStats: [
      { value: "100%", label: "Geverifieerde profielen" },
      { value: "0", label: "Veiligheidsincidenten" },
      { value: "<1%", label: "Rapportagepercentage" },
      { value: "24/7", label: "Moderatieondersteuning" }
    ],
    studentGuidelines: [
      "Houd persoonlijke informatie privé totdat je elkaar persoonlijk ontmoet",
      "Ontmoet op openbare plaatsen voor de eerste keer",
      "Vertrouw op je instincten - als iets niet goed aanvoelt, meld het",
      "Gebruik ons chatsysteem voor alle communicatie in eerste instantie"
    ],
    universityGuidelines: [
      "Monitor de moderatiewachtrij regelmatig",
      "Reageer op veiligheidsrapporten binnen 24 uur",
      "Bied duidelijke escalatiepaden voor studenten",
      "Werk samen met ons ondersteuningsteam aan complexe problemen"
    ]
  }
}

export function SafetySection() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-3 sm:mb-4">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-brand-muted max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Safety Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {t.safetyStats.map((stat, index) => (
            <Card key={index} className="text-center border-brand-border">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-muted">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {t.safetyFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-brand-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                      <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-brand-muted mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-sm text-brand-text">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Safety Guidelines */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 md:p-12">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-brand-text mb-3 sm:mb-4">
              {t.guidelinesTitle}
            </h3>
            <p className="text-sm sm:text-base text-brand-muted">
              {t.guidelinesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-primary" />
                {t.forStudents}
              </h4>
              <ul className="space-y-3 text-sm text-brand-text">
                {t.studentGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-primary" />
                {t.forUniversities}
              </h4>
              <ul className="space-y-3 text-sm text-brand-text">
                {t.universityGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold text-brand-text mb-3 sm:mb-4">
            {t.needHelp}
          </h3>
          <p className="text-sm sm:text-base text-brand-muted mb-4 sm:mb-6">
            {t.needHelpSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 min-h-[44px] w-full sm:w-auto">
              {t.contactSafety}
            </Button>
            <Button variant="outline" size="lg" className="min-h-[44px] w-full sm:w-auto">
              {t.viewSafetyCenter}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
