'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { Shield, AlertTriangle, Users, Eye, Lock, FileText, ExternalLink } from 'lucide-react'

interface SafetyAndIntegrityProps {
  locale?: 'en' | 'nl'
}

export function SafetyAndIntegrity({ locale = 'en' }: SafetyAndIntegrityProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "Safety & Integrity",
      subtitle: "Your safety and privacy are our top priorities",
      description: "No external links in chat; report & review built-in; ID + selfie verification gate.",
      features: [
        {
          icon: Shield,
          title: "ID & Selfie Verification",
          description: "Every user is verified with government ID and live selfie check",
          badge: "Required"
        },
        {
          icon: AlertTriangle,
          title: "No External Links",
          description: "Chat messages cannot contain links to prevent spam and scams",
          badge: "Protected"
        },
        {
          icon: Users,
          title: "Report & Review",
          description: "Built-in reporting system with admin review and action",
          badge: "Monitored"
        },
        {
          icon: Eye,
          title: "Transparent Matching",
          description: "See exactly why you're compatible with clear explanations",
          badge: "Clear"
        }
      ],
      policies: [
        {
          title: "Privacy Policy",
          description: "How we protect and use your data",
          href: "/privacy"
        },
        {
          title: "Accessibility Statement", 
          description: "Our commitment to WCAG 2.2 AA compliance",
          href: "/accessibility"
        },
        {
          title: "Terms of Service",
          description: "Platform rules and user agreements",
          href: "/terms"
        }
      ],
      trustIndicators: [
        "GDPR compliant data handling",
        "WCAG 2.2 AA accessibility standards",
        "Regular security audits",
        "24/7 moderation support"
      ]
    },
    nl: {
      title: "Veiligheid & Integriteit",
      subtitle: "Jouw veiligheid en privacy zijn onze hoogste prioriteiten",
      description: "Geen externe links in chat; rapportage & beoordeling ingebouwd; ID + selfie verificatie vereist.",
      features: [
        {
          icon: Shield,
          title: "ID & Selfie Verificatie",
          description: "Elke gebruiker is geverifieerd met overheids-ID en live selfie controle",
          badge: "Vereist"
        },
        {
          icon: AlertTriangle,
          title: "Geen Externe Links",
          description: "Chatberichten kunnen geen links bevatten om spam en scams te voorkomen",
          badge: "Beschermd"
        },
        {
          icon: Users,
          title: "Rapportage & Beoordeling",
          description: "Ingebouwd rapportagesysteem met admin beoordeling en actie",
          badge: "Gemonitord"
        },
        {
          icon: Eye,
          title: "Transparante Matching",
          description: "Zie precies waarom je compatibel bent met duidelijke uitleg",
          badge: "Duidelijk"
        }
      ],
      policies: [
        {
          title: "Privacybeleid",
          description: "Hoe we je gegevens beschermen en gebruiken",
          href: "/privacy"
        },
        {
          title: "Toegankelijkheidsverklaring",
          description: "Onze inzet voor WCAG 2.2 AA naleving",
          href: "/accessibility"
        },
        {
          title: "Algemene Voorwaarden",
          description: "Platformregels en gebruikersovereenkomsten",
          href: "/terms"
        }
      ],
      trustIndicators: [
        "GDPR-conforme gegevensverwerking",
        "WCAG 2.2 AA toegankelijkheidsnormen",
        "Reguliere beveiligingsaudits",
        "24/7 moderatie ondersteuning"
      ]
    }
  }

  const text = content[locale]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            {text.subtitle}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {text.description}
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {text.features.map((feature, index) => (
            <Card key={index} className="text-center border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Trust & Compliance
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {text.trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {indicator}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="grid md:grid-cols-3 gap-6">
          {text.policies.map((policy, index) => (
            <Card key={index} className="border border-gray-200 hover:border-primary/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {policy.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {policy.description}
                </CardDescription>
                <Link href={policy.href}>
                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
