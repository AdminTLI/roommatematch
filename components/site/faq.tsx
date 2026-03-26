'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl'

const content = {
  en: {
    title: "Frequently asked questions",
    subtitle: "Everything you need to know about Domu Match for universities",
    stillHaveQuestions: "Still have questions?",
    contactText: "Contact our team at",
    faqs: [
      {
        question: "How does the roommate matching algorithm work?",
        answer:
          "We match students on real lifestyle compatibility (quiet hours, cleanliness, routines, social preferences, and more). The goal is fewer conflicts and smoother co-living - with transparent match reasons students can understand."
      },
      {
        question: "What's included in the free pilot?",
        answer:
          "A pilot is designed to prove value quickly: onboarding support, a defined cohort, matching, and an admin view to track adoption and outcomes. We’ll scope the details (size, timeline, reporting) with you based on your housing flow."
      },
      {
        question: "How do you ensure student safety and verification?",
        answer:
          "We focus on a verified community and responsible communication. Universities can set eligibility rules, and we support clear escalation paths and collaboration with housing teams for sensitive cases."
      },
      {
        question: "Can we integrate with our existing housing management system?",
        answer:
          "Yes. We can support common imports/exports and, for deeper integrations, work with your SIS or housing stack so your team doesn’t have to duplicate work."
      },
      {
        question: "What kind of analytics and reporting do you provide?",
        answer:
          "You’ll see adoption and engagement metrics (signups, completion rates, matching outcomes) with reporting that’s useful for your housing team. For larger rollouts, we can tailor dashboards and exports to your KPIs."
      },
      {
        question: "How quickly can we get started?",
        answer:
          "Most pilots can start quickly once the cohort and requirements are clear. We handle onboarding and provide a lightweight rollout plan so your team can launch without heavy lift."
      },
      {
        question: "What happens if students aren't satisfied with their matches?",
        answer:
          "Students can give feedback and we use it to improve match quality. For pilot partners, we review learnings with your team and iterate on matching settings and guidance."
      },
      {
        question: "Do you support international students and different languages?",
        answer:
          "Yes. We support multilingual experiences and mixed cohorts, with guidance that works well for international student housing contexts."
      }
    ]
  },
  nl: {
    title: "Veelgestelde vragen",
    subtitle: "Alles wat je moet weten over Domu Match voor universiteiten",
    stillHaveQuestions: "Nog vragen?",
    contactText: "Neem contact op met ons team via",
    faqs: [
      {
        question: "Hoe werkt het huisgenoot matchingalgoritme?",
        answer:
          "We matchen studenten op echte leefstijl-compatibiliteit (stilteregels, netheid, routines, sociale voorkeuren en meer). Het doel: minder frictie en een prettigere woonervaring - met duidelijke matchredenen."
      },
      {
        question: "Wat is inbegrepen in de gratis pilot?",
        answer:
          "Een pilot is bedoeld om snel waarde te bewijzen: onboarding support, een afgebakende cohort, matching en een admin-overzicht om adoptie en uitkomsten te volgen. Samen bepalen we omvang, looptijd en rapportage op basis van jullie huisvestingsproces."
      },
      {
        question: "Hoe zorgen jullie voor studentveiligheid en verificatie?",
        answer:
          "We bouwen aan een geverifieerde community en verantwoorde communicatie. Universiteiten kunnen eligibility-regels instellen, en we ondersteunen duidelijke escalatiepaden en samenwerking met huisvestingsteams."
      },
      {
        question: "Kunnen we integreren met ons bestaande huisvestingsbeheersysteem?",
        answer:
          "Ja. We ondersteunen gangbare imports/exports en kunnen, voor diepere integraties, koppelen met jullie SIS of huisvestingsstack zodat teams niet dubbel werk doen."
      },
      {
        question: "Wat voor analyses en rapportage bieden jullie?",
        answer:
          "Je krijgt inzicht in adoptie en engagement (aanmeldingen, completion, match-uitkomsten) met rapportage die bruikbaar is voor het huisvestingsteam. Voor grotere roll-outs kunnen we dashboards en exports afstemmen op jullie KPI’s."
      },
      {
        question: "Hoe snel kunnen we beginnen?",
        answer:
          "De meeste pilots kunnen snel starten zodra cohort en requirements helder zijn. Wij regelen onboarding en leveren een licht rollout-plan zodat jullie zonder zware implementatie kunnen lanceren."
      },
      {
        question: "Wat gebeurt er als studenten niet tevreden zijn met hun matches?",
        answer:
          "Studenten kunnen feedback geven en we gebruiken dit om matchkwaliteit te verbeteren. Bij pilots bespreken we learnings met jullie team en optimaliseren we instellingen en begeleiding."
      },
      {
        question: "Ondersteunen jullie internationale studenten en verschillende talen?",
        answer:
          "Ja. We ondersteunen meertaligheid en gemengde cohorten, met begeleiding die goed werkt voor internationale studentenhuisvesting."
      }
    ]
  }
}

export function FAQ() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section>
      <Container>
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {t.faqs.map((faq, index) => (
            <Card key={index} className={cn(GLASS, 'border-white/60')}>
              <Collapsible>
                <CollapsibleTrigger className="w-full min-h-[44px] group/collapsible">
                  <CardHeader className="text-left p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 text-left">
                        {faq.question}
                      </CardTitle>
                      <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-200 flex-shrink-0 group-data-[state=open]/collapsible:rotate-180" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            {t.stillHaveQuestions}
          </p>
          <p className="text-sm text-slate-600">
            {t.contactText}{' '}
            <a
              href="mailto:domumatch@gmail.com"
              className="text-slate-900 hover:underline underline-offset-4"
            >
              domumatch@gmail.com
            </a>
          </p>
        </div>
      </Container>
    </Section>
  )
}
