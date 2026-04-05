export type Locale = 'en' | 'nl'

export interface HeroContent {
  /** Plain text before the gradient phrase */
  headlineBefore: string
  /** 2–3 positive words highlighted with the brand gradient */
  headlineGradient: string
  /** Plain text after the gradient phrase */
  headlineAfter: string
  subheadline: string
  oldWay: string
  domuWay: string
  findMatch: string
  howItWorks: string
}

export interface WhyContent {
  title: string
  painPoints: {
    title: string
    description: string
  }[]
}

export interface SolutionContent {
  title: string
  subtitle: string
  blueprintLabel: string
  features: {
    title: string
    description: string
  }[]
}

export interface TrustContent {
  badge: string
  copy: string
  proofLine: string
  verifiedLabel: string
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

export interface SocialProofContent {
  universities: string[]
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

export interface FeaturesForStudentsContent {
  hero: HeroContent
  why: WhyContent
  solution: SolutionContent
  trust: TrustContent
  investment: InvestmentContent
  faq: FAQContent
  stickyCta: StickyCTAContent
  socialProof: SocialProofContent
  comparison: ComparisonContent
}

export const content: Record<Locale, FeaturesForStudentsContent> = {
  en: {
    hero: {
      headlineBefore: 'Your ',
      headlineGradient: 'best years',
      headlineAfter: ' deserve the right roommates.',
      subheadline:
        "The only student platform that matches you based on lifestyle, sleep schedules, and study habits. 100% ID Verified. Zero Scams.",
      oldWay: 'The Old Way',
      domuWay: 'The Domu Way',
      findMatch: 'Find My Match',
      howItWorks: 'How it Works',
    },
    why: {
      title: "Living with strangers shouldn't be a gamble.",
      painPoints: [
        {
          title: 'The Party vs. Study Conflict',
          description:
            "You’ve got an 8 AM exam. Their ‘quick pre-drink’ turns into a 2 AM afterparty. Sleep, focus, peace - gone.",
        },
        {
          title: 'The Cleanliness War',
          description:
            "Plates stack up, the bin overflows, and somehow you’re the one scrubbing. Resentment builds fast in a tiny kitchen.",
        },
        {
          title: 'The Ghost',
          description:
            "You share a home with someone you barely see - until bills, chores, or guests become a fight.",
        },
      ],
    },
    solution: {
      title: 'The Compatibility Blueprint',
      subtitle: 'Science-backed matching that actually works',
      blueprintLabel: 'Our 200-question survey',
      features: [
        {
          title: 'The 8-Block Deep Dive',
          description:
            "We ask the questions you're too awkward to ask. From guest policies to thermostat preferences.",
        },
        {
          title: "The 'Harmony' Score",
          description:
            'See exactly how compatible you are with a % score before you say hello.',
        },
        {
          title: 'Blind Matching',
          description:
            "We hide photos initially so you connect on habits, not looks. No bias, just data.",
        },
      ],
    },
    trust: {
      badge: 'Powered by Persona™ Identity Verification',
      copy: 'No bots. No AI profiles. No Scams. Every user is government-ID verified before they can chat.',
      proofLine:
        'Persona is trusted by leading companies (e.g. Robinhood and DoorDash) for identity verification - so you’re matching with real people, not fake profiles.',
      verifiedLabel: 'Verified User',
    },
    investment: {
      heading: '15 Minutes for 12 Months of Peace.',
      copy: "Yes, our quiz is detailed. But wouldn't you trade 15 minutes now to avoid 9 months of arguments later?",
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How does the roommate matching algorithm work?',
          answer:
            'Our algorithm analyzes 40+ compatibility factors including sleep schedules, cleanliness preferences, social habits, study routines, noise tolerance, and personality traits. We use science-backed research on roommate compatibility to weight these factors appropriately. You get a Harmony score showing how well you match before you even say hello.',
        },
        {
          question: 'Is Domu Match free for students?',
          answer:
            'Right now, Domu Match is free for students in the Netherlands. In the future, access may move to a subscription model for students whose universities are not subscribed with us. Either way: no hidden fees, and you’ll always see the price upfront.',
        },
        {
          question: "Can I find a roommate if I don't have a room yet?",
          answer:
            "Absolutely! You can use Domu Match whether you're looking for roommates for an existing apartment or searching for housing together with potential matches. Many users find their roommate first, then search for housing together. It's perfect for international students arriving without housing.",
        },
        {
          question: 'How do you prevent housing scams?',
          answer:
            'Every user on Domu Match is government-ID verified through Persona before they can chat. No bots, no fake profiles, no AI-generated identities. We also verify student status through university email addresses. If something feels wrong, our safety team reviews reports within 24 hours.',
        },
      ],
    },
    stickyCta: {
      copy: 'Join {count} students finding their perfect match',
      button: 'Get Started',
    },
    socialProof: {
      universities: ['Tilburg University', 'Avans University of Applied Sciences', 'Breda University of Applied Sciences'],
    },
    comparison: {
      title: 'How we compare',
      subtitle: 'See why students choose Domu Match over traditional platforms',
      competitors: ['Domu Match', 'Kamernet', 'Roomster', 'Room.nl'],
      rows: [
        { feature: 'Lifestyle compatibility matching (40+ factors)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Government ID verification (100% verified users)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Blind matching (connect on habits, not looks)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Free for students', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Harmony score (% compatibility before you chat)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'University-only verified community', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'No user-posted listings (prevents fake ads)', domu: true, kamernet: false, roomster: false, roomnl: true },
        { feature: 'Profile creation & preferences', domu: true, kamernet: true, roomster: true, roomnl: true },
        { feature: 'In-app messaging', domu: true, kamernet: true, roomster: true, roomnl: false },
        { feature: 'Search & filters', domu: true, kamernet: true, roomster: true, roomnl: true },
      ],
    },
  },
  nl: {
    hero: {
      headlineBefore: 'Jouw ',
      headlineGradient: 'beste jaren',
      headlineAfter: ' verdienen de juiste huisgenoten.',
      subheadline:
        "Het enige studentenplatform dat je matcht op basis van levensstijl, slaapschema's en studiegewoonten. 100% ID-geverifieerd. Geen oplichting.",
      oldWay: 'De Oude Manier',
      domuWay: 'De Domu Manier',
      findMatch: 'Vind Mijn Match',
      howItWorks: 'Hoe het werkt',
    },
    why: {
      title: "Samenwonen met vreemden zou geen gok moeten zijn.",
      painPoints: [
        {
          title: 'Het Feest vs. Studie Conflict',
          description:
            "Jij hebt om 8:00 een tentamen. Hun ‘even een drankje’ wordt een afterparty om 2:00. Slaap, focus, rust - weg.",
        },
        {
          title: 'De Schoonmaakoorlog',
          description:
            "Borden stapelen zich op, de prullenbak zit vol en jij staat te schrobben. In een kleine keuken groeit irritatie razendsnel.",
        },
        {
          title: 'De Geest',
          description:
            "Je woont samen met iemand die je amper ziet - totdat rekeningen, chores of gasten ineens gedoe worden.",
        },
      ],
    },
    solution: {
      title: 'Het Compatibiliteitsplan',
      subtitle: 'Wetenschappelijk onderbouwde matching die echt werkt',
      blueprintLabel: 'Onze enquête van 200 vragen',
      features: [
        {
          title: 'De 8-Blok Diepe Duik',
          description:
            "We stellen de vragen die je te ongemakkelijk vindt om te vragen. Van gastenbeleid tot thermostaatvoorkeuren.",
        },
        {
          title: "De 'Harmony' Score",
          description:
            'Zie precies hoe compatibel je bent met een %-score voordat je hallo zegt.',
        },
        {
          title: 'Blinde Matching',
          description:
            "We verbergen foto's aanvankelijk zodat je verbindt op gewoonten, niet uiterlijk. Geen vooroordelen, alleen data.",
        },
      ],
    },
    trust: {
      badge: 'Mede mogelijk gemaakt door Persona™ Identity Verification',
      copy: 'Geen bots. Geen AI-profielen. Geen oplichting. Elke gebruiker is geverifieerd met overheids-ID voordat ze kunnen chatten.',
      proofLine:
        'Persona wordt gebruikt door toonaangevende bedrijven (bijv. Robinhood en DoorDash) voor identiteitsverificatie - zodat jij met echte mensen matcht, niet met nep-profielen.',
      verifiedLabel: 'Geverifieerde Gebruiker',
    },
    investment: {
      heading: '15 Minuten voor 12 Maanden Vrede.',
      copy: "Ja, onze quiz is uitgebreid. Maar zou je 15 minuten nu niet ruilen om 9 maanden ruzie later te voorkomen?",
    },
    faq: {
      title: 'Veelgestelde Vragen',
      items: [
        {
          question: 'Hoe werkt het huisgenoot-matchingalgoritme?',
          answer:
            'Ons algoritme analyseert 40+ compatibiliteitsfactoren, waaronder slaapschema\'s, schoonmaakvoorkeuren, sociale gewoonten, studieroutines, geluidstolerantie en persoonlijkheidskenmerken. We gebruiken wetenschappelijk onderbouwde onderzoeken over huisgenootcompatibiliteit om deze factoren passend te wegen. Je krijgt een Harmony-score die laat zien hoe goed je matcht voordat je hallo zegt.',
        },
        {
          question: 'Is Domu Match gratis voor studenten?',
          answer:
            'Op dit moment is Domu Match gratis voor studenten in Nederland. In de toekomst kan toegang overgaan naar een abonnementsmodel voor studenten van universiteiten die niet bij ons zijn aangesloten. Hoe dan ook: geen verborgen kosten, en je ziet de prijs altijd vooraf.',
        },
        {
          question: 'Kan ik een huisgenoot vinden als ik nog geen kamer heb?',
          answer:
            'Absoluut! Je kunt Domu Match gebruiken of je nu op zoek bent naar huisgenoten voor een bestaand appartement of samen met potentiële matches naar huisvesting zoekt. Veel gebruikers vinden eerst hun huisgenoot en zoeken dan samen naar huisvesting. Het is perfect voor internationale studenten die zonder huisvesting aankomen.',
        },
        {
          question: 'Hoe voorkomen jullie huisvestingsfraude?',
          answer:
            'Elke gebruiker op Domu Match is geverifieerd met overheids-ID via Persona voordat ze kunnen chatten. Geen bots, geen nep-profielen, geen AI-gegenereerde identiteiten. We verifiëren ook de studentenstatus via universiteits-e-mailadressen. Als iets niet klopt, beoordeelt ons veiligheidsteam meldingen binnen 24 uur.',
        },
      ],
    },
    stickyCta: {
      copy: 'Doe mee met {count} studenten die hun perfecte match vinden',
      button: 'Begin nu',
    },
    socialProof: {
      universities: ['Tilburg University', 'Avans University of Applied Sciences', 'Breda University of Applied Sciences'],
    },
    comparison: {
      title: 'Zo vergelijken we',
      subtitle: 'Ontdek waarom studenten kiezen voor Domu Match boven traditionele platforms',
      competitors: ['Domu Match', 'Kamernet', 'Roomster', 'Room.nl'],
      rows: [
        { feature: 'Levensstijl compatibiliteitsmatching (40+ factoren)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Overheids-ID verificatie (100% geverifieerde gebruikers)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Blinde matching (verbind op gewoonten, niet uiterlijk)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Gratis voor studenten', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Harmony-score (% compatibiliteit vóór je chat)', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Alleen universiteits-geverifieerde community', domu: true, kamernet: false, roomster: false, roomnl: false },
        { feature: 'Geen door gebruikers geplaatste advertenties (voorkomt nepadvertenties)', domu: true, kamernet: false, roomster: false, roomnl: true },
        { feature: 'Profiel aanmaken & voorkeuren', domu: true, kamernet: true, roomster: true, roomnl: true },
        { feature: 'In-app berichten', domu: true, kamernet: true, roomster: true, roomnl: false },
        { feature: 'Zoeken & filters', domu: true, kamernet: true, roomster: true, roomnl: true },
      ],
    },
  },
}
