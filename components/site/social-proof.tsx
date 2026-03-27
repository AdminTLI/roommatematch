'use client'

import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    title: "What we've heard so far",
    subtitle:
      'Notes from early conversations we’ve had with a BUas student, a community manager from Breda Internationals, and senior international leadership at BUas.',
    summaryTitle: 'From real conversations',
    summaryNote:
      'These are paraphrased quotes from people we’ve spoken with while building Roommate Match. No ratings, no fake reviews.',
    reviews: [
      {
        title: 'So much time lost to searching',
        body: `After graduating in Breda and leaving my student accommodation, an app like this would have helped me so many times. There were moments where I had to message and interview 20 to 30 students just to find the right replacement - a platform like this would’ve saved me a lot of time and hassle.`,
        source: 'Recent Graduate from BUas',
        meta: 'Described the typical “find-a-replacement” process',
      },
      {
        title: 'When the household fit is wrong',
        body: `During my studies in the Netherlands, there were many times where I wanted to leave and find a new place to stay because I just wasn’t able to get along with the people I lived with.`,
        source: 'Community Manager from Breda Internationals',
        meta: 'Shared while discussing roommate compatibility',
      },
      {
        title: 'A retention lever for universities',
        body: `Even with Dutch policies reducing international students, retention is still a focus for our university. An app like this can definitely help retain students - we’re hopeful to have something like it around us in the near future.`,
        source: 'Senior International Leadership at BUas',
        meta: 'Commented on student retention and support',
      },
    ],
  },
  nl: {
    title: 'Wat we tot nu toe hebben gehoord',
    subtitle:
      'Notities uit vroege gesprekken die we hebben gehad met een BUas-student, een community manager van Breda Internationals, en senior internationale leiding binnen BUas.',
    summaryTitle: 'Uit echte gesprekken',
    summaryNote:
      'Dit zijn geparafraseerde quotes van mensen met wie we hebben gesproken terwijl we Roommate Match bouwen. Geen ratings, geen neppe reviews.',
    reviews: [
      {
        title: 'Zóveel tijd kwijt aan zoeken',
        body: `Na mijn afstuderen in Breda en het verlaten van mijn studentenhuisvesting had een app als deze me zó vaak geholpen. Soms moest ik 20–30 studenten appen en spreken om de juiste vervanger te vinden - dit had me veel tijd en gedoe gescheeld.`,
        source: 'Recent afgestudeerd (Breda)',
        meta: 'Over het “vervanger zoeken”-proces',
      },
      {
        title: 'Als de klik in huis ontbreekt',
        body: `Tijdens mijn studie in Nederland heb ik zo vaak willen verhuizen, omdat ik gewoon niet goed overweg kon met de mensen in huis.`,
        source: 'Community manager van Breda Internationals',
        meta: 'Gedeeld in een gesprek over matchen op woonstijl',
      },
      {
        title: 'Retention is nog steeds belangrijk',
        body: `Ondanks beleid om het aantal internationale studenten te verlagen, blijft retentie een focus voor onze universiteit. Zo’n app kan zeker helpen om studenten te behouden - hopelijk zien we dit in de nabije toekomst terug.`,
        source: 'Universiteitsmedewerker (NL)',
        meta: 'Over retentie en studentondersteuning',
      },
    ],
  },
}

export function SocialProof() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <Section className="py-10 md:py-14 lg:py-16">
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
            {t.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">{t.subtitle}</p>
        </div>

        <div className={cn(GLASS, 'mt-8 p-6 sm:p-7')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/60">
                <span className="text-lg font-bold text-slate-800">“”</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.summaryTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{t.summaryNote}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.reviews.map((r) => (
            <article key={`${r.source}-${r.title}`} className={cn(GLASS, 'p-7')}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">{r.source}</span>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.body}</p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/50 pt-5">
                <div className="min-w-0">
                  <p className="text-xs text-slate-600 leading-snug break-words">{r.meta}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}

