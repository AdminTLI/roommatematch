'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { 
  Brain, 
  Shield, 
  MessageSquare, 
  Users, 
  BarChart3,
  Zap,
  Eye,
  CheckCircle,
  Clock,
  Database,
  Settings
} from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Powerful features for better matches",
    subtitle: "Built with cutting-edge technology and designed for safety, our platform delivers the most intelligent roommate matching available.",
    completeFeaturesTitle: "Complete platform features",
    completeFeaturesSubtitle: "Everything you need for intelligent roommate matching and management",
    compatibilityFactors: "Compatibility factors",
    verifiedProfiles: "Verified profiles",
    quickSetup: "Quick setup",
    ctaTitle: "Experience the difference",
    ctaSubtitle: "Experience the difference with our science-backed matching technology. Find roommates as compatible as your best friends.",
    getStarted: "Get started for free",
    scheduleDemo: "Schedule demo",
    mainFeatures: [
      {
        icon: Brain,
        title: "Smart Matching Algorithm",
        subtitle: "Match on What Matters",
        description: "We analyze 40+ compatibility factors—from quiet hours and cleanliness to study habits and weekend plans. Our algorithm catches conflicts before they start. No more gambles, no more surprises.",
        details: [
          "40+ compatibility factors analyzed",
          "Cosine similarity matching algorithm",
          "Conflict prediction and prevention",
          "Continuous learning and improvement",
          "Academic program integration"
        ],
        highlight: true
      },
      {
        icon: Shield,
        title: "Verified & Safe Platform",
        subtitle: "Verified. Trusted. Yours.",
        description: "Every student on Domu Match has passed government ID + selfie verification. No catfish, no fake profiles, no surprises. Universities back it. You can focus on compatibility, not safety.",
        details: [
          "Government ID verification",
          "Selfie matching technology",
          "University email confirmation",
          "100% verified profiles",
          "Safety incident tracking"
        ],
        highlight: false
      },
      {
        icon: Eye,
        title: "Explainable AI",
        subtitle: "You'll Understand Why",
        description: "When we match you with someone, we show exactly why. Shared study style, compatible quiet hours, both into hiking. Real reasons, not a mystery. Choose from data, not vibes.",
        details: [
          "Transparent compatibility scores",
          "Detailed matching explanations",
          "Shared interests breakdown",
          "Academic connection highlights",
          "Lifestyle compatibility details"
        ],
        highlight: false
      }
    ],
    additionalFeatures: [
      {
        icon: MessageSquare,
        title: "Safe Chat System",
        description: "Text-only, rate-limited, moderated messaging with built-in safety features and escalation paths.",
        features: ["Text-only messaging", "Rate limiting", "Content moderation", "Report & block", "Move-in coordination"]
      },
      {
        icon: Users,
        title: "Academic Integration",
        description: "Match students by shared programs, study years, and academic preferences for better compatibility.",
        features: ["Program matching", "Study year consideration", "Faculty integration", "Academic progress tracking", "Shared course detection"]
      },
      {
        icon: BarChart3,
        title: "Admin Dashboard",
        description: "Comprehensive analytics and management tools for university housing departments.",
        features: ["Real-time analytics", "User management", "Moderation tools", "Custom reporting", "White-label branding"]
      },
      {
        icon: Clock,
        title: "30-Day Edit Cooldown",
        description: "Prevents profile gaming while allowing legitimate updates to maintain matching accuracy.",
        features: ["Profile stability", "Gaming prevention", "Legitimate updates", "Data integrity", "Fair matching"]
      },
      {
        icon: Database,
        title: "Program Import System",
        description: "Automated import of academic programs and course data from university systems.",
        features: ["Automated imports", "Data validation", "Error handling", "Sync scheduling", "Custom mapping"]
      },
      {
        icon: Settings,
        title: "White-label Platform",
        description: "Fully customizable branding and integration for university-specific deployment.",
        features: ["Custom branding", "Domain setup", "Email templates", "University integration", "Custom workflows"]
      }
    ]
  },
  nl: {
    title: "Krachtige functies voor betere matches",
    subtitle: "Gebouwd met geavanceerde technologie en ontworpen voor veiligheid, levert ons platform de meest intelligente huisgenootmatching beschikbaar.",
    completeFeaturesTitle: "Volledige platformfuncties",
    completeFeaturesSubtitle: "Alles wat je nodig hebt voor intelligente huisgenootmatching en -beheer",
    compatibilityFactors: "Compatibiliteitsfactoren",
    verifiedProfiles: "Geverifieerde profielen",
    quickSetup: "Snelle opzet",
    ctaTitle: "Ervaar het verschil",
    ctaSubtitle: "Ervaar het verschil met onze wetenschappelijk onderbouwde matchingtechnologie. Vind huisgenoten die zo compatibel zijn als je beste vrienden.",
    getStarted: "Begin gratis",
    scheduleDemo: "Plan demo",
    mainFeatures: [
      {
        icon: Brain,
        title: "Slim Matchingalgoritme",
        subtitle: "Match op Wat Ertoe Doet",
        description: "We analyseren 40+ compatibiliteitsfactoren—van stilte uren en netheid tot studiegewoonten en weekendplannen. Ons algoritme vangt conflicten op voordat ze beginnen. Geen gokken meer, geen verrassingen meer.",
        details: [
          "40+ compatibiliteitsfactoren geanalyseerd",
          "Cosinusgelijkheid matchingalgoritme",
          "Conflictvoorspelling en -preventie",
          "Continue leren en verbeteren",
          "Academische programma-integratie"
        ],
        highlight: true
      },
      {
        icon: Shield,
        title: "Geverifieerd en Veilig Platform",
        subtitle: "Geverifieerd. Vertrouwd. Van Jou.",
        description: "Elke student op Domu Match heeft overheids-ID + selfie-verificatie doorstaan. Geen catfish, geen nep-profielen, geen verrassingen. Universiteiten steunen het. Je kunt je focussen op compatibiliteit, niet op veiligheid.",
        details: [
          "Overheids-ID verificatie",
          "Selfie matching technologie",
          "Universiteits-e-mailbevestiging",
          "100% geverifieerde profielen",
          "Veiligheidsincident tracking"
        ],
        highlight: false
      },
      {
        icon: Eye,
        title: "Uitlegbare AI",
        subtitle: "Je Zult Begrijpen Waarom",
        description: "Wanneer we je met iemand matchen, tonen we precies waarom. Gedeelde studiestijl, compatibele stilte uren, beide houden van wandelen. Echte redenen, geen mysterie. Kies vanuit data, niet vanuit gevoel.",
        details: [
          "Transparante compatibiliteitsscores",
          "Gedetailleerde matchinguitleg",
          "Gedeelde interesses uitsplitsing",
          "Academische connectie highlights",
          "Levensstijl compatibiliteitsdetails"
        ],
        highlight: false
      }
    ],
    additionalFeatures: [
      {
        icon: MessageSquare,
        title: "Veilig Chatsysteem",
        description: "Alleen tekst, beperkt in frequentie, gemodereerde berichten met ingebouwde veiligheidsfuncties en escalatiepaden.",
        features: ["Alleen tekstberichten", "Frequentiebeperking", "Contentmoderatie", "Rapporteer & blokkeer", "Verhuiscoördinatie"]
      },
      {
        icon: Users,
        title: "Academische Integratie",
        description: "Match studenten op gedeelde programma's, studiejaren en academische voorkeuren voor betere compatibiliteit.",
        features: ["Programma-matching", "Studiejaar overweging", "Faculteitsintegratie", "Academische voortgang tracking", "Gedeelde cursusdetectie"]
      },
      {
        icon: BarChart3,
        title: "Beheerdersdashboard",
        description: "Uitgebreide analyses en beheertools voor universiteitshuisvestingsafdelingen.",
        features: ["Real-time analyses", "Gebruikersbeheer", "Moderatietools", "Aangepaste rapportage", "White-label branding"]
      },
      {
        icon: Clock,
        title: "30-Dagen Bewerkingscooldown",
        description: "Voorkomt profielgaming terwijl legitieme updates worden toegestaan om matchingnauwkeurigheid te behouden.",
        features: ["Profielstabiliteit", "Gamingpreventie", "Legitieme updates", "Gegevensintegriteit", "Eerlijke matching"]
      },
      {
        icon: Database,
        title: "Programma Import Systeem",
        description: "Geautomatiseerde import van academische programma's en cursusgegevens uit universiteitssystemen.",
        features: ["Geautomatiseerde imports", "Gegevensvalidatie", "Foutafhandeling", "Synchronisatieplanning", "Aangepaste mapping"]
      },
      {
        icon: Settings,
        title: "White-label Platform",
        description: "Volledig aanpasbare branding en integratie voor universiteitsspecifieke implementatie.",
        features: ["Aangepaste branding", "Domeininstelling", "E-mailsjablonen", "Universiteitsintegratie", "Aangepaste workflows"]
      }
    ]
  }
}

export function FeaturesSection() {
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

        {/* Main Features */}
        <div className="space-y-16 mb-16">
          {t.mainFeatures.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0
            
            return (
              <div key={feature.title} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                {/* Content */}
                <div className="flex-1">
                  <Card className={`border-brand-border ${feature.highlight ? 'border-brand-primary shadow-elev-2' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${feature.highlight ? 'bg-brand-primary/10' : 'bg-brand-accent/10'}`}>
                          <Icon className={`h-8 w-8 ${feature.highlight ? 'text-brand-primary' : 'text-brand-accent'}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-brand-text">
                            {feature.title}
                          </h3>
                          <p className="text-brand-accent font-medium">
                            {feature.subtitle}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-brand-muted mb-6 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {feature.details.map((detail, detailIndex) => (
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
                  <div className={`w-full max-w-lg h-80 rounded-2xl flex items-center justify-center ${
                    feature.highlight 
                      ? 'bg-gradient-to-br from-brand-primary/5 to-brand-accent/5' 
                      : 'bg-gradient-to-br from-slate-50 to-slate-100'
                  }`}>
                    <div className="text-center">
                      <div className="text-6xl mb-6">
                        {(feature.title.includes('Smart Matching') || feature.title.includes('Slim Matching')) && "🧠"}
                        {(feature.title.includes('Verified') || feature.title.includes('Geverifieerd')) && "🛡️"}
                        {(feature.title.includes('Explainable') || feature.title.includes('Uitlegbare')) && "👁️"}
                      </div>
                      <p className="text-brand-muted font-medium text-lg">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              {t.completeFeaturesTitle}
            </h2>
            <p className="text-lg text-brand-muted">
              {t.completeFeaturesSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.additionalFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-brand-border hover:border-brand-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                        <Icon className="h-6 w-6 text-brand-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-muted mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-brand-text">
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">40+</div>
            <div className="text-sm text-brand-muted">{t.compatibilityFactors}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">100%</div>
            <div className="text-sm text-brand-muted">{t.verifiedProfiles}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary mb-2">10 min</div>
            <div className="text-sm text-brand-muted">{t.quickSetup}</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-text mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-lg text-brand-muted mb-8 max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
              {t.getStarted}
            </Button>
            <Button variant="outline" size="lg">
              {t.scheduleDemo}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
