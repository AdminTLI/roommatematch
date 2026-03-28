import type { CityContent, CityKey } from './content'

export const cityContentNl: Record<CityKey, CityContent> = {
  amsterdam: {
    name: 'Amsterdam',
    nameDisplay: 'Amsterdam',
    region: 'Noord-Holland',
    intro:
      'Vind compatibele studenten en young professionals van UvA, VU, HvA en andere Amsterdamse instellingen. Wetenschappelijk onderbouwde matching voor prettig samenwonen in de hoofdstad.',
    stats: [
      { value: '4,200+', label: 'Studenten Amsterdam' },
      { value: '€550', label: 'Gem. kamersprijs' },
      { value: '5', label: 'Universiteiten' },
      { value: '92%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'De studentenhuisvesting in Amsterdam is competitief; de juiste huisgenoot maakt het verschil.',
    marketOverview: {
      averageRent: '€450-€1.200/maand, afhankelijk van locatie en kamertype',
      housingType: 'Mix van studio’s, gedeelde flats en studentencomplexen',
      competition: 'Hoge vraag, vooral naar betaalbare kamers bij universiteiten',
      extra: 'Meeste contracten 6–12 maanden; sommige verhuurders bieden studiejaarcontracten',
    },
    neighborhoods: [
      { name: 'De Pijp', description: 'Levendig, multicultureel, dicht bij VU', priceRange: '€650-€900/maand' },
      { name: 'Oost', description: 'Betaalbaar, divers, goede OV-verbindingen', priceRange: '€500-€700/maand' },
      { name: 'Noord', description: 'Creatieve buurt, groeiende community, fietsvriendelijk', priceRange: '€450-€650/maand' },
      { name: 'Science Park', description: 'Dicht bij UvA-campus, moderne studentenhuisvesting', priceRange: '€600-€800/maand' },
      { name: 'Westerpark', description: 'Groen, veel young professionals', priceRange: '€700-€950/maand' },
    ],
    universities: [
      {
        name: 'University of Amsterdam (UvA)',
        description: '31.000+ studenten | Breed onderzoeksuniversiteit',
        programs: 'Populaire opleidingen: Bedrijfskunde, Psychologie, Geneeskunde, Recht',
      },
      {
        name: 'Vrije Universiteit Amsterdam (VU)',
        description: '29.000+ studenten | Sterk internationaal, onderzoeksintensief',
        programs: 'Populaire opleidingen: Geneeskunde, Bedrijfskunde, Bèta, Geesteswetenschappen',
      },
      {
        name: 'Amsterdam University of Applied Sciences (HvA)',
        description: '46.000+ studenten | Praktijkgericht hbo',
        programs: 'Populaire opleidingen: Bedrijfskunde, Engineering, Sport, Media',
      },
      {
        name: 'Overige instellingen',
        description: 'Gerrit Rietveld Academie, Conservatorium van Amsterdam, Inholland',
        programs: 'Gespecialiseerde opleidingen in kunst, muziek en beroepsonderwijs',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Amsterdam?',
        answer:
          'Kamers in Amsterdam liggen vaak tussen €450–€700 per maand (gedeeld) en €700–€1.200 voor een privékamer. Centrum en Zuid zijn duurder dan Oost of Noord.',
      },
      {
        question: 'Met welke Amsterdamse universiteiten werkt Domu Match?',
        answer:
          'Met alle grote instellingen, waaronder UvA, VU, HvA, Gerrit Rietveld Academie en Conservatorium van Amsterdam.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Amsterdam?',
        answer:
          'Onder meer De Pijp (levendig), Oost (betaalbaar), Noord (creatief), Westerpark en gebieden rond Science Park en Uilenstede.',
      },
      {
        question: 'Is het moeilijk om studentenhuisvesting in Amsterdam te vinden?',
        answer:
          'De markt is krap. Begin 3–6 maanden van tevoren en combineer zoeken met Domu Match: een passende huisgenoot vergroot je opties.',
      },
      {
        question: 'Kunnen internationale studenten Domu Match gebruiken?',
        answer:
          'Ja. Domu Match helpt internationale studenten om Nederlandse en internationale huisgenoten te vinden die bij je leefstijl passen.',
      },
    ],
  },
  rotterdam: {
    name: 'Rotterdam',
    nameDisplay: 'Rotterdam',
    region: 'Zuid-Holland',
    intro:
      'Vind compatibele studenten en young professionals van EUR, Hogeschool Rotterdam, Inholland en meer. Wetenschappelijk onderbouwde matching voor prettig samenwonen.',
    stats: [
      { value: '2,800+', label: 'Studenten Rotterdam' },
      { value: '€420', label: 'Gem. kamersprijs' },
      { value: '4', label: 'Universiteiten' },
      { value: '94%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Rotterdam is betaalbaarder dan Amsterdam, met goede studentenvoorzieningen en OV.',
    marketOverview: {
      averageRent: '€350-€650/maand; betaalbaarder dan Amsterdam',
      housingType: 'Gerenoveerde pakhuizen, moderne appartementen en klassieke woningen',
      competition: 'Gematigde vraag; vaak makkelijker vinden dan in Amsterdam',
      extra: 'Uitstekende metro verbindt alle wijken',
    },
    neighborhoods: [
      { name: 'Kralingen', description: 'Dicht bij EUR-campus, studentvriendelijk', priceRange: '€400-€600/maand' },
      { name: 'Noord', description: 'Betaalbaar, multicultureel, goed OV', priceRange: '€350-€500/maand' },
      { name: 'West', description: 'Levendig, dicht bij centrum', priceRange: '€450-€650/maand' },
      { name: 'Blijdorp', description: 'Rustig, groen, bij dierentuin', priceRange: '€400-€550/maand' },
      { name: 'Centrum', description: 'Centraal, uitgaan, winkels', priceRange: '€500-€750/maand' },
    ],
    universities: [
      {
        name: 'Erasmus University Rotterdam (EUR)',
        description: '24.000+ studenten | Sterk in bedrijfskunde en economie',
        programs: 'Populaire opleidingen: Geneeskunde, Bedrijfskunde, Economie, Recht',
      },
      {
        name: 'Rotterdam University of Applied Sciences',
        description: '28.000+ studenten | Praktijkgericht hbo',
        programs: 'Populaire opleidingen: Bedrijfskunde, Zorg, Engineering, Sociaal werk',
      },
      {
        name: 'InHolland Rotterdam',
        description: 'Hbo met sterke link naar het werkveld',
        programs: 'Verschillende toegepaste en beroepsopleidingen',
      },
      {
        name: 'Codarts',
        description: 'Kunstopleiding voor muziek, dans en circus',
        programs: 'Muziek, Dans, Circus',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Rotterdam?',
        answer:
          'Meestal €350–€650 per maand — betaalbaarder dan Amsterdam. Kralingen en Noord zijn populair.',
      },
      {
        question: 'Met welke Rotterdamse instellingen werkt Domu Match?',
        answer:
          'Met EUR, Hogeschool Rotterdam, Inholland Rotterdam en Codarts — voor passende huisgenoten binnen elke instelling.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Rotterdam?',
        answer:
          'Onder meer Kralingen (bij EUR), Noord, West en Blijdorp. De metro maakt pendelen eenvoudig.',
      },
      {
        question: 'Is Rotterdam geschikt voor internationale studenten?',
        answer:
          'Ja: zeer internationaal, veel Engels. Domu Match helpt je huisgenoten te vinden die bij je leefstijl passen.',
      },
    ],
  },
  utrecht: {
    name: 'Utrecht',
    nameDisplay: 'Utrecht',
    region: 'Utrecht',
    intro:
      'Vind geverifieerde studenten en young professionals van Universiteit Utrecht, HU en meer. Wetenschappelijk onderbouwde matching in het hart van Nederland.',
    stats: [
      { value: '3,100+', label: 'Studenten Utrecht' },
      { value: '€520', label: 'Gem. kamersprijs' },
      { value: '2', label: 'Universiteiten' },
      { value: '91%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Compacte, fietsvriendelijke stad met sterke studentengemeenschap en diverse huisvestingsopties.',
    marketOverview: {
      averageRent: '€450-€700/maand, afhankelijk van wijk en kamertype',
      housingType: 'Historische grachtenpanden, moderne appartementen en studentencomplexen',
      competition: 'Hoge vraag; begin op tijd, vooral rond Science Park',
      extra: 'Uitstekende fietsinfrastructuur; meeste wijken binnen 15–20 minuten fietsen',
    },
    neighborhoods: [
      { name: 'Lombok', description: 'Divers, levendig, cafés en winkels', priceRange: '€450-€650/maand' },
      { name: 'Wittevrouwen', description: 'Rustig, residentieel, gezinsvriendelijk', priceRange: '€500-€700/maand' },
      { name: 'Science Park', description: 'Dicht bij UU-campus, moderne huisvesting', priceRange: '€550-€750/maand' },
      { name: 'Oudwijk', description: 'Groen, rustig, iets duurder', priceRange: '€550-€750/maand' },
      { name: 'Binnenstad', description: 'Centraal, grachten, uitgaan', priceRange: '€600-€850/maand' },
    ],
    universities: [
      {
        name: 'Utrecht University (UU)',
        description: '30.000+ studenten | Breed aanbod, sterk onderzoek',
        programs: 'Populaire opleidingen: Recht, Bèta, Geesteswetenschappen, Geneeskunde',
      },
      {
        name: 'HU University of Applied Sciences',
        description: '38.000+ studenten | Praktijkgericht hbo',
        programs: 'Populaire opleidingen: Onderwijs, Zorg, Bedrijfskunde, ICT',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Utrecht?',
        answer:
          'Vaak €450–€700 per maand. Lombok en Wittevrouwen zijn populair; Science Park ligt handig voor UU-studenten.',
      },
      {
        question: 'Met welke Utrechtse instellingen werkt Domu Match?',
        answer:
          'Met Universiteit Utrecht (UU) en Hogeschool Utrecht (HU).',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Utrecht?',
        answer:
          'Onder meer Lombok, Wittevrouwen, Science Park en de binnenstad.',
      },
      {
        question: 'Is Utrecht geschikt voor internationale studenten?',
        answer:
          'Ja: internationaal en fietsvriendelijk, veel Engelstalige opleidingen. Domu Match helpt bij het vinden van passende huisgenoten.',
      },
    ],
  },
  'den-haag': {
    name: 'Den Haag',
    nameDisplay: 'Den Haag',
    region: 'Zuid-Holland',
    intro:
      'Vind geverifieerde studenten en young professionals van De Haagse Hogeschool, Universiteit Leiden Den Haag en meer. Wetenschappelijk onderbouwde matching in een internationale stad.',
    stats: [
      { value: '2,200+', label: 'Studenten Den Haag' },
      { value: '€480', label: 'Gem. kamersprijs' },
      { value: '3+', label: 'Instellingen' },
      { value: '90%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Internationale sfeer, strand dichtbij, en een mix van historische en moderne wijken.',
    marketOverview: {
      averageRent: '€400-€650/maand, afhankelijk van wijk',
      housingType: 'Grachtenpanden, moderne appartementen en studentenhuisvesting via DUWO en anderen',
      competition: 'Gematigd tot hoog; meld je vroeg bij DUWO',
      extra: 'DUWO is de grootste studentenhuisvester; schrijf in zodra je je aanbod accepteert',
    },
    neighborhoods: [
      { name: 'Zeeheldenkwartier', description: 'Grachten, jugendstil, cafés, dicht bij ISS', priceRange: '€450-€650/maand' },
      { name: 'Statenkwartier', description: 'Rustig, veilig, nabij strand', priceRange: '€500-€700/maand' },
      { name: 'Laakkwartier', description: 'Dicht bij centrum, divers', priceRange: '€400-€550/maand' },
      { name: 'Regentessekwartier', description: 'Levendig, winkels, horeca', priceRange: '€450-€600/maand' },
      { name: 'Bezuidenhout', description: 'Bij Haagse Bos, gemixte woningen', priceRange: '€450-€600/maand' },
      { name: 'Scheveningen', description: 'Strand, zee, iets hogere huren', priceRange: '€500-€750/maand' },
    ],
    universities: [
      {
        name: 'The Hague University of Applied Sciences (THUAS)',
        description: '28.000+ studenten | Sterk internationaal, praktijkgericht',
        programs: 'Populaire opleidingen: International Business, Recht, Security, ICT',
      },
      {
        name: 'Leiden University – The Hague Campus',
        description: 'Opleidingen in recht, bestuur en internationale betrekkingen',
        programs: 'Recht, Bestuurskunde, International Studies',
      },
      {
        name: 'Overige instellingen',
        description: 'ISS, Hotelschool The Hague en andere gespecialiseerde scholen',
        programs: 'Ontwikkelingsstudies, hospitality en meer',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Den Haag?',
        answer:
          'Meestal €400–€650 per maand. Zeeheldenkwartier, Laak en Regentessekwartier zijn populair; Scheveningen is duurder maar vlak bij het strand.',
      },
      {
        question: 'Met welke Haagse instellingen werkt Domu Match?',
        answer:
          'Onder meer THUAS, Universiteit Leiden Den Haag en andere scholen in de stad.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Den Haag?',
        answer:
          'Onder meer Zeeheldenkwartier, Statenkwartier, Laakkwartier, Regentessekwartier en Bezuidenhout.',
      },
      {
        question: 'Kunnen internationale studenten Domu Match in Den Haag gebruiken?',
        answer:
          'Ja. Den Haag is zeer internationaal; Domu Match helpt je huisgenoten te vinden die bij je leefstijl passen.',
      },
    ],
  },
  eindhoven: {
    name: 'Eindhoven',
    nameDisplay: 'Eindhoven',
    region: 'Noord-Brabant',
    intro:
      'Vind geverifieerde studenten en young professionals van TU/e, Fontys en meer in de Brainport-regio. Wetenschappelijk onderbouwde matching voor innovators.',
    stats: [
      { value: '2,500+', label: 'Studenten Eindhoven' },
      { value: '€420', label: 'Gem. kamersprijs' },
      { value: '2', label: 'Universiteiten' },
      { value: '93%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Tech-hoofdstad met betaalbaardere huisvesting dan Amsterdam of Utrecht; goede opties bij campus en centrum.',
    marketOverview: {
      averageRent: '€350-€550/maand; studio’s tot ca. €650-€870 incl. nutsvoorzieningen',
      housingType: 'Kamers in studentenhuizen, studio’s en verenigingswoningen',
      competition: 'Krap aanbod; begin vroeg (bijv. vanaf april voor volgend studiejaar)',
      extra: 'TU/e en Fontys werken samen met huisvesters; vraag gereserveerde kamers aan als je in aanmerking komt',
    },
    neighborhoods: [
      { name: 'Stratumseind', description: 'Uitgaan, centraal, levendig', priceRange: '€400-€600/maand' },
      { name: 'Woensel', description: 'Betaalbaar, divers, goed OV', priceRange: '€350-€500/maand' },
      { name: 'Campusbuurt', description: 'Dicht bij TU/e, handig voor studenten', priceRange: '€450-€650/maand' },
      { name: 'Centrum', description: 'Binnenstad, winkels, horeca', priceRange: '€500-€700/maand' },
      { name: 'Gestel', description: 'Rustig, residentieel, gezinsvriendelijk', priceRange: '€400-€550/maand' },
    ],
    universities: [
      {
        name: 'Eindhoven University of Technology (TU/e)',
        description: '11.000+ studenten | Technische topuniversiteit',
        programs: 'Populaire opleidingen: Engineering, Informatica, Industrial Design, Technische Natuurkunde',
      },
      {
        name: 'Fontys University of Applied Sciences',
        description: '44.000+ studenten | Praktijkgericht tech en creatief',
        programs: 'Populaire opleidingen: ICT, Engineering, Bedrijfskunde, Kunst',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Eindhoven?',
        answer:
          'Gedeelde kamers vaak €350–€550/maand; studio’s €410–€870 incl. nutsvoorzieningen. Betaalbaarder dan Amsterdam of Utrecht.',
      },
      {
        question: 'Met welke Eindhovense instellingen werkt Domu Match?',
        answer:
          'Met TU/e en Fontys — voor passende huisgenoten in de regio.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Eindhoven?',
        answer:
          'Onder meer Stratumseind, Woensel, de campusbuurt en het centrum. Omliggende dorpen zijn ook een optie.',
      },
      {
        question: 'Wanneer moet ik beginnen met zoeken in Eindhoven?',
        answer:
          'Zo vroeg mogelijk. TU/e adviseert vanaf april voor het volgende jaar; Fontys hanteert deadlines. Met Domu Match vind je eerst huisgenoten, daarna kun je samen woning zoeken.',
      },
    ],
  },
  groningen: {
    name: 'Groningen',
    nameDisplay: 'Groningen',
    region: 'Groningen',
    intro:
      'Vind geverifieerde studenten en young professionals van RUG en Hanzehogeschool. Wetenschappelijk onderbouwde matching in een levendige studentenstad.',
    stats: [
      { value: '2,600+', label: 'Studenten Groningen' },
      { value: '€420', label: 'Gem. kamersprijs' },
      { value: '2', label: 'Universiteiten' },
      { value: '94%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Groningen heeft een van de hoogste student/ inwoner-ratio’s. Begin 3–5 maanden van tevoren; een passende huisgenoot vergroot je opties.',
    marketOverview: {
      averageRent: '€350-€550/maand, afhankelijk van wijk en type',
      housingType: 'SSH-complexen (gemeubileerd, incl. nutsvoorzieningen), kamers en appartementen',
      competition: 'Hoge vraag; plan 3–5 maanden vooruit',
      extra: 'Compacte stad: in ~25 minuten fiets je er doorheen; omliggende dorpen zijn haalbaar',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Levendig, winkels, uitgaan, nabij academiegebouw', priceRange: '€450-€650/maand' },
      { name: 'Paddepoel', description: 'Dicht bij Zernike, veel studenten', priceRange: '€350-€500/maand' },
      { name: 'Selwerd', description: 'Betaalbaar, nabij Zernike', priceRange: '€350-€500/maand' },
      { name: 'Oosterpoort', description: 'Karaktervol, betaalbaar, bij station', priceRange: '€400-€550/maand' },
      { name: 'Oosterpark', description: 'Populaire studentenbuurt', priceRange: '€400-€550/maand' },
    ],
    universities: [
      {
        name: 'University of Groningen (RUG)',
        description: '34.000+ studenten | Onderzoeksuniversiteit, breed aanbod',
        programs: 'Populaire opleidingen: Recht, Economie, Bèta, Geesteswetenschappen, Geneeskunde',
      },
      {
        name: 'Hanze University of Applied Sciences',
        description: '28.000+ studenten | Praktijkgericht, sterk internationaal',
        programs: 'Populaire opleidingen: Bedrijfskunde, Engineering, Kunst, Zorg',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Groningen?',
        answer:
          'Meestal €350–€550/maand. Paddepoel en Selwerd zijn betaalbaar en dicht bij Zernike; de binnenstad is duurder maar centraal.',
      },
      {
        question: 'Met welke Groningse instellingen werkt Domu Match?',
        answer:
          'Met RUG en Hanzehogeschool.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Groningen?',
        answer:
          'Onder meer binnenstad, Paddepoel, Selwerd, Oosterpoort en Oosterpark. De stad is zeer fietsvriendelijk.',
      },
      {
        question: 'Is Groningen geschikt voor internationale studenten?',
        answer:
          'Ja: grote internationale community (ca. 10.000). Domu Match helpt bij huisgenoten die bij je leefstijl passen.',
      },
    ],
  },
  leiden: {
    name: 'Leiden',
    nameDisplay: 'Leiden',
    region: 'Zuid-Holland',
    intro:
      'Vind geverifieerde studenten en young professionals van Universiteit Leiden. Historische universiteitsstad met sterke academische traditie.',
    stats: [
      { value: '2,400+', label: 'Studenten Leiden' },
      { value: '€480', label: 'Gem. kamersprijs' },
      { value: '1', label: 'Universiteit' },
      { value: '92%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Historische charme en sterke universiteit in een compacte, fietsvriendelijke stad met levendige studentengemeenschap.',
    marketOverview: {
      averageRent: '€400-€650/maand, afhankelijk van locatie',
      housingType: 'Monumenten, grachtenpanden, moderne appartementen en studentencomplexen',
      competition: 'Hoge vraag; begin op tijd, vooral voor binnenstad en Bio Science Park',
      extra: 'Compact: de meeste wijken binnen 15 minuten fietsen',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Historisch, grachten, cafés, uitgaan', priceRange: '€500-€700/maand' },
      { name: 'Leiden-Noord', description: 'Rustiger, residentieel, goede prijs', priceRange: '€400-€550/maand' },
      { name: 'Bio Science Park', description: 'Dicht bij science faculty, modern', priceRange: '€450-€650/maand' },
      { name: 'Stevenshof', description: 'Gezinsvriendelijk, rustig', priceRange: '€400-€550/maand' },
      { name: 'Zuidwest', description: 'Betaalbaar, divers', priceRange: '€380-€520/maand' },
    ],
    universities: [
      {
        name: 'Leiden University',
        description: '28.000+ studenten | Oudste universiteit van Nederland, breed onderzoek',
        programs: 'Populaire opleidingen: Recht, Geesteswetenschappen, Bèta, Geneeskunde, Internationale betrekkingen',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Leiden?',
        answer:
          'Meestal €400–€650/maand. Binnenstad is duurder; Leiden-Noord en Zuidwest zijn betaalbaarder.',
      },
      {
        question: 'Met welke instelling werkt Domu Match in Leiden?',
        answer:
          'Met Universiteit Leiden — alle faculteiten kunnen via Domu Match passende huisgenoten vinden.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Leiden?',
        answer:
          'Onder meer binnenstad, Leiden-Noord, Bio Science Park en Stevenshof.',
      },
      {
        question: 'Is Leiden geschikt voor internationale studenten?',
        answer:
          'Ja: zeer internationaal, veel Engelstalige opleidingen. Domu Match helpt bij huisgenoten die bij je leefstijl passen.',
      },
    ],
  },
  nijmegen: {
    name: 'Nijmegen',
    nameDisplay: 'Nijmegen',
    region: 'Gelderland',
    intro:
      'Vind geverifieerde studenten en young professionals van Radboud Universiteit en HAN. Oude stad met jonge, groene en levendige studentensfeer.',
    stats: [
      { value: '2,300+', label: 'Studenten Nijmegen' },
      { value: '€430', label: 'Gem. kamersprijs' },
      { value: '2', label: 'Universiteiten' },
      { value: '91%', label: 'Matchtevredenheid' },
    ],
    housingIntro:
      'Een van de groenste steden van Europa, vlak bij Duitsland, met betaalbare huren en sterke community.',
    marketOverview: {
      averageRent: '€350-€600/maand, afhankelijk van wijk',
      housingType: 'Kamers, studentenhuizen, studio’s en woningen rond campus Heijendaal',
      competition: 'Gematigd tot hoog; begin enkele maanden voor verhuizing',
      extra: 'Heijendaal is populair bij Radboud- en HAN-studenten',
    },
    neighborhoods: [
      { name: 'Binnenstad', description: 'Centraal, winkels, uitgaan, historisch', priceRange: '€450-€650/maand' },
      { name: 'Dukenburg', description: 'Betaalbaar, divers, goed OV', priceRange: '€350-€500/maand' },
      { name: 'Heijendaal', description: 'Dicht bij Radboud- en HAN-campus', priceRange: '€400-€600/maand' },
      { name: 'Lent', description: 'Over de Waal, in ontwikkeling, meer ruimte', priceRange: '€400-€550/maand' },
      { name: 'Bottendaal', description: 'Veel studenten, levendig', priceRange: '€420-€580/maand' },
    ],
    universities: [
      {
        name: 'Radboud University',
        description: '24.000+ studenten | Brede onderzoeksuniversiteit',
        programs: 'Populaire opleidingen: Recht, Geneeskunde, Bèta, Geesteswetenschappen, Sociale wetenschappen',
      },
      {
        name: 'HAN University of Applied Sciences',
        description: '33.000+ studenten | Praktijkgericht hbo',
        programs: 'Populaire opleidingen: Bedrijfskunde, Engineering, Zorg, Onderwijs',
      },
    ],
    faqs: [
      {
        question: 'Wat is de gemiddelde huur voor studentenkamers in Nijmegen?',
        answer:
          'Meestal €350–€600/maand. Dukenburg en Bottendaal zijn vaak betaalbaarder; Heijendaal ligt handig bij de campus.',
      },
      {
        question: 'Met welke Nijmeegse instellingen werkt Domu Match?',
        answer:
          'Met Radboud Universiteit en HAN.',
      },
      {
        question: 'Welke buurten zijn populair bij studenten in Nijmegen?',
        answer:
          'Onder meer binnenstad, Dukenburg, Heijendaal, Bottendaal en Lent.',
      },
      {
        question: 'Is Nijmegen geschikt voor internationale studenten?',
        answer:
          'Ja: groen, internationaal en gastvrij. Radboud en HAN trekken veel internationale studenten; Domu Match helpt bij passende huisgenoten.',
      },
    ],
  },
}
