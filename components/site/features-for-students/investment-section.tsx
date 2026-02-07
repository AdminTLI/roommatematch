'use client'

import { useRouter } from 'next/navigation'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'

export function InvestmentSection() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].investment

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  return (
    <Section
      id="investment"
      className="bg-gradient-to-b from-slate-50 to-indigo-50/50"
      aria-labelledby="investment-heading"
    >
      <Container>
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 md:p-12 text-center shadow-elev-1">
          <div className="flex justify-center mb-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100"
              aria-hidden
            >
              <Clock className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <h2
            id="investment-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            {t.heading}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.copy}
          </p>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[48px] px-8 rounded-2xl border-0 shadow-lg"
            onClick={handleGetStarted}
          >
            {locale === 'nl' ? 'Begin de quiz' : 'Start the quiz'}
          </Button>
        </div>
      </Container>
    </Section>
  )
}
