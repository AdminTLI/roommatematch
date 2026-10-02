'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, EyeOff, ShieldCheck, TimerReset } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import type { Locale } from '@/lib/i18n'
import { ID_VERIFICATION_PRIVACY_HELP_HREF } from '@/lib/verification/privacy-help'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const copy: Record<
  Locale,
  {
    eyebrow: string
    title: string
    body: string
    points: { icon: 'eye' | 'check' | 'timer'; title: string; body: string }[]
    primary: string
    secondary: string
  }
> = {
  en: {
    eyebrow: 'ID check privacy',
    title: 'We check your ID. We don’t keep the photos.',
    body:
      'Nervous about uploading your passport or driver’s licence? Fair. Persona runs the secure selfie + ID scan. Domu Match mainly keeps that you passed - so you’re matching with real people, not bots or banned accounts coming back under a new name.',
    points: [
      {
        icon: 'eye',
        title: 'No ID photos on our side',
        body: 'Your ID images and selfie stay with Persona for the check. Other users never see them.',
      },
      {
        icon: 'check',
        title: 'Pass / fail is what sticks',
        body: 'Long-term we keep that you’re verified - so chat and matching stay people-only.',
      },
      {
        icon: 'timer',
        title: 'Extra details get scrubbed',
        body: 'Limited match fields (like name/age checks) are removed after about 4 weeks.',
      },
    ],
    primary: 'Read the full explanation',
    secondary: 'Privacy Policy',
  },
  nl: {
    eyebrow: 'Privacy bij ID-check',
    title: 'We checken je ID. We bewaren de foto’s niet.',
    body:
      'Spannend om je paspoort of rijbewijs te uploaden? Snapbaar. Persona doet de veilige selfie- + ID-scan. Domu Match bewaart vooral dat je bent goedgekeurd - zodat je met echte mensen matcht, niet met bots of verbannen accounts die terugkomen.',
    points: [
      {
        icon: 'eye',
        title: 'Geen ID-foto’s bij ons',
        body: 'Je ID-beelden en selfie blijven bij Persona voor de check. Andere gebruikers zien ze nooit.',
      },
      {
        icon: 'check',
        title: 'Geslaagd / niet geslaagd blijft',
        body: 'Op lange termijn bewaren we dat je geverifieerd bent - zodat chat en matching mensen-only blijven.',
      },
      {
        icon: 'timer',
        title: 'Extra details worden gewist',
        body: 'Beperkte checkvelden (zoals naam/leeftijd) verdwijnen na ongeveer 4 weken.',
      },
    ],
    primary: 'Lees de volledige uitleg',
    secondary: 'Privacybeleid',
  },
}

const iconMap = {
  eye: EyeOff,
  check: CheckCircle2,
  timer: TimerReset,
} as const

/**
 * Marketing section explaining Persona ID-check privacy in student-friendly language.
 */
export function IdVerificationPrivacySection() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = copy[locale]

  return (
    <Section
      id="id-verification-privacy"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="id-privacy-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className={cn(GLASS, 'p-8 md:p-12')}
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t.eyebrow}
            </div>
            <h2
              id="id-privacy-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl md:text-4xl"
            >
              {t.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{t.body}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {t.points.map((point) => {
              const Icon = iconMap[point.icon]
              return (
                <div
                  key={point.title}
                  className="rounded-2xl border border-white/70 bg-white/50 p-5 text-left shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <Icon className="h-5 w-5 text-emerald-700" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-800">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{point.body}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
            >
              <Link href={ID_VERIFICATION_PRIVACY_HELP_HREF}>{t.primary}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            >
              <Link href="/privacy">{t.secondary}</Link>
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
