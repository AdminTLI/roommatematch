/**
 * Shared content for all university city landing pages.
 * Each city has the same section structure; copy is city-specific.
 * Room rent figures cite Kamernet Q2 2026 private-room medians where noted.
 */

export type CityKey =
  | 'amsterdam'
  | 'rotterdam'
  | 'utrecht'
  | 'den-haag'
  | 'eindhoven'
  | 'groningen'
  | 'leiden'
  | 'nijmegen'
  | 'breda'
  | 'tilburg'

export interface CityStats {
  value: string
  label: string
}

export interface Neighborhood {
  name: string
  description: string
  priceRange: string
}

export interface University {
  name: string
  description: string
  programs?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface CityContent {
  name: string
  nameDisplay: string
  region: string
  intro: string
  stats: CityStats[]
  housingIntro: string
  marketOverview: {
    averageRent: string
    housingType: string
    competition: string
    extra?: string
  }
  neighborhoods: Neighborhood[]
  universities: University[]
  faqs: FAQItem[]
}

/** Dual-sided + differentiation FAQs shared across every city page. */
function marketplaceFaqs(cityDisplay: string): FAQItem[] {
  return [
    {
      question: `Can I use Domu Match to find a roommate in ${cityDisplay}?`,
      answer: `Yes. If you are looking for a housemate, flatmate, or someone to rent with in ${cityDisplay}, Domu Match matches you on lifestyle and compatibility with verified students and young professionals - then you can house-hunt together.`,
    },
    {
      question: `I already have a room in ${cityDisplay} - can I find a housemate?`,
      answer: `Yes. Domu Match works both ways: seekers looking for a roommate and people with a free room who need a compatible housemate. Sign up, complete your profile, and match with verified users who fit your house rules.`,
    },
    {
      question: 'How is Domu Match different from Kamernet, Roomster, or other room sites?',
      answer:
        'Room boards list rooms and ads. Domu Match matches people: verified students and young professionals based on compatibility. We do not replace housing corporations or listing sites - we help you find who you live with before (or while) you find where.',
    },
  ]
}

/** Build JSON-LD structured data for a city page (LocalBusiness, BreadcrumbList, FAQPage). */
export function getCityStructuredData(cityKey: CityKey): object {
  const city = cityContent[cityKey]
  const slug = cityKey
  const base = 'https://domumatch.com'
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: `Domu Match - ${city.nameDisplay}`,
        description: `Find compatible roommates in ${city.nameDisplay} - for seekers and people with a free room`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.nameDisplay,
          addressRegion: city.region,
          addressCountry: 'NL',
        },
        areaServed: { '@type': 'City', name: city.nameDisplay },
        serviceType: 'Roommate Matching Service',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base },
          { '@type': 'ListItem', position: 2, name: city.nameDisplay, item: `${base}/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: city.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  }
}

export const cityContent: Record<CityKey, CityContent> = {
  amsterdam: {
    name: 'Amsterdam',
    nameDisplay: 'Amsterdam',
    region: 'Noord-Holland',
    intro:
      'Looking for a roommate in Amsterdam - or have a free room and need a housemate? Match with verified students and young professionals from UvA, VU, HvA and more. Compatibility first, not another room ad.',
    stats: [
      { value: '~€950', label: 'Median room rent (Q2 2026)' },
      { value: 'High', label: 'Housing competition' },
      { value: '3+', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      "Amsterdam's private room market is the most expensive in the Netherlands. Finding a compatible roommate makes shared flats and student houses work - whether you are searching or filling a spot.",
    marketOverview: {
      averageRent:
        'Private-room median around €950/month (Kamernet Q2 2026); shared rooms and outer neighbourhoods can be lower, studios and Centrum higher',
      housingType: 'Shared flats, student residences, studios, and campus-area housing',
      competition: 'Very high - start early and consider matching with a roommate before viewing',
      extra: 'Most contracts 6–12 months; academic-year contracts appear in some student complexes',
    },
    neighborhoods: [
      { name: 'De Pijp', description: 'Lively, multicultural, close to VU', priceRange: 'Often €700+/month' },
      { name: 'Oost', description: 'Diverse, good transport, relatively better value', priceRange: 'Often €550–€800/month' },
      { name: 'Noord', description: 'Creative hub, growing, bike-friendly', priceRange: 'Often €500–€750/month' },
      { name: 'Science Park', description: 'Near UvA campus, modern student housing', priceRange: 'Often €600–€850/month' },
      { name: 'Westerpark', description: 'Green spaces, many young professionals', priceRange: 'Often €700–€950/month' },
    ],
    universities: [
      {
        name: 'University of Amsterdam (UvA)',
        description: 'Large research university across multiple campuses',
        programs: 'Business, Psychology, Medicine, Law, Humanities',
      },
      {
        name: 'Vrije Universiteit Amsterdam (VU)',
        description: 'Research-intensive with strong international focus',
        programs: 'Medicine, Business, Sciences, Humanities',
      },
      {
        name: 'Amsterdam University of Applied Sciences (HvA)',
        description: 'Large UAS with practical, career-oriented programmes',
        programs: 'Business, Engineering, Sports, Media',
      },
      {
        name: 'Other institutions',
        description: 'Gerrit Rietveld Academie, Conservatorium, Inholland and more',
        programs: 'Arts, music, and professional education',
      },
    ],
    faqs: [
      {
        question: 'What does a student room typically cost in Amsterdam?',
        answer:
          'The private-room market median was about €950/month in Q2 2026 (Kamernet). Shared rooms and outer neighbourhoods can be lower; Centrum, Zuid and studios are often higher. Always check what utilities include.',
      },
      {
        question: 'Which universities does Domu Match support in Amsterdam?',
        answer:
          'Students and young professionals connected to UvA, VU, HvA and other Amsterdam institutions use Domu Match to find compatible housemates.',
      },
      {
        question: 'What are popular neighbourhoods for shared living in Amsterdam?',
        answer:
          'De Pijp, Oost, Noord, Science Park and Westerpark are common for students and young professionals. Match on lifestyle first - then choose a neighbourhood together.',
      },
      ...marketplaceFaqs('Amsterdam'),
    ],
  },

  rotterdam: {
    name: 'Rotterdam',
    nameDisplay: 'Rotterdam',
    region: 'Zuid-Holland',
    intro:
      'Find a roommate in Rotterdam or fill a free room with someone who fits. Verified students and young professionals from Erasmus University, Hogeschool Rotterdam, Inholland and more.',
    stats: [
      { value: '~€500–€700', label: 'Typical room rent band' },
      { value: 'Moderate+', label: 'Housing competition' },
      { value: '4', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Rotterdam is usually more affordable than Amsterdam, with strong student areas around Kralingen and a growing young-professional scene. Compatibility still decides whether a house works.',
    marketOverview: {
      averageRent: 'Often €400–€700/month depending on neighbourhood and room type',
      housingType: 'Renovated warehouses, shared flats, modern apartments, student housing',
      competition: 'Moderate to high near EUR; easier than Amsterdam overall',
      extra: 'Metro and bike links make living outside the campus area practical',
    },
    neighborhoods: [
      { name: 'Kralingen', description: 'Near EUR campus, classic student area', priceRange: 'Often €450–€650/month' },
      { name: 'Noord', description: 'Affordable, multicultural, strong transport', priceRange: 'Often €400–€550/month' },
      { name: 'West', description: 'Vibrant, closer to centre', priceRange: 'Often €450–€650/month' },
      { name: 'Blijdorp', description: 'Quieter, green, near the zoo', priceRange: 'Often €400–€550/month' },
      { name: 'Centrum', description: 'Central, nightlife, shops', priceRange: 'Often €500–€750/month' },
    ],
    universities: [
      {
        name: 'Erasmus University Rotterdam (EUR)',
        description: 'Research university known for business, economics and medicine',
        programs: 'Medicine, Business, Economics, Law',
      },
      {
        name: 'Rotterdam University of Applied Sciences',
        description: 'Large UAS with practical programmes',
        programs: 'Business, Healthcare, Engineering, Social Work',
      },
      {
        name: 'Inholland Rotterdam',
        description: 'Applied sciences with industry connections',
        programs: 'Professional and applied programmes',
      },
      {
        name: 'Codarts',
        description: 'University of the Arts (music, dance, circus)',
        programs: 'Music, Dance, Circus Arts',
      },
    ],
    faqs: [
      {
        question: 'What is a typical room rent in Rotterdam?',
        answer:
          'Many student rooms fall roughly in the €400–€700 range depending on area and amenities. Kralingen and Centrum skew higher; Noord and Blijdorp can be better value.',
      },
      {
        question: 'Which institutions do Rotterdam users come from?',
        answer:
          'EUR, Rotterdam University of Applied Sciences, Inholland Rotterdam, Codarts and young professionals working in the city.',
      },
      {
        question: 'Best neighbourhoods for roommates in Rotterdam?',
        answer:
          'Kralingen (EUR), Noord, West, Blijdorp and Centrum are popular. Domu Match helps you agree on lifestyle before you commit to a house.',
      },
      ...marketplaceFaqs('Rotterdam'),
    ],
  },

  utrecht: {
    name: 'Utrecht',
    nameDisplay: 'Utrecht',
    region: 'Utrecht',
    intro:
      'Looking for a roommate in Utrecht – or have a free room? Match with verified UU and HU students and young professionals. Compatibility matching for shared living in the heart of the Netherlands.',
    stats: [
      { value: '~€775', label: 'Median room rent (Q2 2026)' },
      { value: 'High', label: 'Housing competition' },
      { value: '2', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Utrecht is compact and bike-friendly, but private rooms are among the most expensive after Amsterdam. Matching with the right housemate opens shared options faster than searching alone.',
    marketOverview: {
      averageRent:
        'Private-room median around €775/month (Kamernet Q2 2026); ranges vary widely by neighbourhood',
      housingType: 'Canal-side shares, modern flats, student complexes near Science Park',
      competition: 'High - especially near Science Park and the centre',
      extra: 'Most areas are 15–20 minutes by bike across the city',
    },
    neighborhoods: [
      { name: 'Lombok', description: 'Diverse, lively, cafés and shops', priceRange: 'Often €500–€700/month' },
      { name: 'Wittevrouwen', description: 'Residential, quieter', priceRange: 'Often €550–€750/month' },
      { name: 'Science Park', description: 'Near UU campus, modern housing', priceRange: 'Often €600–€800/month' },
      { name: 'Oudwijk', description: 'Green, quieter, can be pricier', priceRange: 'Often €550–€750/month' },
      { name: 'City Centre', description: 'Canals, nightlife, central', priceRange: 'Often €650–€900/month' },
    ],
    universities: [
      {
        name: 'Utrecht University (UU)',
        description: 'Large research university with a strong international intake',
        programs: 'Law, Sciences, Humanities, Medicine',
      },
      {
        name: 'HU University of Applied Sciences',
        description: 'Large UAS across practical fields',
        programs: 'Education, Healthcare, Business, ICT',
      },
    ],
    faqs: [
      {
        question: 'What does a student room cost in Utrecht?',
        answer:
          'The private-room median was about €775/month in Q2 2026 (Kamernet). Lombok and some residential areas can be lower; centre and Science Park often higher.',
      },
      {
        question: 'Which universities does Domu Match support in Utrecht?',
        answer: 'Students from Utrecht University and HU, plus young professionals living and working in Utrecht.',
      },
      {
        question: 'Popular roommate neighbourhoods in Utrecht?',
        answer:
          'Lombok, Wittevrouwen, Science Park, Oudwijk and the city centre. Agree on noise, guests and commute before you sign.',
      },
      ...marketplaceFaqs('Utrecht'),
    ],
  },

  'den-haag': {
    name: 'Den Haag',
    nameDisplay: 'The Hague',
    region: 'Zuid-Holland',
    intro:
      'Find a compatible roommate in The Hague - or a housemate for your free room. Verified students from THUAS, Leiden University Campus The Hague, and young professionals in an international city.',
    stats: [
      { value: '~€450–€700', label: 'Typical room rent band' },
      { value: 'Moderate+', label: 'Housing competition' },
      { value: '3+', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'The Hague mixes international organisations, UAS students and beachside living. Shared houses work best when housemates align on routines and guests - Domu Match focuses on that match.',
    marketOverview: {
      averageRent: 'Often €400–€700/month depending on neighbourhood; Scheveningen skews higher',
      housingType: 'Canal houses, modern apartments, DUWO and private shares',
      competition: 'Moderate to high; register early with corporations where relevant',
      extra: 'DUWO and other providers matter for student stock - still match people separately',
    },
    neighborhoods: [
      { name: 'Zeeheldenkwartier', description: 'Canals, cafés, close to many schools', priceRange: 'Often €450–€650/month' },
      { name: 'Statenkwartier', description: 'Residential, near beach', priceRange: 'Often €500–€700/month' },
      { name: 'Laakkwartier', description: 'Closer to centre, diverse', priceRange: 'Often €400–€550/month' },
      { name: 'Regentessekwartier', description: 'Lively, shops and restaurants', priceRange: 'Often €450–€600/month' },
      { name: 'Bezuidenhout', description: 'Near Haagse Bos, mixed housing', priceRange: 'Often €450–€600/month' },
      { name: 'Scheveningen', description: 'Beachside, often pricier', priceRange: 'Often €500–€750/month' },
    ],
    universities: [
      {
        name: 'The Hague University of Applied Sciences (THUAS)',
        description: 'Large international UAS',
        programs: 'International Business, Law, Security, ICT',
      },
      {
        name: 'Leiden University - The Hague Campus',
        description: 'Governance, law and international programmes',
        programs: 'Law, Public Administration, International Studies',
      },
      {
        name: 'Other institutions',
        description: 'ISS, Hotelschool The Hague and specialised schools',
        programs: 'Development studies, hospitality and more',
      },
    ],
    faqs: [
      {
        question: 'What is typical room rent in The Hague?',
        answer:
          'Many rooms fall in roughly €400–€700/month. Zeeheldenkwartier and Scheveningen can cost more; Laak and some residential areas offer better value.',
      },
      {
        question: 'Which institutions are common among Domu Match users in The Hague?',
        answer: 'THUAS, Leiden University The Hague campus, Hotelschool and young professionals in NGOs, government and tech.',
      },
      {
        question: 'Best areas for shared living in The Hague?',
        answer:
          'Zeeheldenkwartier, Statenkwartier, Laakkwartier, Regentessekwartier, Bezuidenhout and Scheveningen - pick based on commute and lifestyle, after you match.',
      },
      ...marketplaceFaqs('The Hague'),
    ],
  },

  eindhoven: {
    name: 'Eindhoven',
    nameDisplay: 'Eindhoven',
    region: 'Noord-Brabant',
    intro:
      'Roommate matching in Eindhoven for TU/e and Fontys students and tech young professionals. Looking for a housemate - or filling a free room in Brainport?',
    stats: [
      { value: '~€540', label: 'Median room rent (Q2 2026)' },
      { value: 'High', label: 'Housing pressure' },
      { value: '2+', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Eindhoven rents rose sharply recently but remain below Randstad peaks. Start early - and match on lifestyle so your shared house survives exam weeks and night shifts.',
    marketOverview: {
      averageRent:
        'Private-room median around €540/month (Kamernet Q2 2026); studios and furnished rooms can be higher',
      housingType: 'Shared houses, studios, association and campus-area housing',
      competition: 'High for good rooms - TU/e recommends searching months ahead',
      extra: 'Reserved institutional rooms help some students; Domu Match helps with the people side',
    },
    neighborhoods: [
      { name: 'Stratum / Stratumseind', description: 'Nightlife and central energy', priceRange: 'Often €450–€650/month' },
      { name: 'Woensel', description: 'More affordable, diverse, good transport', priceRange: 'Often €400–€550/month' },
      { name: 'Campus area', description: 'Near TU/e, convenient for students', priceRange: 'Often €450–€650/month' },
      { name: 'Centrum', description: 'City centre, shops, restaurants', priceRange: 'Often €500–€700/month' },
      { name: 'Gestel', description: 'Quieter, residential', priceRange: 'Often €400–€550/month' },
    ],
    universities: [
      {
        name: 'Eindhoven University of Technology (TU/e)',
        description: 'Leading tech and engineering university',
        programs: 'Engineering, Computer Science, Industrial Design, Applied Physics',
      },
      {
        name: 'Fontys University of Applied Sciences',
        description: 'Large UAS with strong Eindhoven presence',
        programs: 'ICT, Engineering, Business, Arts',
      },
    ],
    faqs: [
      {
        question: 'What does a student room cost in Eindhoven?',
        answer:
          'The private-room median was about €540/month in Q2 2026 (Kamernet), after a steep year-on-year rise. Always confirm utilities and contract length.',
      },
      {
        question: 'Which universities does Domu Match support in Eindhoven?',
        answer: 'TU/e and Fontys students, plus young professionals in Brainport tech and design.',
      },
      {
        question: 'When should I start looking in Eindhoven?',
        answer:
          'As early as possible - many students start from spring for the next academic year. Matching a roommate first can expand the houses you can apply for together.',
      },
      ...marketplaceFaqs('Eindhoven'),
    ],
  },

  groningen: {
    name: 'Groningen',
    nameDisplay: 'Groningen',
    region: 'Groningen',
    intro:
      'Find a roommate in Groningen or a housemate for your free room. Verified RUG and Hanze students in one of the Netherlands’ most student-dense cities.',
    stats: [
      { value: '~€400–€550', label: 'Typical room rent band' },
      { value: 'High', label: 'Student demand' },
      { value: '2', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Groningen’s student share of the population is huge. Start 3–5 months early. Domu Match helps you find who you live with - seekers and houses with a free room.',
    marketOverview: {
      averageRent: 'Often €350–€550/month depending on area; centre is pricier',
      housingType: 'SSH and corporation rooms, private shares, apartments',
      competition: 'High demand every academic year - plan ahead',
      extra: 'Compact city - most neighbourhoods are within a 25-minute bike ride',
    },
    neighborhoods: [
      { name: 'City Centre', description: 'Vibrant, shops, nightlife', priceRange: 'Often €450–€650/month' },
      { name: 'Paddepoel', description: 'Near Zernike, student-heavy', priceRange: 'Often €350–€500/month' },
      { name: 'Selwerd', description: 'Affordable, near Zernike', priceRange: 'Often €350–€500/month' },
      { name: 'Oosterpoort', description: 'Near station, good value', priceRange: 'Often €400–€550/month' },
      { name: 'Oosterpark', description: 'Popular student area', priceRange: 'Often €400–€550/month' },
    ],
    universities: [
      {
        name: 'University of Groningen (RUG)',
        description: 'Large research university with many internationals',
        programs: 'Law, Economics, Sciences, Humanities, Medicine',
      },
      {
        name: 'Hanze University of Applied Sciences',
        description: 'Large UAS with strong practical programmes',
        programs: 'Business, Engineering, Arts, Healthcare',
      },
    ],
    faqs: [
      {
        question: 'What is typical room rent in Groningen?',
        answer:
          'Many rooms fall around €350–€550/month. Paddepoel and Selwerd are often better value near Zernike; the centre costs more.',
      },
      {
        question: 'Which universities does Domu Match support in Groningen?',
        answer: 'University of Groningen (RUG) and Hanze University of Applied Sciences, plus young professionals staying in the city.',
      },
      {
        question: 'Is Groningen good for international students?',
        answer:
          'Yes - large international community. Domu Match helps Dutch and international students find compatible housemates (and fill free rooms) without relying only on Facebook groups.',
      },
      ...marketplaceFaqs('Groningen'),
    ],
  },

  leiden: {
    name: 'Leiden',
    nameDisplay: 'Leiden',
    region: 'Zuid-Holland',
    intro:
      'Roommate finder for Leiden University students and young professionals. Looking for a housemate in the oldest university city - or need someone for your free room?',
    stats: [
      { value: '~€450–€650', label: 'Typical room rent band' },
      { value: 'High', label: 'Housing competition' },
      { value: '1+', label: 'Major university' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Leiden is compact and historic, with pressure around the centre and Bio Science Park. Match on habits first so a canal-side share actually works.',
    marketOverview: {
      averageRent: 'Often €400–€650/month; centre and Bio Science Park skew higher',
      housingType: 'Historic shares, canal housing, modern flats, student complexes',
      competition: 'High - start early for centre and campus-adjacent rooms',
      extra: 'Most neighbourhoods are within about 15 minutes by bike',
    },
    neighborhoods: [
      { name: 'City centre', description: 'Historic, canals, cafés, nightlife', priceRange: 'Often €500–€700/month' },
      { name: 'Leiden-Noord', description: 'Quieter, often better value', priceRange: 'Often €400–€550/month' },
      { name: 'Bio Science Park', description: 'Near science faculty, modern', priceRange: 'Often €450–€650/month' },
      { name: 'Stevenshof', description: 'Residential, quieter', priceRange: 'Often €400–€550/month' },
      { name: 'Zuidwest', description: 'More affordable, diverse', priceRange: 'Often €380–€520/month' },
    ],
    universities: [
      {
        name: 'Leiden University',
        description: 'Oldest university in the Netherlands; strong research profile',
        programs: 'Law, Humanities, Sciences, Medicine, International Relations',
      },
      {
        name: 'Hogeschool Leiden',
        description: 'University of applied sciences in and around Leiden',
        programs: 'Applied and professional programmes',
      },
    ],
    faqs: [
      {
        question: 'What does a student room cost in Leiden?',
        answer:
          'Expect roughly €400–€650/month for many rooms. The historic centre is pricier; Leiden-Noord and Zuidwest can offer better value.',
      },
      {
        question: 'Which institutions does Domu Match support in Leiden?',
        answer: 'Leiden University and Hogeschool Leiden students, plus young professionals living in the Leiden region.',
      },
      {
        question: 'Best neighbourhoods for shared living in Leiden?',
        answer:
          'City centre, Leiden-Noord, Bio Science Park, Stevenshof and Zuidwest. Match first, then choose the commute that fits both of you.',
      },
      ...marketplaceFaqs('Leiden'),
    ],
  },

  nijmegen: {
    name: 'Nijmegen',
    nameDisplay: 'Nijmegen',
    region: 'Gelderland',
    intro:
      'Find a roommate in Nijmegen or fill a free room near Radboud and HAN. Verified matching for students and young professionals in a green, lively student city.',
    stats: [
      { value: '~€400–€600', label: 'Typical room rent band' },
      { value: 'Moderate+', label: 'Housing competition' },
      { value: '2', label: 'Major institutions' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Nijmegen combines campus life at Heijendaal with a historic centre. Shared houses succeed when people agree on guests, cleaning and study quiet - Domu Match starts there.',
    marketOverview: {
      averageRent: 'Often €350–€600/month depending on area and room type',
      housingType: 'Shared houses, studios, campus-area housing near Heijendaal',
      competition: 'Moderate to high before the academic year',
      extra: 'Heijendaal is popular for Radboud and HAN students',
    },
    neighborhoods: [
      { name: 'City centre', description: 'Historic, shops, nightlife', priceRange: 'Often €450–€650/month' },
      { name: 'Dukenburg', description: 'More affordable, good transport', priceRange: 'Often €350–€500/month' },
      { name: 'Heijendaal', description: 'Near Radboud and HAN campus', priceRange: 'Often €400–€600/month' },
      { name: 'Lent', description: 'Across the Waal, more space', priceRange: 'Often €400–€550/month' },
      { name: 'Bottendaal', description: 'Student-heavy, lively', priceRange: 'Often €420–€580/month' },
    ],
    universities: [
      {
        name: 'Radboud University',
        description: 'Broad research university',
        programs: 'Law, Medicine, Sciences, Humanities, Social Sciences',
      },
      {
        name: 'HAN University of Applied Sciences',
        description: 'Large UAS with a strong Nijmegen presence',
        programs: 'Business, Engineering, Healthcare, Education',
      },
    ],
    faqs: [
      {
        question: 'What is typical room rent in Nijmegen?',
        answer:
          'Many rooms fall around €350–€600/month. Dukenburg and Bottendaal can be better value; Heijendaal trades price for campus proximity.',
      },
      {
        question: 'Which universities does Domu Match support in Nijmegen?',
        answer: 'Radboud University and HAN University of Applied Sciences, plus young professionals in the region.',
      },
      {
        question: 'Popular roommate areas in Nijmegen?',
        answer:
          'Centre, Dukenburg, Heijendaal, Bottendaal and Lent. Match on lifestyle, then pick the side of the river that fits both of you.',
      },
      ...marketplaceFaqs('Nijmegen'),
    ],
  },

  breda: {
    name: 'Breda',
    nameDisplay: 'Breda',
    region: 'Noord-Brabant',
    intro:
      'Looking for a roommate in Breda – or have a free room and need a housemate? Domu Match connects verified Avans and BUas students and young professionals through compatibility matching, not room ads.',
    stats: [
      { value: '~€553', label: 'Median room rent (Q2 2026)' },
      { value: 'Avans + BUas', label: 'Key institutions' },
      { value: 'Rising', label: 'Rent trend vs last year' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Breda sits between Randstad pressure and Brabant student life. Private rooms rose to a median around €553/month in Q2 2026. Whether you need a roommate or have a spare room in a student house, start with who you live with.',
    marketOverview: {
      averageRent:
        'Private-room median about €553/month (Kamernet Q2 2026, +4.3% YoY). Expect a band around €450–€700 depending on size, furniture and location',
      housingType:
        'Shared student houses, rooms above shops near the station, modern flats in Belcrum, quieter homes toward Ginneken',
      competition:
        'Moderate but tightening - good rooms near Avans/BUas and the station go quickly before September',
      extra:
        'Young professionals in logistics, creative and hospitality also share flats. Domu Match matches students with students and professionals with professionals',
    },
    neighborhoods: [
      {
        name: 'Centrum / Grote Markt',
        description: 'Historic centre, nightlife, walkable to many campuses and cafés',
        priceRange: 'Often €500–€700/month',
      },
      {
        name: 'Station / Belcrum',
        description: 'Fast NS links, growing creative/residential pocket north of the tracks',
        priceRange: 'Often €480–€650/month',
      },
      {
        name: 'Haagpoort / Heusdenhout side',
        description: 'Practical for cycling to Avans locations; calmer residential streets',
        priceRange: 'Often €450–€600/month',
      },
      {
        name: 'Ginneken',
        description: 'Leafy, village feel, popular with later-year students and young professionals',
        priceRange: 'Often €500–€700/month',
      },
      {
        name: 'Brabantpark / east',
        description: 'More space, good value if you accept a slightly longer bike ride',
        priceRange: 'Often €450–€580/month',
      },
    ],
    universities: [
      {
        name: 'Avans University of Applied Sciences (Breda)',
        description: 'Major UAS hub in Breda with a large regional student population',
        programs: 'Business, Engineering, ICT, Built Environment, Social Studies',
      },
      {
        name: 'Breda University of Applied Sciences (BUas)',
        description: 'Specialised UAS known for tourism, games, media and logistics',
        programs: 'Tourism, Leisure, Games, Media, Logistics, Hotel',
      },
      {
        name: 'Young professionals in Breda',
        description: 'Graduates staying for work in logistics, creative industries and hospitality',
        programs: 'Shared flats and young-professional houses across the city',
      },
    ],
    faqs: [
      {
        question: 'What does a student room cost in Breda?',
        answer:
          'The private-room median was about €553/month in Q2 2026 (Kamernet), up roughly 4% year-on-year. Budget a wider band (€450–€700) depending on utilities, furniture and neighbourhood.',
      },
      {
        question: 'Which schools does Domu Match support in Breda?',
        answer:
          'Avans and BUas students are the core student audience, plus young professionals living and working in Breda. Students match with students; professionals with professionals.',
      },
      {
        question: 'I have a free room in a Breda student house - can I find a housemate here?',
        answer:
          'Yes. That is the “have a room, need a housemate” side of Domu Match: create a profile for your house vibe and match with verified people who want a room in Breda – without posting another anonymous ad.',
      },
      {
        question: 'How is this different from Facebook groups or Kamernet for Breda?',
        answer:
          'Listing sites and groups show rooms. Domu Match focuses on compatibility and verification so you know why someone is a fit before the viewing - whether you are searching or filling a spot.',
      },
      {
        question: 'What are good neighbourhoods for roommates in Breda?',
        answer:
          'Centrum for nightlife and short walks, Belcrum/station for trains, Haagpoort for Avans cycling routes, Ginneken for a calmer vibe, and Brabantpark for space. Match on lifestyle first, then pick the area together.',
      },
      {
        question: 'Can internationals and Dutch students both use Domu Match in Breda?',
        answer:
          'Yes. BUas and Avans attract both. Profiles and matching work in English and Dutch so mixed houses can still align on expectations.',
      },
      ...marketplaceFaqs('Breda'),
    ],
  },

  tilburg: {
    name: 'Tilburg',
    nameDisplay: 'Tilburg',
    region: 'Noord-Brabant',
    intro:
      'Looking for a roommate in Tilburg – or have a free room near campus? Match with verified Tilburg University, Fontys and Avans students and young professionals. People matching, not room listings.',
    stats: [
      { value: '~€595', label: 'Median room rent (Q2 2026)' },
      { value: 'TiU + Fontys', label: 'Key institutions' },
      { value: '+11%', label: 'YoY median rent change' },
      { value: 'Both', label: 'Seekers & free rooms' },
    ],
    housingIntro:
      'Tilburg’s private-room median hit about €595/month in Q2 2026 (+11.2% YoY). Competition is softer than Amsterdam, but good rooms near Tilburg University and the centre still vanish fast. Domu Match helps seekers and houses with a free room find each other on compatibility.',
    marketOverview: {
      averageRent:
        'Private-room median about €595/month (Kamernet Q2 2026). Plan roughly €450–€700 for most student rooms depending on inclusief/exclusief and size',
      housingType:
        'Classic student houses, corporation rooms (e.g. via ROOM.nl / providers), private shares, and flats toward Quirijnstok and campus',
      competition:
        'Easier than Randstad but still seasonal - August rush is real. Matching a housemate first can unlock whole-house applications',
      extra:
        'International master’s students at Tilburg University often need English-friendly houses; young professionals stay for data, law and creative work',
    },
    neighborhoods: [
      {
        name: 'Centrum / Spoorzone',
        description: 'City centre energy, Pieter Vreedeplein, growing Spoorzone creative belt',
        priceRange: 'Often €520–€700/month',
      },
      {
        name: 'Korvel / West',
        description: 'Classic student-house streets, lively, short bike to centre',
        priceRange: 'Often €480–€650/month',
      },
      {
        name: 'Oud-Noord',
        description: 'Residential character, good value, solid cycling routes',
        priceRange: 'Often €450–€600/month',
      },
      {
        name: 'Quirijnstok / campus side',
        description: 'Closer to Tilburg University campus; practical for early lectures',
        priceRange: 'Often €500–€680/month',
      },
      {
        name: 'Oerle / south-west',
        description: 'Quieter, more space, popular with later-year students and YPs',
        priceRange: 'Often €470–€620/month',
      },
    ],
    universities: [
      {
        name: 'Tilburg University',
        description: 'Research university with strong economics, law, data science and social sciences',
        programs: 'Economics, Law, Data Science, Psychology, Business',
      },
      {
        name: 'Fontys Tilburg',
        description: 'Major Fontys locations in Tilburg for applied programmes',
        programs: 'ICT, Teacher Education, Arts, Business, Engineering',
      },
      {
        name: 'Avans (Tilburg region)',
        description: 'Avans presence in the Tilburg area alongside Breda campuses',
        programs: 'Applied sciences and professional bachelor programmes',
      },
      {
        name: 'Young professionals in Tilburg',
        description: 'Graduates staying for work across Brabant’s knowledge and creative economy',
        programs: 'Shared flats and professional housemate matching',
      },
    ],
    faqs: [
      {
        question: 'What does a student room cost in Tilburg?',
        answer:
          'The private-room median was about €595/month in Q2 2026 (Kamernet), up about 11% year-on-year. Budget €450–€700 for many rooms once you include variation in utilities and furniture.',
      },
      {
        question: 'Which universities does Domu Match support in Tilburg?',
        answer:
          'Tilburg University, Fontys Tilburg, Avans students in the region, and young professionals living in Tilburg. Students match only with students; professionals with professionals.',
      },
      {
        question: 'I have a free room in Tilburg - can I find a housemate on Domu Match?',
        answer:
          'Yes. Use Domu Match when you already have a room: describe your house culture and match with verified people looking for a room in Tilburg, instead of relying only on Facebook or listing sites.',
      },
      {
        question: 'How is Domu Match different from ROOM.nl or Kamernet in Tilburg?',
        answer:
          'ROOM.nl and Kamernet help with housing stock and ads. Domu Match helps with the people decision - who you live with - using verification and compatibility. Use both: match a housemate, then secure the room.',
      },
      {
        question: 'What neighbourhoods work well for roommates in Tilburg?',
        answer:
          'Centrum/Spoorzone for city life, Korvel for classic student houses, Oud-Noord for value, Quirijnstok for campus proximity, and Oerle for quieter living. Agree on bike time and nightlife tolerance before you sign.',
      },
      {
        question: 'Is Tilburg good for international students looking for roommates?',
        answer:
          'Yes. Tilburg University has a substantial international intake. Domu Match helps internationals and Dutch students find compatible housemates with clear expectations - not lottery-style group chats.',
      },
      ...marketplaceFaqs('Tilburg'),
    ],
  },
}
