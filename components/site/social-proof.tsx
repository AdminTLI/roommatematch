'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

function VerifiedBadge({
  label = 'Verified',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center', className)}
      aria-label={label}
      title={label}
      role="img"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <polygon
          fill="#1D9BF0"
          points="12.000,2.000 14.122,4.079 17.000,3.340 17.798,6.202 20.660,7.000 19.921,9.878 22.000,12.000 19.921,14.122 20.660,17.000 17.798,17.798 17.000,20.660 14.122,19.921 12.000,22.000 9.878,19.921 7.000,20.660 6.202,17.798 3.340,17.000 4.079,14.122 2.000,12.000 4.079,9.878 3.340,7.000 6.202,6.202 7.000,3.340 9.878,4.079"
        />
        <path
          d="M7.6 12.4l2.6 2.6 6.2-6.2"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.55 5.06 16.82 6 11.31 2 7.41l5.53-.8L10 1.6z"
      />
    </svg>
  )
}

function Stars({ value, label }: { value: number; label: string }) {
  const full = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <div className="flex items-center gap-1" aria-label={label} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn('h-4 w-4', i < full ? 'text-amber-500' : 'text-slate-300/70')}
        />
      ))}
    </div>
  )
}

const content = {
  en: {
    title: 'Reviews from our beta testers',
    subtitle: 'What our users have to say',
    summaryLabel: 'Member rating',
    summaryNote: 'Reviews during our beta testing phase',
    chips: ['Beta testers', 'Verified profiles'],
    reviews: [
      {
        rating: 5,
        title: 'Felt safer straight away',
        body: 'I liked that everyone is verified. I’m an international student and I’m always a bit cautious meeting new people - this made it feel way less sketchy.',
        name: 'Annelie',
        meta: 'Year 2 student from Germany studying at Tilburg University',
      },
      {
        rating: 5,
        title: 'The “why we match” part is the best',
        body: 'Seeing the match reasons helped me message people I actually clicked with. I didn’t waste a week chatting with someone who lives totally differently.',
        name: 'Sveva',
        meta: 'Year 1 student from Italy studying at Avans University of Applied Sciences',
      },
      {
        rating: 4,
        title: 'Less awkward than the usual process',
        body: 'It’s still a bit scary finding a roommate in NL, but this felt more normal than Facebook groups. I liked that you can compare habits before you meet.',
        name: 'Arjun',
        meta: 'Year 3 student from India studying at Avans University of Applied Sciences',
      },
    ],
  },
  nl: {
    title: 'Reviews van echte leden',
    subtitle: 'Notities van onze beta testers (studenten).',
    summaryLabel: 'Beoordeling door leden',
    summaryNote: 'Verzameld tijdens de beta (voorbeelden).',
    chips: ['Beta testers', 'Geverifieerde profielen'],
    reviews: [
      {
        rating: 5,
        title: 'Voelde meteen veiliger',
        body: 'Fijn dat iedereen geverifieerd is. Als internationale student ben ik altijd wat voorzichtiger met nieuwe mensen - dit voelde echt minder sketchy.',
        name: 'Annelie',
        meta: 'Student uit Duitsland (Jaar 2) aan Tilburg University',
      },
      {
        rating: 5,
        title: 'Die “waarom we matchen” is het beste',
        body: 'De match-redenen hielpen me sneller mensen te berichten waar ik echt mee klikte. Ik verspilde geen week aan chatten met iemand die totaal anders leeft.',
        name: 'Sveva',
        meta: 'Student uit Italië (Jaar 1) aan Avans University of Applied Sciences',
      },
      {
        rating: 4,
        title: 'Minder ongemakkelijk dan normaal',
        body: 'Een huisgenoot vinden in NL blijft spannend, maar dit voelde normaler dan Facebookgroepen. Top dat je gewoontes kan vergelijken vóór je afspreekt.',
        name: 'Arjun',
        meta: 'Student uit India (Jaar 3) aan Avans University of Applied Sciences',
      },
    ],
  },
}

export function SocialProof() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            {t.title}
          </h2>
        </div>

        <div className={cn(GLASS, 'mt-8 p-6 sm:p-7')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/60">
                <span className="text-lg font-bold text-slate-800">4.8</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{t.summaryLabel}</p>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <Stars value={5} label={`${t.summaryLabel}: 4.8 / 5`} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{t.summaryNote}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {t.chips.map((x) => (
                <span
                  key={x}
                  className="inline-flex items-center rounded-full border border-white/70 bg-white/50 px-2.5 py-1 font-medium"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.reviews.map((r) => (
            <article key={`${r.name}-${r.title}`} className={cn(GLASS, 'p-7')}>
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} label={`${r.rating} / 5`} />
                <span className="text-xs font-medium text-slate-500">{locale === 'nl' ? 'Beta tester' : 'Beta tester'}</span>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.body}</p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/50 pt-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      <span>{r.name}</span>
                      <VerifiedBadge label={locale === 'nl' ? 'Geverifieerd' : 'Verified'} />
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 leading-snug break-words">{r.meta}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}

