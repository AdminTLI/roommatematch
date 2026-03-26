'use client'

import { MarketingSubpageWrapperLight } from '../../components/marketing-subpage-wrapper-light'
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
    whyDescription: "We're building practical systems for safer, happier shared living for students and young professionals. Your work ships fast and shapes how we build.",
    currentFocus: 'Current focus',
    focusItems: [
      'Refine onboarding conversion and verification flow',
      'Tighten matching quality signals and simple metrics',
      'Design campus‑ready growth experiments'
    ],
    opportunity: 'Opportunity',
    opportunityText: 'You may be the first contributor in your area  -  set the standard and leave strong references behind you.'
  },
  nl: {
    title: 'Aanmelden om mee te doen',
    subtitle: 'Deel je vaardigheden, tijdsinzet en de rollen waar je enthousiast over bent.',
    note: 'Omdat we pre-team zijn, werkt elke aanvrager rechtstreeks met de oprichter samen om betekenisvolle projecten af te bakenen.',
    whyTitle: 'Waarom jouw bijdrage ertoe doet',
    whyDescription: 'We bouwen praktische systemen voor veiligere, gelukkigere shared living voor studenten en young professionals. Je werk wordt snel geleverd en vormt hoe we bouwen.',
    currentFocus: 'Huidige focus',
    focusItems: [
      'Verfijn onboardingconversie en verificatieflow',
      'Versterk matchkwaliteitssignalen en eenvoudige metrics',
      'Ontwerp campusklare groei-experimenten'
    ],
    opportunity: 'Kans',
    opportunityText: 'Je kunt de eerste contributor in jouw gebied zijn  -  zet de standaard en laat sterke referenties achter.'
  }
}

export default function CareersApplyPage() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <MarketingSubpageWrapperLight className="relative overflow-hidden">
      <Section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
        <Container className="relative z-10">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600/70" aria-hidden />
              Domu Match
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {t.title}
            </h1>
            <p className="text-base text-slate-700 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              {t.note}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl space-y-6">
            <Card className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-center text-slate-900 tracking-tight">
                  {t.whyTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <p className="text-slate-700 max-w-2xl mx-auto text-center">
                  {t.whyDescription}
                </p>
                <div className="space-y-2 max-w-2xl mx-auto">
                  <div className="text-sm font-semibold text-center text-slate-900">
                    {t.currentFocus}
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-left">
                    {t.focusItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/60 p-4 text-xs text-center max-w-2xl mx-auto">
                  <div className="font-semibold text-slate-900 mb-1">{t.opportunity}</div>
                  <p className="text-slate-700 leading-relaxed">
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
    </MarketingSubpageWrapperLight>
  )
}


