'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { ArrowRight, Users, Building2, Mail } from 'lucide-react'

interface FinalCTAProps {
  locale?: 'en' | 'nl'
}

export function FinalCTA({ locale = 'en' }: FinalCTAProps) {
  const { t } = useApp()

  const content = {
    en: {
      title: "Ready to Find Your Perfect Roommate?",
      subtitle: "Join thousands of students who have already found their ideal living situation through our platform.",
      cta: {
        student: {
          title: "For Students",
          description: "Start your compatibility-based roommate search",
          buttonText: "Start now",
          href: "/auth/sign-up"
        },
        university: {
          title: "For Universities", 
          description: "Reduce conflicts and improve student satisfaction",
          buttonText: "See how it works",
          href: "/learn",
          secondaryButtonText: "Contact us",
          secondaryHref: "/contact"
        }
      }
    },
    nl: {
      title: "Klaar om je Perfecte Huisgenoot te Vinden?",
      subtitle: "Sluit je aan bij duizenden studenten die hun ideale woonsituatie al hebben gevonden via ons platform.",
      cta: {
        student: {
          title: "Voor Studenten",
          description: "Start je compatibiliteits-gebaseerde huisgenoot zoektocht",
          buttonText: "Start nu",
          href: "/auth/sign-up"
        },
        university: {
          title: "Voor Universiteiten",
          description: "Verminder conflicten en verbeter studenttevredenheid",
          buttonText: "Bekijk hoe het werkt",
          href: "/learn",
          secondaryButtonText: "Neem contact op",
          secondaryHref: "/contact"
        }
      }
    }
  }

  const text = content[locale]

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-indigo-50 dark:from-primary/10 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {text.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        {/* Split CTA Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Students CTA */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{text.cta.student.title}</CardTitle>
              <CardDescription className="text-base">
                {text.cta.student.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href={text.cta.student.href}>
                <Button size="lg" className="w-full text-lg px-8 py-4">
                  {text.cta.student.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Universities CTA */}
          <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-fit">
                <Building2 className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle className="text-2xl">{text.cta.university.title}</CardTitle>
              <CardDescription className="text-base">
                {text.cta.university.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <Link href={text.cta.university.href}>
                <Button variant="outline" size="lg" className="w-full text-lg px-8 py-4">
                  {text.cta.university.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={text.cta.university.secondaryHref}>
                <Button variant="ghost" size="sm" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  {text.cta.university.secondaryButtonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom trust indicator */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trusted by students at University of Amsterdam, TU Delft, and Erasmus University
          </p>
        </div>
      </div>
    </section>
  )
}
