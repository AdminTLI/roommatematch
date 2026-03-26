'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'
import { BadgeCheck, GraduationCap, Sparkles, University } from 'lucide-react'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    eyebrow: 'Pricing',
    title: 'Free today. Flexible tomorrow.',
    subtitle:
      'Right now Domu Match is free for students and young professionals. Later on, we may introduce subscription options - and we’re also working with universities so students can keep access free through sponsorship.',
    cards: [
      {
        icon: BadgeCheck,
        title: 'Individuals (today)',
        body: 'Free for students and young professionals. Verified profiles and matching included.',
        bullets: ['Free sign-up', 'Verified community', 'Compatibility-based matching'],
      },
      {
        icon: Sparkles,
        title: 'Individuals (near future)',
        body: 'Subscription access for students and young professionals (launching soon).',
        bullets: ['Subscription plans', 'Same matching experience', 'No hidden fees'],
      },
      {
        icon: University,
        title: 'University-sponsored access',
        body: 'If a university partners with us, its students can use Domu Match for free with a dedicated campus experience.',
        bullets: ['Students are free', 'Same-university matching option', 'Admin dashboards & reporting'],
      },
    ],
    footnote:
      'For university partnerships (pilots, licenses, ROI), see the section below.',
  },
  nl: {
    eyebrow: 'Prijzen',
    title: 'Nu gratis. Straks flexibel.',
    subtitle:
      'Domu Match is nu gratis voor studenten en young professionals. Later kunnen we abonnementsopties introduceren - en we werken ook samen met universiteiten zodat studenten via sponsoring gratis toegang kunnen houden.',
    cards: [
      {
        icon: BadgeCheck,
        title: 'Individueel (nu)',
        body: 'Gratis voor studenten en young professionals. Inclusief verificatie en matching.',
        bullets: ['Gratis aanmelden', 'Geverifieerde community', 'Matching op compatibiliteit'],
      },
      {
        icon: Sparkles,
        title: 'Individueel (binnenkort)',
        body: 'Abonnement voor studenten en young professionals (komt eraan).',
        bullets: ['Abonnementen', 'Dezelfde matching', 'Geen verborgen kosten'],
      },
      {
        icon: GraduationCap,
        title: 'Via universiteit',
        body: 'Als een universiteit partner wordt, kunnen studenten gratis gebruikmaken van Domu Match met een campus-ervaring.',
        bullets: ['Studenten gratis', 'Optie: alleen eigen universiteit', 'Admin dashboards & rapportages'],
      },
    ],
    footnote:
      'Voor universiteitspartnerships (pilots, licenties, ROI) zie hieronder.',
  },
}

export function PricingPlansOverview() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
            {t.eyebrow}
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-slate-800">
            {t.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.cards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className={cn(GLASS, 'p-7')}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl border border-white/70 bg-white/70 grid place-items-center">
                    <Icon className="h-6 w-6 text-slate-800" aria-hidden />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{card.title}</h2>
                </div>
                <p className="mt-4 text-slate-600">{card.body}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900/60" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">{t.footnote}</p>
      </Container>
    </Section>
  )
}

