'use client'

import { useRouter } from 'next/navigation'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: "Join our",
    titleHighlight: "community of builders",
    subtitle:
      "We’re still founder-led and pre-team. Every contributor shapes safer student housing, ships real work in weeks, and sets the tone for how we grow.",
    primary: "See open tracks",
    secondary: "Why volunteer with us",
    points: [
      "Work directly with the founder—no layers",
      "Scope a project, ship it, and showcase it",
      "First contributors get priority when paid roles open"
    ],
    visualTitle: "Build Domu Match with us"
  },
  nl: {
    title: "Word onderdeel van onze",
    titleHighlight: "community van builders",
    subtitle:
      "We zijn nog founder-led en pre-team. Elke contributor helpt veiliger studentenhuisvesting op te bouwen en levert zichtbaar werk af.",
    primary: "Bekijk de tracks",
    secondary: "Waarom vrijwilligen",
    points: [
      "Werk direct met de founder—zonder lagen",
      "Scope een project, ship het, laat het zien",
      "Eerste contributors krijgen voorrang op betaalde rollen"
    ],
    visualTitle: "Bouw mee aan Domu Match"
  }
}

interface FinalCTAProps {
  variant?: 'light' | 'dark'
}

export function FinalCTA({ variant = 'light' }: FinalCTAProps) {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]
  const isDark = variant === 'dark'

  const handlePrimary = () => {
    router.push('/careers#roles')
  }

  const handleSecondary = () => {
    router.push('/careers')
  }

  return (
    <Section
      className={cn(
        isDark && 'relative overflow-hidden bg-slate-950 py-16 md:py-24'
      )}
    >
      {isDark && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"
          aria-hidden
        />
      )}
      <Container className="relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left column - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2
                className={cn(
                  'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
                  isDark
                    ? 'text-white'
                    : 'text-brand-text'
                )}
              >
                {t.title}{' '}
                <span
                  className={
                    isDark
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500'
                      : 'text-brand-primary'
                  }
                >
                  {t.titleHighlight}
                </span>
              </h2>
              <p
                className={cn(
                  'text-base md:text-lg leading-relaxed max-w-prose',
                  isDark ? 'text-white/80' : 'text-brand-muted'
                )}
              >
                {t.subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handlePrimary}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2',
                  isDark
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50 hover:scale-105 focus-visible:ring-white focus-visible:ring-offset-slate-950'
                    : 'bg-brand-primary text-white hover:bg-brand-primaryHover focus-visible:ring-brand-primary'
                )}
              >
                {t.primary}
              </button>
              <button
                type="button"
                onClick={handleSecondary}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2',
                  isDark
                    ? 'bg-transparent border border-white/30 text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-slate-950'
                    : 'border border-brand-border text-brand-text hover:bg-muted focus-visible:ring-brand-primary'
                )}
              >
                {t.secondary}
              </button>
            </div>

            {/* Trust indicators */}
            <ul
              className={cn(
                'flex flex-col gap-3 text-sm pt-2',
                isDark ? 'text-white/80' : 'text-brand-muted'
              )}
            >
              {t.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check
                    className={cn(
                      'h-4 w-4 flex-shrink-0 mt-0.5',
                      isDark ? 'text-indigo-400' : 'text-brand-primary'
                    )}
                    aria-hidden
                  />
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column - Visual placeholder */}
          <div className="flex justify-center items-center">
            <div
              className={cn(
                'w-full max-w-md h-72 rounded-2xl flex items-center justify-center border',
                isDark
                  ? 'bg-white/5 border-white/20'
                  : 'bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 border-brand-border/20'
              )}
            >
              <div className="text-center space-y-4 p-8">
                <div className="text-5xl mb-2" aria-hidden>🤝</div>
                <p
                  className={cn(
                    'font-semibold text-lg',
                    isDark ? 'text-white/80' : 'text-brand-muted'
                  )}
                >
                  {t.visualTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}