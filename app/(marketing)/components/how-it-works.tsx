'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import { FileText, Users, MessageCircle, ArrowRight } from 'lucide-react'

interface HowItWorksProps {
  locale?: 'en' | 'nl'
}

export function HowItWorks({ locale = 'en' }: HowItWorksProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "How it works",
      subtitle: "Three simple steps to go from strangers to roommates",
      steps: [
        {
          icon: FileText,
          number: "01",
          title: "Tell us how you live",
          description: "Complete our 5-10 minute questionnaire about your lifestyle, preferences, and deal-breakers.",
          details: [
            "Sleep schedule and study habits",
            "Cleanliness and social preferences", 
            "Budget and location requirements",
            "Personality and communication style"
          ]
        },
        {
          icon: Users,
          number: "02", 
          title: "Get group & individual matches",
          description: "Our algorithm finds compatible roommates and explains why you're a good fit with clear compatibility scores.",
          details: [
            "Group suggestions (2-3 people)",
            "Individual compatibility matches",
            "Detailed compatibility breakdowns",
            "Watch-out warnings for potential issues"
          ]
        },
        {
          icon: MessageCircle,
          number: "03",
          title: "Chat and form a household", 
          description: "Connect safely through our text-only chat system. No links, no spam—just real conversations.",
          details: [
            "Text-only messaging for safety",
            "Built-in spam and scam protection",
            "Group chat for household formation",
            "Report system for any issues"
          ]
        }
      ]
    },
    nl: {
      title: "Hoe het werkt",
      subtitle: "Drie eenvoudige stappen om je perfecte huisgenoot te vinden",
      steps: [
        {
          icon: FileText,
          number: "01",
          title: "Vertel ons hoe je leeft",
          description: "Voltooi onze 5-10 minuten vragenlijst over je leefstijl, voorkeuren en no-go's.",
          details: [
            "Slaapschema en studeerpatronen",
            "Schoonmaak en sociale voorkeuren",
            "Budget en locatie-eisen", 
            "Persoonlijkheid en communicatiestijl"
          ]
        },
        {
          icon: Users,
          number: "02",
          title: "Krijg groep & individuele matches", 
          description: "Ons algoritme vindt compatibele huisgenoten en legt uit waarom jullie goed bij elkaar passen.",
          details: [
            "Groepsuggesties (2-3 personen)",
            "Individuele compatibiliteitsmatches",
            "Gedetailleerde compatibiliteitsanalyse",
            "Waarschuwingen voor potentiële problemen"
          ]
        },
        {
          icon: MessageCircle,
          number: "03",
          title: "Chat en vorm een huishouden",
          description: "Verbind veilig via ons alleen-tekst chat systeem. Geen links, geen spam—alleen echte gesprekken.",
          details: [
            "Alleen-tekst berichten voor veiligheid",
            "Ingebouwde spam en scam bescherming",
            "Groepschat voor huishoudvorming",
            "Rapportagesysteem voor problemen"
          ]
        }
      ]
    }
  }

  const text = content[locale]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {text.steps.map((step, index) => (
            <Card key={index} className="relative border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit relative">
                  <step.icon className="h-8 w-8 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {step.number}
                  </div>
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {step.description}
                </CardDescription>
                
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Arrow connector for desktop */}
              {index < text.steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Mobile arrows */}
        <div className="lg:hidden flex justify-center space-x-8 mt-8">
          {text.steps.slice(0, -1).map((_, index) => (
            <ArrowRight key={index} className="h-5 w-5 text-gray-400 rotate-90" />
          ))}
        </div>
      </div>
    </section>
  )
}
