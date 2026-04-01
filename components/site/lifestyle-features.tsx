'use client'

import { useMemo, useState } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle2, IdCard, ListChecks, Sparkles } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    title: 'Built for calm homes',
    subtitle: 'Clearer matches. Better vibes at home.',
    cards: {
      verified: {
        key: 'verified',
        title: 'Verified & safe',
        copy: '100% verified students and professionals. No exceptions.',
        badge: 'ID & Photo Verification',
        previewTitle: 'What you get',
        preview: [
          'ID & photo verification',
          'Student/professional-only communities',
          'Duplicate & fraud detection',
          'Report & block',
          'Privacy-first messaging',
          'Fast safety support',
        ],
      },
      matchMatters: {
        key: 'matchMatters',
        title: 'Match on what matters',
        copy: 'Match on the things that actually shape day-to-day living.',
        badge: 'Personality & Compatibility',
        chipsTitle: 'What you’ll see',
        chips: ['Interests', 'Housing status', 'Preferred city', 'Budget range', 'University / WFH'],
        previewTitle: 'Profile snapshot',
        previewPairs: [
          { k: 'Preferred city', v: 'Breda' },
          { k: 'Budget', v: '€450 – €650' },
        ],
      },
      explainable: {
        key: 'explainable',
        title: 'Shared vibes',
        copy: 'See exactly why you click before you even say hello.',
        badge: 'Tailored Matching Algorithm',
        whyTitle: 'Why you match',
        why: ['Shared interests', 'Similar context', 'Compatible home vibe'],
        previewTitle: 'Match preview',
        previewScore: '91%',
      },
    },
  },
  nl: {
    title: 'Gemaakt voor rustige huizen',
    subtitle: 'Duidelijkere matches. Betere vibes thuis.',
    cards: {
      verified: {
        key: 'verified',
        title: 'Geverifieerd & veilig',
        copy: '100% geverifieerde studenten en professionals. Geen uitzonderingen.',
        badge: 'ID- & fotoverificatie',
        previewTitle: 'Wat je krijgt',
        preview: [
          'ID- & fotoverificatie',
          'Alleen studenten/professionals',
          'Detectie van dubbele accounts & fraude',
          'Rapporteer & blokkeer',
          'Privacy-first berichten',
          'Snelle safety support',
        ],
      },
      matchMatters: {
        key: 'matchMatters',
        title: 'Match op wat ertoe doet',
        copy: 'Match op wat het dagelijkse leven écht bepaalt.',
        badge: 'Persoonlijkheid & compatibiliteit',
        chipsTitle: 'Wat je ziet',
        chips: ['Interesses', 'Woonstatus', 'Voorkeursstad', 'Budget', 'Universiteit / WFH'],
        previewTitle: 'Profiel snapshot',
        previewPairs: [
          { k: 'Voorkeursstad', v: 'Breda' },
          { k: 'Budget', v: '€450 – €650' },
        ],
      },
      explainable: {
        key: 'explainable',
        title: 'Gedeelde vibes',
        copy: 'Zie precies waarom je klikt, nog vóór je hallo zegt.',
        badge: 'Matching op maat',
        whyTitle: 'Waarom het klikt',
        why: ['Gedeelde interesses', 'Vergelijkbare context', 'Fijne huisvibe'],
        previewTitle: 'Match preview',
        previewScore: '91%',
      },
    },
  },
}

function FeatureTile({
  icon: Icon,
  eyebrow,
  title,
  copy,
  previewTitle,
  previewBody,
  accent,
}: {
  icon: React.ElementType
  eyebrow: string
  title: string
  copy: string
  previewTitle: string
  previewBody: React.ReactNode
  accent: 'emerald' | 'indigo' | 'violet'
}) {
  const accentMap = {
    emerald: {
      chip: 'bg-emerald-600 text-white',
      iconBg: 'bg-emerald-50/80 border-emerald-200/80',
      icon: 'text-emerald-700',
    },
    indigo: {
      chip: 'bg-indigo-600 text-white',
      iconBg: 'bg-indigo-50/80 border-indigo-200/80',
      icon: 'text-indigo-700',
    },
    violet: {
      chip: 'bg-violet-600 text-white',
      iconBg: 'bg-violet-50/80 border-violet-200/80',
      icon: 'text-violet-700',
    },
  } as const

  const a = accentMap[accent]

  return (
    <div className={cn(GLASS, 'p-7 flex flex-col')}>
      <div className="flex items-start justify-between gap-4">
        <div className={cn('h-12 w-12 rounded-2xl border grid place-items-center', a.iconBg)}>
          <Icon className={cn('h-6 w-6', a.icon)} aria-hidden />
        </div>
        <div className={cn('rounded-full px-3 py-1 text-xs font-semibold', a.chip)}>{eyebrow}</div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{copy}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/50 p-4 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {previewTitle}
        </div>
        <div className="mt-3">{previewBody}</div>
      </div>
    </div>
  )
}

export function LifestyleFeatures() {
  const { locale } = useApp()
  const t = content[locale]
  const [active, setActive] = useState<'verified' | 'matchMatters' | 'explainable'>('verified')

  const items = useMemo(() => {
    return [
      { id: 'verified' as const, icon: IdCard, label: t.cards.verified.badge },
      { id: 'matchMatters' as const, icon: ListChecks, label: t.cards.matchMatters.badge },
      { id: 'explainable' as const, icon: Sparkles, label: t.cards.explainable.badge },
    ]
  }, [t.cards.explainable.badge, t.cards.matchMatters.badge, t.cards.verified.badge])

  const activeCard =
    active === 'verified'
      ? t.cards.verified
      : active === 'matchMatters'
        ? t.cards.matchMatters
        : t.cards.explainable

  const ActiveIcon =
    active === 'verified' ? IdCard : active === 'matchMatters' ? ListChecks : Sparkles

  return (
    <Section className="py-14 md:py-20 lg:py-24">
      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-800 leading-[1.05]">
              {t.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl">{t.subtitle}</p>

            <div className={cn(GLASS, 'p-2')}>
              <div className="grid grid-cols-1 gap-2">
                {items.map((it) => {
                  const isActive = it.id === active
                  const Icon = it.icon
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setActive(it.id)}
                      className={cn(
                        'rounded-2xl px-4 py-3.5 text-left transition-colors border',
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white/50 text-slate-800 border-white/60 hover:bg-white/70'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-700')} aria-hidden />
                        <div className="text-xs font-bold uppercase tracking-[0.16em] truncate">
                          {activeCard.key === it.id ? activeCard.title : t.cards[it.id].title}
                        </div>
                      </div>
                      <div className={cn('mt-1 text-[11px] font-semibold opacity-80 truncate')}>
                        {it.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className={cn(GLASS, 'p-7 sm:p-8 min-h-[440px] flex flex-col')}>
            <div className="flex items-start justify-between gap-4">
              <div className="h-12 w-12 rounded-2xl border border-white/70 bg-white/60 grid place-items-center">
                <ActiveIcon className="h-6 w-6 text-slate-800" aria-hidden />
              </div>
              {'previewScore' in activeCard && activeCard.previewScore ? (
                <div className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700">
                  {activeCard.badge}
                </div>
              ) : (
                <div className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700">
                  {activeCard.badge}
                </div>
              )}
            </div>

            <h3 className="mt-5 text-2xl font-bold text-slate-800">{activeCard.title}</h3>
            <p className="mt-2 text-slate-600">{activeCard.copy}</p>

            <div className="mt-6 rounded-2xl border border-white/70 bg-white/50 p-4 flex-1 flex flex-col">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {activeCard.previewTitle}
              </div>

              {'preview' in activeCard && activeCard.preview ? (
                <div className="mt-3 space-y-2">
                  {activeCard.preview.map((x) => (
                    <div key={x} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" aria-hidden />
                      <span className="text-sm text-slate-700">{x}</span>
                    </div>
                  ))}
                </div>
              ) : null}


              {'chips' in activeCard && activeCard.chips ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeCard.chips.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}

              {'previewPairs' in activeCard && activeCard.previewPairs ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activeCard.previewPairs.map((p) => (
                    <div key={p.k} className="rounded-2xl border border-white/70 bg-white/60 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        {p.k}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{p.v}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {active === 'explainable' && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    {
                      title: locale === 'nl' ? 'Harmony score' : 'Harmony score',
                      body:
                        locale === 'nl'
                          ? 'Hoe goed jullie leefstijl matcht.'
                          : 'How well your lifestyle fits.',
                    },
                    {
                      title: locale === 'nl' ? 'Context score' : 'Context score',
                      body:
                        locale === 'nl'
                          ? 'Match op stad, budget en timing.'
                          : 'Match on city, budget, and timing.',
                    },
                    {
                      title: locale === 'nl' ? 'Why you match (detected reasoning)' : 'Why you match (detected reasoning)',
                      body:
                        locale === 'nl'
                          ? 'De belangrijkste signalen achter de match.'
                          : 'The key signals behind the match.',
                    },
                    {
                      title: locale === 'nl' ? 'Detailed dimension scores' : 'Detailed dimension scores',
                      body:
                        locale === 'nl'
                          ? 'Scores per dimensie (bv. schoon, slaap, gasten).'
                          : 'Scores per dimension (e.g. clean, sleep, guests).',
                    },
                  ].map((s) => (
                    <div key={s.title} className="rounded-2xl border border-white/70 bg-white/60 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 leading-snug">
                        {s.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-700 leading-snug">{s.body}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Spacer to keep panel height stable across tabs */}
              <div className="flex-1" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

