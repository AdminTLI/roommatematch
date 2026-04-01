'use client'

import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import type { Locale } from '@/lib/i18n'

const copy: Record<
  Locale,
  { title: string; lead: string; operational: string; incidents: string; contact: string }
> = {
  en: {
    title: 'Platform status',
    lead: 'Current availability of Domu Match marketing pages and core services.',
    operational: 'All systems operational',
    incidents: 'If you experience an issue, email us and we will investigate.',
    contact: 'Contact support',
  },
  nl: {
    title: 'Platformstatus',
    lead: 'Actuele beschikbaarheid van Domu Match-marketingpagina’s en kernservices.',
    operational: 'Alle systemen operationeel',
    incidents: 'Ervaar je een probleem? Mail ons, dan kijken we mee.',
    contact: 'Mail support',
  },
}

export function StatusPageContent() {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-16 md:py-24">
        <Container className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-600">{t.lead}</p>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-6 py-4 text-emerald-900 font-semibold">
            {t.operational}
          </div>
          <p className="text-sm text-slate-600">{t.incidents}</p>
          <a
            href="mailto:domumatch@gmail.com"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            {t.contact}
          </a>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}
