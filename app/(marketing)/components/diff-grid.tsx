'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { X, Check, AlertTriangle, Users, Target, Clock } from 'lucide-react'

interface DiffGridProps {
  locale?: 'en' | 'nl'
}

export function DiffGrid({ locale = 'en' }: DiffGridProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "Why we're different",
      subtitle: "Traditional platforms focus on availability. We focus on compatibility.",
      comparison: {
        traditional: {
          title: "Availability-first platforms",
          subtitle: "Kamernet, HousingAnywhere, ROOM",
          description: "Huge supply, little fit",
          icon: X,
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          problems: [
            "Post and hope someone responds",
            "No compatibility assessment", 
            "Meeting strangers without context",
            "High conflict rates",
            "Time-consuming filtering",
            "Scam and spam risks"
          ],
          metrics: [
            { label: "Average time to find", value: "3-6 weeks", icon: Clock },
            { label: "Conflict rate", value: "40-60%", icon: AlertTriangle },
            { label: "Success rate", value: "30-50%", icon: Target }
          ]
        },
        domuMatch: {
          title: "Domu Match",
          subtitle: "Compatibility-first for campus life",
          description: "Algorithm-driven matching with lifestyle analysis",
          icon: Check,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-900/20", 
          borderColor: "border-green-200 dark:border-green-800",
          solutions: [
            "Scientific compatibility matching",
            "Lifestyle questionnaire analysis",
            "Group formation suggestions",
            "Transparent compatibility scores",
            "ID-verified community only",
            "Built-in safety features"
          ],
          metrics: [
            { label: "Average time to find", value: "3-7 days", icon: Clock },
            { label: "Conflict rate", value: "5-15%", icon: AlertTriangle },
            { label: "Success rate", value: "85-95%", icon: Target }
          ]
        }
      }
    },
    nl: {
      title: "Waarom wij anders zijn",
      subtitle: "Traditionele platforms focussen op beschikbaarheid. Wij focussen op compatibiliteit.",
      comparison: {
        traditional: {
          title: "Beschikbaarheid-eerst platforms",
          subtitle: "Kamernet, HousingAnywhere, ROOM",
          description: "Grote aanbod, weinig passend",
          icon: X,
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          problems: [
            "Plaats een advertentie en hoop op reactie",
            "Geen compatibiliteitsbeoordeling",
            "Ontmoet vreemden zonder context",
            "Hoge conflictratio",
            "Tijdrovend filteren",
            "Scam en spam risico's"
          ],
          metrics: [
            { label: "Gemiddelde zoektijd", value: "3-6 weken", icon: Clock },
            { label: "Conflictratio", value: "40-60%", icon: AlertTriangle },
            { label: "Succesratio", value: "30-50%", icon: Target }
          ]
        },
        domuMatch: {
          title: "Domu Match",
          subtitle: "Compatibiliteit-eerst voor campus leven",
          description: "Algoritme-gedreven matching met leefstijl analyse",
          icon: Check,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          solutions: [
            "Wetenschappelijke compatibiliteitsmatching",
            "Leefstijl vragenlijst analyse",
            "Groepsvorming suggesties",
            "Transparante compatibiliteitsscores",
            "Alleen ID-geverifieerde community",
            "Ingebouwde veiligheidsfuncties"
          ],
          metrics: [
            { label: "Gemiddelde zoektijd", value: "3-7 dagen", icon: Clock },
            { label: "Conflictratio", value: "5-15%", icon: AlertTriangle },
            { label: "Succesratio", value: "85-95%", icon: Target }
          ]
        }
      }
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
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Traditional Platforms */}
          <Card className={`border-2 ${text.comparison.traditional.borderColor} ${text.comparison.traditional.bgColor}`}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${text.comparison.traditional.bgColor}`}>
                  <text.comparison.traditional.icon className={`h-6 w-6 ${text.comparison.traditional.color}`} />
                </div>
                <div>
                  <CardTitle className={`${text.comparison.traditional.color}`}>
                    {text.comparison.traditional.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {text.comparison.traditional.subtitle}
                  </CardDescription>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {text.comparison.traditional.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Problems */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Common Issues:
                </h4>
                <ul className="space-y-2">
                  {text.comparison.traditional.problems.map((problem, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {text.comparison.traditional.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <metric.icon className="h-5 w-5 text-red-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-red-600">{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Domu Match */}
          <Card className={`border-2 ${text.comparison.domuMatch.borderColor} ${text.comparison.domuMatch.bgColor}`}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${text.comparison.domuMatch.bgColor}`}>
                  <text.comparison.domuMatch.icon className={`h-6 w-6 ${text.comparison.domuMatch.color}`} />
                </div>
                <div>
                  <CardTitle className={`${text.comparison.domuMatch.color}`}>
                    {text.comparison.domuMatch.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {text.comparison.domuMatch.subtitle}
                  </CardDescription>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {text.comparison.domuMatch.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Solutions */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Our Solutions:
                </h4>
                <ul className="space-y-2">
                  {text.comparison.domuMatch.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {text.comparison.domuMatch.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <metric.icon className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-600">{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Badge variant="outline" className="text-primary border-primary">
            <Users className="h-4 w-4 mr-1" />
            Join the compatibility-first revolution
          </Badge>
        </div>
      </div>
    </section>
  )
}
