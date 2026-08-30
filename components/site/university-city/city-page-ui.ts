import type { Locale } from '@/lib/i18n'

export type CityPageUi = {
  heroTitleBefore: string
  heroTitleAfter: string
  getStarted: string
  howItWorks: string
  trust1: string
  trust2: string
  trust3: string
  whyHeading: (cityName: string) => string
  whyPoints: { title: string; description: string }[]
  marketplaceHeading: (cityName: string) => string
  marketplaceSub: string
  marketplaceSeekerTitle: string
  marketplaceSeekerBody: string
  marketplaceSeekerCta: string
  marketplaceSupplyTitle: string
  marketplaceSupplyBody: string
  marketplaceSupplyCta: string
  housingHeading: (cityName: string) => string
  marketOverview: string
  avgRent: string
  housingType: string
  competition: string
  contracts: string
  popularNeighborhoods: string
  universitiesHeading: (cityName: string) => string
  universitiesSub: (cityName: string) => string
  faqTitle: string
}

export const cityPageUi: Record<Locale, CityPageUi> = {
  en: {
    heroTitleBefore: 'Find a compatible roommate in',
    heroTitleAfter: '',
    getStarted: 'Get Started Free',
    howItWorks: 'How It Works',
    trust1: 'Looking for a roommate or have a free room',
    trust2: 'Verified students & young professionals',
    trust3: 'Compatibility matching - not room ads',
    whyHeading: (cityName) => `Why people in ${cityName} choose Domu Match`,
    whyPoints: [
      {
        title: 'Verified users only',
        description:
          'University email or young-professional verification. Connect with real people - not anonymous listings.',
      },
      {
        title: 'Compatibility first',
        description:
          'Match on routines, boundaries, and lifestyle - so shared living works beyond the viewing.',
      },
      {
        title: 'Not another room board',
        description:
          'Kamernet-style sites list rooms. Domu Match matches people: seekers and housemates with a free spot.',
      },
      {
        title: 'Free for students & YPs',
        description: 'No hidden fees or premium tiers. Completely free for students and young professionals.',
      },
    ],
    marketplaceHeading: (cityName) => `Two ways to use Domu Match in ${cityName}`,
    marketplaceSub:
      'Whether you need a housemate or already have a free room, start with compatibility - then find housing together or fill the empty spot.',
    marketplaceSeekerTitle: 'Looking for a roommate',
    marketplaceSeekerBody:
      'Searching for shared living, a student house, or someone to rent with? Match on lifestyle first, then house-hunt with confidence.',
    marketplaceSeekerCta: 'Find a roommate',
    marketplaceSupplyTitle: 'Have a room, need a housemate',
    marketplaceSupplyBody:
      'Empty room in your flat or student house? Find a verified housemate who fits your house rules - before the next awkward viewing.',
    marketplaceSupplyCta: 'Find a housemate',
    housingHeading: (cityName) => `Student & shared housing in ${cityName}`,
    marketOverview: 'Market Overview',
    avgRent: 'Typical room rent:',
    housingType: 'Housing type:',
    competition: 'Competition:',
    contracts: 'Contracts:',
    popularNeighborhoods: 'Popular Neighborhoods',
    universitiesHeading: (cityName) => `${cityName} universities & institutions`,
    universitiesSub: (cityName) => `We support students and young professionals around major institutions in ${cityName}`,
    faqTitle: 'Frequently Asked Questions',
  },
  nl: {
    heroTitleBefore: 'Vind een passende huisgenoot in',
    heroTitleAfter: '',
    getStarted: 'Gratis beginnen',
    howItWorks: 'Hoe het werkt',
    trust1: 'Huisgenoot zoeken of kamer vrij',
    trust2: 'Geverifieerde studenten & young professionals',
    trust3: 'Matching op compatibiliteit - geen kameradvertenties',
    whyHeading: (cityName) => `Waarom mensen in ${cityName} voor Domu Match kiezen`,
    whyPoints: [
      {
        title: 'Alleen geverifieerde gebruikers',
        description:
          'Universiteitsmail of young-professional check. Contact met echte mensen - geen anonieme advertenties.',
      },
      {
        title: 'Eerst compatibiliteit',
        description:
          'Match op routines, grenzen en leefstijl - zodat samenwonen werkt ná het bezichtigen.',
      },
      {
        title: 'Geen kamerplatform',
        description:
          'Sites als Kamernet tonen kamers. Domu Match matcht mensen: zoekers én huizen met een vrije kamer.',
      },
      {
        title: 'Gratis voor studenten & YPs',
        description: 'Geen verborgen kosten of premium-tiers. Gratis voor studenten en young professionals.',
      },
    ],
    marketplaceHeading: (cityName) => `Twee manieren om Domu Match in ${cityName} te gebruiken`,
    marketplaceSub:
      'Of je een huisgenoot zoekt of al een kamer vrij hebt: begin met compatibiliteit - daarna samen een woning zoeken of de lege plek vullen.',
    marketplaceSeekerTitle: 'Huisgenoot zoeken',
    marketplaceSeekerBody:
      'Op zoek naar een studentenhuis, flatshare of iemand om mee te huren? Match eerst op leefstijl, daarna met vertrouwen een woning zoeken.',
    marketplaceSeekerCta: 'Zoek een huisgenoot',
    marketplaceSupplyTitle: 'Kamer vrij, huisgenoot gezocht',
    marketplaceSupplyBody:
      'Lege kamer in je flat of studentenhuis? Vind een geverifieerde huisgenoot die bij jullie huisregels past — vóór de volgende ongemakkelijke bezichtiging.',
    marketplaceSupplyCta: 'Zoek een medebewoner',
    housingHeading: (cityName) => `Studenten- & gedeelde huisvesting in ${cityName}`,
    marketOverview: 'Markt in één oogopslag',
    avgRent: 'Typische kamerhuur:',
    housingType: 'Type woningen:',
    competition: 'Concurrentie:',
    contracts: 'Contracten:',
    popularNeighborhoods: 'Populaire buurten',
    universitiesHeading: (cityName) => `Universiteiten & hogescholen in ${cityName}`,
    universitiesSub: (cityName) => `We helpen studenten en young professionals rond grote instellingen in ${cityName}`,
    faqTitle: 'Veelgestelde vragen',
  },
}
