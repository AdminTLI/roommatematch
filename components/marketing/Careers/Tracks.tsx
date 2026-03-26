'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Target, Users, Rocket } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/app/providers'

const content = {
  en: {
    experienced: {
      title: 'Experienced contributors',
      badge: 'Pro bono',
      intro: 'Professionals and grads who care about the mission and want to contribute hands-on.',
      highlights: ['Ship trust & safety features', 'Collaborate with a focused team', 'Flexible, sprint-style work'],
      note: 'Pitch an idea or choose a scoped project. Light onboarding included.',
      chips: ['Time: sprint-style', 'Deliverable: scoped issue(s)'],
      footer: 'We’ll reply within one week, scope a project, and share a Notion board to get started.'
    },
    student: {
      title: 'Student volunteers',
      badge: 'Student-ready',
      intro: 'Students build real projects in marketing, product, design, research, data, and more.',
      highlights: ['Portfolio work on a live platform', 'Mentorship and review', 'Aligned with your studies'],
      note: 'Choose an area; we scope a project and onboard you. Typical time: 3–5 hrs/week.',
      chips: ['Time: 3–5 hrs/week', 'Deliverable: scoped project'],
      footer: 'We’ll reply within one week, scope a project aligned to your studies, and share a Notion board.'
    },
    cta: 'Apply to join'
  },
  nl: {
    experienced: {
      title: 'Ervaren contributors',
      badge: 'Pro bono',
      intro: 'Professionals en graduates die onze missie ondersteunen en zelf willen bouwen.',
      highlights: ['Bouw aan trust- & safetyfeatures', 'Werk met een klein gefocust team', 'Flexibele sprints'],
      note: 'Pitch je idee of kies een scoped project. Onboarding is licht maar duidelijk.',
      chips: ['Tijd: sprintvorm', 'Deliverable: scoped issue(s)'],
      footer: 'Binnen een week reageren we, scope we het project en delen we een Notion-board.'
    },
    student: {
      title: 'Student volunteers',
      badge: 'Student-ready',
      intro: 'Studenten bouwen mee aan marketing, product, design, research, data en meer.',
      highlights: ['Portfolio werk op een live platform', 'Mentoring en review', 'Aansluitend op je studie'],
      note: 'Kies je focus; wij scopen een project en onboarden je. Richtlijn: 3–5 uur per week.',
      chips: ['Tijd: 3–5 uur/week', 'Deliverable: scoped project'],
      footer: 'We reageren binnen een week, stemmen het project af en delen een Notion-board.'
    },
    cta: 'Meld je aan'
  }
}

export function Tracks() {
  const { locale } = useApp()
  const t = content[locale]

  const cards = [
    { data: t.experienced, icons: [Target, Users, Rocket] },
    { data: t.student, icons: [Rocket, Users, Target] }
  ]

  return (
    <>
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        {cards.map(({ data, icons }, index) => (
          <Card
            className="h-full border border-white/60 bg-white/45 backdrop-blur-xl rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            key={index}
          >
            <CardHeader>
              <div className="text-center space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                  {data.title}
                </CardTitle>
                <div className="mt-1">
                  <Badge
                    variant={index === 0 ? 'secondary' : 'default'}
                    className="border border-white/70 bg-white/60 text-xs text-slate-700 px-3 py-1 rounded-full"
                  >
                    {data.badge}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-slate-700 text-center leading-relaxed">{data.intro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {data.highlights.map((highlight, idx) => {
                  const Icon = icons[idx]
                  return (
                    <div
                      key={highlight}
                      className="rounded-2xl bg-white/60 border border-white/70 p-3 text-center text-slate-800 backdrop-blur-xl"
                    >
                      <Icon className="mx-auto h-4 w-4 text-blue-700 mb-1" />
                      {highlight}
                    </div>
                  )
                })}
              </div>
              <Separator className="my-3 bg-white/70" />
              <p className="text-xs text-slate-600 text-center leading-relaxed">{data.note}</p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {data.chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-[11px] text-slate-700 border border-white/70"
                  >
                    <CalendarClock className="h-3 w-3 text-blue-700" aria-hidden="true" />
                    {chip}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed text-center">{data.footer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button
          asChild
          size="lg"
          className="rounded-2xl bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90"
        >
          <a href="/careers/apply">{t.cta}</a>
        </Button>
      </div>
    </>
  )
}


