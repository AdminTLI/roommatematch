'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, GraduationCap, Shield, Target } from 'lucide-react'
import { useApp } from '@/app/providers'

const content = {
  en: {
    cards: [
      {
        icon: Briefcase,
        title: 'What volunteers get',
        description: 'Ship real work with thoughtful review and support.',
        tags: ['Portfolio pieces', 'Mentorship', 'References']
      },
      {
        icon: GraduationCap,
        title: 'Student benefits',
        description: 'Learn by building on a live platform - research, design, analytics, and growth.',
        tags: ['Growth experiments', 'Analytics & matching', 'UX & content']
      },
      {
        icon: Shield,
        title: 'Why we do it',
        description: 'Safer, happier student housing - privacy‑first, accessible, evidence‑based.',
        tags: ['Privacy‑first', 'Accessible', 'Evidence‑based']
      },
      {
        icon: Target,
        title: 'Immediate priorities',
        description: 'Help where it counts now - your work ships fast.',
        tags: ['Onboarding verification', 'Matching metrics', 'Campus partnerships']
      }
    ]
  },
  nl: {
    cards: [
      {
        icon: Briefcase,
        title: 'Wat vrijwilligers krijgen',
        description: 'Lever zichtbaar werk af met doordachte review en ondersteuning.',
        tags: ['Portfolio stukken', 'Mentorschap', 'Referenties']
      },
      {
        icon: GraduationCap,
        title: 'Studentenvoordelen',
        description: 'Leer door te bouwen op een live platform - onderzoek, design, analytics en groei.',
        tags: ['Groei-experimenten', 'Analytics & matching', 'UX & content']
      },
      {
        icon: Shield,
        title: 'Waarom we het doen',
        description: 'Veiligere, gelukkigere studentenhuisvesting - privacy‑first, toegankelijk, op bewijs gebaseerd.',
        tags: ['Privacy‑first', 'Toegankelijk', 'Op bewijs gebaseerd']
      },
      {
        icon: Target,
        title: 'Directe prioriteiten',
        description: 'Help waar het nu telt - je werk wordt snel geleverd.',
        tags: ['Onboarding verificatie', 'Matching metrics', 'Campus partnerschappen']
      }
    ]
  }
}

export function Benefits() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {t.cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Card
              key={idx}
              className="h-full text-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.9)] hover:border-white/30 transition-colors text-white"
            >
              <CardHeader className="space-y-3">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-sky-500/30 border border-white/20 shadow-[0_10px_30px_rgba(56,189,248,0.45)]">
                  <Icon className="h-5 w-5 text-sky-100" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm px-6 pb-6">
                <p className="text-sm leading-relaxed text-white/70">
                  {card.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {card.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="inline-flex items-center rounded-full bg-white/8 px-3 py-1 text-xs text-white/80 border border-white/15"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


