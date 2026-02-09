'use client'

import { MarketingSubpageWrapper } from '../../components/marketing-subpage-wrapper'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ApplyForm } from '@/components/marketing/Careers/ApplyForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Apply to join',
    subtitle: "Share your skills, time commitment, and the roles you're excited about.",
    note: "Because we're pre‑team, every applicant will work directly with the founder to scope meaningful projects.",
    whyTitle: 'Why your contribution matters',
    whyDescription: "We're building practical systems for safer, happier student housing. Your work ships fast and shapes how we build.",
    currentFocus: 'Current focus',
    focusItems: [
      'Refine onboarding conversion and verification flow',
      'Tighten matching quality signals and simple metrics',
      'Design campus‑ready growth experiments'
    ],
    opportunity: 'Opportunity',
    opportunityText: 'You may be the first contributor in your area — set the standard and leave strong references behind you.'
  },
  nl: {
    title: 'Aanmelden om mee te doen',
    subtitle: 'Deel je vaardigheden, tijdsinzet en de rollen waar je enthousiast over bent.',
    note: 'Omdat we pre-team zijn, werkt elke aanvrager rechtstreeks met de oprichter samen om betekenisvolle projecten af te bakenen.',
    whyTitle: 'Waarom jouw bijdrage ertoe doet',
    whyDescription: 'We bouwen praktische systemen voor veiligere, gelukkigere studentenhuisvesting. Je werk wordt snel geleverd en vormt hoe we bouwen.',
    currentFocus: 'Huidige focus',
    focusItems: [
      'Verfijn onboardingconversie en verificatieflow',
      'Versterk matchkwaliteitssignalen en eenvoudige metrics',
      'Ontwerp campusklare groei-experimenten'
    ],
    opportunity: 'Kans',
    opportunityText: 'Je kunt de eerste contributor in jouw gebied zijn — zet de standaard en laat sterke referenties achter.'
  }
}

export default function CareersApplyPage() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <MarketingSubpageWrapper>
      <Section className="relative overflow-hidden bg-slate-950">
        <Container>
          <div className="mx-auto max-w-5xl text-center py-10 sm:py-12 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t.title}
            </h1>
            <p className="text-slate-400">
              {t.subtitle}
            </p>
            <p className="text-sm text-slate-500">
              {t.note}
            </p>
          </div>

          
          <div className="mx-auto max-w-6xl space-y-6">
            <Card className="rounded-2xl border border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-center text-white">{t.whyTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <p className="text-slate-400 max-w-2xl mx-auto text-center">
                  {t.whyDescription}
                </p>
                <div className="space-y-2 max-w-2xl mx-auto">
                  <div className="text-sm font-medium text-center text-slate-200">{t.currentFocus}</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                    {t.focusItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3 text-xs text-center max-w-2xl mx-auto">
                  <div className="font-medium text-white mb-1">{t.opportunity}</div>
                  <p className="text-slate-400 leading-relaxed">
                    {t.opportunityText}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="lg:mt-0">
              <ApplyForm />
            </div>
          </div>

        </Container>
      </Section>
    </MarketingSubpageWrapper>
  )
}


