'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import type { Locale } from '@/lib/i18n'

const copy: Record<
  Locale,
  { badge: string; title: string; body: string; primary: string; secondary: string }
> = {
  en: {
    badge: 'Safety built in',
    title: 'Verified people. Calm, safe chat.',
    body:
      'Everyone is government‑ID verified before they can chat. You can always block or report, and you stay in your life‑stage pool (students with students, professionals with professionals).',
    primary: 'Get started',
    secondary: 'Safety',
  },
  nl: {
    badge: 'Veiligheid standaard',
    title: 'Geverifieerde mensen. Rustige, veilige chat.',
    body:
      'Iedereen wordt geverifieerd met een overheids-ID voordat je kunt chatten. Je kunt altijd blokkeren of melden, en je blijft in je eigen pool (studenten met studenten, professionals met professionals).',
    primary: 'Begin gratis',
    secondary: 'Veiligheid',
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
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Button
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-900/90 shadow-[0_12px_30px_rgba(15,23,42,0.18)] rounded-2xl"
                asChild
              >
                <Link href="/auth/sign-up">{t.primary}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/50 backdrop-blur-xl border-white/60 text-slate-800 hover:bg-white/70 rounded-2xl"
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
