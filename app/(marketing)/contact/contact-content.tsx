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
    submit: 'Send',
    email: 'info@domumatch.com'
  },
  nl: {
    title: 'Contact',
    description: 'Vragen of feedback? Gebruik het formulier hieronder of mail ons op {email}.',
    namePlaceholder: 'Je naam',
    emailPlaceholder: 'E-mailadres',
    messagePlaceholder: 'Hoe kunnen we helpen?',
    submit: 'Versturen',
    email: 'info@domumatch.com'
  }
}

export function ContactContent() {
  const { locale } = useApp()
  const t = content[locale]
  const descriptionParts = t.description.split('{email}')

  return (
    <Section className="bg-slate-950">
      <Container>
        <h1 className="text-4xl font-bold mb-6 text-white">{t.title}</h1>
        <p className="text-slate-400 mb-8 max-w-2xl">
          {descriptionParts[0]}
          <a href={`mailto:${t.email}`} className="font-medium text-violet-400 hover:text-violet-300">
            {t.email}
          </a>
          {descriptionParts[1]}
        </p>

        <form className="grid gap-4 max-w-xl">
          <input
            className="border border-slate-600 rounded-lg px-4 py-3 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder={t.namePlaceholder}
          />
          <input
            className="border border-slate-600 rounded-lg px-4 py-3 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder={t.emailPlaceholder}
            type="email"
          />
          <textarea
            className="border border-slate-600 rounded-lg px-4 py-3 h-40 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            placeholder={t.messagePlaceholder}
          />
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-lg font-medium transition-colors">
            {t.submit}
          </button>
        </form>
      </Container>
    </Section>
  )
}

