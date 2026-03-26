'use client'

import { useApp } from '@/app/providers'
import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ProcessRibbon } from '@/components/marketing/Careers/ProcessRibbon'
import { Tracks } from '@/components/marketing/Careers/Tracks'
import { RoleCatalogCards } from '@/components/marketing/Careers/RoleCatalogCards'
import { Benefits } from '@/components/marketing/Careers/Benefits'
import { ApplyDialog } from '@/components/marketing/Careers/ApplyDialog'
import { ApplyProcessFAQ } from '@/components/marketing/Careers/ApplyProcessFAQ'

const content = {
  en: {
    hero: {
      badge: 'Early builder mission: safer, happier shared living',
      title: 'Join our community of builders',
      body: 'We’re mission-driven to improve roommate safety and trust. Join as an experienced builder or as a student gaining real-world experience - every contribution drives tangible impact.',
      primary: 'Explore tracks',
      secondary: 'Meet the community',
      footnote: 'Collaborate directly with the founder - small, focused projects with clear outcomes.'
    },
    tracks: {
      heading: 'Two ways to join',
      subheading: 'Choose the path that fits your goals - both contribute directly to our mission.'
    },
    roles: {
      heading: 'Role catalog by capability area',
      subheading: 'Explore the capability areas and pick where you want to contribute.'
    },
    focus: {
      heading: 'Current focus and open priorities',
      subheading: 'Plug in where it matters most right now.',
      cards: [
        { title: 'University partnerships', body: 'Shape outreach, pilots, and partner-facing materials.' },
        { title: 'Marketing & Growth', body: 'Run experiments that drive qualified signups and campus trust.' },
        { title: 'Coding & IT', body: 'Ship new features, fix bugs, and keep everything running smoothly.' }
      ],
      caption: 'We don’t have a team yet - you’ll be in the builder seat.'
    },
    benefits: {
      heading: 'Volunteer experience benefits',
      subheading: 'Grow your skills while contributing to a safety-first platform for students and young professionals.'
    },
    apply: {
      heading: 'Tell us how you want to help',
      description: 'Choose your track, share your skills and time commitment, and we’ll get back to you.',
      note1: 'Founder-led review happens weekly. Once we scope your time, you’ll get a Notion board with project tasks and milestones.',
      note2: 'We have zero volunteers right now - so you’ll set the tone. We review applications weekly and align on a scoped project before you commit.',
      dialogCta: 'Open application form'
    }
  },
  nl: {
    hero: {
      badge: 'Early builder missie: veiligere, gelukkigere shared living',
      title: 'Word onderdeel van onze builders-community',
      body: 'We werken missiegedreven aan meer vertrouwen en veiligheid tussen huisgenoten. Sluit je aan als ervaren builder of als student die ervaring wil opdoen - iedere bijdrage heeft directe impact.',
      primary: 'Bekijk de tracks',
      secondary: 'Ontmoet de community',
      footnote: 'Werk rechtstreeks met de oprichter - kleine, gefocuste projecten met duidelijke resultaten.'
    },
    tracks: {
      heading: 'Twee manieren om mee te doen',
      subheading: 'Kies het pad dat bij jou past - allebei dragen ze direct bij aan onze missie.'
    },
    roles: {
      heading: 'Rolcatalogus per domein',
      subheading: 'Verken de capability areas en kies waar jij wilt bijdragen.'
    },
    focus: {
      heading: 'Huidige focus en prioriteiten',
      subheading: 'Plug in waar het nú het meest nodig is.',
      cards: [
        { title: 'Universiteitspartners', body: 'Help met outreach, pilots en materialen voor partners.' },
        { title: 'Marketing & Groei', body: 'Draai experimenten voor kwalitatieve aanmeldingen en campus trust.' },
        { title: 'Coding & IT', body: 'Bouw nieuwe features, fix bugs en houd alles stabiel.' }
      ],
      caption: 'We hebben nog geen team - jij zit in de builder seat.'
    },
    benefits: {
      heading: 'Voordelen voor vrijwilligers',
      subheading: 'Groei in je vaardigheden terwijl je bouwt aan een veilige community voor studenten en young professionals.'
    },
    apply: {
      heading: 'Vertel hoe jij wilt helpen',
      description: 'Kies je track, deel je skills en tijd, en wij nemen contact op.',
      note1: 'We reviewen wekelijks. Na de intake krijg je een Notion-board met taken en milestones.',
      note2: 'We hebben nu nog nul vrijwilligers - dus jij bepaalt de toon. We stemmen eerst een scoped project af.',
      dialogCta: 'Open het aanmeldformulier'
    }
  }
}

export function CareersContent() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <>
      <Section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-7">
            <div className="mb-3 flex items-center justify-center">
              <Badge
                variant="secondary"
                className="rounded-full border border-white/70 bg-white/55 text-xs font-semibold tracking-tight text-slate-700 px-4 py-1.5 backdrop-blur-xl shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                {t.hero.badge}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {t.hero.title.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                {t.hero.title.split(' ').slice(3).join(' ')}
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              {t.hero.body}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                asChild
                className="rounded-2xl bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90"
              >
                <a href="#tracks">{t.hero.primary}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-2xl border-white/70 bg-white/60 text-slate-800 hover:bg-white/75 hover:text-slate-900"
              >
                <a href="#roles">{t.hero.secondary}</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.footnote}
            </p>
          </div>
        </Container>
      </Section>

      <Section className="relative overflow-hidden !py-4 md:!py-6 lg:!py-8">
        <Container>
          <ProcessRibbon />
        </Container>
      </Section>

      <Section id="tracks" className="relative overflow-hidden">
        <Container>
          <div className="mx-auto max-w-5xl pt-8 pb-4 sm:pt-10 sm:pb-6">
            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
                {t.tracks.heading}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 max-w-3xl mx-auto">
                {t.tracks.subheading}
              </p>
            </div>
            <Tracks />
          </div>
        </Container>
      </Section>

      <Section id="roles" className="relative overflow-hidden">
        <Container>
          <div className="mx-auto max-w-5xl pt-1 pb-4 sm:pt-2 sm:pb-6">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
                {t.roles.heading}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 max-w-3xl mx-auto">
                {t.roles.subheading}
              </p>
            </div>
            <RoleCatalogCards />
          </div>
        </Container>
      </Section>

      <Section id="focus" className="relative overflow-hidden">
        <Container>
          <div className="mx-auto max-w-5xl py-5 sm:py-6">
            <div className="mb-3 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
                <span className="text-slate-800">
                  {t.focus.heading.split(' ')[0]} {t.focus.heading.split(' ')[1]}
                </span>{' '}
                {t.focus.heading.split(' ').slice(2).join(' ')}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 max-w-3xl mx-auto">
                {t.focus.subheading}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {t.focus.cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/60 bg-white/45 p-5 text-center text-slate-800 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="font-semibold text-slate-900">{card.title}</div>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-4 text-center">
              {t.focus.caption}
            </p>
          </div>
        </Container>
      </Section>

      <Section id="benefits" className="relative overflow-hidden">
        <Container>
          <div className="mx-auto max-w-5xl py-5 sm:py-6">
            <div className="mb-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
                {t.benefits.heading.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-slate-800">
                  {t.benefits.heading.split(' ').slice(-1)}
                </span>
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 max-w-3xl mx-auto">
                {t.benefits.subheading}
              </p>
            </div>
            <Benefits />
          </div>
        </Container>
      </Section>

      <Section id="apply" className="relative overflow-hidden pb-10 md:pb-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center py-10 sm:py-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
              {t.apply.heading.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="text-slate-800">
                {t.apply.heading.split(' ').slice(3).join(' ')}
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 max-w-3xl mx-auto">
              {t.apply.description}
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {t.apply.note1}
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {t.apply.note2}
            </p>
            <div className="mt-8 flex items-center justify-center">
              <ApplyDialog cta={t.apply.dialogCta} />
            </div>
          </div>
          <div className="py-6">
            <ApplyProcessFAQ />
          </div>
        </Container>
      </Section>
    </>
  )
}


