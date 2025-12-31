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
    <Section className="bg-white">
      <Container>
        <h1 className="text-4xl font-bold mb-6 text-brand-text">{t.title}</h1>
        <p className="text-brand-muted mb-8 max-w-2xl">
          {descriptionParts[0]}
          <span className="font-medium">{t.email}</span>
          {descriptionParts[1]}
        </p>

        <form className="grid gap-4 max-w-xl">
          <input className="border rounded-md px-4 py-3" placeholder={t.namePlaceholder} />
          <input className="border rounded-md px-4 py-3" placeholder={t.emailPlaceholder} type="email" />
          <textarea className="border rounded-md px-4 py-3 h-40" placeholder={t.messagePlaceholder} />
          <button className="bg-brand-600 text-white px-5 py-3 rounded-md">
            {t.submit}
          </button>
        </form>
      </Container>
    </Section>
  )
}

