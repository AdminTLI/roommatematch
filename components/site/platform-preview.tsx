'use client'

import { useMemo, useState } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'
import { PlatformPreviewCard, type PlatformPreviewCardData } from '@/components/site/platform-preview-card'

type PreviewMode = 'student' | 'professional'

const copy = {
  en: {
    title: 'Peek inside the app',
    subtitle:
      'Tap around to flip the card and explore the breakdown. Use the Student / Professional toggle to see how profiles change by life stage. Detailed dimension scores are category-by-category fit (sleep, guests, cleanliness, etc.) based on your answers - higher means closer preferences.',
    student: 'Student',
    professional: 'Professional',
    demo: 'Demo preview - sample profiles.',
    match: 'Match',
    whyTitle: 'Why you match',
    expand: 'Show why',
    collapse: 'Hide why',
    fields: {
      context: 'Context',
      interests: 'Interests',
      housing: 'Housing status',
      city: 'Preferred city',
      budget: 'Budget',
      wfh: 'WFH',
      schedule: 'Schedule',
    },
  },
  nl: {
    title: 'Kijk even in de app',
    subtitle:
      'Klik rond om de kaart te flippen en de breakdown te bekijken. Gebruik de Student / Professional toggle om te zien hoe profielen per levensfase veranderen. Detailed dimension scores zijn scores per categorie (slaap, gasten, schoon, etc.) op basis van jullie antwoorden - hoe hoger, hoe beter de match.',
    student: 'Student',
    professional: 'Professional',
    demo: 'Demo preview - voorbeeldprofielen.',
    match: 'Match',
    whyTitle: 'Waarom het klikt',
    expand: 'Toon waarom',
    collapse: 'Verberg waarom',
    fields: {
      context: 'Context',
      interests: 'Interesses',
      housing: 'Woonstatus',
      city: 'Voorkeursstad',
      budget: 'Budget',
      wfh: 'WFH',
      schedule: 'Schema',
    },
  },
}

export function PlatformPreview() {
  const { locale } = useApp()
  const t = copy[locale]

  const [mode, setMode] = useState<PreviewMode>('student')

  const data: PlatformPreviewCardData = useMemo(() => {
    const base = {
      matchPercent: 91,
      harmonyPercent: 90,
      contextPercent: 88,
      highlights:
        locale === 'nl'
          ? ['Gedeelde interesses', 'Vergelijkbare context', 'Fijne huisvibe']
          : ['Shared interests', 'Similar context', 'Compatible home vibe'],
      dimensions: {
        cleanliness: 92,
        noise: 86,
        guests: 84,
        sleep: 88,
        shared_spaces: 90,
        substances: 85,
        study_social: 89,
        home_vibe: 91,
      },
    } as const

    if (mode === 'student') {
      return {
        name: 'Sanne de Vries',
        matchPercent: base.matchPercent,
        harmonyPercent: base.harmonyPercent,
        contextPercent: base.contextPercent,
        contextLine:
          locale === 'nl'
            ? 'Universiteit van Amsterdam • Rechten • Jaar 1'
            : 'University of Amsterdam • Law • Year 1',
        highlights: [...base.highlights],
        dimensions: { ...base.dimensions },
      }
    }

    return {
      name: 'Milan',
      matchPercent: 90,
      harmonyPercent: 89,
      contextPercent: 86,
      contextLine:
        locale === 'nl'
          ? 'Young professional • Hybride • Breda'
          : 'Young professional • Hybrid • Breda',
      highlights:
        locale === 'nl'
          ? ['Rustige communicatie', 'Gedeelde interesses', 'Fijne huisvibe']
          : ['Calm communication', 'Shared interests', 'Similar home vibe'],
      dimensions: { ...base.dimensions, guests: 82, substances: 88 },
    }
  }, [locale, mode])

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        {/* Dating-app style: one clear card focal point */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-stretch">
          <div className="space-y-4 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
              {t.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl">
              {t.subtitle}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                className={cn(
                  'rounded-full',
                  mode === 'student'
                    ? 'bg-slate-900 text-white hover:bg-slate-900/90'
                    : 'bg-white/60 text-slate-800 border border-white/70 hover:bg-white/80'
                )}
                onClick={() => setMode('student')}
              >
                {t.student}
              </Button>
              <Button
                type="button"
                size="sm"
                className={cn(
                  'rounded-full',
                  mode === 'professional'
                    ? 'bg-slate-900 text-white hover:bg-slate-900/90'
                    : 'bg-white/60 text-slate-800 border border-white/70 hover:bg-white/80'
                )}
                onClick={() => setMode('professional')}
              >
                {t.professional}
              </Button>
            </div>
          </div>

          <div className="relative lg:order-1">
            <div className="relative mx-auto max-w-[460px] h-[660px] overflow-visible scale-100 lg:scale-95 origin-center">
              <PlatformPreviewCard
                locale={locale}
                data={data}
                heightClassName="h-[660px]"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

