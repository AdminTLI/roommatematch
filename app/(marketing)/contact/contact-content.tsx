'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Contact',
    description: 'Questions or feedback? Use the form below or email us at {email}.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Email',
    messagePlaceholder: 'How can we help?',
    topicPlaceholder: 'What is your message about?',
    submit: 'Send',
    email: 'info@domumatch.com'
  },
  nl: {
    title: 'Contact',
    description: 'Vragen of feedback? Gebruik het formulier hieronder of mail ons op {email}.',
    namePlaceholder: 'Je naam',
    emailPlaceholder: 'E-mailadres',
    messagePlaceholder: 'Hoe kunnen we helpen?',
    topicPlaceholder: 'Waar gaat je bericht over?',
    submit: 'Versturen',
    email: 'info@domumatch.com'
  }
}

export function ContactContent() {
  const { locale } = useApp()
  const t = content[locale]
  const descriptionParts = t.description.split('{email}')

  const topics =
    locale === 'nl'
      ? [
          'Gebruik van Domu Match (studenten & huisgenoten)',
          'Problemen met account, verificatie of onboarding',
          'Vragen over matches, veiligheid of rapporteren',
          'Universiteitspartnerschap of pilot',
          'Prijsstelling, ROI of gegevens voor universiteiten',
          'Woningaanbieders / huisvestingspartners',
          'Samenwerking met andere bedrijven of organisaties',
          'Investering of aandeelhoudersrelatie',
          'Pers, media of spreekverzoeken',
          'Juridische, privacy- of beveiligingsvraag',
          'Algemene feedback of iets anders',
        ]
      : [
          'Using Domu Match (students & roommates)',
          'Account, verification or onboarding issues',
          'Questions about matches, safety or reporting',
          'University partnership or pilot',
          'Pricing, ROI or data for universities',
          'Housing providers / accommodation partners',
          'Collaboration with other companies or organisations',
          'Investment or shareholder relations',
          'Press, media or speaking requests',
          'Legal, privacy or security questions',
          'General feedback or something else',
        ]

  return (
    <Section className="relative overflow-hidden bg-slate-950">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 via-purple-950/35 to-slate-950" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/18 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/18 blur-3xl" />
      </div>
      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl pb-10 pt-8 sm:pt-10 sm:pb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {t.title}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl">
            {descriptionParts[0]}
            <a
              href={`mailto:${t.email}`}
              className="font-medium text-sky-300 hover:text-sky-200 underline underline-offset-4 decoration-sky-400/60"
            >
              {t.email}
            </a>
            {descriptionParts[1]}
          </p>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <form className="grid gap-4">
              <input
                className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-300/70"
                placeholder={t.namePlaceholder}
              />
              <input
                className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-300/70"
                placeholder={t.emailPlaceholder}
                type="email"
              />
              <select
                className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-300/70"
                defaultValue=""
              >
                <option value="" disabled className="bg-slate-900 text-white/60">
                  {t.topicPlaceholder}
                </option>
                {topics.map((topic) => (
                  <option key={topic} value={topic} className="bg-slate-900 text-white">
                    {topic}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-[160px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none resize-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-300/70"
                placeholder={t.messagePlaceholder}
              />
              <button
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.8)] transition-colors hover:from-indigo-400 hover:to-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                type="submit"
              >
                {t.submit}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  )
}

