'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Why Private Landlords Exit Dutch Student Housing',
    excerpt:
      'Roughly half of Dutch student rooms sit in private hands. ABF and Kences reporting shows that stock is shrinking fast as landlords sell, even while corporations build. Here is what that means for rents, cities, and 2026 policy.',
    publishDate: '2026-06-17',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage and Retention',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How room scarcity shows up in wellbeing dashboards and completion risk, not only in rent tables.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'National monitoring data on who has a room, who wants one, and where integration pressure builds.',
      },
      {
        title: 'Universities and cities we track',
        href: '/universities',
        description:
          'Context on how Dutch institutions sit inside different municipal housing regimes and student populations.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates often start with wait lists and average rent. A quieter supply shock sits
          underneath: <strong>private landlords are selling student properties faster than new rooms arrive</strong>.
          Reporting from NOS on research commissioned by the Ministry of Housing (VRO) and Kences describes more than
          5,000 student homes sold in a single year, equivalent to roughly 10,000 rooms (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ). That is not a marginal correction. It is a structural shift in who controls the pipeline students depend on.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Rental documents and contract signing — private student housing and Dutch rental law changes"
          />
          <figcaption>
            When private landlords exit, student cities lose flexible stock that corporations rarely replace at the same pace.
          </figcaption>
        </figure>

        <h2>Private stock matters because it is half the system</h2>

        <p>
          Kences director Jolan de Bie told NOS that about half of all Dutch student housing sits with private
          landlords (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ). Corporations have built roughly 5,000 student rooms per year since 2022, but private investors buy back
          only a small share to keep renting. Kences warned that the country could lose about 9 percent of its student
          rooms within two years if sales continue at the current pace, with an estimated 45,000 private rooms at risk
          over that window (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ).
        </p>

        <p>
          The national picture had roughly 393,000 student rooms for higher-education students in the past academic
          year, according to the same reporting. When 17,800 fewer students occupied private rooms compared with the
          year before, and total supply in twenty student cities fell by an estimated 13,500 units to 322,400, the
          squeeze is visible in both stock and occupancy (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, September 2025
          </a>
          ).
        </p>

        <h2>Which cities feel the sales wave first</h2>

        <p>
          ABF Research, cited by NOS, shows that private sales concentrate in major student cities. Amsterdam led with
          more than 2,000 sold private rental homes, followed by Rotterdam (1,025), Utrecht (810), and Groningen
          (695) (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ). The chart below makes the geographic skew legible: one metro can absorb years of municipal new-build
          ambition in a single sales cycle.
        </p>

        <BlogBarChart
          data={[
            { label: 'Amsterdam', value: 2000 },
            { label: 'Rotterdam', value: 1025 },
            { label: 'Utrecht', value: 810 },
            { label: 'Groningen', value: 695 },
          ]}
          yLabel="Sold homes"
          unit="count"
          caption="Source: ABF Research via NOS, November 2025. Counts are private rental homes sold in one year; NOS reports each home represents roughly two student rooms."
        />

        <p>
          For students already navigating{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international housing friction
          </Link>
          , a shrinking private layer means fewer mid-price rooms and more competition for the same institutional
          mailboxes. Cities that route landlords to university accommodation desks, as Breda does for Avans and BUas
          under the hospitaregeling, feel that pressure when informal supply thins (
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            Gemeente Breda, n.d.
          </a>
          ).
        </p>

        <h3>Why landlords sell: rent caps, tax, and house-sharing rules</h3>

        <p>
          ING housing economist Sander Burgers told NOS the sales wave reflects both market returns and policy. Higher
          interest rates and strong owner-occupier prices make selling attractive. At the same time, the Wet
          Betaalbare Huur caps rents through a points system, box 3 taxation on rental assets has risen, and stricter
          house-sharing permits make multi-tenant properties harder to operate (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ;
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ). Burgers framed the trade-off plainly: measures that protect sitting tenants can shift stock out of the
          rental sector rather than expand it.
        </p>

        <p>
          Kences has argued for complementary fixes: permit-free house sharing up to three or four tenants where
          municipalities steer by target group, temporary student contracts to make letting predictable, and extending
          rent allowance to some private student tenants who currently miss out (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, September 2025
          </a>
          ;
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, November 2025
          </a>
          ).
        </p>

        <h2>What 2026 policy signals change</h2>

        <p>
          In April 2026, Housing Minister Boekholt-O&apos;Sullivan announced a package aimed at accelerating supply:
          simpler permitting, a flexible pool of civil servants to unblock projects, and a target to raise prefabricated
          construction from just over 20 percent of new builds today to half within four years (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, April 2026
          </a>
          ). For student rooms specifically, the letter to parliament mentions easier house sharing, citing Utrecht&apos;s
          model where three people may share without a permit, and broader temporary rental contracts for students
          regardless of whether they come from outside the municipality.
        </p>

        <p>
          The same announcement softens parts of the Wet Betaalbare Huur: WOZ value may weigh more heavily in the
          points system, penalties for missing outdoor space may disappear, and small national monuments may command
          higher rents (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, April 2026
          </a>
          ). The stated goal is to keep rental stock on the market. Whether that reverses private exits in student
          cities will depend on implementation speed, because sales already outpaced new corporation builds in the
          reporting window Kences described.
        </p>

        <h2>Student-side effects: prices, blocked turnover, and hidden demand</h2>

        <p>
          Supply shrinkage does not stay on a spreadsheet. Kamernet reported average student rents of 683 euros per
          month in early 2025, up more than 6 percent year on year, while listing volumes barely moved (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The Landelijke Studentenvakbond told NOS that students struggle to afford rent and fear challenging
          landlords because temporary contracts make eviction feel immediate, even as huurteams win a large share of
          disputes when students do act (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Kences also notes that headline shortage figures understate pressure. An estimated 57 percent of graduates
          still occupy a student room a year after finishing, unable to move into the general housing market, which
          keeps rooms from turning over (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, September 2025
          </a>
          ). Fewer students even report actively searching for a room, not because demand vanished, but because repeated
          failure makes search look irrational. That dynamic connects private exits to the retention story outlined in{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            earlier Dutch housing analysis on this site
          </Link>
          .
        </p>

        <h2>How to read the evidence without overclaiming</h2>

        <p>
          Three guardrails keep this topic honest. First, separate <strong>sales counts</strong> from{' '}
          <strong>net room loss</strong>: a sold house may leave the student pool even if it helps an owner-occupier
          elsewhere. Second, treat policy announcements as <strong>intent</strong> until municipal rules and point
          systems are published. Third, compare local vacancy tools and institution guidance, not only national
          averages, when advising students on autumn intake.
        </p>

        <p>
          For behavioural questions that still matter in a tight market, see{' '}
          <Link href="/blog/how-to-find-a-great-roommate">how to find a great roommate</Link>. Institution-level
          context sits in the <Link href="/universities">universities overview</Link>, and the editorial approach
          behind these pieces is summarised on the <Link href="/about">about page</Link>.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (n.d.). <em>Kamer verhuren met de hospitaregeling</em>. Retrieved June 17, 2026, from{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>. Retrieved June
          17, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, September 3). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved
          June 17, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, November 3). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Retrieved June
          17, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS Nieuwsuur. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.
          Retrieved June 17, 2026, from{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026, April 20). <em>Kabinet wil sneller bouwen met prefabwoningen en versoepelt de huurwet</em>.
          Retrieved June 17, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Waarom particuliere verhuurders de Nederlandse studentenmarkt verlaten',
    excerpt:
      'Ongeveer de helft van de studentenkamers staat bij particulieren. ABF- en Kences-cijfers tonen een snelle krimp door verkoop, terwijl corporaties wel bouwen. Wat betekent dat voor huur, steden en het beleid in 2026?',
    publishDate: '2026-06-17',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Kamertekort en retentie',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe schaarste terugkomt in welzijn en studiesucces, niet alleen in huurtabellen.',
      },
      {
        title: 'Internationale studentenhuisvesting',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Landelijke monitoring over wie een kamer heeft, wie er een wil, en waar integratiedruk ontstaat.',
      },
      {
        title: 'Steden en instellingen',
        href: '/universities',
        description:
          'Context per regio over instellingen en gemeentelijk woonbeleid.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting begint vaak bij wachtlijsten en gemiddelde huur. Daaronder speelt een
          stillere schok: <strong>particuliere verhuurders verkopen studentenpanden sneller dan er nieuwe kamers
          bijkomen</strong>. NOS berichtte op basis van onderzoek van ABF Research in opdracht van VRO en Kences over
          meer dan 5.000 verkochte studentenwoningen in één jaar, goed voor circa 10.000 kamers (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ). Dat verandert wie de voorraad beheert waar studenten op leunen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Huurcontract en documenten — particuliere studentenhuisvesting en wijzigingen in de huurwet"
          />
          <figcaption>
            Wanneer particulieren vertrekken, verliezen studentensteden flexibele voorraad die corporaties zelden even snel vervangen.
          </figcaption>
        </figure>

        <h2>Particuliere voorraad is de helft van het systeem</h2>

        <p>
          Kences-directeur Jolan de Bie zei tegen NOS dat ongeveer de helft van alle studentenwoningen bij
          particulieren staat (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ). Corporaties bouwen sinds 2022 gemiddeld 5.000 kamers per jaar, maar particulieren kopen weinig terug om te
          blijven verhuren. Kences waarschuwde dat Nederland binnen twee jaar circa 9 procent van de studentenkamers
          kan verliezen als de verkoop doorzet, met een geschat risico van 45.000 particuliere kamers (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ).
        </p>

        <p>
          Landelijk telde men in het afgelopen collegejaar circa 393.000 studentenkamers voor het hoger onderwijs. Er
          woonden 17.800 minder studenten in de particuliere sector dan het jaar ervoor, en het totale aanbod in
          twintig studentensteden daalde met naar schatting 13.500 eenheden naar 322.400 (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, september 2025
          </a>
          ).
        </p>

        <h2>Waar verkopen het hardst toeslaan</h2>

        <p>
          Volgens ABF Research, via NOS, concentreren verkopen zich in grote studentensteden. Amsterdam staat bovenaan
          met meer dan 2.000 verkochte particuliere huurwoningen, gevolgd door Rotterdam (1.025), Utrecht (810) en
          Groningen (695) (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ). De grafiek hieronder laat die geografische scheefheid zien.
        </p>

        <BlogBarChart
          data={[
            { label: 'Amsterdam', value: 2000 },
            { label: 'Rotterdam', value: 1025 },
            { label: 'Utrecht', value: 810 },
            { label: 'Groningen', value: 695 },
          ]}
          yLabel="Verkochte woningen"
          unit="stuks"
          caption="Bron: ABF Research via NOS, november 2025. Aantallen zijn verkochte particuliere huurwoningen in één jaar; NOS meldt dat elke woning circa twee studentenkamers vertegenwoordigt."
        />

        <p>
          Voor studenten die al navigeren in{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale woonfrictie
          </Link>{' '}
          betekent een krimpende particuliere laag minder middenprijskamers en meer concurrentie om dezelfde
          instellingskanalen. Steden die verhuurders doorverwijzen naar hogescholen, zoals Breda voor Avans en BUas
          onder de hospitaregeling, voelen die druk wanneer informeel aanbod dunner wordt (
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            Gemeente Breda, z.d.
          </a>
          ).
        </p>

        <h3>Waarom verkopen: huurplafonds, belasting en woningdelen</h3>

        <p>
          ING-woningmarkteconoom Sander Burgers zei tegen NOS dat de verkoopgolf zowel marktrendementen als beleid
          weerspiegelt. Hogere rentes en sterke koopprijzen maken verkopen aantrekkelijk. Tegelijk begrenst de Wet
          betaalbare huur de huur via een puntensysteem, is de box 3-belasting op verhuur gestegen, en zijn
          vergunningen voor woningdelen aangescherpt (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ;
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ). Burgers formuleerde de afweging scherp: maatregelen die zittende huurders beschermen kunnen voorraad uit
          de verhuursector duwen in plaats van uitbreiden.
        </p>

        <p>
          Kences pleit voor aanvullende maatregelen: vergunningsvrij woningdelen tot drie of vier personen waar
          gemeenten sturen op doelgroepen, tijdelijke studentencontracten, en huurtoeslag voor sommige particuliere
          studenthuurders (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, september 2025
          </a>
          ;
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, november 2025
          </a>
          ).
        </p>

        <h2>Wat het beleid in 2026 aankondigt</h2>

        <p>
          In april 2026 kondigde minister Boekholt-O&apos;Sullivan maatregelen aan om bouwen te versnellen:
          vereenvoudigde vergunningen, een flexibele pool ambtenaren, en een doel om prefabbouw van iets meer dan 20
          procent van de nieuwbouw nu naar de helft binnen vier jaar te brengen (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, april 2026
          </a>
          ). Voor studenten noemt de brief makkelijker woningdelen, met Utrecht als voorbeeld waar drie personen zonder
          vergunning mogen delen, en bredere tijdelijke contracten voor alle studenten.
        </p>

        <p>
          Tegelijk wordt de Wet betaalbare huur versoepeld: WOZ-waarde telt zwaarder mee, minpunten voor ontbrekende
          buitenruimte verdwijnen, en kleine rijksmonumenten mogen hogere huren vragen (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, april 2026
          </a>
          ). Of dat particuliere uitstroom in studentensteden keert, hangt af van implementatiesnelheid, omdat verkopen
          in de rapportageperiode van Kences al sneller gingen dan corporatiebouw.
        </p>

        <h2>Effecten voor studenten: prijs, doorstroom en verborgen vraag</h2>

        <p>
          Krimpende voorraad blijft niet op papier. Kamernet meldde begin 2025 een gemiddelde studentenhuur van 683
          euro per maand, ruim 6 procent hoger dan een jaar eerder, terwijl het aanbod nauwelijks groeide (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De LSVb zei dat studenten de huur nauwelijks kunnen betalen en bang zijn hun kamer te verliezen bij
          klachten over tijdelijke contracten (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Kences merkt ook op dat tekortcijfers de druk onderschatten. Naar schatting woont 57 procent van de
          afgestudeerden na een jaar nog in een studentenkamer omdat doorstroom naar de reguliere markt ontbreekt (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, september 2025
          </a>
          ). Minder studenten zeggen actief te zoeken, niet omdat de behoefte weg is, maar omdat herhaald falen zoeken
          onaannemelijk maakt. Dat verbindt particuliere uitstroom aan het retentiebeeld in{' '}
          <Link href="/blog/student-housing-shortage-retention-roi">
            eerder Nederlands huisvestingsonderzoek op deze site
          </Link>
          .
        </p>

        <h2>Zo lees je het bewijs zorgvuldig</h2>

        <p>
          Drie kaders helpen. Scheid <strong>verkoopcijfers</strong> van <strong>netto kamerverlies</strong>: een
          verkocht huis verlaat de studentenvoorraad ook als het elders een koper helpt. Behandel
          beleidsaankondigingen als <strong>intentie</strong> tot gemeentelijke regels vastliggen. Vergelijk lokale
          tools en instellingsadviezen, niet alleen landelijke gemiddelden, bij herfstintake.
        </p>

        <p>
          Voor gedragsvragen in een krappe markt:{' '}
          <Link href="/blog/how-to-find-a-great-roommate">een fijne huisgenoot vinden</Link>. Instellingscontext:{' '}
          <Link href="/universities">universiteiten en hogescholen</Link>. Redactionele lijn:{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (z.d.). <em>Kamer verhuren met de hospitaregeling</em>. Geraadpleegd 17 juni 2026,{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Gemiddelde kamerprijs stijgt tot bijna 700 euro, aanbod blijft achter</em>. Geraadpleegd 17
          juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Geraadpleegd
          17 juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, 3 november). <em>Particulieren verkopen steeds vaker hun studentenwoningen</em>. Geraadpleegd 17
          juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS Nieuwsuur. (2025). <em>Door nieuwe verhuurregels komen studenten nóg moeilijker aan een kamer</em>.
          Geraadpleegd 17 juni 2026,{' '}
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026, 20 april). <em>Kabinet wil sneller bouwen met prefabwoningen en versoepelt de huurwet</em>.
          Geraadpleegd 17 juni 2026,{' '}
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet
          </a>
        </p>
      </div>
    ),
  },
}

export function PrivateLandlordsExitStudentHousingArticle() {
  const { locale } = useApp()
  const article = content[locale]

  return (
    <BlogPostLayout
      title={article.title}
      excerpt={article.excerpt}
      publishDate={article.publishDate}
      readTime={article.readTime}
      relatedLinks={article.relatedLinks}
    >
      {article.body()}
    </BlogPostLayout>
  )
}
