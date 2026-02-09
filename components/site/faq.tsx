'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: "Frequently asked questions",
    subtitle: "Everything you need to know about Domu Match for universities",
    stillHaveQuestions: "Still have questions?",
    contactText: "Contact our team at",
    faqs: [
      {
        question: "How does the roommate matching algorithm work?",
        answer: "Our algorithm analyzes 40+ compatibility factors including study habits, cleanliness preferences, social activities, quiet hours, and lifestyle choices. It uses cosine similarity to predict compatibility and prevent conflicts before they start."
      },
      {
        question: "What's included in the free pilot?",
        answer: "The pilot includes up to 500 students, basic matching algorithm, email support, admin dashboard, basic analytics, and white-label branding. It's perfect for testing our platform with a small cohort for 30 days."
      },
      {
        question: "How do you ensure student safety and verification?",
        answer: "Every student must complete government ID + selfie verification before accessing the platform. All chat is text-only, rate-limited, and moderated. We provide escalation paths for any concerns and work closely with university housing teams."
      },
      {
        question: "Can we integrate with our existing housing management system?",
        answer: "Yes! Our Enterprise plan includes API access and custom integrations. We can connect with most housing management systems and student information systems to streamline your workflow."
      },
      {
        question: "What kind of analytics and reporting do you provide?",
        answer: "Our admin dashboard shows real-time analytics including signup rates by university, compatibility scores, dispute resolution metrics, and housing satisfaction trends. Enterprise customers get custom reporting and compliance documentation."
      },
      {
        question: "How quickly can we get started?",
        answer: "Pilot universities can be up and running within 1 week. We provide complete onboarding, training for your housing team, and ongoing support. Most universities see results within the first 30 days."
      },
      {
        question: "What happens if students aren't satisfied with their matches?",
        answer: "We have a satisfaction guarantee. If students aren't happy with their matches, we work with your housing team to find better alternatives. Our algorithm continuously learns and improves based on feedback."
      },
      {
        question: "Do you support international students and different languages?",
        answer: "Yes! Our platform supports multiple languages and we have experience working with international student populations. We can customize the experience for different cultural preferences and housing needs."
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
        answer: "Ons algoritme analyseert 40+ compatibiliteitsfactoren, waaronder studiegewoonten, netheidsvoorkeuren, sociale activiteiten, stilte uren en levensstijlkeuzes. Het gebruikt cosinusgelijkheid om compatibiliteit te voorspellen en conflicten te voorkomen voordat ze beginnen."
      },
      {
        question: "Wat is inbegrepen in de gratis pilot?",
        answer: "De pilot omvat tot 500 studenten, basis matchingalgoritme, e-mailondersteuning, beheerdersdashboard, basisanalyses en white-label branding. Het is perfect voor het testen van ons platform met een kleine groep gedurende 30 dagen."
      },
      {
        question: "Hoe zorgen jullie voor studentveiligheid en verificatie?",
        answer: "Elke student moet overheids-ID + selfie-verificatie voltooien voordat hij toegang krijgt tot het platform. Alle chat is alleen tekst, beperkt in frequentie en gemodereerd. We bieden escalatiepaden voor eventuele zorgen en werken nauw samen met universiteitshuisvestingsteams."
      },
      {
        question: "Kunnen we integreren met ons bestaande huisvestingsbeheersysteem?",
        answer: "Ja! Ons Enterprise-plan omvat API-toegang en aangepaste integraties. We kunnen verbinding maken met de meeste huisvestingsbeheersystemen en studentinformatiesystemen om je workflow te stroomlijnen."
      },
      {
        question: "Wat voor analyses en rapportage bieden jullie?",
        answer: "Ons beheerdersdashboard toont real-time analyses, waaronder aanmeldingspercentages per universiteit, compatibiliteitsscores, geschiloplossingsmetrieken en huisvestingstevredenheidstrends. Enterprise-klanten krijgen aangepaste rapportage en nalevingsdocumentatie."
      },
      {
        question: "Hoe snel kunnen we beginnen?",
        answer: "Pilot-universiteiten kunnen binnen 1 week operationeel zijn. We bieden volledige onboarding, training voor je huisvestingsteam en doorlopende ondersteuning. De meeste universiteiten zien resultaten binnen de eerste 30 dagen."
      },
      {
        question: "Wat gebeurt er als studenten niet tevreden zijn met hun matches?",
        answer: "We hebben een tevredenheidsgarantie. Als studenten niet blij zijn met hun matches, werken we samen met je huisvestingsteam om betere alternatieven te vinden. Ons algoritme leert en verbetert continu op basis van feedback."
      },
      {
        question: "Ondersteunen jullie internationale studenten en verschillende talen?",
        answer: "Ja! Ons platform ondersteunt meerdere talen en we hebben ervaring met het werken met internationale studentenpopulaties. We kunnen de ervaring aanpassen voor verschillende culturele voorkeuren en huisvestingsbehoeften."
      }
    ]
  }
}

export function FAQ() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-slate-950">
      <Container>
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {t.faqs.map((faq, index) => (
            <Card key={index} className="border-slate-700 bg-slate-800/30">
              <Collapsible>
                <CollapsibleTrigger className="w-full min-h-[44px]">
                  <CardHeader className="text-left p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base sm:text-lg font-semibold text-white text-left">
                        {faq.question}
                      </CardTitle>
                      <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200 flex-shrink-0 group-data-[state=open]/collapsible:rotate-180" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 mb-4">
            {t.stillHaveQuestions}
          </p>
          <p className="text-sm text-slate-400">
            {t.contactText}{' '}
            <a href="mailto:domumatch@gmail.com" className="text-violet-400 hover:text-violet-300 hover:underline">
              domumatch@gmail.com
            </a>
          </p>
        </div>
      </Container>
    </Section>
  )
}
