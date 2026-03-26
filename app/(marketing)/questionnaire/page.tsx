'use client'

import { useState } from 'react'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'

type Answer = string | number | boolean

const content = {
  en: {
    title: 'Compatibility Questionnaire',
    description: 'Answer a few quick questions to improve your matches. You can update answers later in your profile.',
    continue: 'Continue',
    questions: [
      { key: 'sleepSchedule', label: 'Sleep schedule', options: ['Early', 'Regular', 'Late'] },
      { key: 'cleanliness', label: 'Cleanliness preference', options: ['Very tidy', 'Tidy', 'Laid back'] },
      { key: 'studyHabits', label: 'Study habits', options: ['Quiet at home', 'Library', 'Group study at home'] },
      { key: 'social', label: 'Social activity at home', options: ['Low', 'Medium', 'High'] },
      { key: 'budget', label: 'Monthly budget (€)', options: ['400-600', '600-800', '800+'] },
      { key: 'pets', label: 'Comfortable with pets', options: ['Yes', 'No'] },
    ],
  },
  nl: {
    title: 'Compatibiliteitsvragenlijst',
    description: 'Beantwoord een paar snelle vragen om je matches te verbeteren. Je kunt je antwoorden later altijd aanpassen.',
    continue: 'Doorgaan',
    questions: [
      { key: 'sleepSchedule', label: 'Slaappatroon', options: ['Vroeg', 'Normaal', 'Laat'] },
      { key: 'cleanliness', label: 'Voorkeur voor netheid', options: ['Zeer netjes', 'Netjes', 'Ontspannen'] },
      { key: 'studyHabits', label: 'Studiegewoonten', options: ['Rustig thuis', 'Bibliotheek', 'Groepsstudie thuis'] },
      { key: 'social', label: 'Sociale activiteit thuis', options: ['Laag', 'Gemiddeld', 'Hoog'] },
      { key: 'budget', label: 'Maandelijks budget (€)', options: ['400-600', '600-800', '800+'] },
      { key: 'pets', label: 'Comfortabel met huisdieren', options: ['Ja', 'Nee'] },
    ],
  },
}

export default function QuestionnairePage() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale]

  const setAnswer = (key: string, value: Answer) => setAnswers(prev => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    // For now, store locally and route to signup if not logged in
    localStorage.setItem('qm_temp_answers', JSON.stringify(answers))
    router.push('/auth/sign-up')
  }

  return (
    <MarketingSubpageWrapperLight>
      <Section className="py-10 md:py-14 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600/70" aria-hidden />
                Domu Match
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {t.title}
              </h1>
              <p className="mt-3 text-slate-700 max-w-2xl">
                {t.description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
              <div className="grid gap-6">
                {t.questions.map((q) => (
                  <div key={q.key}>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      {q.label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((o) => {
                        const selected = answers[q.key] === o
                        return (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setAnswer(q.key, o)}
                            className={[
                              'px-4 py-2 rounded-2xl border text-sm font-semibold transition-colors',
                              selected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)]'
                                : 'bg-white/60 border-white/70 text-slate-800 hover:bg-white/75',
                            ].join(' ')}
                          >
                            {o}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSubmit}
                  className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-900/90 shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                >
                  {t.continue}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapperLight>
  )
}


