'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import type { Locale } from '@/lib/i18n'
import { ID_VERIFICATION_PRIVACY_HELP_HREF } from '@/lib/verification/privacy-help'

const copy: Record<
  Locale,
  {
    badge: string
    title: string
    body: string
    privacyNote: string
    primary: string
    secondary: string
    privacyLink: string
  }
> = {
  en: {
    badge: 'Safety built in',
    title: 'Verified people. Calm, safe chat.',
    body:
      'Everyone is government‑ID verified before they can chat. You can always block or report, and you stay in your life‑stage pool (students with students, professionals with professionals).',
    privacyNote:
      'We don’t keep your ID photos — Persona runs the scan. We mainly store that you passed.',
    primary: 'Get started',
    secondary: 'Safety',
    privacyLink: 'What happens to my ID?',
  },
  nl: {
    badge: 'Veiligheid standaard',
    title: 'Geverifieerde mensen. Rustige, veilige chat.',
    body:
      'Iedereen wordt geverifieerd met een overheids-ID voordat je kunt chatten. Je kunt altijd blokkeren of melden, en je blijft in je eigen pool (studenten met studenten, professionals met professionals).',
    privacyNote:
      'We bewaren je ID-foto’s niet — Persona doet de scan. We bewaren vooral dat je bent goedgekeurd.',
    primary: 'Begin gratis',
    secondary: 'Veiligheid',
    privacyLink: 'Wat gebeurt er met mijn ID?',
  },
}

export function HowItWorksSafetyBand() {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                {t.badge}
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">{t.title}</h2>
              <p className="mt-3 text-slate-600">{t.body}</p>
              <p className="mt-3 text-sm text-slate-500">
                {t.privacyNote}{' '}
                <Link
                  href={ID_VERIFICATION_PRIVACY_HELP_HREF}
                  className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-500"
                >
                  {t.privacyLink}
                </Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Button
                size="lg"
                className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] rounded-xl"
                asChild
              >
                <Link href="/auth/sign-up">{t.primary}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50 dark:hover:text-slate-900"
                asChild
              >
                <Link href="/safety">{t.secondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
