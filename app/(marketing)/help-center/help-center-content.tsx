'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Help Center',
    faqs: [
      { q: 'Getting started', a: 'Create an account, verify your identity, and complete the compatibility quiz.' },
      { q: 'Account & verification', a: 'We verify with government ID + selfie and university email for safety.' },
      { q: 'Matching & scores', a: 'Scores are based on 40+ factors. We show why you matched for transparency.' },
      { q: 'Safety & reporting', a: 'Report any concern from a profile or chat. Our team reviews every report.' }
    ]
  },
  nl: {
    title: 'Helpcentrum',
    faqs: [
      { q: 'Aan de slag', a: 'Maak een account aan, verifieer je identiteit en vul de compatibiliteitsquiz in.' },
      { q: 'Account & verificatie', a: 'We verifiëren met een overheid-ID + selfie en je universiteitsmail voor veiligheid.' },
      { q: 'Matching & scores', a: 'Scores zijn gebaseerd op meer dan 40 factoren. We tonen waarom je een match bent voor transparantie.' },
      { q: 'Veiligheid & meldingen', a: 'Meld een zorg direct vanuit een profiel of chat. Ons team beoordeelt elke melding.' }
    ]
  }
}

export function HelpCenterContent() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="bg-white">
      <Container>
        <h1 className="text-4xl font-bold mb-6 text-brand-text">{t.title}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {t.faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-brand-border bg-white p-6">
              <h2 className="text-xl font-semibold mb-2">{faq.q}</h2>
              <p className="text-brand-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}


