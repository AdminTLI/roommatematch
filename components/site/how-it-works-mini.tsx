'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle2, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    title: 'How it works',
    subtitle: 'Three quick steps. No awkward interviews.',
    steps: [
      { icon: ShieldCheck, title: 'Verify', body: 'Real people only.' },
      { icon: Sparkles, title: 'Match', body: 'See why you click.' },
      { icon: MessageCircle, title: 'Chat', body: 'Start safely in-app.' },
    ],
  },
  nl: {
    title: 'Hoe het werkt',
    subtitle: 'Drie snelle stappen. Geen awkward interviews.',
    steps: [
      { icon: ShieldCheck, title: 'Verifieer', body: 'Alleen echte mensen.' },
      { icon: Sparkles, title: 'Match', body: 'Zie waarom je klikt.' },
      { icon: MessageCircle, title: 'Chat', body: 'Start veilig in-app.' },
    ],
  },
}

export function HowItWorksMini() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
          <div className={cn(GLASS, 'p-7 sm:p-8')}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
              {t.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">{t.subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                locale === 'nl' ? 'Geen woning-loterij vibes' : 'No housing lottery energy',
                locale === 'nl' ? 'Geen catfish' : 'No catfish',
                locale === 'nl' ? 'Meer rust thuis' : 'More calm at home',
              ].map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.steps.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className={cn(GLASS, 'p-6')}>
                  <div className="h-12 w-12 rounded-2xl border border-white/70 bg-white/60 grid place-items-center">
                    <Icon className="h-6 w-6 text-slate-800" aria-hidden />
                  </div>
                  <div className="mt-4 text-lg font-bold text-slate-800">{s.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{s.body}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}

