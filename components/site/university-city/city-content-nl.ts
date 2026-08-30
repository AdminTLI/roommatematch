import type { CityContent, CityKey, FAQItem } from './content'

function marketplaceFaqsNl(cityDisplay: string): FAQItem[] {
  return [
    {
      question: `Kan ik Domu Match gebruiken om een huisgenoot te zoeken in ${cityDisplay}?`,
      answer: `Ja. Als je een huisgenoot, flatmate of iemand om mee te huren zoekt in ${cityDisplay}, matcht Domu Match je op leefstijl en compatibiliteit met geverifieerde studenten en young professionals - daarna kun je samen een woning zoeken.`,
    },
    {
      question: `Ik heb al een kamer in ${cityDisplay} - kan ik een huisgenoot vinden?`,
      answer: `Ja. Domu Match werkt twee kanten op: mensen die een huisgenoot zoeken én mensen met een vrije kamer die een passende medebewoner nodig hebben. Maak een profiel en match met geverifieerde gebruikers die bij jullie huisregels passen.`,
    },
    {
      question: 'Hoe verschilt Domu Match van Kamernet, Roomster of andere kamerplatforms?',
      answer:
        'Kamerplatforms tonen kamers en advertenties. Domu Match matcht mensen: geverifieerde studenten en young professionals op compatibiliteit. Wij vervangen geen woningcorporaties of advertentiesites - we helpen je te kiezen mét wie je woont, voor of tijdens je zoektocht naar waar.',
    },
  ]
}

export const cityContentNl: Record<CityKey, CityContent> = {
  amsterdam: {
    name: 'Amsterdam',
    nameDisplay: 'Amsterdam',
    region: 'Noord-Holland',
    intro:
      'Huisgenoot zoeken in Amsterdam - of een kamer vrij en huisgenoot gezocht? Match met geverifieerde studenten en young professionals van UvA, VU, HvA en meer. Eerst compatibiliteit, geen kameradvertentie.',
    stats: [
      { value: '~€950', label: 'Mediane kamerhuur (Q2 2026)' },
      { value: 'Hoog', label: 'Concurrentie huisvesting' },
      { value: '3+', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'De particuliere kamermarkt in Amsterdam is de duurste van Nederland. Een passende huisgenoot maakt samenwonen werkbaar — of je zoekt of een plek vult.',
    marketOverview: {
      averageRent:
        'Mediane particuliere kamerhuur rond €950/maand (Kamernet Q2 2026); gedeelde kamers en buitenwijken lager, studio’s en Centrum hoger',
      housingType: 'Shared flats, studentencomplexen, studio’s en campuswoningen',
      competition: 'Zeer hoog - begin vroeg en overweeg eerst te matchen vóór bezichtigingen',
      extra: 'Meeste contracten 6–12 maanden; soms studiejaarcontracten in studentencomplexen',
    },
    neighborhoods: [
      { name: 'De Pijp', description: 'Levendig, multicultureel, dicht bij VU', priceRange: 'Vaak €700+/maand' },
      { name: 'Oost', description: 'Divers, goed OV, relatief betere prijs', priceRange: 'Vaak €550–€800/maand' },
      { name: 'Noord', description: 'Creatief, groeiend, fietsvriendelijk', priceRange: 'Vaak €500–€750/maand' },
      { name: 'Science Park', description: 'Bij UvA-campus, moderne studentenhuisvesting', priceRange: 'Vaak €600–€850/maand' },
      { name: 'Westerpark', description: 'Groen, veel young professionals', priceRange: 'Vaak €700–€950/maand' },
    ],
    universities: [
      {
        name: 'Universiteit van Amsterdam (UvA)',
        description: 'Grote onderzoeksuniversiteit op meerdere campussen',
        programs: 'Bedrijfskunde, Psychologie, Geneeskunde, Recht, Geesteswetenschappen',
      },
      {
        name: 'Vrije Universiteit Amsterdam (VU)',
        description: 'Onderzoeksintensief met sterke internationale focus',
        programs: 'Geneeskunde, Bedrijfskunde, Bèta, Geesteswetenschappen',
      },
      {
        name: 'Hogeschool van Amsterdam (HvA)',
        description: 'Grote hbo-instelling met praktijkgerichte opleidingen',
        programs: 'Bedrijfskunde, Engineering, Sport, Media',
      },
      {
        name: 'Overige instellingen',
        description: 'Gerrit Rietveld Academie, Conservatorium, Inholland en meer',
        programs: 'Kunst, muziek en beroepsonderwijs',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Amsterdam?',
        answer:
          'De mediane particuliere kamerhuur lag rond €950/maand in Q2 2026 (Kamernet). Gedeelde kamers en buitenwijken kunnen lager; Centrum, Zuid en studio’s vaak hoger. Check altijd wat bij de huur inbegrepen is.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Amsterdam?',
        answer:
          'Studenten en young professionals verbonden aan UvA, VU, HvA en andere Amsterdamse instellingen gebruiken Domu Match om passende huisgenoten te vinden.',
      },
      {
        question: 'Welke buurten zijn populair voor samenwonen in Amsterdam?',
        answer:
          'De Pijp, Oost, Noord, Science Park en Westerpark. Match eerst op leefstijl - kies daarna samen een buurt.',
      },
      ...marketplaceFaqsNl('Amsterdam'),
    ],
  },

  rotterdam: {
    name: 'Rotterdam',
    nameDisplay: 'Rotterdam',
    region: 'Zuid-Holland',
    intro:
      'Huisgenoot zoeken in Rotterdam of een vrije kamer vullen? Geverifieerde studenten en young professionals van Erasmus Universiteit, Hogeschool Rotterdam, Inholland en meer.',
    stats: [
      { value: '~€500–€700', label: 'Typische kamerhuur' },
      { value: 'Matig+', label: 'Concurrentie' },
      { value: '4', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Rotterdam is meestal betaalbaarder dan Amsterdam, met sterke studentenbuurten rond Kralingen. Compatibiliteit bepaalt of een huis werkt.',
    marketOverview: {
      averageRent: 'Vaak €400–€700/maand, afhankelijk van buurt en kamertype',
      housingType: 'Gerenoveerde panden, shared flats, moderne appartementen, studentenhuisvesting',
      competition: 'Matig tot hoog bij EUR; makkelijker dan Amsterdam',
      extra: 'Metro en fiets maken wonen buiten de campus haalbaar',
    },
    neighborhoods: [
      { name: 'Kralingen', description: 'Bij EUR-campus, klassieke studentenbuurt', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Noord', description: 'Betaalbaar, multicultureel, goed OV', priceRange: 'Vaak €400–€550/maand' },
      { name: 'West', description: 'Levendig, dichter bij centrum', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Blijdorp', description: 'Rustiger, groen, bij de dierentuin', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Centrum', description: 'Centraal, uitgaan, winkels', priceRange: 'Vaak €500–€750/maand' },
    ],
    universities: [
      {
        name: 'Erasmus Universiteit Rotterdam (EUR)',
        description: 'Onderzoeksuniversiteit bekend om business, economie en geneeskunde',
        programs: 'Geneeskunde, Bedrijfskunde, Economie, Recht',
      },
      {
        name: 'Hogeschool Rotterdam',
        description: 'Grote hbo met praktijkgerichte opleidingen',
        programs: 'Business, Zorg, Engineering, Social Work',
      },
      {
        name: 'Inholland Rotterdam',
        description: 'Hbo met sterke industriebanden',
        programs: 'Toegepaste en professionele opleidingen',
      },
      {
        name: 'Codarts',
        description: 'Hogeschool voor de Kunsten (muziek, dans, circus)',
        programs: 'Muziek, Dans, Circus',
      },
    ],
    faqs: [
      {
        question: 'Wat is een typische kamerhuur in Rotterdam?',
        answer:
          'Veel studentenkamers liggen ongeveer tussen €400–€700. Kralingen en Centrum vaak hoger; Noord en Blijdorp kunnen beter geprijsd zijn.',
      },
      {
        question: 'Van welke instellingen komen Rotterdamse gebruikers?',
        answer:
          'EUR, Hogeschool Rotterdam, Inholland Rotterdam, Codarts en young professionals die in de stad werken.',
      },
      {
        question: 'Beste buurten voor huisgenoten in Rotterdam?',
        answer:
          'Kralingen (EUR), Noord, West, Blijdorp en Centrum. Domu Match helpt eerst leefstijl af te stemmen vóór je een huis kiest.',
      },
      ...marketplaceFaqsNl('Rotterdam'),
    ],
  },

  utrecht: {
    name: 'Utrecht',
    nameDisplay: 'Utrecht',
    region: 'Utrecht',
    intro:
      'Huisgenoot zoeken in Utrecht - of een kamer vrij? Match met geverifieerde UU- en HU-studenten en young professionals. Compatibiliteitsmatching in het hart van Nederland.',
    stats: [
      { value: '~€775', label: 'Mediane kamerhuur (Q2 2026)' },
      { value: 'Hoog', label: 'Concurrentie' },
      { value: '2', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Utrecht is compact en fietsvriendelijk, maar particuliere kamers horen bij de duurste na Amsterdam. De juiste huisgenoot opent meer gedeelde woonopties dan alleen zoeken.',
    marketOverview: {
      averageRent:
        'Mediane particuliere kamerhuur rond €775/maand (Kamernet Q2 2026); sterk afhankelijk van buurt',
      housingType: 'Grachtenpanden, moderne flats, studentencomplexen bij Science Park',
      competition: 'Hoog - vooral bij Science Park en het centrum',
      extra: 'Meeste buurten binnen 15–20 minuten fietsen',
    },
    neighborhoods: [
      { name: 'Lombok', description: 'Divers, levendig, cafés en winkels', priceRange: 'Vaak €500–€700/maand' },
      { name: 'Wittevrouwen', description: 'Residentieel, rustiger', priceRange: 'Vaak €550–€750/maand' },
      { name: 'Science Park', description: 'Bij UU-campus, moderne huisvesting', priceRange: 'Vaak €600–€800/maand' },
      { name: 'Oudwijk', description: 'Groen, rustiger, soms duurder', priceRange: 'Vaak €550–€750/maand' },
      { name: 'Binnenstad', description: 'Grachten, uitgaan, centraal', priceRange: 'Vaak €650–€900/maand' },
    ],
    universities: [
      {
        name: 'Universiteit Utrecht (UU)',
        description: 'Grote onderzoeksuniversiteit met sterke internationale intake',
        programs: 'Recht, Bèta, Geesteswetenschappen, Geneeskunde',
      },
      {
        name: 'Hogeschool Utrecht (HU)',
        description: 'Grote hbo over veel praktijklijnen',
        programs: 'Onderwijs, Zorg, Business, ICT',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Utrecht?',
        answer:
          'De mediane particuliere kamerhuur lag rond €775/maand in Q2 2026 (Kamernet). Lombok en sommige woonwijken kunnen lager; centrum en Science Park vaak hoger.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Utrecht?',
        answer: 'Studenten van Universiteit Utrecht en HU, plus young professionals die in Utrecht wonen en werken.',
      },
      {
        question: 'Populaire buurten voor huisgenoten in Utrecht?',
        answer:
          'Lombok, Wittevrouwen, Science Park, Oudwijk en de binnenstad. Stem eerst lawaai, gasten en reistijd af vóór je tekent.',
      },
      ...marketplaceFaqsNl('Utrecht'),
    ],
  },

  'den-haag': {
    name: 'Den Haag',
    nameDisplay: 'Den Haag',
    region: 'Zuid-Holland',
    intro:
      'Huisgenoot zoeken in Den Haag - of een medebewoner voor je vrije kamer? Geverifieerde studenten van THUAS, Campus Den Haag en young professionals in een internationale stad.',
    stats: [
      { value: '~€450–€700', label: 'Typische kamerhuur' },
      { value: 'Matig+', label: 'Concurrentie' },
      { value: '3+', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Den Haag mengt internationale organisaties, hbo-studenten en strandleven. Shared houses werken het best als huisgenoten routines en gasten afstemmen.',
    marketOverview: {
      averageRent: 'Vaak €400–€700/maand; Scheveningen vaak hoger',
      housingType: 'Grachtenpanden, moderne appartementen, DUWO en private shares',
      competition: 'Matig tot hoog; schrijf vroeg in bij corporaties waar relevant',
      extra: 'DUWO en andere aanbieders voor voorraad - match mensen apart',
    },
    neighborhoods: [
      { name: 'Zeeheldenkwartier', description: 'Grachten, cafés, dicht bij scholen', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Statenkwartier', description: 'Residentieel, dicht bij strand', priceRange: 'Vaak €500–€700/maand' },
      { name: 'Laakkwartier', description: 'Dichter bij centrum, divers', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Regentessekwartier', description: 'Levendig, winkels en restaurants', priceRange: 'Vaak €450–€600/maand' },
      { name: 'Bezuidenhout', description: 'Bij Haagse Bos, gemengde woningvoorraad', priceRange: 'Vaak €450–€600/maand' },
      { name: 'Scheveningen', description: 'Aan zee, vaak duurder', priceRange: 'Vaak €500–€750/maand' },
    ],
    universities: [
      {
        name: 'De Haagse Hogeschool (THUAS)',
        description: 'Grote internationale hbo',
        programs: 'International Business, Recht, Security, ICT',
      },
      {
        name: 'Universiteit Leiden - Campus Den Haag',
        description: 'Bestuur, recht en internationale opleidingen',
        programs: 'Recht, Bestuurskunde, International Studies',
      },
      {
        name: 'Overige instellingen',
        description: 'ISS, Hotelschool The Hague en gespecialiseerde scholen',
        programs: 'Ontwikkelingsstudies, hospitality en meer',
      },
    ],
    faqs: [
      {
        question: 'Wat is een typische kamerhuur in Den Haag?',
        answer:
          'Veel kamers vallen grofweg tussen €400–€700/maand. Zeeheldenkwartier en Scheveningen kunnen duurder; Laak en sommige woonwijken bieden meer waarde.',
      },
      {
        question: 'Welke instellingen komen vaak voor bij Domu Match in Den Haag?',
        answer: 'THUAS, Campus Den Haag, Hotelschool en young professionals bij NGO’s, overheid en tech.',
      },
      {
        question: 'Beste buurten voor samenwonen in Den Haag?',
        answer:
          'Zeeheldenkwartier, Statenkwartier, Laakkwartier, Regentessekwartier, Bezuidenhout en Scheveningen - kies op woon-werkverkeer en leefstijl ná de match.',
      },
      ...marketplaceFaqsNl('Den Haag'),
    ],
  },

  eindhoven: {
    name: 'Eindhoven',
    nameDisplay: 'Eindhoven',
    region: 'Noord-Brabant',
    intro:
      'Huisgenoot matchen in Eindhoven voor TU/e- en Fontys-studenten en tech young professionals. Op zoek naar een huisgenoot - of een vrije kamer vullen in Brainport?',
    stats: [
      { value: '~€540', label: 'Mediane kamerhuur (Q2 2026)' },
      { value: 'Hoog', label: 'Druk op kamers' },
      { value: '2+', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Huren in Eindhoven stegen sterk maar blijven onder Randstad-pieken. Begin vroeg - en match op leefstijl zodat je huis tentamenweken en nachtdiensten overleeft.',
    marketOverview: {
      averageRent:
        'Mediane particuliere kamerhuur rond €540/maand (Kamernet Q2 2026); studio’s en gemeubileerd kunnen hoger',
      housingType: 'Shared houses, studio’s, verenigings- en campuswoningen',
      competition: 'Hoog voor goede kamers - TU/e adviseert maanden van tevoren te zoeken',
      extra: 'Gereserveerde institutionele kamers helpen sommigen; Domu Match helpt de mensenkant',
    },
    neighborhoods: [
      { name: 'Stratum / Stratumseind', description: 'Uitgaan en centrale energie', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Woensel', description: 'Betaalbaarder, divers, goed OV', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Campusgebied', description: 'Bij TU/e, handig voor studenten', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Centrum', description: 'Binnenstad, winkels, restaurants', priceRange: 'Vaak €500–€700/maand' },
      { name: 'Gestel', description: 'Rustiger, residentieel', priceRange: 'Vaak €400–€550/maand' },
    ],
    universities: [
      {
        name: 'Technische Universiteit Eindhoven (TU/e)',
        description: 'Toonaangevende tech- en engineeringuniversiteit',
        programs: 'Engineering, Computer Science, Industrial Design, Applied Physics',
      },
      {
        name: 'Fontys Hogescholen',
        description: 'Grote hbo met sterke Eindhovense aanwezigheid',
        programs: 'ICT, Engineering, Business, Arts',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Eindhoven?',
        answer:
          'De mediane particuliere kamerhuur lag rond €540/maand in Q2 2026 (Kamernet), na een stevige stijging. Check altijd servicekosten en contractduur.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Eindhoven?',
        answer: 'TU/e- en Fontys-studenten, plus young professionals in Brainport tech en design.',
      },
      {
        question: 'Wanneer moet ik beginnen met zoeken in Eindhoven?',
        answer:
          'Zo vroeg mogelijk - veel studenten starten in het voorjaar voor het volgende studiejaar. Eerst een huisgenoot matchen kan meer huizen openen.',
      },
      ...marketplaceFaqsNl('Eindhoven'),
    ],
  },

  groningen: {
    name: 'Groningen',
    nameDisplay: 'Groningen',
    region: 'Groningen',
    intro:
      'Huisgenoot zoeken in Groningen of een vrije kamer vullen? Geverifieerde RUG- en Hanze-studenten in een van de meest studentenrijke steden van Nederland.',
    stats: [
      { value: '~€400–€550', label: 'Typische kamerhuur' },
      { value: 'Hoog', label: 'Studentenvraag' },
      { value: '2', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Groningen heeft een enorm aandeel studenten. Begin 3–5 maanden vroeg. Domu Match helpt zoekers én huizen met een vrije kamer.',
    marketOverview: {
      averageRent: 'Vaak €350–€550/maand; centrum duurder',
      housingType: 'SSH/corporatiekamers, private shares, appartementen',
      competition: 'Hoge vraag elk studiejaar - plan vooruit',
      extra: 'Compacte stad - meeste buurten binnen 25 minuten fietsen',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Levendig, winkels, uitgaan', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Paddepoel', description: 'Bij Zernike, veel studenten', priceRange: 'Vaak €350–€500/maand' },
      { name: 'Selwerd', description: 'Betaalbaar, bij Zernike', priceRange: 'Vaak €350–€500/maand' },
      { name: 'Oosterpoort', description: 'Bij station, goede prijs', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Oosterpark', description: 'Populaire studentenbuurt', priceRange: 'Vaak €400–€550/maand' },
    ],
    universities: [
      {
        name: 'Rijksuniversiteit Groningen (RUG)',
        description: 'Grote onderzoeksuniversiteit met veel internationals',
        programs: 'Recht, Economie, Bèta, Geesteswetenschappen, Geneeskunde',
      },
      {
        name: 'Hanzehogeschool Groningen',
        description: 'Grote hbo met sterke praktijkopleidingen',
        programs: 'Business, Engineering, Arts, Zorg',
      },
    ],
    faqs: [
      {
        question: 'Wat is een typische kamerhuur in Groningen?',
        answer:
          'Veel kamers liggen rond €350–€550/maand. Paddepoel en Selwerd vaak beter geprijsd bij Zernike; het centrum is duurder.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Groningen?',
        answer: 'Rijksuniversiteit Groningen en Hanzehogeschool, plus young professionals die in de stad blijven.',
      },
      {
        question: 'Is Groningen goed voor internationale studenten?',
        answer:
          'Ja - grote internationale community. Domu Match helpt Nederlandse en internationale studenten passende huisgenoten te vinden (en vrije kamers te vullen) zonder alleen op Facebookgroepen te leunen.',
      },
      ...marketplaceFaqsNl('Groningen'),
    ],
  },

  leiden: {
    name: 'Leiden',
    nameDisplay: 'Leiden',
    region: 'Zuid-Holland',
    intro:
      'Huisgenoot zoeken voor Leidse studenten en young professionals. Op zoek in de oudste universiteitsstad — of iemand nodig voor je vrije kamer?',
    stats: [
      { value: '~€450–€650', label: 'Typische kamerhuur' },
      { value: 'Hoog', label: 'Concurrentie' },
      { value: '1+', label: 'Grote universiteit' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Leiden is compact en historisch, met druk rond centrum en Bio Science Park. Match eerst op gewoontes zodat een grachtenhuis echt werkt.',
    marketOverview: {
      averageRent: 'Vaak €400–€650/maand; centrum en Bio Science Park hoger',
      housingType: 'Historische shares, grachtenwoningen, moderne flats, studentencomplexen',
      competition: 'Hoog - begin vroeg voor centrum en campusnabije kamers',
      extra: 'Meeste buurten binnen zo’n 15 minuten fietsen',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Historisch, grachten, cafés, uitgaan', priceRange: 'Vaak €500–€700/maand' },
      { name: 'Leiden-Noord', description: 'Rustiger, vaak betere prijs', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Bio Science Park', description: 'Bij bètafaculteit, modern', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Stevenshof', description: 'Residentieel, rustiger', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Zuidwest', description: 'Betaalbaarder, divers', priceRange: 'Vaak €380–€520/maand' },
    ],
    universities: [
      {
        name: 'Universiteit Leiden',
        description: 'Oudste universiteit van Nederland; sterk onderzoeksprofiel',
        programs: 'Recht, Geesteswetenschappen, Bèta, Geneeskunde, International Relations',
      },
      {
        name: 'Hogeschool Leiden',
        description: 'Hbo in en rond Leiden',
        programs: 'Toegepaste en professionele opleidingen',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Leiden?',
        answer:
          'Reken grofweg op €400–€650/maand voor veel kamers. Het historische centrum is duurder; Leiden-Noord en Zuidwest kunnen meer waarde bieden.',
      },
      {
        question: 'Welke instellingen ondersteunt Domu Match in Leiden?',
        answer: 'Universiteit Leiden en Hogeschool Leiden, plus young professionals in de Leidse regio.',
      },
      {
        question: 'Beste buurten voor samenwonen in Leiden?',
        answer:
          'Binnenstad, Leiden-Noord, Bio Science Park, Stevenshof en Zuidwest. Match eerst, kies daarna de fietsroute die bij jullie past.',
      },
      ...marketplaceFaqsNl('Leiden'),
    ],
  },

  nijmegen: {
    name: 'Nijmegen',
    nameDisplay: 'Nijmegen',
    region: 'Gelderland',
    intro:
      'Huisgenoot zoeken in Nijmegen of een vrije kamer vullen bij Radboud en HAN. Geverifieerde matching voor studenten en young professionals in een groene, levendige studentenstad.',
    stats: [
      { value: '~€400–€600', label: 'Typische kamerhuur' },
      { value: 'Matig+', label: 'Concurrentie' },
      { value: '2', label: 'Grote instellingen' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Nijmegen combineert campusleven op Heijendaal met een historische binnenstad. Shared houses lukken als mensen gasten, schoonmaak en stiltetijd afspreken.',
    marketOverview: {
      averageRent: 'Vaak €350–€600/maand afhankelijk van buurt en kamertype',
      housingType: 'Shared houses, studio’s, campuswoningen bij Heijendaal',
      competition: 'Matig tot hoog vóór het studiejaar',
      extra: 'Heijendaal is populair bij Radboud- en HAN-studenten',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Historisch, winkels, uitgaan', priceRange: 'Vaak €450–€650/maand' },
      { name: 'Dukenburg', description: 'Betaalbaarder, goed OV', priceRange: 'Vaak €350–€500/maand' },
      { name: 'Heijendaal', description: 'Bij Radboud- en HAN-campus', priceRange: 'Vaak €400–€600/maand' },
      { name: 'Lent', description: 'Over de Waal, meer ruimte', priceRange: 'Vaak €400–€550/maand' },
      { name: 'Bottendaal', description: 'Veel studenten, levendig', priceRange: 'Vaak €420–€580/maand' },
    ],
    universities: [
      {
        name: 'Radboud Universiteit',
        description: 'Brede onderzoeksuniversiteit',
        programs: 'Recht, Geneeskunde, Bèta, Geesteswetenschappen, Sociale Wetenschappen',
      },
      {
        name: 'Hogeschool van Arnhem en Nijmegen (HAN)',
        description: 'Grote hbo met sterke Nijmeegse aanwezigheid',
        programs: 'Business, Engineering, Zorg, Onderwijs',
      },
    ],
    faqs: [
      {
        question: 'Wat is een typische kamerhuur in Nijmegen?',
        answer:
          'Veel kamers liggen rond €350–€600/maand. Dukenburg en Bottendaal kunnen beter geprijsd zijn; Heijendaal ruilt prijs voor nabijheid van de campus.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Nijmegen?',
        answer: 'Radboud Universiteit en HAN, plus young professionals in de regio.',
      },
      {
        question: 'Populaire buurten voor huisgenoten in Nijmegen?',
        answer:
          'Binnenstad, Dukenburg, Heijendaal, Bottendaal en Lent. Match op leefstijl, kies daarna de kant van de rivier die bij jullie past.',
      },
      ...marketplaceFaqsNl('Nijmegen'),
    ],
  },

  breda: {
    name: 'Breda',
    nameDisplay: 'Breda',
    region: 'Noord-Brabant',
    intro:
      'Huisgenoot zoeken in Breda - of huisgenoot gezocht voor een vrije kamer? Domu Match verbindt geverifieerde Avans- en BUas-studenten en young professionals via compatibiliteitsmatching, niet via kameradvertenties.',
    stats: [
      { value: '~€553', label: 'Mediane kamerhuur (Q2 2026)' },
      { value: 'Avans + BUas', label: 'Kerninstellingen' },
      { value: 'Stijgend', label: 'Huurtendens t.o.v. vorig jaar' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'Breda zit tussen Randstad-druk en Brabants studentenleven. Particuliere kamers stegen naar een mediaan rond €553/maand in Q2 2026. Of je een huisgenoot zoekt of een plek in een studentenhuis vrij hebt: begin bij mét wie je woont.',
    marketOverview: {
      averageRent:
        'Mediane particuliere kamerhuur ongeveer €553/maand (Kamernet Q2 2026, +4,3% YoY). Reken op €450–€700 afhankelijk van grootte, meubilering en locatie',
      housingType:
        'Studentenhuizen, kamers bij het station, moderne flats in Belcrum, rustiger wonen richting Ginneken',
      competition:
        'Matig maar aantrekkend - goede kamers bij Avans/BUas en het station verdwijnen snel vóór september',
      extra:
        'Ook young professionals in logistiek, creatieve sector en hospitality delen flats. Studenten matchen met studenten; professionals met professionals',
    },
    neighborhoods: [
      {
        name: 'Centrum / Grote Markt',
        description: 'Historisch centrum, uitgaan, loopafstand tot campussen en cafés',
        priceRange: 'Vaak €500–€700/maand',
      },
      {
        name: 'Station / Belcrum',
        description: 'Snelle NS-verbindingen, groeiende creatieve/woonbuurt ten noorden van het spoor',
        priceRange: 'Vaak €480–€650/maand',
      },
      {
        name: 'Haagpoort / Heusdenhout-kant',
        description: 'Handig fietsen naar Avans; rustiger woonstraten',
        priceRange: 'Vaak €450–€600/maand',
      },
      {
        name: 'Ginneken',
        description: 'Groen, dorps gevoel, populair bij hogerejaars en young professionals',
        priceRange: 'Vaak €500–€700/maand',
      },
      {
        name: 'Brabantpark / oost',
        description: 'Meer ruimte, goede prijs bij iets langere fietsrit',
        priceRange: 'Vaak €450–€580/maand',
      },
    ],
    universities: [
      {
        name: 'Avans Hogeschool (Breda)',
        description: 'Belangrijke hbo-hub in Breda met grote regionale studentenpopulatie',
        programs: 'Business, Engineering, ICT, Built Environment, Social Studies',
      },
      {
        name: 'Breda University of Applied Sciences (BUas)',
        description: 'Gespecialiseerde hbo bekend om toerisme, games, media en logistiek',
        programs: 'Tourism, Leisure, Games, Media, Logistics, Hotel',
      },
      {
        name: 'Young professionals in Breda',
        description: 'Afgestudeerden die blijven voor werk in logistiek, creatieve industrie en hospitality',
        programs: 'Shared flats en young-professional huizen door de stad',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Breda?',
        answer:
          'De mediane particuliere kamerhuur lag rond €553/maand in Q2 2026 (Kamernet), ongeveer 4% hoger dan een jaar eerder. Budgetteer €450–€700 afhankelijk van servicekosten, meubels en buurt.',
      },
      {
        question: 'Welke scholen ondersteunt Domu Match in Breda?',
        answer:
          'Avans- en BUas-studenten vormen de kern, plus young professionals die in Breda wonen en werken. Studenten matchen met studenten; professionals met professionals.',
      },
      {
        question: 'Ik heb een vrije kamer in een Bredase studentenhuis - kan ik hier een huisgenoot vinden?',
        answer:
          'Ja. Dat is de “huisgenoot gezocht”-kant van Domu Match: maak een profiel over jullie huissfeer en match met geverifieerde mensen die een kamer in Breda zoeken - zonder weer een anonieme advertentie.',
      },
      {
        question: 'Hoe verschilt dit van Facebookgroepen of Kamernet voor Breda?',
        answer:
          'Advertentiesites en groepen tonen kamers. Domu Match focust op compatibiliteit en verificatie zodat je weet waarom iemand past vóór de bezichtiging - of je zoekt of een plek vult.',
      },
      {
        question: 'Welke buurten werken goed voor huisgenoten in Breda?',
        answer:
          'Centrum voor uitgaan en korte loopafstanden, Belcrum/station voor treinen, Haagpoort voor Avans-fietsroutes, Ginneken voor rust, Brabantpark voor ruimte. Match eerst op leefstijl, kies daarna samen de buurt.',
      },
      {
        question: 'Kunnen internationale én Nederlandse studenten Domu Match in Breda gebruiken?',
        answer:
          'Ja. BUas en Avans trekken beide. Profielen en matching werken in het Engels en Nederlands zodat gemengde huizen verwachtingen kunnen afstemmen.',
      },
      ...marketplaceFaqsNl('Breda'),
    ],
  },

  tilburg: {
    name: 'Tilburg',
    nameDisplay: 'Tilburg',
    region: 'Noord-Brabant',
    intro:
      'Huisgenoot zoeken in Tilburg - of huisgenoot gezocht voor een vrije kamer bij de campus? Match met geverifieerde Tilburg University-, Fontys- en Avans-studenten en young professionals. Mensen matchen, geen kamerlijsten.',
    stats: [
      { value: '~€595', label: 'Mediane kamerhuur (Q2 2026)' },
      { value: 'TiU + Fontys', label: 'Kerninstellingen' },
      { value: '+11%', label: 'YoY mediane huur' },
      { value: 'Beide', label: 'Zoekers & vrije kamers' },
    ],
    housingIntro:
      'De mediane particuliere kamerhuur in Tilburg lag rond €595/maand in Q2 2026 (+11,2% YoY). Concurrentie is zachter dan in Amsterdam, maar goede kamers bij Tilburg University en het centrum verdwijnen snel. Domu Match helpt zoekers én huizen met een vrije kamer op compatibiliteit.',
    marketOverview: {
      averageRent:
        'Mediane particuliere kamerhuur ongeveer €595/maand (Kamernet Q2 2026). Reken grofweg €450–€700 voor veel studentenkamers afhankelijk van inclusief/exclusief en grootte',
      housingType:
        'Klassieke studentenhuizen, corporatiekamers (o.a. via ROOM.nl / aanbieders), private shares en flats richting Quirijnstok en campus',
      competition:
        'Makkelijker dan de Randstad maar seizoensgebonden - augustus-rush is echt. Eerst een huisgenoot matchen kan hele-huis-aanmeldingen openen',
      extra:
        'Internationale masterstudenten bij Tilburg University zoeken vaak Engelstalige huizen; young professionals blijven voor data, recht en creatief werk',
    },
    neighborhoods: [
      {
        name: 'Centrum / Spoorzone',
        description: 'Binnenstad, Pieter Vreedeplein, groeiende creatieve Spoorzone',
        priceRange: 'Vaak €520–€700/maand',
      },
      {
        name: 'Korvel / West',
        description: 'Klassieke studentenhuisstraten, levendig, korte fiets naar centrum',
        priceRange: 'Vaak €480–€650/maand',
      },
      {
        name: 'Oud-Noord',
        description: 'Residentieel karakter, goede prijs, stevige fietsroutes',
        priceRange: 'Vaak €450–€600/maand',
      },
      {
        name: 'Quirijnstok / campus-kant',
        description: 'Dichter bij Tilburg University; handig voor vroege colleges',
        priceRange: 'Vaak €500–€680/maand',
      },
      {
        name: 'Oerle / zuidwest',
        description: 'Rustiger, meer ruimte, populair bij hogerejaars en YPs',
        priceRange: 'Vaak €470–€620/maand',
      },
    ],
    universities: [
      {
        name: 'Tilburg University',
        description: 'Onderzoeksuniversiteit sterk in economie, recht, data science en sociale wetenschappen',
        programs: 'Economie, Recht, Data Science, Psychologie, Business',
      },
      {
        name: 'Fontys Tilburg',
        description: 'Belangrijke Fontys-locaties in Tilburg voor hbo-opleidingen',
        programs: 'ICT, Lerarenopleiding, Arts, Business, Engineering',
      },
      {
        name: 'Avans (regio Tilburg)',
        description: 'Avans-aanwezigheid in de Tilburgse regio naast Breda',
        programs: 'Hbo en professionele bacheloropleidingen',
      },
      {
        name: 'Young professionals in Tilburg',
        description: 'Afgestudeerden die blijven voor werk in Brabants kennis- en creatieve economie',
        programs: 'Shared flats en professional housemate matching',
      },
    ],
    faqs: [
      {
        question: 'Wat kost een studentenkamer in Tilburg?',
        answer:
          'De mediane particuliere kamerhuur lag rond €595/maand in Q2 2026 (Kamernet), ongeveer 11% hoger dan een jaar eerder. Budgetteer €450–€700 voor veel kamers inclusief variatie in servicekosten en meubels.',
      },
      {
        question: 'Welke universiteiten ondersteunt Domu Match in Tilburg?',
        answer:
          'Tilburg University, Fontys Tilburg, Avans-studenten in de regio en young professionals in Tilburg. Studenten matchen alleen met studenten; professionals met professionals.',
      },
      {
        question: 'Ik heb een vrije kamer in Tilburg - kan ik via Domu Match een huisgenoot vinden?',
        answer:
          'Ja. Gebruik Domu Match voor “huisgenoot gezocht”: beschrijf jullie huiscultuur en match met geverifieerde mensen die een kamer in Tilburg zoeken, in plaats van alleen Facebook of advertentiesites.',
      },
      {
        question: 'Hoe verschilt Domu Match van ROOM.nl of Kamernet in Tilburg?',
        answer:
          'ROOM.nl en Kamernet helpen met voorraad en advertenties. Domu Match helpt met de mensenkwestie - mét wie je woont - via verificatie en compatibiliteit. Gebruik beide: match een huisgenoot, regel daarna de kamer.',
      },
      {
        question: 'Welke buurten werken goed voor huisgenoten in Tilburg?',
        answer:
          'Centrum/Spoorzone voor stadsleven, Korvel voor klassieke studentenhuizen, Oud-Noord voor prijs, Quirijnstok voor campusnabijheid, Oerle voor rustiger wonen. Spreek fiets tijd en uitgaan af vóór je tekent.',
      },
      {
        question: 'Is Tilburg goed voor internationale studenten die een huisgenoot zoeken?',
        answer:
          'Ja. Tilburg University heeft een substantiële internationale intake. Domu Match helpt internationals en Nederlandse studenten passende huisgenoten te vinden met duidelijke verwachtingen - geen loterij-achtige group chats.',
      },
      ...marketplaceFaqsNl('Tilburg'),
    ],
  },
}
