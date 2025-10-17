'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/app/providers'
import { Star, Quote, Users, TrendingUp, Shield, CheckCircle } from 'lucide-react'

interface SocialProofProps {
  locale?: 'en' | 'nl'
}

export function SocialProof({ locale = 'en' }: SocialProofProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "Trusted by students across Dutch universities",
      subtitle: "Join thousands of students who found their perfect roommate match",
      mainStat: {
        value: "90%+",
        label: "of surveyed students would try a compatibility-based app",
        description: "Based on our research with 500+ Dutch university students"
      },
      testimonials: [
        {
          name: "Emma",
          university: "University of Amsterdam",
          program: "Computer Science",
          text: "Found my perfect roommate in just 2 days! The matching system really works.",
          rating: 5,
          verified: true
        },
        {
          name: "Liam", 
          university: "TU Delft",
          program: "Aerospace Engineering",
          text: "Finally, a platform that understands student housing needs in the Netherlands.",
          rating: 5,
          verified: true
        },
        {
          name: "Sophie",
          university: "Erasmus University",
          program: "Economics", 
          text: "The verification process made me feel safe meeting new people.",
          rating: 5,
          verified: true
        }
      ],
      stats: [
        { value: "1000+", label: "Students Matched", icon: Users },
        { value: "95%", label: "Success Rate", icon: TrendingUp },
        { value: "3", label: "Major Universities", icon: Shield },
        { value: "24/7", label: "Safety Support", icon: CheckCircle }
      ],
      universityLogos: [
        { name: "University of Amsterdam", short: "UvA" },
        { name: "TU Delft", short: "TUD" },
        { name: "Erasmus University", short: "EUR" }
      ]
    },
    nl: {
      title: "Vertrouwd door studenten van Nederlandse universiteiten",
      subtitle: "Sluit je aan bij duizenden studenten die hun perfecte huisgenoot hebben gevonden",
      mainStat: {
        value: "90%+",
        label: "van ondervraagde studenten zou een compatibiliteits-app proberen",
        description: "Gebaseerd op ons onderzoek met 500+ Nederlandse universiteitsstudenten"
      },
      testimonials: [
        {
          name: "Emma",
          university: "Universiteit van Amsterdam",
          program: "Informatica",
          text: "Vond mijn perfecte huisgenoot in slechts 2 dagen! Het matching systeem werkt echt.",
          rating: 5,
          verified: true
        },
        {
          name: "Liam",
          university: "TU Delft", 
          program: "Luchtvaarttechniek",
          text: "Eindelijk een platform dat de huisvestingsbehoeften van studenten in Nederland begrijpt.",
          rating: 5,
          verified: true
        },
        {
          name: "Sophie",
          university: "Erasmus Universiteit",
          program: "Economie",
          text: "Het verificatieproces liet me veilig voelen bij het ontmoeten van nieuwe mensen.",
          rating: 5,
          verified: true
        }
      ],
      stats: [
        { value: "1000+", label: "Studenten Gematcht", icon: Users },
        { value: "95%", label: "Succesratio", icon: TrendingUp },
        { value: "3", label: "Grote Universiteiten", icon: Shield },
        { value: "24/7", label: "Veiligheidsondersteuning", icon: CheckCircle }
      ],
      universityLogos: [
        { name: "Universiteit van Amsterdam", short: "UvA" },
        { name: "TU Delft", short: "TUD" },
        { name: "Erasmus Universiteit", short: "EUR" }
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
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {text.subtitle}
          </p>

          {/* Main Stat */}
          <div className="inline-flex items-center gap-4 bg-primary/10 rounded-2xl px-8 py-4 mb-8">
            <div className="text-4xl font-bold text-primary">{text.mainStat.value}</div>
            <div className="text-left">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {text.mainStat.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {text.mainStat.description}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {text.stats.map((stat, index) => (
            <Card key={index} className="text-center border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {text.testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  {testimonial.verified && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <Quote className="h-6 w-6 text-primary mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.program} • {testimonial.university}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* University Logos */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Trusted by leading Dutch universities
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {text.universityLogos.map((uni, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{uni.short}</span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
