'use client'

import { PastelMeshBackground } from '@/components/site/pastel-mesh-background'
import { MarketingNavbarLight } from '@/components/site/marketing-navbar-light'
import { MarketingLayoutFixLight } from '../components/marketing-layout-fix-light'
import Footer from '@/components/site/footer'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ShieldCheck, Users, Sparkles, Rocket, FileCheck2, Wrench, Scale } from 'lucide-react'
import { useApp } from '@/app/providers'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const formUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSddXhmGZ3dqlQRqkf-C3yOXXwYJHboiRsH0mVJQTp3m5UhtZQ/viewform?usp=dialog'

type Perk = { icon: LucideIcon; title: string; description: string }
type Expectation = { icon: LucideIcon; title: string; description: string }

const copy: Record<
  Locale,
  {
    skipLink: string
    badge: string
    heroTitleBefore: string
    heroTitleGradient: string
    heroTitleAfter: string
    heroLead: string
    ctaPrimary: string
    stat1Title: string
    stat1Body: string
    stat2Title: string
    stat2Body: string
    stat3Title: string
    stat3Body: string
    perksEyebrow: string
    perksTitle: string
    perksLead: string
    perks: Perk[]
    finePrintEyebrow: string
    finePrintTitle: string
    finePrintLead: string
    expectations: Expectation[]
    finalTitle: string
    finalBody: string
    ctaSecondary: string
  }
> = {
  en: {
    skipLink: 'Skip to main content',
    badge: 'Invite-only beta',
    heroTitleBefore: 'Join the Domu Match ',
    heroTitleGradient: 'Founding Circle.',
    heroTitleAfter: '',
    heroLead:
      "We're revolutionizing how students and young professionals find roommates. Join our exclusive, invite-only Beta to find your perfect match before the public launch — and help us build the platform you actually want to use.",
    ctaPrimary: 'Apply for Beta Access',
    stat1Title: 'First wave',
    stat1Body: 'Early testers get direct founder access and the most influence.',
    stat2Title: 'Real impact',
    stat2Body: 'Your feedback will shape the product roadmap before public launch.',
    stat3Title: 'Limited spots',
    stat3Body: "We're intentionally keeping this cohort small and high-quality.",
    perksEyebrow: 'Why join now',
    perksTitle: 'Early access with real upside.',
    perksLead:
      "This isn't just a waitlist. It's a founding opportunity to get meaningful perks, influence product decisions, and be recognized as an early builder.",
    perks: [
      {
        icon: ShieldCheck,
        title: 'Lifetime VIP Status.',
        description:
          "Get free lifetime access to Domu Match and a permanent 'Founding Member' badge on your profile so everyone knows you were here first.",
      },
      {
        icon: Users,
        title: 'The Inner Circle.',
        description:
          'Gain access to a private community of like-minded early adopters and receive exclusive invites to Domu Match real-world events.',
      },
      {
        icon: Rocket,
        title: 'Shape the Future (And your CV).',
        description:
          "Work directly with our founders to dictate what features we build next. Active testers receive a personalized professional endorsement for 'Product Advisory'.",
      },
    ],
    finePrintEyebrow: 'The fine print',
    finePrintTitle: 'What it means to be a Beta Tester.',
    finePrintLead: "Clear expectations up front, so you know exactly what you're signing up for.",
    expectations: [
      {
        icon: Wrench,
        title: "It's a work in progress",
        description:
          "You will encounter bugs, missing features, and weird glitches. That's the point! Your feedback helps us fix them.",
      },
      {
        icon: Sparkles,
        title: 'You are a volunteer',
        description:
          'This is an unpaid program for early believers who want to solve the roommate crisis and find great people to live with.',
      },
      {
        icon: FileCheck2,
        title: 'Confidentiality',
        description:
          "Because you're getting a behind-the-scenes look at unreleased technology, we ask all testers to sign a standard Non-Disclosure Agreement (NDA).",
      },
      {
        icon: Scale,
        title: 'Liability',
        description:
          'We provide this beta "as-is" without warranties. You help us test it, and we promise to listen to your feedback.',
      },
    ],
    finalTitle: 'Ready to shape the future of shared living?',
    finalBody:
      'Become one of the earliest Domu Match testers and help define the product before everyone else arrives.',
    ctaSecondary: 'Take me to the Application Form',
  },
  nl: {
    skipLink: 'Ga naar hoofdinhoud',
    badge: 'Alleen op uitnodiging (bèta)',
    heroTitleBefore: 'Word lid van de ',
    heroTitleGradient: 'Founding Circle',
    heroTitleAfter: ' van Domu Match.',
    heroLead:
      'We veranderen hoe studenten en young professionals een huisgenoot vinden. Doe mee met onze exclusieve bèta: vind je match vóór de publieke launch én help ons het platform te bouwen dat jij écht wilt gebruiken.',
    ctaPrimary: 'Meld je aan voor bèta',
    stat1Title: 'Eerste golf',
    stat1Body: 'Vroege testers krijgen direct toegang tot de founders en de meeste invloed.',
    stat2Title: 'Echte impact',
    stat2Body: 'Jouw feedback bepaalt de roadmap vóór de publieke launch.',
    stat3Title: 'Beperkte plekken',
    stat3Body: 'We houden deze groep bewust klein en kwalitatief sterk.',
    perksEyebrow: 'Waarom nu meedoen',
    perksTitle: 'Vroege toegang met echte voordelen.',
    perksLead:
      'Dit is geen wachtlijst. Het is een kans om founding-perks te krijgen, productkeuzes mee te bepalen en zichtbaar early builder te zijn.',
    perks: [
      {
        icon: ShieldCheck,
        title: 'Lifetime VIP-status.',
        description:
          'Gratis levenslange toegang tot Domu Match en een permanente “Founding Member”-badge op je profiel.',
      },
      {
        icon: Users,
        title: 'De inner circle.',
        description:
          'Toegang tot een besloten community van early adopters en exclusieve uitnodigingen voor Domu Match-events.',
      },
      {
        icon: Rocket,
        title: 'Bepaal de toekomst (én je CV).',
        description:
          'Werk direct met de founders aan de volgende features. Actieve testers krijgen een persoonlijke professionele aanbeveling voor productadvies.',
      },
    ],
    finePrintEyebrow: 'Kleine lettertjes',
    finePrintTitle: 'Wat bèta-testen betekent.',
    finePrintLead: 'Heldere afspraken, zodat je weet waar je aan begint.',
    expectations: [
      {
        icon: Wrench,
        title: 'Het is work in progress',
        description:
          'Je komt bugs, ontbrekende features en rare glitches tegen. Dat hoort erbij — jouw feedback helpt ons verbeteren.',
      },
      {
        icon: Sparkles,
        title: 'Je bent vrijwilliger',
        description:
          'Onbetaald programma voor mensen die het huisgenootprobleem willen oplossen en goede huisgenoten willen vinden.',
      },
      {
        icon: FileCheck2,
        title: 'Vertrouwelijkheid',
        description:
          'Je ziet technologie die nog niet uit is; we vragen daarom een standaard geheimhoudingsverklaring (NDA).',
      },
      {
        icon: Scale,
        title: 'Aansprakelijkheid',
        description:
          'Deze bèta leveren we “as-is” zonder garanties. Jij helpt testen; wij luisteren naar je feedback.',
      },
    ],
    finalTitle: 'Klaar om mee te bouwen aan de toekomst van samenwonen?',
    finalBody:
      'Word een van de eerste testers van Domu Match en help het product vorm te geven vóór iedereen meedoet.',
    ctaSecondary: 'Naar het aanmeldformulier',
  },
}

export function BetaPageContent() {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <main id="main-content" className="relative overflow-hidden pt-16 md:pt-20">
      <PastelMeshBackground />

      <div className="relative z-10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-md"
        >
          {t.skipLink}
        </a>
        <MarketingLayoutFixLight />
        <MarketingNavbarLight />

        <Section className="py-14 md:py-20 lg:py-24">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl px-4 py-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-blue-600" aria-hidden />
                  {t.badge}
                </div>
                <h1 className="mt-5 text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {t.heroTitleBefore}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                    {t.heroTitleGradient}
                  </span>
                  {t.heroTitleAfter}
                </h1>
                <p className="mt-5 max-w-3xl text-slate-700 text-base sm:text-lg leading-relaxed">{t.heroLead}</p>
                <div className="mt-8">
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-4 transition-colors"
                  >
                    {t.ctaPrimary}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">{t.stat1Title}</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">{t.stat1Body}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">{t.stat2Title}</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">{t.stat2Body}</p>
                </div>
                <div className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-5">
                  <div className="text-slate-900 text-2xl font-bold">{t.stat3Title}</div>
                  <p className="mt-2 text-slate-700 text-sm leading-relaxed">{t.stat3Body}</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="py-10 md:py-14 lg:py-16">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">{t.perksEyebrow}</p>
                <h2 className="mt-3 text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">{t.perksTitle}</h2>
                <p className="mt-4 text-slate-700 leading-relaxed">{t.perksLead}</p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {t.perks.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <article
                      key={perk.title}
                      className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-7 sm:p-8"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl">
                        <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                      </div>
                      <h3 className="mt-4 text-slate-900 text-xl font-semibold tracking-tight">{perk.title}</h3>
                      <p className="mt-3 text-slate-700 leading-relaxed">{perk.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </Container>
        </Section>

        <Section className="py-10 md:py-14 lg:py-16">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">{t.finePrintEyebrow}</p>
                <h2 className="mt-3 text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">{t.finePrintTitle}</h2>
                <p className="mt-4 text-slate-700 leading-relaxed">{t.finePrintLead}</p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {t.expectations.map((item) => {
                  const Icon = item.icon
                  return (
                    <article
                      key={item.title}
                      className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-6 sm:p-7"
                    >
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl">
                          <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                        </div>
                        <h3 className="min-w-0 text-slate-900 text-lg font-semibold tracking-tight leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-slate-700 leading-relaxed">{item.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </Container>
        </Section>

        <Section className="pt-10 pb-16 md:pt-14 md:pb-24">
          <Container className="relative z-10 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-8 sm:p-10">
              <div className="lg:col-span-8">
                <p className="text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight">{t.finalTitle}</p>
                <p className="mt-3 text-slate-700 leading-relaxed max-w-2xl">{t.finalBody}</p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full lg:w-auto items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-4 transition-colors"
                >
                  {t.ctaSecondary}
                </a>
              </div>
            </div>
          </Container>
        </Section>

        <Footer />
      </div>
    </main>
  )
}
