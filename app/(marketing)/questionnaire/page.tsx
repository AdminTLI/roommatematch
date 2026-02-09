'use client'

import { useState } from 'react'
import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
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
    <MarketingSubpageWrapper>
      <Section className="bg-slate-950">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-white">{t.title}</h1>
          <p className="text-slate-400 mb-8 max-w-2xl">{t.description}</p>

          <div className="grid gap-6 max-w-2xl">
            {t.questions.map(q => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-slate-200 mb-2">{q.label}</label>
                <div className="flex flex-wrap gap-2">
                  {q.options.map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setAnswer(q.key, o)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${answers[q.key] === o ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-800/50 border-slate-600 text-slate-200 hover:border-slate-500'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-500 text-white">{t.continue}</Button>
          </div>
        </Container>
      </Section>
    </MarketingSubpageWrapper>
  )
}


