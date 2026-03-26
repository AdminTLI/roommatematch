'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { useState } from 'react'
import { toast } from 'sonner'

const content = {
  en: {
    title: 'Contact',
    description: 'Questions or feedback? Use the form below or email us at {email}.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Email',
    messagePlaceholder: 'How can we help?',
    topicPlaceholder: 'What is your message about?',
    submit: 'Send',
    email: 'domumatch@gmail.com'
  },
  nl: {
    title: 'Contact',
    description: 'Vragen of feedback? Gebruik het formulier hieronder of mail ons op {email}.',
    namePlaceholder: 'Je naam',
    emailPlaceholder: 'E-mailadres',
    messagePlaceholder: 'Hoe kunnen we helpen?',
    topicPlaceholder: 'Waar gaat je bericht over?',
    submit: 'Versturen',
    email: 'domumatch@gmail.com'
  }
}

export function ContactContent() {
  const { locale } = useApp()
  const t = content[locale]
  const descriptionParts = t.description.split('{email}')
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')

  const canSubmit = name.trim().length >= 2 && email.trim().length >= 3 && topic.trim().length >= 2 && message.trim().length >= 10

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!canSubmit) {
      const missing: string[] = []
      if (name.trim().length < 2) missing.push(locale === 'nl' ? 'naam' : 'name')
      if (email.trim().length < 3) missing.push(locale === 'nl' ? 'e-mail' : 'email')
      if (topic.trim().length < 2) missing.push(locale === 'nl' ? 'onderwerp' : 'topic')
      if (message.trim().length < 10) missing.push(locale === 'nl' ? 'bericht' : 'message')

      toast.error(
        locale === 'nl'
          ? `Vul het volgende in: ${missing.join(', ')}.`
          : `Please fill in: ${missing.join(', ')}.`
      )
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topic.trim(),
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to send message')
      }

      toast.success(locale === 'nl' ? 'Bericht verzonden. We nemen snel contact op.' : 'Message sent. We’ll get back to you soon.')
      setName('')
      setEmail('')
      setTopic('')
      setMessage('')
    } catch (err: any) {
      toast.error(err?.message || (locale === 'nl' ? 'Er ging iets mis.' : 'Something went wrong.'))
    } finally {
      setSubmitting(false)
    }
  }

  const topics =
    locale === 'nl'
      ? [
          'Gebruik van Domu Match (studenten & young professionals)',
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
          'Using Domu Match (students & young professionals)',
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
    <Section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600/70" aria-hidden />
            Domu Match
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            {t.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto">
            {descriptionParts[0]}
            <a
              href={`mailto:${t.email}`}
              className="font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-400/40"
            >
              {t.email}
            </a>
            {descriptionParts[1]}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <form className="grid gap-4" onSubmit={onSubmit}>
              <input
                className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                placeholder={t.emailPlaceholder}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select
                className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="" disabled className="text-slate-500">
                  {t.topicPlaceholder}
                </option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-[160px] rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none resize-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                placeholder={t.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (locale === 'nl' ? 'Versturen…' : 'Sending…') : t.submit}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  )
}

