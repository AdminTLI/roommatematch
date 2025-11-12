'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  UserPlus, 
  FileText, 
  Users, 
  MessageSquare, 
  Home,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "How Domu Match works",
    subtitle: "From sign up to move-in, discover how our intelligent matching process helps you find roommates as compatible as your best friends.",
    featuresTitle: "Why our process works",
    featuresSubtitle: "Built on science, backed by universities, designed for safety",
    ctaTitle: "Ready to find your perfect match?",
    ctaSubtitle: "Get started today and find your ideal roommate. The process takes just 10 minutes to complete your compatibility profile.",
    ctaButton: "Get started for free",
    steps: [
      {
        step: "01",
        icon: UserPlus,
        title: "Sign Up & Verify",
        description: "Create your account with your university email and complete ID verification for safety.",
        details: [
          "Government ID + selfie verification",
          "University email confirmation",
          "Profile setup with basic info",
          "Privacy settings configuration"
        ],
        color: "bg-blue-500"
      },
      {
        step: "02", 
        icon: FileText,
        title: "Complete Compatibility Quiz",
        description: "Answer questions about your lifestyle, study habits, and preferences to build your compatibility profile.",
        details: [
          "40+ compatibility factors",
          "Study schedule and habits",
          "Cleanliness preferences",
          "Social activities and interests",
          "Quiet hours and lifestyle choices"
        ],
        color: "bg-green-500"
      },
      {
        step: "03",
        icon: Users,
        title: "Get Matched",
        description: "Our algorithm analyzes compatibility and shows you potential roommates with explainable reasoning.",
        details: [
          "AI-powered matching algorithm",
          "Compatibility score explanation",
          "Academic program matching",
          "Study year consideration",
          "Shared interests highlighting"
        ],
        color: "bg-purple-500"
      },
      {
        step: "04",
        icon: MessageSquare,
        title: "Chat Safely",
        description: "Connect with matches through our moderated chat system. Text-only, rate-limited, and secure.",
        details: [
          "Text-only messaging",
          "Rate-limited conversations",
          "Moderated content",
          "Report and block features",
          "Safe communication platform"
        ],
        color: "bg-orange-500"
      },
      {
        step: "05",
        icon: Home,
        title: "Start Together",
        description: "Once you've found your ideal roommate, coordinate plans and start your university journey together.",
        details: [
          "Roommate coordination",
          "Safety guidelines",
          "University integration",
          "Ongoing support",
          "Compatibility insights"
        ],
        color: "bg-red-500"
      }
    ],
    features: [
      {
        icon: Zap,
        title: "Smart Matching Algorithm",
        description: "Our algorithm analyzes 40+ compatibility factors to predict roommate success before conflicts start."
      },
      {
        icon: Shield,
        title: "Verified Students Only",
        description: "Every student is verified with government ID and selfie verification for maximum safety."
      },
      {
        icon: CheckCircle,
        title: "Transparent Process",
        description: "See exactly why you're matched with someone. No black box - just clear, explainable compatibility."
      }
    ]
  },
  nl: {
    title: "Hoe Domu Match werkt",
    subtitle: "Van aanmelding tot verhuizing, ontdek hoe ons intelligente matchingproces je helpt huisgenoten te vinden die zo compatibel zijn als je beste vrienden.",
    featuresTitle: "Waarom ons proces werkt",
    featuresSubtitle: "Gebouwd op wetenschap, ondersteund door universiteiten, ontworpen voor veiligheid",
    ctaTitle: "Klaar om je perfecte match te vinden?",
    ctaSubtitle: "Begin vandaag en vind je ideale huisgenoot. Het proces duurt slechts 10 minuten om je compatibiliteitsprofiel te voltooien.",
    ctaButton: "Begin gratis",
    steps: [
      {
        step: "01",
        icon: UserPlus,
        title: "Aanmelden en verifiëren",
        description: "Maak je account aan met je universiteits-e-mail en voltooi ID-verificatie voor veiligheid.",
        details: [
          "Overheids-ID + selfie-verificatie",
          "Universiteits-e-mailbevestiging",
          "Profiel instellen met basisinfo",
          "Privacy-instellingen configureren"
        ],
        color: "bg-blue-500"
      },
      {
        step: "02", 
        icon: FileText,
        title: "Compatibiliteitsquiz voltooien",
        description: "Beantwoord vragen over je levensstijl, studiegewoonten en voorkeuren om je compatibiliteitsprofiel op te bouwen.",
        details: [
          "40+ compatibiliteitsfactoren",
          "Studierooster en gewoonten",
          "Netheidsvoorkeuren",
          "Sociale activiteiten en interesses",
          "Stilte uren en levensstijlkeuzes"
        ],
        color: "bg-green-500"
      },
      {
        step: "03",
        icon: Users,
        title: "Krijg matches",
        description: "Ons algoritme analyseert compatibiliteit en toont je potentiële huisgenoten met uitlegbare redenering.",
        details: [
          "AI-aangedreven matchingalgoritme",
          "Uitleg van compatibiliteitsscore",
          "Academische programma-matching",
          "Studiejaar overweging",
          "Gedeelde interesses benadrukken"
        ],
        color: "bg-purple-500"
      },
      {
        step: "04",
        icon: MessageSquare,
        title: "Chat veilig",
        description: "Maak contact met matches via ons gemodereerde chatsysteem. Alleen tekst, beperkt in frequentie en veilig.",
        details: [
          "Alleen tekstberichten",
          "Beperkte conversaties",
          "Gemodereerde inhoud",
          "Rapporteer- en blokkeerfuncties",
          "Veilig communicatieplatform"
        ],
        color: "bg-orange-500"
      },
      {
        step: "05",
        icon: Home,
        title: "Start samen",
        description: "Zodra je je ideale huisgenoot hebt gevonden, coördineer plannen en begin je universiteitsreis samen.",
        details: [
          "Huisgenootcoördinatie",
          "Veiligheidsrichtlijnen",
          "Universiteitsintegratie",
          "Doorlopende ondersteuning",
          "Compatibiliteitsinzichten"
        ],
        color: "bg-red-500"
      }
    ],
    features: [
      {
        icon: Zap,
        title: "Slim matchingalgoritme",
        description: "Ons algoritme analyseert 40+ compatibiliteitsfactoren om het succes van huisgenoten te voorspellen voordat conflicten beginnen."
      },
      {
        icon: Shield,
        title: "Alleen geverifieerde studenten",
        description: "Elke student is geverifieerd met overheids-ID en selfie-verificatie voor maximale veiligheid."
      },
      {
        icon: CheckCircle,
        title: "Transparant proces",
        description: "Zie precies waarom je met iemand bent gematcht. Geen black box - alleen duidelijke, uitlegbare compatibiliteit."
      }
    ]
  }
}

export function HowItWorksSection() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-gradient-to-b from-white to-slate-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 mb-16">
          {t.steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0
            
            return (
              <div key={step.step} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                {/* Content */}
                <div className="flex-1">
                  <Card className="border-brand-border">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color} text-white text-xl font-bold`}>
                          {step.step}
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                          <Icon className="h-6 w-6 text-brand-primary" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-brand-text mb-4">
                        {step.title}
                      </h3>
                      <p className="text-brand-muted mb-6 text-lg">
                        {step.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-brand-text">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <div className={`w-full max-w-lg h-80 rounded-3xl flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_10px_30px_-10px_rgba(2,6,23,0.25)] border border-white/50 backdrop-blur-xl ${
                    isEven ? 'bg-gradient-to-br from-blue-50/80 to-purple-50/80' : 'bg-gradient-to-br from-green-50/80 to-orange-50/80'
                  }`}>
                    <div className="text-center">
                      <div className="mb-4">
                        <span className="block text-[96px] md:text-[140px] leading-none">
                          {step.step === "01" && "👤"}
                          {step.step === "02" && "📝"}
                          {step.step === "03" && "🤝"}
                          {step.step === "04" && "💬"}
                          {step.step === "05" && "🏠"}
                        </span>
                      </div>
                      <p className="text-brand-muted font-medium">
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-lg text-brand-muted">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                    <Icon className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-brand-muted">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-brand-text mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-lg text-brand-muted mb-8 max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>
          <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
            {t.ctaButton}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Container>
    </Section>
  )
}
