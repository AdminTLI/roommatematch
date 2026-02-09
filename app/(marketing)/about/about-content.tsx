'use client'

import { useApp } from '@/app/providers'
import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import { Timeline } from '@/components/about/timeline'
import { EvidenceTile } from '@/components/about/evidence-tile'
import { CheckCircle2, Lightbulb, Shield, BookOpen, Target, GraduationCap, User } from 'lucide-react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
        "University is supposed to be the most transformative chapter of your life, yet for millions of students, the excitement of an acceptance letter quickly fades into the anxiety of a housing lottery. We have seen this story play out too many times: brilliant students struggling to pass exams not because the coursework was too hard, but because their home environment was draining their energy. Domu Match was born from this silence - from the realization that while universities were excellent at teaching students what to learn, no one was helping them decide who to live with. We realized that in the high-stakes world of higher education, a compatible roommate isn't just a convenience; they are the difference between feeling isolated and feeling supported.",
        "We refused to accept that your mental health should be left to chance, so we built the infrastructure to change it. By replacing random assignment with compatibility science, we help students find homes based on shared living values, daily rhythms, and mutual respect rather than just move-in dates. We bridge the gap between strangers, turning the daunting process of \"finding a room\" into the meaningful experience of building a micro-community. Our platform verifies every user and prioritizes privacy by design, ensuring that the technology works quietly in the background to create a foundation of trust before you ever unlock the front door.",
        "This is about more than just a place to sleep; it is about reclaiming your home as a sanctuary. We believe that who you live with determines who you become during these critical years, which is why we are partnering with forward-thinking universities to make wellbeing-focused housing the new standard. Whether you are an international student navigating a new culture or a first-year leaving home for the first time, our mission remains the same: to ensure that when you close your books at the end of the day, you are coming home to a place where you can truly recharge, thrive, and be yourself."
      ],
      founders: [
        { name: 'Danish Samsudin', title: 'Founder and Product Developer', quote: "As a former President of ESN Breda, I've seen how much universities are doing to prioritise their students well-being and mental health. It takes an entire 'behind the scenes' team to create a meaningful impact towards students, especially internationals. But I know I could contribute not just more, but better. After just a few months, I truly believe we now have what it takes to support HEI's with their long term goals and objectives." },
        { name: 'Vitor Mello', title: 'Co-Founder and Sales and Marketing', quote: "I watched too many brilliant friends lose their spark simply because they were living in toxic environments. I refused to accept that 'bad roommates' are just a part of student life. We built Domu Match to prove that peace of mind isn't luck - it's a standard we can guarantee. I'm incredibly proud that we finally have the tool I wish my friends had years ago." }
      ]
    },
    timeline: [
      { title: 'The Problem Identified', description: "We recognized that nearly half of all students face roommate conflicts that impact well-being and academic performance. Random assignment wasn't working.", date: '2025 August' },
      { title: 'Research Phase', description: 'We analyzed peer-reviewed studies on compatibility, peer effects, and student housing satisfaction from Nature and other leading sources.', date: '2025 September' },
      { title: 'Algorithm Development', description: 'We built a science-driven algorithm that analyzes 40+ lifestyle and academic factors, informed by social compatibility research.', date: '2025 October' },
      { title: 'First Version Complete', description: "The first version of Domu Match's user interface was put together and its basic functionality features fully built.", date: '2025 November' },
      { title: 'Debugging and Error Testing', description: 'The platform is currently undergoing several changes to debug multiple errors and ensure that during the soft launch, users have a seamless experience. This will allow beta testers to provide more feedback on introducing the right features for the platform.', date: '2026 January' },
      { title: 'Beta Testing Soft Launch', description: 'The platform will be launched to a small group of students in Breda and Tilburg. We will work together to ensure that we have the most important and wanted features that users expect working properly before our full planned launch.', date: '2026 March' },
      { title: 'Full Launch Planned', description: 'We are expected to launch the platform for our first students in May. Students will be able to finally use our science-backed matching algorithm to connect with and find compatible roommates for the first time ever in The Netherlands.', date: '2026 May' }
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
          solution: "We analyze 40+ factors - study habits, cleanliness, social needs - to prevent conflict before it starts.",
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
        { title: 'Science-Driven', body: 'Our matching is backed by research - not guesswork. Peer-reviewed compatibility science informs every recommendation.' },
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
        'Daarom bouwen we aan een beter systeem. We gebruiken compatibiliteitswetenschap - dezelfde principes waarmee mensen hechte vriendschappen vormen - en matchen op levensstijl, persoonlijkheid en studie. Elke gebruiker wordt geverifieerd en het proces is transparant. Samen met universiteiten maken we dit de norm.',
        'Ons doel is eenvoudig: studenthuisvesting veiliger, blijer en beter passend maken. Eén match tegelijk.'
      ],
      founders: [
        { name: 'Danish Samsudin', title: 'Oprichter en ontwikkelaar', quote: 'We zijn met Domu Match gestart omdat we te veel studenten zagen worstelen met huisgenoten. Onze missie: met wetenschap en technologie matches maken die echt standhouden.' },
        { name: 'Vitor Mello', title: 'Medeoprichter en verkoop en marketing', quote: 'i am a placeholder. don\'t forget to fill me out' }
      ]
    },
    timeline: [
      { title: 'Probleem gesignaleerd', description: 'We zagen dat bijna de helft van de studenten conflicten heeft die welzijn en studie raken. Willekeurige toewijzing werkte niet.', date: '2025 augustus' },
      { title: 'Onderzoeksfase', description: 'We doken in peer-reviewed studies over compatibiliteit, peereffecten en woontevredenheid.', date: '2025 september' },
      { title: 'Algoritmeontwikkeling', description: 'We bouwden een algoritme dat meer dan 40 factoren weegt, geïnspireerd op sociale wetenschappen en best practices.', date: '2025 oktober' },
      { title: 'Eerste versie voltooid', description: 'De eerste versie van Domu Match werd volledig gebouwd en onderging uitgebreide debugging- en fouttestprocessen om betrouwbaarheid en kwaliteit te waarborgen.', date: '2025 november' },
      { title: 'Bètatestfase', description: 'We bevinden ons momenteel in de bètatestfase, verzamelen feedback en verfijnen het platform om de best mogelijke ervaring voor studenten te garanderen.', date: '2026 januari' },
      { title: 'Bètatest Soft Launch', description: 'Het platform wordt gelanceerd voor een kleine groep studenten in Breda en Tilburg. Samen zorgen we ervoor dat de belangrijkste en meest gewenste functies correct werken voordat we de volledige lancering plannen.', date: '2026 maart' },
      { title: 'Volledige lancering gepland', description: 'We verwachten het platform in mei te lanceren voor onze eerste studenten. Studenten kunnen dan eindelijk ons wetenschappelijk onderbouwde matchingalgoritme gebruiken om compatibele huisgenoten te vinden - voor het eerst in Nederland.', date: '2026 mei' }
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
        "Rijkere profielen met bio's, interesses en highlights toevoegen"
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
          solution: 'Wij analyseren meer dan 40 factoren - studie, netheid, sociale behoeften - om conflicten te voorkomen.',
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
        { title: 'Transparent', text: 'We laten zien waarom je met iemand matcht en waar je op moet letten.' },
        { title: 'Partnerschap', text: 'We werken met universiteiten om compatibiliteit de norm te maken.' }
      ],
      button: 'Werk met ons samen'
    },
  }
}

export function AboutContent() {
  const { locale } = useApp()
  const t = content[locale]
  const reducedMotion = useReducedMotion()

  const fadeIn = {
    initial: reducedMotion ? {} : { opacity: 0, y: 20 },
    whileInView: reducedMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  }

  return (
    <>
      {/* Hero section */}
      <Section className="relative overflow-hidden pt-16 md:pt-24 pb-20 md:pb-28">
        <Container className="relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.hero.titlePrefix}</span>{' '}
              {t.hero.titleHighlight}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Our Story */}
      <Section id="our-story" className="relative overflow-hidden py-16 md:py-24">
        <Container className="relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16 md:mb-20"
              {...fadeIn}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.story.heading}</span>
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                {t.story.subheading}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12 mb-20">
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t.story.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-lg text-white/70 leading-relaxed',
                      index === t.story.paragraphs.length - 1 && 'font-medium text-white/90'
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </motion.div>
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="glass noise-overlay p-6 md:p-8 transition-all duration-300 hover:border-white/30 hover:bg-white/15">
                  <div className="space-y-6">
                    {t.story.founders.map((founder, index) => (
                      <div key={founder.name}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 min-h-12 min-w-12 flex-shrink-0 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                            <User className="h-6 w-6 flex-shrink-0 text-indigo-400" aria-hidden />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{founder.name}</h3>
                            <p className="text-sm text-white/60">{founder.title}</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">
                          &ldquo;{founder.quote}&rdquo;
                        </p>
                        {index < t.story.founders.length - 1 && (
                          <hr className="mt-6 border-white/20" aria-hidden />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mb-20"
              initial={reducedMotion ? false : { opacity: 0 }}
              whileInView={reducedMotion ? false : { opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-white mb-12 text-center tracking-tight">
                {locale === 'nl' ? 'Onze reis' : 'Our Journey'}
              </h3>
              <Timeline items={t.timeline} />
            </motion.div>

            <motion.div
              className="mt-20"
              {...fadeIn}
            >
              <h3 className="text-2xl font-bold text-white mb-8 text-center tracking-tight">{t.vision.heading}</h3>
              <div className="max-w-3xl mx-auto space-y-8">
                <p className="text-lg text-white/70 leading-relaxed text-center">
                  {t.vision.intro}
                </p>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="glass noise-overlay p-6 md:p-8 transition-all duration-300 hover:border-white/30 hover:bg-white/15">
                    <h4 className="font-semibold text-white mb-4 text-lg">{t.vision.shortTermTitle}</h4>
                    <ul className="space-y-3 text-white/70">
                      {t.vision.shortTerm.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass noise-overlay p-6 md:p-8 transition-all duration-300 hover:border-white/30 hover:bg-white/15">
                    <h4 className="font-semibold text-white mb-4 text-lg">{t.vision.longTermTitle}</h4>
                    <ul className="space-y-3 text-white/70">
                      {t.vision.longTerm.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Evidence section */}
      <Section className="relative overflow-hidden py-16 md:py-24">
        <Container className="relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16 md:mb-20"
              {...fadeIn}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.evidence.headingHighlight}</span>{' '}
                {t.evidence.headingSuffix}
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                {t.evidence.description}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {t.evidence.tiles.map((tile, index) => (
                <EvidenceTile key={index} {...tile} />
              ))}
            </motion.div>

            <motion.div
              className="glass noise-overlay p-8 md:p-10 transition-all duration-300 hover:border-white/30 hover:bg-white/15"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {t.evidence.insightTitle}
                  </h3>
                  <p className="text-white/70 leading-relaxed mb-4">
                    {t.evidence.insightBody}
                  </p>
                  <p className="text-xs text-white/50 italic">{t.evidence.insightSource}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* CTA section */}
      <Section className="relative overflow-hidden py-16 md:py-24">
        <Container className="relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              {t.cta.heading}
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.cta.description}
            </p>

            <div className="glass noise-overlay rounded-2xl p-8 mb-10 max-w-2xl mx-auto border-white/20 bg-white/5">
              <ul className="text-left space-y-4 text-white/90">
                {t.cta.bullets.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{item.title}:</strong> {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/contact"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.cta.button}
            </Link>
          </motion.div>
        </Container>
      </Section>
    </>
  )
}
