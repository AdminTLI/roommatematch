export type Locale = 'en' | 'nl'

export interface HeroContent {
  headline: string
  subheadline: string
  oldWay: string
  domuWay: string
  findMatch: string
  howItWorks: string
}

export interface WhyContent {
  title: string
  painPoints: { title: string; description: string }[]
}

export interface SolutionContent {
  title: string
  subtitle: string
  blueprintLabel: string
  features: { title: string; description: string }[]
}

export interface TrustContent {
  badge: string
  copy: string
  verifiedLabel: string
  proofLine: string
}

export interface InvestmentContent {
  heading: string
  copy: string
}

export interface FAQContent {
  title: string
  items: { question: string; answer: string }[]
}

export interface StickyCTAContent {
  copy: string
  button: string
}

export interface ComparisonRow {
  feature: string
  domu: boolean
  kamernet: boolean
  roomster: boolean
  roomnl: boolean
}

export interface ComparisonContent {
  title: string
  subtitle: string
  competitors: string[]
  rows: ComparisonRow[]
}

export interface FeaturesForYoungProfessionalsContent {
  hero: HeroContent
  why: WhyContent
  solution: SolutionContent
  trust: TrustContent
  investment: InvestmentContent
  faq: FAQContent
  stickyCta: StickyCTAContent
  comparison: ComparisonContent
}

export const content: Record<Locale, FeaturesForYoungProfessionalsContent> = {
  en: {
    hero: {
      headline: "Find a flatmate who actually fits your life.",
      subheadline:
        "Lifestyle compatibility matching for young professionals. 100% ID verified. Separate pool from students. Zero scams.",
      oldWay: 'The Old Way',
      domuWay: 'The Domu Way',
      findMatch: 'Find My Match',
      howItWorks: 'How it Works',
    },
    why: {
      title: "Shared living shouldn't be a lottery.",
      painPoints: [
        {
          title: 'The WFH Reality Check',
          description:
            'You have calls, deadlines, and a home office. They treat weekdays like the weekend. Your apartment becomes a coworking nightmare.',
        },
        {
          title: 'The Bills and Boundaries Problem',
          description:
            'Energy spikes, subscriptions pile up, and “I’ll pay you later” becomes a habit. Money tension kills a home fast.',
        },
        {
          title: 'The Lifestyle Mismatch',
          description:
            'You want calm evenings and predictable routines. They want spontaneous guests, constant noise, and chaos. Same rent, different lives.',
        },
      ],
    },
    solution: {
      title: 'The Compatibility Blueprint',
      subtitle: 'Science-backed matching that works',
      blueprintLabel: 'Our compatibility survey',
      features: [
        { title: 'Lifestyle Deep Dive', description: "We ask the questions you're too awkward to ask. From guests to noise to cleanliness." },
        { title: "The 'Harmony' Score", description: "See how compatible you are with a % score before you say hello." },
        { title: 'Blind Matching', description: "We hide photos initially so you connect on habits, not looks. No bias, just data." },
      ],
    },
    trust: {
      badge: 'Powered by Persona™ Identity Verification',
      copy: 'No bots. No fake profiles. No scams. Every user is government-ID verified before they can chat. Young professionals get the same safe, gated environment as students - in a separate pool.',
      verifiedLabel: 'Verified User',
      proofLine:
        'Persona is trusted by leading companies (e.g. OpenAI, Coursera, and Brex) for identity verification - so you’re matching with real people, not fake profiles.',
    },
    investment: {
      heading: '15 Minutes for a Year of Peace.',
      copy: "Our quiz is detailed. Trade 15 minutes now to avoid months of conflict with the wrong flatmate.",
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Who can use Domu Match as a young professional?',
          answer: 'Young professionals in the Netherlands can sign up with their email. You are matched only with other verified young professionals in a separate pool from students. No university email is required.',
        },
        {
          question: 'Is Domu Match free for young professionals?',
          answer:
            'Right now, Domu Match is free for young professionals. In the future, access may move to a paid annual subscription model. Either way: no hidden fees, and you’ll always see the price upfront.',
        },
        {
          question: 'How do young professionals verify?',
          answer: 'Every user is government-ID verified through Persona before they can chat. Young professionals use the same process; no university email is needed.',
        },
        {
          question: 'Do I only get matched with other young professionals?',
          answer: 'Yes. Students match only with students; young professionals only with young professionals. You are in a dedicated pool.',
        },
      ],
    },
    stickyCta: {
      copy: 'Join {count} people finding their perfect match',
      button: 'Get Started',
    },
    comparison: {
      title: 'How we compare',
      subtitle: 'See why young professionals choose Domu Match',
      competitors: ['Domu Match', 'Kamernet', 'Roomster', 'Room.nl'],
      rows: [
        { feature: 'Lifestyle compatibility matching (40+ factors)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Government ID verification (100% verified users)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Blind matching (connect on habits, not looks)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Free for young professionals', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Harmony score (% compatibility before you chat)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Separate pool (professionals only with professionals)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'No user-posted listings (prevents fake ads)', domu: true, kamernet: false, roomster: false, roomnl: true },
        { feature: 'Profile & preferences', domu: true, kamernet: true, roomster: true, roomnl: true },
        { feature: 'In-app messaging', domu: true, kamernet: true, roomster: true, roomnl: false },
        { feature: 'Search & filters', domu: true, kamernet: true, roomster: true, roomnl: true },
      ],
    },
  },
  nl: {
    hero: {
      headline: "Vind een huisgenoot die bij je leven past.",
      subheadline:
        "Levensstijl-compatibiliteitsmatching voor young professionals. 100% ID-geverifieerd. Aparte pool van studenten. Geen oplichting.",
      oldWay: 'De Oude Manier',
      domuWay: 'De Domu Manier',
      findMatch: 'Vind Mijn Match',
      howItWorks: 'Hoe het werkt',
    },
    why: {
      title: "Samenwonen zou geen loterij moeten zijn.",
      painPoints: [
        {
          title: 'De Thuiswerk Realiteit',
          description:
            'Jij hebt calls, deadlines en een thuiswerkplek. Zij doen doordeweeks alsof het weekend is. Je huis wordt een stressvolle werkplek.',
        },
        {
          title: 'Rekeningen en Grenzen',
          description:
            'De energiekosten schieten omhoog, abonnementen stapelen zich op en “ik betaal later” wordt een patroon. Geldgedoe sloopt de sfeer.',
        },
        {
          title: 'De Lifestyle Mismatch',
          description:
            'Jij wilt rustige avonden en voorspelbare routines. Zij willen spontane gasten, veel geluid en chaos. Zelfde huur, ander leven.',
        },
      ],
    },
    solution: {
      title: 'Het compatibiliteitsplan',
      subtitle: 'Wetenschappelijk onderbouwde matching die werkt',
      blueprintLabel: 'Onze compatibiliteitsenquête',
      features: [
        { title: 'Levensstijl deep dive', description: "We stellen de vragen die je te ongemakkelijk vindt om te vragen. Van gasten tot geluid tot schoonmaken." },
        { title: "De 'Harmony' score", description: "Zie hoe compatibel je bent met een %-score voordat je hallo zegt." },
        { title: 'Blinde matching', description: "We verbergen foto's eerst zodat je verbindt op gewoonten, niet uiterlijk." },
      ],
    },
    trust: {
      badge: 'Mede mogelijk gemaakt door Persona™ Identity Verification',
      copy: 'Geen bots. Geen nep-profielen. Geen oplichting. Elke gebruiker is geverifieerd met overheids-ID voordat ze kunnen chatten. Young professionals krijgen dezelfde veilige omgeving als studenten - in een aparte pool.',
      verifiedLabel: 'Geverifieerde Gebruiker',
      proofLine:
        'Persona wordt gebruikt door toonaangevende bedrijven (bijv. OpenAI, Coursera en Brex) voor identiteitsverificatie - zodat jij met echte mensen matcht, niet met nep-profielen.',
    },
    investment: {
      heading: '15 minuten voor een jaar vrede.',
      copy: "Onze quiz is uitgebreid. Ruil 15 minuten nu in om maanden conflict met de verkeerde huisgenoot te voorkomen.",
    },
    faq: {
      title: 'Veelgestelde vragen',
      items: [
        {
          question: 'Wie kan Domu Match gebruiken als young professional?',
          answer: 'Young professionals in Nederland kunnen zich aanmelden met hun e-mail. Je wordt alleen gematcht met andere geverifieerde young professionals in een aparte pool van studenten.',
        },
        {
          question: 'Is Domu Match gratis voor young professionals?',
          answer:
            'Op dit moment is Domu Match gratis voor young professionals. In de toekomst kan toegang overgaan naar een betaald jaarlijks abonnementsmodel. Hoe dan ook: geen verborgen kosten, en je ziet de prijs altijd vooraf.',
        },
        {
          question: 'Hoe verifiëren young professionals?',
          answer: 'Elke gebruiker is geverifieerd met overheids-ID via Persona voordat ze kunnen chatten. Young professionals gebruiken hetzelfde proces.',
        },
        {
          question: 'Word ik alleen gematcht met andere young professionals?',
          answer: 'Ja. Studenten matchen alleen met studenten; young professionals alleen met young professionals. Je zit in een eigen pool.',
        },
      ],
    },
    stickyCta: {
      copy: 'Doe mee met {count} mensen die hun perfecte match vinden',
      button: 'Begin nu',
    },
    comparison: {
      title: 'Zo vergelijken we',
      subtitle: 'Ontdek waarom young professionals voor Domu Match kiezen',
      competitors: ['Domu Match', 'Kamernet', 'Roomster', 'Room.nl'],
      rows: [
        { feature: 'Levensstijl compatibiliteitsmatching (40+ factoren)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Overheids-ID verificatie (100% geverifieerde gebruikers)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Blinde matching (verbind op gewoonten, niet uiterlijk)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Gratis voor young professionals', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Harmony-score (% compatibiliteit vóór je chat)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Aparte pool (professionals alleen met professionals)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Geen door gebruikers geplaatste advertenties', domu: true, kamernet: false, roomster: false, roomnl: true },
        { feature: 'Profiel & voorkeuren', domu: true, kamernet: true, roomster: true, roomnl: true },
        { feature: 'In-app berichten', domu: true, kamernet: true, roomster: true, roomnl: false },
        { feature: 'Zoeken & filters', domu: true, kamernet: true, roomster: true, roomnl: true },
      ],
    },
  },
}
