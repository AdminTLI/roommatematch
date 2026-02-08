/**
 * Shared content for all university city landing pages.
 * Each city has the same section structure; copy is city-specific.
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
  nameDisplay: string // e.g. "The Hague" for den-haag
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
        description: `Find compatible roommates in ${city.nameDisplay}`,
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
      'Connect with compatible students from UvA, VU, HvA, and other Amsterdam universities. Science-backed matching for harmonious living in the capital.',
    stats: [
      { value: '4,200+', label: 'Amsterdam students' },
      { value: '€550', label: 'Avg. room price' },
      { value: '5', label: 'Major universities' },
      { value: '92%', label: 'Match satisfaction' },
    ],
    housingIntro:
      "Amsterdam's student housing market is competitive, but finding the right roommate makes all the difference.",
    marketOverview: {
      averageRent: '€450-€1,200/month depending on location and room type',
      housingType: 'Mix of studio apartments, shared flats, and student residences',
      competition: 'High demand, especially for affordable options near universities',
      extra: 'Most rental agreements are 6-12 months; some landlords offer academic year contracts',
    },
    neighborhoods: [
      { name: 'De Pijp', description: 'Lively atmosphere, multicultural, close to VU', priceRange: '€650-€900/month' },
      { name: 'Oost', description: 'Affordable, diverse, good transport links', priceRange: '€500-€700/month' },
      { name: 'Noord', description: 'Creative hub, growing community, bike-friendly', priceRange: '€450-€650/month' },
      { name: 'Science Park', description: 'Near UvA campus, modern student housing', priceRange: '€600-€800/month' },
      { name: 'Westerpark', description: 'Green spaces, young professionals', priceRange: '€700-€950/month' },
    ],
    universities: [
      {
        name: 'University of Amsterdam (UvA)',
        description: '31,000+ students | Research university with broad programs',
        programs: 'Popular programs: Business, Psychology, Medicine, Law',
      },
      {
        name: 'Vrije Universiteit Amsterdam (VU)',
        description: '29,000+ students | Research-intensive with strong international focus',
        programs: 'Popular programs: Medicine, Business, Sciences, Humanities',
      },
      {
        name: 'Amsterdam University of Applied Sciences (HvA)',
        description: '46,000+ students | Practical, career-oriented education',
        programs: 'Popular programs: Business, Engineering, Sports, Media',
      },
      {
        name: 'Other Institutions',
        description: 'Gerrit Rietveld Academie, Conservatorium van Amsterdam, Inholland',
        programs: 'Specialized programs in arts, music, and professional education',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Amsterdam?',
        answer:
          'Student rooms in Amsterdam typically range from €450-€700 per month for a shared room, and €700-€1,200 for a private room. Prices vary by neighborhood, with areas like Centrum and Zuid being more expensive than Oost or Noord.',
      },
      {
        question: 'Which universities does Domu Match work with in Amsterdam?',
        answer:
          'Domu Match works with all major Amsterdam universities including University of Amsterdam (UvA), Vrije Universiteit Amsterdam (VU), Amsterdam University of Applied Sciences (HvA), Gerrit Rietveld Academie, and Conservatorium van Amsterdam.',
      },
      {
        question: 'What are the best neighborhoods for students in Amsterdam?',
        answer:
          'Popular student neighborhoods in Amsterdam include De Pijp (lively, multicultural), Oost (affordable, diverse), Noord (creative, growing), Westerpark (young professionals), and areas near university campuses like Science Park and Uilenstede.',
      },
      {
        question: 'Is it hard to find student housing in Amsterdam?',
        answer:
          'Amsterdam has a competitive student housing market due to high demand. Starting your search early (3-6 months before moving) and using specialized platforms like Domu Match significantly improves your chances. Finding compatible roommates also opens up more housing options.',
      },
      {
        question: 'Can international students use Domu Match?',
        answer:
          'Yes! Domu Match is perfect for international students studying in Amsterdam. Our platform helps you connect with both Dutch and international students, making your transition to Amsterdam easier.',
      },
    ],
  },
  rotterdam: {
    name: 'Rotterdam',
    nameDisplay: 'Rotterdam',
    region: 'Zuid-Holland',
    intro:
      'Connect with compatible students from Erasmus University, InHolland, and other Rotterdam institutions. Science-backed matching for harmonious living.',
    stats: [
      { value: '2,800+', label: 'Rotterdam students' },
      { value: '€420', label: 'Avg. room price' },
      { value: '4', label: 'Major universities' },
      { value: '94%', label: 'Match satisfaction' },
    ],
    housingIntro:
      'Rotterdam offers more affordable housing than Amsterdam with excellent student amenities and transport.',
    marketOverview: {
      averageRent: '€350-€650/month, more affordable than Amsterdam',
      housingType: 'Mix of renovated warehouses, modern apartments, and traditional housing',
      competition: 'Moderate demand, easier to find housing than Amsterdam',
      extra: 'Excellent metro system connects all major areas',
    },
    neighborhoods: [
      { name: 'Kralingen', description: 'Near EUR campus, student-friendly', priceRange: '€400-€600/month' },
      { name: 'Noord', description: 'Affordable, multicultural, great transport', priceRange: '€350-€500/month' },
      { name: 'West', description: 'Vibrant, close to city center', priceRange: '€450-€650/month' },
      { name: 'Blijdorp', description: 'Quiet, green spaces, near zoo', priceRange: '€400-€550/month' },
      { name: 'Centrum', description: 'Central location, nightlife, shops', priceRange: '€500-€750/month' },
    ],
    universities: [
      {
        name: 'Erasmus University Rotterdam (EUR)',
        description: '24,000+ students | Top-ranked business and economics programs',
        programs: 'Popular programs: Medicine, Business, Economics, Law',
      },
      {
        name: 'Rotterdam University of Applied Sciences',
        description: '28,000+ students | Practical education in business, healthcare, engineering',
        programs: 'Popular programs: Business, Healthcare, Engineering, Social Work',
      },
      {
        name: 'InHolland Rotterdam',
        description: 'Professional education with strong industry connections',
        programs: 'Various applied sciences and professional programs',
      },
      {
        name: 'Codarts',
        description: 'University of Arts for music, dance, and circus performers',
        programs: 'Music, Dance, Circus Arts',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Rotterdam?',
        answer:
          'Student rooms in Rotterdam typically range from €350-€650 per month, making it more affordable than Amsterdam. Kralingen and Noord are popular and relatively budget-friendly.',
      },
      {
        question: 'Which universities does Domu Match work with in Rotterdam?',
        answer:
          'Domu Match works with Erasmus University (EUR), Rotterdam University of Applied Sciences, InHolland Rotterdam, and Codarts. We help students from all these institutions find compatible roommates.',
      },
      {
        question: 'What are the best neighborhoods for students in Rotterdam?',
        answer:
          'Popular student areas include Kralingen (near EUR campus), Noord (affordable, multicultural), West (vibrant, central), and Blijdorp (quiet, green). The metro makes commuting easy.',
      },
      {
        question: 'Is Rotterdam a good city for international students?',
        answer:
          'Yes. Rotterdam is very international, with English widely spoken. Erasmus University and other institutions attract students from around the world. Domu Match helps you find roommates who share your lifestyle regardless of background.',
      },
    ],
  },
  utrecht: {
    name: 'Utrecht',
    nameDisplay: 'Utrecht',
    region: 'Utrecht',
    intro:
      'Connect with verified students from Utrecht University, HU, and other institutions. Science-backed matching in the heart of the Netherlands.',
    stats: [
      { value: '3,100+', label: 'Utrecht students' },
      { value: '€520', label: 'Avg. room price' },
      { value: '2', label: 'Major universities' },
      { value: '91%', label: 'Match satisfaction' },
    ],
    housingIntro:
      'Utrecht offers a compact, bike-friendly city with good student housing options and a strong student community.',
    marketOverview: {
      averageRent: '€450-€700/month depending on area and room type',
      housingType: 'Mix of historic canal-side housing, modern apartments, and student complexes',
      competition: 'High demand; start searching early, especially near Science Park',
      extra: 'Excellent cycling infrastructure; most areas are 15–20 minutes by bike',
    },
    neighborhoods: [
      { name: 'Lombok', description: 'Diverse, lively, good cafés and shops', priceRange: '€450-€650/month' },
      { name: 'Wittevrouwen', description: 'Residential, quiet, family-friendly', priceRange: '€500-€700/month' },
      { name: 'Science Park', description: 'Near UU campus, modern housing', priceRange: '€550-€750/month' },
      { name: 'Oudwijk', description: 'Green, quiet, slightly more expensive', priceRange: '€550-€750/month' },
      { name: 'City Centre', description: 'Central, canals, nightlife', priceRange: '€600-€850/month' },
    ],
    universities: [
      {
        name: 'Utrecht University (UU)',
        description: '30,000+ students | Broad academic programs, strong research',
        programs: 'Popular programs: Law, Sciences, Humanities, Medicine',
      },
      {
        name: 'HU University of Applied Sciences',
        description: '38,000+ students | Practical education across many fields',
        programs: 'Popular programs: Education, Healthcare, Business, ICT',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Utrecht?',
        answer:
          'Student rooms in Utrecht typically range from €450-€700 per month. Lombok and Wittevrouwen are popular and relatively affordable; Science Park is convenient for UU students.',
      },
      {
        question: 'Which universities does Domu Match work with in Utrecht?',
        answer:
          'Domu Match works with Utrecht University (UU) and HU University of Applied Sciences. Students from both institutions use our platform to find compatible roommates.',
      },
      {
        question: 'What are the best neighborhoods for students in Utrecht?',
        answer:
          'Popular student neighborhoods include Lombok (diverse, lively), Wittevrouwen (quiet, residential), Science Park (near campus), and the city centre for those who want to be in the heart of the city.',
      },
      {
        question: 'Is Utrecht good for international students?',
        answer:
          'Yes. Utrecht is very international and bike-friendly. Many courses are taught in English. Domu Match helps international and Dutch students find roommates who match their lifestyle.',
      },
    ],
  },
  'den-haag': {
    name: 'Den Haag',
    nameDisplay: 'The Hague',
    region: 'Zuid-Holland',
    intro:
      'Connect with verified students from The Hague University, Leiden University The Hague, and other institutions. Science-backed matching in the international city of peace and justice.',
    stats: [
      { value: '2,200+', label: 'The Hague students' },
      { value: '€480', label: 'Avg. room price' },
      { value: '3+', label: 'Major institutions' },
      { value: '90%', label: 'Match satisfaction' },
    ],
    housingIntro:
      'The Hague offers an international atmosphere, seaside access, and a mix of historic and modern neighborhoods.',
    marketOverview: {
      averageRent: '€400-€650/month depending on neighborhood',
      housingType: 'Canal houses, modern apartments, and student housing from DUWO and others',
      competition: 'Moderate to high; register with DUWO early',
      extra: 'DUWO is the largest student housing provider; register as soon as you accept your offer',
    },
    neighborhoods: [
      { name: 'Zeeheldenkwartier', description: 'Canals, Art Nouveau, cafés, close to ISS', priceRange: '€450-€650/month' },
      { name: 'Statenkwartier', description: 'Residential, safe, near beach', priceRange: '€500-€700/month' },
      { name: 'Laakkwartier', description: 'Close to city centre, diverse', priceRange: '€400-€550/month' },
      { name: 'Regentessekwartier', description: 'Lively, shops, restaurants', priceRange: '€450-€600/month' },
      { name: 'Bezuidenhout', description: 'Near Haagse Bos park, mix of housing', priceRange: '€450-€600/month' },
      { name: 'Scheveningen', description: 'Beach, seaside, slightly higher rents', priceRange: '€500-€750/month' },
    ],
    universities: [
      {
        name: 'The Hague University of Applied Sciences (THUAS)',
        description: '28,000+ students | Strong international focus, practical programs',
        programs: 'Popular programs: International Business, Law, Security, ICT',
      },
      {
        name: 'Leiden University – The Hague Campus',
        description: 'Programmes in law, governance, international relations',
        programs: 'Law, Public Administration, International Studies',
      },
      {
        name: 'Other institutions',
        description: 'ISS, Hotelschool The Hague, and other specialized schools',
        programs: 'Development studies, hospitality, and more',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in The Hague?',
        answer:
          'Student rooms in The Hague typically range from €400-€650 per month. Zeeheldenkwartier, Laakkwartier, and Regentessekwartier are popular. Scheveningen is pricier but offers beach access.',
      },
      {
        question: 'Which universities does Domu Match work with in The Hague?',
        answer:
          'Domu Match works with The Hague University of Applied Sciences (THUAS), Leiden University The Hague campus, and other institutions in the city. We help students find compatible roommates across all of them.',
      },
      {
        question: 'What are the best neighborhoods for students in The Hague?',
        answer:
          'Popular student areas include Zeeheldenkwartier (canals, cafés), Statenkwartier (residential, near beach), Laakkwartier (central, affordable), Regentessekwartier (lively), and Bezuidenhout (green, quiet).',
      },
      {
        question: 'Can international students use Domu Match in The Hague?',
        answer:
          'Yes. The Hague is very international. Domu Match is ideal for international students—you can find roommates who share your lifestyle and make the transition to the city easier.',
      },
    ],
  },
  eindhoven: {
    name: 'Eindhoven',
    nameDisplay: 'Eindhoven',
    region: 'Noord-Brabant',
    intro:
      'Connect with verified students from TU Eindhoven, Fontys, and other institutions in the Netherlands’ tech hub. Science-backed matching for innovators.',
    stats: [
      { value: '2,500+', label: 'Eindhoven students' },
      { value: '€420', label: 'Avg. room price' },
      { value: '2', label: 'Major universities' },
      { value: '93%', label: 'Match satisfaction' },
    ],
    housingIntro:
      "Eindhoven's tech scene attracts innovative students. Housing is more affordable than Amsterdam or Utrecht, with good options near campus and in the city.",
    marketOverview: {
      averageRent: '€350-€550/month; studios can reach €650-€870 including utilities',
      housingType: 'Student rooms in shared houses, studios, and association housing',
      competition: 'Shortage in Eindhoven; start searching early (e.g. April for next year)',
      extra: 'TU/e and Fontys partner with housing organizations; apply for reserved rooms if eligible',
    },
    neighborhoods: [
      { name: 'Stratumseind', description: 'Nightlife, central, lively', priceRange: '€400-€600/month' },
      { name: 'Woensel', description: 'Affordable, diverse, good transport', priceRange: '€350-€500/month' },
      { name: 'Campus area', description: 'Near TU/e, convenient for students', priceRange: '€450-€650/month' },
      { name: 'Centrum', description: 'City centre, shops, restaurants', priceRange: '€500-€700/month' },
      { name: 'Gestel', description: 'Quiet, residential, family-friendly', priceRange: '€400-€550/month' },
    ],
    universities: [
      {
        name: 'Eindhoven University of Technology (TU/e)',
        description: '11,000+ students | Top tech and engineering university',
        programs: 'Popular programs: Engineering, Computer Science, Industrial Design, Applied Physics',
      },
      {
        name: 'Fontys University of Applied Sciences',
        description: '44,000+ students across locations | Practical tech and creative programs',
        programs: 'Popular programs: ICT, Engineering, Business, Arts',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Eindhoven?',
        answer:
          'Student rooms in Eindhoven typically range from €350-€550 per month (shared) and €410-€870 including utilities for studios. More affordable than Amsterdam or Utrecht.',
      },
      {
        question: 'Which universities does Domu Match work with in Eindhoven?',
        answer:
          'Domu Match works with TU Eindhoven (TU/e) and Fontys. Students from both use our platform to find compatible roommates in the tech hub.',
      },
      {
        question: 'What are the best neighborhoods for students in Eindhoven?',
        answer:
          'Popular areas include Stratumseind (central, nightlife), Woensel (affordable), the campus area (near TU/e), and Centrum. Expand to nearby villages if needed.',
      },
      {
        question: 'When should I start looking for housing in Eindhoven?',
        answer:
          'Start as early as possible. TU/e recommends from April for the next academic year. Fontys has deadlines (e.g. June 15 for fall). Domu Match helps you find roommates first, then you can search for housing together.',
      },
    ],
  },
  groningen: {
    name: 'Groningen',
    nameDisplay: 'Groningen',
    region: 'Groningen',
    intro:
      'Connect with verified students from University of Groningen (RUG) and Hanze UAS. Experience the ultimate Dutch student city with the highest student-to-population ratio.',
    stats: [
      { value: '2,600+', label: 'Groningen students' },
      { value: '€420', label: 'Avg. room price' },
      { value: '2', label: 'Major universities' },
      { value: '94%', label: 'Match satisfaction' },
    ],
    housingIntro:
      'Groningen is known for having the highest student-to-population ratio in the Netherlands. Start your search 3–5 months early; finding a compatible roommate opens more options.',
    marketOverview: {
      averageRent: '€350-€550/month depending on area and type',
      housingType: 'SSH dormitories (furnished, utilities included), private rooms and apartments',
      competition: 'High demand; plan 3–5 months ahead',
      extra: 'City is compact—cycle across in about 25 minutes; surrounding villages are viable',
    },
    neighborhoods: [
      { name: 'City Centre', description: 'Vibrant, shops, nightlife, near main building', priceRange: '€450-€650/month' },
      { name: 'Paddepoel', description: 'Near Zernike campus, student-heavy', priceRange: '€350-€500/month' },
      { name: 'Selwerd', description: 'Affordable, near Zernike', priceRange: '€350-€500/month' },
      { name: 'Oosterpoort', description: 'Quirky, affordable, near station', priceRange: '€400-€550/month' },
      { name: 'Oosterpark', description: 'Popular student area', priceRange: '€400-€550/month' },
    ],
    universities: [
      {
        name: 'University of Groningen (RUG)',
        description: '34,000+ students | Research university, broad programmes',
        programs: 'Popular programs: Law, Economics, Sciences, Humanities, Medicine',
      },
      {
        name: 'Hanze University of Applied Sciences',
        description: '28,000+ students | Practical education, strong international focus',
        programs: 'Popular programs: Business, Engineering, Arts, Healthcare',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Groningen?',
        answer:
          'Student rooms in Groningen typically range from €350-€550 per month. Paddepoel and Selwerd are affordable and near Zernike; the city centre is pricier but central.',
      },
      {
        question: 'Which universities does Domu Match work with in Groningen?',
        answer:
          'Domu Match works with the University of Groningen (RUG) and Hanze University of Applied Sciences. Students from both use our platform to find compatible roommates.',
      },
      {
        question: 'What are the best neighborhoods for students in Groningen?',
        answer:
          'Popular areas include the city centre (vibrant but noisier), Paddepoel and Selwerd (near Zernike, affordable), Oosterpoort (quirky, good value), and Oosterpark. The city is very bike-friendly.',
      },
      {
        question: 'Is Groningen good for international students?',
        answer:
          'Yes. Groningen has a large international student community (around 10,000). Domu Match helps you find roommates who share your lifestyle and make settling in easier.',
      },
    ],
  },
  leiden: {
    name: 'Leiden',
    nameDisplay: 'Leiden',
    region: 'Zuid-Holland',
    intro:
      'Connect with verified students from Leiden University. Experience living in the Netherlands’ oldest university city with a rich academic tradition.',
    stats: [
      { value: '2,400+', label: 'Leiden students' },
      { value: '€480', label: 'Avg. room price' },
      { value: '1', label: 'Major university' },
      { value: '92%', label: 'Match satisfaction' },
    ],
    housingIntro:
      'Leiden combines historic charm with academic excellence. A compact city with good cycling infrastructure and a strong student community.',
    marketOverview: {
      averageRent: '€400-€650/month depending on location',
      housingType: 'Historic buildings, canal-side housing, modern apartments, and student complexes',
      competition: 'High demand; start early, especially for city centre and Bio Science Park',
      extra: 'Compact city; most areas are within 15 minutes by bike',
    },
    neighborhoods: [
      { name: 'City centre', description: 'Historic, canals, cafés, nightlife', priceRange: '€500-€700/month' },
      { name: 'Leiden-Noord', description: 'Residential, quieter, good value', priceRange: '€400-€550/month' },
      { name: 'Bio Science Park', description: 'Near science faculty, modern', priceRange: '€450-€650/month' },
      { name: 'Stevenshof', description: 'Family-friendly, quieter', priceRange: '€400-€550/month' },
      { name: 'Zuidwest', description: 'Affordable, diverse', priceRange: '€380-€520/month' },
    ],
    universities: [
      {
        name: 'Leiden University',
        description: '28,000+ students | Oldest university in the Netherlands, broad research programmes',
        programs: 'Popular programs: Law, Humanities, Sciences, Medicine, International Relations',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Leiden?',
        answer:
          'Student rooms in Leiden typically range from €400-€650 per month. The city centre is pricier; Leiden-Noord and Zuidwest offer more affordable options.',
      },
      {
        question: 'Which universities does Domu Match work with in Leiden?',
        answer:
          'Domu Match works with Leiden University. Students from all faculties use our platform to find compatible roommates in this historic university city.',
      },
      {
        question: 'What are the best neighborhoods for students in Leiden?',
        answer:
          'Popular student areas include the city centre (historic, lively), Leiden-Noord (quiet, good value), Bio Science Park (near science faculty), and Stevenshof (quiet, residential).',
      },
      {
        question: 'Is Leiden good for international students?',
        answer:
          'Yes. Leiden University is very international and many programmes are in English. Domu Match helps you find roommates who share your lifestyle in this compact, bike-friendly city.',
      },
    ],
  },
  nijmegen: {
    name: 'Nijmegen',
    nameDisplay: 'Nijmegen',
    region: 'Gelderland',
    intro:
      'Connect with verified students from Radboud University and HAN. Experience the Netherlands’ oldest city with a young, green, and vibrant student vibe.',
    stats: [
      { value: '2,300+', label: 'Nijmegen students' },
      { value: '€430', label: 'Avg. room price' },
      { value: '2', label: 'Major universities' },
      { value: '91%', label: 'Match satisfaction' },
    ],
    housingIntro:
      "Nijmegen is one of Europe's greenest cities with excellent student life. Close to the German border, with affordable rents and a strong community feel.",
    marketOverview: {
      averageRent: '€350-€600/month depending on area',
      housingType: 'Student rooms, shared houses, studios, and campus-area housing near Heijendaal',
      competition: 'Moderate to high; start searching a few months before moving',
      extra: 'Heijendaal campus area is popular for Radboud and HAN students',
    },
    neighborhoods: [
      { name: 'City centre', description: 'Central, shops, nightlife, historic', priceRange: '€450-€650/month' },
      { name: 'Dukenburg', description: 'Affordable, diverse, good transport', priceRange: '€350-€500/month' },
      { name: 'Heijendaal', description: 'Near Radboud and HAN campus', priceRange: '€400-€600/month' },
      { name: 'Lent', description: 'Across Waal, developing, more space', priceRange: '€400-€550/month' },
      { name: 'Bottendaal', description: 'Student-heavy, lively', priceRange: '€420-€580/month' },
    ],
    universities: [
      {
        name: 'Radboud University',
        description: '24,000+ students | Broad research university',
        programs: 'Popular programs: Law, Medicine, Sciences, Humanities, Social Sciences',
      },
      {
        name: 'HAN University of Applied Sciences',
        description: '33,000+ students across locations | Practical education',
        programs: 'Popular programs: Business, Engineering, Healthcare, Education',
      },
    ],
    faqs: [
      {
        question: 'What is the average rent for student rooms in Nijmegen?',
        answer:
          'Student rooms in Nijmegen typically range from €350-€600 per month. Dukenburg and Bottendaal are often more affordable; Heijendaal is convenient for campus.',
      },
      {
        question: 'Which universities does Domu Match work with in Nijmegen?',
        answer:
          'Domu Match works with Radboud University and HAN University of Applied Sciences. Students from both use our platform to find compatible roommates.',
      },
      {
        question: 'What are the best neighborhoods for students in Nijmegen?',
        answer:
          'Popular student areas include the city centre (central, historic), Dukenburg (affordable), Heijendaal (near campus), Bottendaal (student-heavy), and Lent (across the river, more space).',
      },
      {
        question: 'Is Nijmegen good for international students?',
        answer:
          'Yes. Nijmegen is international, green, and welcoming. Radboud and HAN attract many international students. Domu Match helps you find roommates who match your lifestyle in the Netherlands’ oldest city.',
      },
    ],
  },
}
