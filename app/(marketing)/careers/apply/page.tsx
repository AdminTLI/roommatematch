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
    <MarketingSubpageWrapper className="relative overflow-hidden">
      <Section className="relative overflow-hidden bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 via-purple-950/35 to-slate-950" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/18 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/18 blur-3xl" />
        </div>
        <Container className="relative z-10">
          <div className="mx-auto max-w-5xl text-center py-10 sm:py-12 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t.title}
            </h1>
            <p className="text-base text-white/75 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <p className="text-sm text-white/65 max-w-2xl mx-auto">
              {t.note}
            </p>
          </div>

          
          <div className="mx-auto max-w-6xl space-y-6">
            <Card className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-center text-white tracking-tight">
                  {t.whyTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-relaxed">
                <p className="text-white/75 max-w-2xl mx-auto text-center">
                  {t.whyDescription}
                </p>
                <div className="space-y-2 max-w-2xl mx-auto">
                  <div className="text-sm font-medium text-center text-white">
                    {t.currentFocus}
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-white/75 text-left">
                    {t.focusItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-center max-w-2xl mx-auto">
                  <div className="font-medium text-white mb-1">{t.opportunity}</div>
                  <p className="text-white/75 leading-relaxed">
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


