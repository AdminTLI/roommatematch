'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { Shield, Users, Lock, CheckCircle, Eye, Globe } from 'lucide-react'

interface ValuePropsProps {
  locale?: 'en' | 'nl'
}

export function ValueProps({ locale = 'en' }: ValuePropsProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "Built for trust and safety",
      subtitle: "Every feature designed to protect students and reduce conflicts",
      badges: [
        {
          icon: Users,
          title: "Campus-gated (SSO ready)",
          description: "Only verified university students can join your community",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        },
        {
          icon: Shield,
          title: "ID & Selfie Verification",
          description: "Government ID + live selfie verification for every user",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        },
        {
          icon: Lock,
          title: "GDPR/WCAG-first",
          description: "Privacy by design, accessibility by default",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        }
      ],
      universitySubtext: "Reduce complaints, raise satisfaction, and cut admin workload.",
      features: [
        {
          icon: CheckCircle,
          title: "Verified Community",
          description: "Every member is ID-verified and campus-verified"
        },
        {
          icon: Eye,
          title: "Transparent Matching",
          description: "See exactly why you're compatible with clear explanations"
        },
        {
          icon: Globe,
          title: "Campus Integration",
          description: "Seamless SSO with SURFconext and university systems"
        }
      ]
    },
    nl: {
      title: "Gebouwd voor vertrouwen en veiligheid",
      subtitle: "Elke functie is ontworpen om studenten te beschermen en conflicten te verminderen",
      badges: [
        {
          icon: Users,
          title: "Campus-beperkt (SSO gereed)",
          description: "Alleen geverifieerde universiteitsstudenten kunnen zich aansluiten",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        },
        {
          icon: Shield,
          title: "ID & Selfie Verificatie",
          description: "Overheids-ID + live selfie verificatie voor elke gebruiker",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        },
        {
          icon: Lock,
          title: "GDPR/WCAG-eerst",
          description: "Privacy by design, toegankelijkheid standaard",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        }
      ],
      universitySubtext: "Verminder klachten, verhoog tevredenheid en verminder administratieve werkdruk.",
      features: [
        {
          icon: CheckCircle,
          title: "Geverifieerde Community",
          description: "Elk lid is ID-geverifieerd en campus-geverifieerd"
        },
        {
          icon: Eye,
          title: "Transparante Matching",
          description: "Zie precies waarom je compatibel bent met duidelijke uitleg"
        },
        {
          icon: Globe,
          title: "Campus Integratie",
          description: "Naadloze SSO met SURFconext en universiteitssystemen"
        }
      ]
    }
  }

  const text = content[locale]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {text.badges.map((badge, index) => (
            <Card key={index} className="text-center border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <badge.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{badge.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {badge.description}
                </CardDescription>
                <Badge className={`mt-4 ${badge.color}`}>
                  {badge.title.split(' ')[0]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* University Value Prop */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            For Universities
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            {text.universitySubtext}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {text.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <feature.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
