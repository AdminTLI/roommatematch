'use client'

import { useApp } from '@/app/providers'
import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Timeline } from '@/components/about/timeline'
import { EvidenceTile } from '@/components/about/evidence-tile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Lightbulb, Shield, BookOpen, Target, GraduationCap, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const content = {
  en: {
    hero: {
      titlePrefix: 'Our Mission:',
      titleHighlight: 'Better Roommate Matches Through Science',
      description: "We believe finding a compatible roommate shouldn't be a gamble. Domu Match is a science-driven platform that uses compatibility research to help students find roommates they'll actually get along with. Safety, transparency, and evidence-based matching guide everything we do."
    },
    story: {
      heading: 'Our Story',
      subheading: "How we started, what drives us, and where we're headed.",
      paragraphs: [
        "Finding a good roommate shouldn't be a gamble. Yet for millions of students every year, it is. You fill out a form, get randomly assigned, and hope for the best. Sometimes it works out. Often it doesn't.",
        "Domu Match was founded by Danish Samsudin, Founder and Developer, who saw the same problem play out again and again: students struggling with roommate conflicts that hurt their grades, their mental health, and their university experience. Research shows that nearly half of all students face frequent or occasional conflict with their roommates. That's not acceptable.",
        "So we built a better way. We use compatibility science—the same principles that help people form lasting friendships—to match students based on lifestyle, personality, and academic factors. We verify every user. We make the matching process transparent. And we partner with universities to make this the standard for student housing.",
        'Our goal is simple: make student living safer, happier, and more compatible. One match at a time.'
      ],
      founderQuote: 'We started Domu Match because we saw too many students struggling with roommate conflicts. Our mission is to use science and technology to create better matches—matches that last.',
      founderTitle: 'Founder and Developer'
    },
    timeline: [
      { title: 'The Problem Identified', description: "We recognized that nearly half of all students face roommate conflicts that impact well-being and academic performance. Random assignment wasn't working.", date: '2025 August' },
      { title: 'Research Phase', description: 'We analyzed peer-reviewed studies on compatibility, peer effects, and student housing satisfaction from Nature and other leading sources.', date: '2025 September' },
      { title: 'Algorithm Development', description: 'We built a science-driven algorithm that analyzes 40+ lifestyle and academic factors, informed by social compatibility research.', date: '2025 October' },
      { title: 'Launch', description: 'We launched Domu Match with transparent, explainable matching backed by verification and safety measures.', date: '2025 November' },
      { title: 'Growing Impact', description: "We're now helping students across multiple universities find better matches and making science-backed matching the standard.", date: 'Present' }
    ],
    vision: {
      heading: "Where We're Headed",
      intro: 'Our vision is to make science-backed roommate matching the standard for student housing. Every student deserves compatibility-based matching that considers lifestyle, personality, and academics.',
      shortTermTitle: 'Short-term goals',
      shortTerm: [
        'Expand partnerships with universities across the Netherlands',
        'Build a community of verified students finding better matches',
        'Continuously tune the matching model using outcomes and feedback',
        'Launch student-created group chats to form houses faster',
        'Introduce richer profiles with bios, interests, and highlights'
      ],
      longTermTitle: 'Long-term vision',
      longTerm: [
        'Partner with housing agencies to offer compatibility-matched rooms',
        'Provide in-platform legal contracts students can review and sign',
        'Enable roommate agreements to set expectations and accountability',
        'Offer individual and group calling for deeper conversations',
        'Launch mobile apps so Domu Match is accessible everywhere'
      ]
    },
    evidence: {
      headingHighlight: 'The Evidence:',
      headingSuffix: 'Why Compatibility Matters',
      description: "Research shows that compatibility impacts academic performance, retention, and satisfaction. Here's what the data tells us.",
      tiles: [
        {
          statistic: '47.9%',
          title: 'Report Roommate Conflict',
          explanation: 'Nearly half of students face ongoing conflict. Negative peer effects hurt grades, well-being, and retention.',
          source: 'Golding et al., "Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students"',
          solution: "We analyze 40+ factors—study habits, cleanliness, social needs—to prevent conflict before it starts.",
          icon: 'Users' as const
        },
        {
          statistic: '67.6%',
          title: 'Want to Switch Rooms',
          explanation: 'Bad matches create churn, stress, and extra work for housing teams.',
          source: 'Deng (Empirical Study of Dormitory Conflict)',
          solution: 'Transparent matching helps students make informed choices, reducing churn and improving retention.',
          icon: 'TrendingUp' as const
        },
        {
          statistic: '70%',
          title: 'Satisfied When Compatible',
          explanation: 'Prioritizing compatibility drives housing satisfaction and retention.',
          source: 'InsideHigherEd coverage of SDSU survey (2024)',
          solution: 'Our science-backed approach helps students find roommates as compatible as their best friends.',
          icon: 'Shield' as const
        }
      ],
      insightTitle: 'Why Compatibility Matters: Peer Effects, Retention, and Satisfaction',
      insightBody: 'Roommate conflicts have real academic and emotional costs. Compatibility compounds over time: strong matches mean better grades, retention, and satisfaction. Poor matches create stress, churn, and lower performance.',
      insightSource: 'Cao et al., "Heterogeneous peer effects of college roommates on academic performance" (Nature, 2024)'
    },
    values: {
      headingPrefix: 'What We',
      headingHighlight: 'Value',
      description: 'These principles guide everything we do, from building our algorithm to partnering with universities.',
      cards: [
        { title: 'Safety First', body: "Student safety is non-negotiable. We verify every user and prioritize secure, respectful interactions." },
        { title: 'Science-Driven', body: 'Our matching is backed by research—not guesswork. Peer-reviewed compatibility science informs every recommendation.' },
        { title: 'Transparency', body: "No black boxes. We explain how matching works and why you're compatible with each potential roommate." },
        { title: 'University Partnership', body: 'We partner with universities so better matching becomes the housing standard.' }
      ]
    },
    cta: {
      heading: 'What Drives Us',
      description: "We're a mission-led organization focused on making student living safer, happier, and more compatible.",
      bullets: [
        { title: 'Safety above all', text: 'Every user is verified. Every interaction is secure.' },
        { title: 'Science-driven', text: 'Our algorithm is grounded in peer-reviewed compatibility research.' },
        { title: 'Transparent', text: "We show you exactly why you're compatible with each match." },
        { title: 'Partnership-focused', text: 'We work with universities to make better matching the standard.' }
      ],
      button: 'Partner With Us'
    },
    founder: {
      name: 'Danish Samsudin'
    }
  },
  nl: {
    hero: {
      titlePrefix: 'Onze missie:',
      titleHighlight: 'Betere huisgenootmatches met wetenschap',
      description: 'Een huisgenoot vinden mag geen gok zijn. Domu Match gebruikt compatibiliteitsonderzoek om studenten te koppelen op basis van levensstijl, persoonlijkheid en studie. Veiligheid, transparantie en wetenschap sturen elke keuze.'
    },
    story: {
      heading: 'Ons verhaal',
      subheading: 'Hoe we begonnen, wat ons drijft en waar we naartoe werken.',
      paragraphs: [
        'Een goede huisgenoot vinden zou geen loterij mogen zijn. Toch gebeurt het voor miljoenen studenten nog steeds: je vult een formulier in, krijgt een willekeurige toewijzing en hoopt op het beste.',
        'Domu Match is opgericht door Danish Samsudin, oprichter en ontwikkelaar, die keer op keer zag hoe conflicten cijfers, mentale gezondheid en het studentenleven schaadden. Bijna de helft van de studenten ervaart geregeld spanning met huisgenoten. Dat moet anders.',
        'Daarom bouwen we aan een beter systeem. We gebruiken compatibiliteitswetenschap—dezelfde principes waarmee mensen hechte vriendschappen vormen—en matchen op levensstijl, persoonlijkheid en studie. Elke gebruiker wordt geverifieerd en het proces is transparant. Samen met universiteiten maken we dit de norm.',
        'Ons doel is eenvoudig: studenthuisvesting veiliger, blijer en beter passend maken. Eén match tegelijk.'
      ],
      founderQuote: 'We zijn met Domu Match gestart omdat we te veel studenten zagen worstelen met huisgenoten. Onze missie: met wetenschap en technologie matches maken die echt standhouden.',
      founderTitle: 'Oprichter en ontwikkelaar'
    },
    timeline: [
      { title: 'Probleem gesignaleerd', description: 'We zagen dat bijna de helft van de studenten conflicten heeft die welzijn en studie raken. Willekeurige toewijzing werkte niet.', date: '2025 augustus' },
      { title: 'Onderzoeksfase', description: 'We doken in peer-reviewed studies over compatibiliteit, peereffecten en woontevredenheid.', date: '2025 september' },
      { title: 'Algoritmeontwikkeling', description: 'We bouwden een algoritme dat meer dan 40 factoren weegt, geïnspireerd op sociale wetenschappen en best practices.', date: '2025 oktober' },
      { title: 'Lancering', description: 'We lanceerden Domu Match met uitlegbare matching plus verificatie en veiligheidslagen.', date: '2025 november' },
      { title: 'Groeiende impact', description: 'We helpen inmiddels studenten van meerdere universiteiten en maken wetenschappelijke matching tot de standaard.', date: 'Nu' }
    ],
    vision: {
      heading: 'Waar we naartoe werken',
      intro: 'We willen dat compatibiliteit de norm wordt in studenthuisvesting. Elke student verdient matching op basis van levensstijl, persoonlijkheid en academische doelen.',
      shortTermTitle: 'Doelen op korte termijn',
      shortTerm: [
        'Meer samenwerkingen met universiteiten in heel Nederland',
        'Een community van geverifieerde studenten opbouwen',
        'Het matchingmodel continu bijsturen met resultaten en feedback',
        'Student-gestuurde groepschats lanceren om huizen te vormen',
        'Rijkere profielen met bio’s, interesses en highlights toevoegen'
      ],
      longTermTitle: 'Langetermijnvisie',
      longTerm: [
        'Samenwerken met verhuurders om kamers op compatibiliteit te matchen',
        'In-app contracten aanbieden die studenten veilig kunnen tekenen',
        'Roommate agreements faciliteren voor duidelijke afspraken',
        'Individuele en groepsgesprekken mogelijk maken',
        'Mobiele apps lanceren zodat Domu Match overal beschikbaar is'
      ]
    },
    evidence: {
      headingHighlight: 'Het bewijs:',
      headingSuffix: 'Waarom compatibiliteit telt',
      description: 'Onderzoek laat zien dat compatibiliteit directe impact heeft op prestaties, retentie en welzijn.',
      tiles: [
        {
          statistic: '47,9%',
          title: 'Ervaart conflict',
          explanation: 'Bijna de helft van de studenten heeft terugkerende conflicten met huisgenoten, wat prestatie en welzijn schaadt.',
          source: 'Golding e.a., Negative Roommate Relationships and the Health and Well-being of Undergraduate College Students',
          solution: 'Wij analyseren meer dan 40 factoren—studie, netheid, sociale behoeften—om conflicten te voorkomen.',
          icon: 'Users' as const
        },
        {
          statistic: '67,6%',
          title: 'Wil verhuizen',
          explanation: 'Slechte matches zorgen voor onrust, kosten en extra werk voor huisvestingsteams.',
          source: 'Deng, Empirical Study of Dormitory Conflict',
          solution: 'Transparante matching helpt studenten bewuste keuzes te maken en vermindert churn.',
          icon: 'TrendingUp' as const
        },
        {
          statistic: '70%',
          title: 'Tevreden bij compatibiliteit',
          explanation: 'Wanneer compatibiliteit voorop staat, stijgt woon- en studiesucces.',
          source: 'InsideHigherEd, SDSU-enquête (2024)',
          solution: 'Onze wetenschappelijke aanpak helpt studenten huisgenoten te vinden die voelen als goede vrienden.',
          icon: 'Shield' as const
        }
      ],
      insightTitle: 'Waarom compatibiliteit telt: peereffecten, retentie en tevredenheid',
      insightBody: 'Conflicten hebben echte academische en emotionele kosten. Goede matches leveren samengestelde voordelen op; slechte matches stapelen stress en uitval op.',
      insightSource: 'Cao e.a., Heterogeneous peer effects of college roommates on academic performance (Nature, 2024)'
    },
    values: {
      headingPrefix: 'Waar we',
      headingHighlight: 'voor staan',
      description: 'Deze principes sturen onze technologie én onze partnerships.',
      cards: [
        { title: 'Veiligheid eerst', body: 'Elke gebruiker wordt geverifieerd. Respectvolle, veilige interacties zijn de basis.' },
        { title: 'Wetenschap centraal', body: 'Onze matching rust op peer-reviewed compatibiliteitsonderzoek, niet op onderbuikgevoel.' },
        { title: 'Transparantie', body: 'Geen black box. Je weet precies waarom je met iemand matcht.' },
        { title: 'Samenwerking met universiteiten', body: 'We bouwen samen aan studenthuisvesting die beter werkt voor iedereen.' }
      ]
    },
    cta: {
      heading: 'Wat ons drijft',
      description: 'We zijn een missiegedreven organisatie die studenthuisvesting veiliger, blijer en voorspelbaarder maakt.',
      bullets: [
        { title: 'Veiligheid boven alles', text: 'Elke gebruiker wordt geverifieerd en elke interactie is beveiligd.' },
        { title: 'Wetenschap als basis', text: 'Ons algoritme volgt peer-reviewed compatibiliteitsprincipes.' },
        { title: 'Transparant', text: 'We laten zien waarom je met iemand matcht en waar je op moet letten.' },
        { title: 'Partnerschap', text: 'We werken met universiteiten om compatibiliteit de norm te maken.' }
      ],
      button: 'Werk met ons samen'
    },
    founder: {
      name: 'Danish Samsudin'
    }
  }
}

export function AboutContent() {
  const { locale } = useApp()
  const t = content[locale]

  return (
    <>
      <Section className="bg-gradient-to-b from-white to-brand-surface/30 pb-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight">
              <span className="text-brand-primary">{t.hero.titlePrefix}</span> {t.hero.titleHighlight}
            </h1>
            <p className="text-lg md:text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed mb-10">
              {t.hero.description}
            </p>
          </div>
        </Container>
      </Section>

      <Section id="our-story" className="bg-white py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                <span className="text-brand-primary">{t.story.heading}</span>
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                {t.story.subheading}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 mb-20">
              <div className="lg:col-span-2 space-y-6">
                {t.story.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`text-lg text-brand-muted leading-relaxed ${index === t.story.paragraphs.length - 1 ? 'font-medium text-brand-text' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div>
                <Card className="border-brand-border/50 bg-brand-surface/30 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-brand-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{t.founder.name}</CardTitle>
                        <p className="text-sm text-brand-muted">{t.story.founderTitle}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-muted leading-relaxed">
                      “{t.story.founderQuote}”
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-2xl font-bold text-brand-text mb-12 text-center">
                {locale === 'nl' ? 'Onze reis' : 'Our Journey'}
              </h3>
              <Timeline items={t.timeline} />
            </div>

            <div className="mt-20">
              <h3 className="text-2xl font-bold text-brand-text mb-8 text-center">{t.vision.heading}</h3>
              <div className="max-w-3xl mx-auto space-y-8">
                <p className="text-lg text-brand-muted leading-relaxed text-center">
                  {t.vision.intro}
                </p>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="font-semibold text-brand-text mb-4 text-lg">{t.vision.shortTermTitle}</h4>
                    <ul className="space-y-3 text-brand-muted">
                      {t.vision.shortTerm.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-text mb-4 text-lg">{t.vision.longTermTitle}</h4>
                    <ul className="space-y-3 text-brand-muted">
                      {t.vision.longTerm.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-surface/50 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                <span className="text-brand-primary">{t.evidence.headingHighlight}</span> {t.evidence.headingSuffix}
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                {t.evidence.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {t.evidence.tiles.map((tile, index) => (
                <EvidenceTile key={index} {...tile} />
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-10 border border-brand-border/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-text mb-4">
                    {t.evidence.insightTitle}
                  </h3>
                  <p className="text-brand-muted leading-relaxed mb-4">
                    {t.evidence.insightBody}
                  </p>
                  <p className="text-xs text-brand-muted italic">{t.evidence.insightSource}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-brand-surface/30 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                {t.values.headingPrefix} <span className="text-brand-primary">{t.values.headingHighlight}</span>
              </h2>
              <p className="text-lg text-brand-muted max-w-3xl mx-auto">
                {t.values.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.values.cards.map((card, index) => {
                const icons = [Shield, BookOpen, Target, GraduationCap]
                const Icon = icons[index]
                return (
                  <Card key={card.title} className="border-brand-border/50 text-center">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-brand-primary" />
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-brand-muted leading-relaxed">
                        {card.body}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-gradient-to-br from-brand-primary to-brand-primaryHover text-white py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.cta.heading}
            </h2>
            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.cta.description}
            </p>

            <div className="bg-white/10 rounded-2xl p-8 mb-10 max-w-2xl mx-auto">
              <ul className="text-left space-y-4 text-white/90">
                {t.cta.bullets.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{item.title}:</strong> {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">
                  {t.cta.button}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

