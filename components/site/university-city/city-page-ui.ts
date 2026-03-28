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
    heroTitleBefore: 'Find Your Perfect Roommate in',
    heroTitleAfter: '',
    getStarted: 'Get Started Free',
    howItWorks: 'How It Works',
    trust1: 'Free for students & young professionals',
    trust2: 'Verified users only',
    trust3: 'Science-backed matching',
    whyHeading: (cityName) => `Why ${cityName} Students Choose Domu Match`,
    whyPoints: [
      {
        title: 'Verified Users Only',
        description:
          'All users verified (university email or young-professional verification). Connect safely with compatible roommates.',
      },
      {
        title: 'Science-Backed Matching',
        description: '40+ compatibility factors analyzed to find your perfect roommate match.',
      },
      {
        title: 'Free Forever',
        description: 'No hidden fees, no premium tiers. Completely free for students and young professionals.',
      },
    ],
    housingHeading: (cityName) => `Student Housing in ${cityName}`,
    marketOverview: 'Market Overview',
    avgRent: 'Average Rent:',
    housingType: 'Housing Type:',
    competition: 'Competition:',
    contracts: 'Contracts:',
    popularNeighborhoods: 'Popular Neighborhoods',
    universitiesHeading: (cityName) => `${cityName} Universities`,
    universitiesSub: (cityName) => `We work with all major universities and institutions in ${cityName}`,
    faqTitle: 'Frequently Asked Questions',
  },
  nl: {
    heroTitleBefore: 'Vind je perfecte huisgenoot in',
    heroTitleAfter: '',
    getStarted: 'Gratis beginnen',
    howItWorks: 'Hoe het werkt',
    trust1: 'Gratis voor studenten & young professionals',
    trust2: 'Alleen geverifieerde gebruikers',
    trust3: 'Wetenschappelijk onderbouwde matching',
    whyHeading: (cityName) => `Waarom studenten in ${cityName} voor Domu Match kiezen`,
    whyPoints: [
      {
        title: 'Alleen geverifieerde gebruikers',
        description:
          'Iedereen wordt geverifieerd (universiteitsmail of young-professional check). Veilig in contact met passende huisgenoten.',
      },
      {
        title: 'Matching op wetenschap',
        description: '40+ compatibiliteitsfactoren om jouw beste huisgenoot-match te vinden.',
      },
      {
        title: 'Gratis',
        description: 'Geen verborgen kosten of premium-tiers. Gratis voor studenten en young professionals.',
      },
    ],
    housingHeading: (cityName) => `Studentenhuisvesting in ${cityName}`,
    marketOverview: 'Markt in één oogopslag',
    avgRent: 'Gemiddelde huur:',
    housingType: 'Type woningen:',
    competition: 'Concurrentie:',
    contracts: 'Contracten:',
    popularNeighborhoods: 'Populaire buurten',
    universitiesHeading: (cityName) => `Universiteiten in ${cityName}`,
    universitiesSub: (cityName) => `We werken met de grote universiteiten en instellingen in ${cityName}`,
    faqTitle: 'Veelgestelde vragen',
  },
}
