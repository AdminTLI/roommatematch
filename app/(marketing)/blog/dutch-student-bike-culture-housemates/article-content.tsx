'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'How Bike Culture Shapes Dutch Student Houses',
    excerpt:
      'CBS cycling data and campus research show why the bicycle sets the rhythm of Dutch student houses—especially as autumn pulls life indoors.',
    publishDate: '2026-10-07',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How houses write short norms without turning every request into a late-night message war.',
      },
      {
        title: 'Exam Week House Rules',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Temporary quiet, kitchen, and guest norms when tentamenweek compresses every routine.',
      },
      {
        title: 'Language Gaps With Dutch Housemates',
        href: '/blog/international-students-dutch-housemates-language',
        description:
          'How kitchen Dutch and unspoken contact norms shape mixed student houses.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In the Netherlands, the student house does not run on the lease alone. It runs on tyres, lights, and the
          unspoken rule that everyone somehow gets to campus, the Albert Heijn, and the late lecture without turning
          the hallway into a bike depot. In 2023 the bicycle accounted for{' '}
          <strong>27%</strong> of all trips by residents aged six and older - second only to the car - and the average
          person cycled about <strong>2.9 kilometres</strong> a day (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, Hoeveel fietsen inwoners van Nederland?
          </a>
          ). For student houses, that is not trivia. It is the operating system of everyday life.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Bicycles parked along a canal embankment in a Dutch city under an overcast sky"
          />
          <figcaption>
            Dutch student culture moves on two wheels. Shared houses feel that rhythm before anyone opens the group
            chat.
          </figcaption>
        </figure>

        <h2>Why the fiets is housemate infrastructure</h2>

        <p>
          Ask a Dutch student what &quot;being late&quot; means and you will often hear a bike story: a flat tyre,
          stolen lights, a chain that only fails when it rains sideways. CBS data for 2023 show people aged{' '}
          <strong>18–25</strong> still average about <strong>2.6 kilometres</strong> by bike per day, while shopping,
          going out, sport, and hobbies together make up more than four in ten bicycle trips (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2023
          </a>
          ). Those are exactly the trips that bind a household: groceries, club nights, the supermarket run nobody
          wanted to do alone.
        </p>

        <p>
          Campus life mirrors the pattern. At Tilburg University, the on-campus bike workshop reports roughly{' '}
          <strong>fifty</strong> visitors a day and a seasonal spike of punctures in autumn - a small but telling
          signal that student mobility is maintenance-heavy, not optional (
          <a
            href="https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            Univers, 2026
          </a>
          ). When one housemate&apos;s bike dies, the whole dinner plan can stall. Compatibility is not only about
          dishes; it is about whether your logistics stack matches.
        </p>

        <h2>Autumn: when outdoor culture moves indoors</h2>

        <p>
          October is the hinge month. CBS month-by-month figures show daily cycling distance around{' '}
          <strong>3.0 km</strong> in October, then falling toward roughly <strong>2.4 km</strong> in November and{' '}
          <strong>1.9 km</strong> in December (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2023
          </a>
          ). University guidance for students echoes the lived experience: layers, lights, rain trousers, and more
          indoor plans once terraces stop feeling spontaneous (
          <a
            href="https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/?tag=student-tips"
            target="_blank"
            rel="noreferrer"
          >
            University of Twente student stories
          </a>
          ).
        </p>

        <p>
          That seasonal shift is where housemate culture gets tested. Summer bonding happens on bikes and doorsteps.
          Late autumn bonding happens in the living room - board games, shared cooking, the quiet agreement that
          someone puts the kettle on when the rain starts again. Houses that only socialise outdoors often discover,
          around mid-terms, that they never built an indoor script. The same pattern shows up in{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">exam-week house rules</Link>: stress compresses
          routines, and unspoken norms become loud.
        </p>

        <h3>Do&apos;s and don&apos;ts for bike-shaped houses</h3>

        <ul>
          <li>
            <strong>Do</strong> agree where wet bikes, dripping coats, and muddy shoes land. Hallway chaos is not a
            personality flaw; it is missing storage rules.
          </li>
          <li>
            <strong>Do</strong> treat lights and locks as shared risk. One dark bike on a shared rack can become
            everyone&apos;s insurance headache.
          </li>
          <li>
            <strong>Do</strong> plan one low-effort indoor ritual for grey weeks: a rotating cook night, a Sunday
            grocery loop, a phone-free living-room hour.
          </li>
          <li>
            <strong>Don&apos;t</strong> assume everyone grew up with shark teeth markings and right-of-way instincts.
            Radboud student reporting on research by Wies Biekens notes that internationals often build a mental map
            of the city by bike - but early rides feel intense, and belonging does not automatically create Dutch
            friendships (
            <a
              href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
              target="_blank"
              rel="noreferrer"
            >
              ANS, 2026
            </a>
            ).
          </li>
          <li>
            <strong>Don&apos;t</strong> use the group chat only for blame after someone blocks the stairwell. Write
            the boring rule first - the same habit that makes{' '}
            <Link href="/blog/group-chats-ground-rules">group chat ground rules</Link> work.
          </li>
        </ul>

        <h2>Belonging on two wheels - and its limits</h2>

        <p>
          Biekens&apos; interviews with sixteen international students in Amsterdam and Nijmegen describe cycling as
          physical fitness, social flexibility, and a cultural shortcut: on a bike you blend into traffic even when
          your Dutch is still thin. Interviewees joked that every extra outing made the bike feel cheaper because the
          purchase was already sunk (
          <a
            href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            ANS summary of Biekens, 2026
          </a>
          ). That is a powerful wellbeing story - and an incomplete integration story. Cycling with other
          internationals can raise belonging without closing the contact gap with Dutch peers, a theme that also
          appears in{' '}
          <Link href="/blog/international-students-dutch-housemates-language">
            language gaps with Dutch housemates
          </Link>
          .
        </p>

        <p>
          For mixed houses, the practical translation is modest. Offer a bike buddy for the first rainy commute. Share
          the repair shop location the way you share the Wi-Fi password. Do not confuse &quot;they bought a bike&quot;
          with &quot;they feel at home at dinner.&quot; The{' '}
          <Link href="/universities">university and programme directory</Link> situates students in institutional
          context; the{' '}
          <Link href="/about">about page</Link> explains how Domu Match thinks about student living systems without
          turning every cultural habit into a product pitch. Rent and deposit maths still matter for the household
          budget - the{' '}
          <Link href="/rent-calculator">rent calculator</Link> is one neutral place to keep those numbers honest -
          but the bike is often the first shared culture test after the contract.
        </p>

        <h2>A simple autumn house checklist</h2>

        <p>Use this as a ten-minute house meeting agenda, not a manifesto:</p>

        <ul>
          <li>Where do wet bikes and dripping gear go after 18:00?</li>
          <li>Who owns spare lights, and what is the replace-or-borrow rule?</li>
          <li>Which evening each week is the default indoor hang - optional, not mandatory?</li>
          <li>How do we invite the newest housemate on a grocery ride without making it a test?</li>
          <li>What is the quiet-hour plan when mid-terms and rain both arrive in the same week?</li>
        </ul>

        <p>
          Dutch student culture romanticises the fiets for good reason: it is freedom, thrift, and a daily civic
          rehearsal. Shared houses feel the downside when logistics are invisible until they fail. As days shorten,
          the houses that stay warm are not the ones with the nicest bikes - they are the ones that turn outdoor
          rhythm into indoor agreements before resentment does the scheduling.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          CBS. (2023/2024 visualisation). Hoeveel fietsen inwoners van Nederland?{' '}
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Klaassen, J. / ANS. (2026). Wies Biekens on cycling and belonging among international students.{' '}
          <a
            href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Univers. (2026). Campus bike workshop as meeting place (Tilburg University).{' '}
          <a
            href="https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          University of Twente. Zo overleef je de herfst als student.{' '}
          <a
            href="https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/?tag=student-tips"
            target="_blank"
            rel="noreferrer"
          >
            https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Hoe fietscultuur Nederlandse studentenhuizen vormt',
    excerpt:
      'CBS-fietscijfers en campusonderzoek laten zien waarom de fiets het ritme van studentenhuizen zet - vooral als de herfst het leven naar binnen trekt.',
    publishDate: '2026-10-07',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Groepschats en huisafspraken',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe huizen korte normen opschrijven zonder elk verzoek tot een middernachtelijke app-oorlog te maken.',
      },
      {
        title: 'Tentamenweek-huisregels',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Tijdelijke stilte-, keuken- en bezoeknormen wanneer de tentamenweek elke routine comprimeert.',
      },
      {
        title: 'Taalkloven met Nederlandse huisgenoten',
        href: '/blog/international-students-dutch-housemates-language',
        description:
          'Hoe keuken-Nederlands en onuitgesproken contactnormen gemengde studentenhuizen kleuren.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In Nederland draait een studentenhuis niet alleen op het huurcontract. Het draait op banden, lampjes en
          de onuitgesproken regel dat iedereen toch naar de campus, de Albert Heijn en het late college komt zonder
          dat de gang een fietsendepot wordt. In 2023 was de fiets goed voor{' '}
          <strong>27%</strong> van alle verplaatsingen van inwoners van 6 jaar of ouder - na de auto de meest
          gebruikte vervoerwijze - en fietste iemand gemiddeld ongeveer <strong>2,9 kilometer</strong> per dag (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, Hoeveel fietsen inwoners van Nederland?
          </a>
          ). Voor studentenhuizen is dat geen trivia. Het is het besturingssysteem van alledaags samenleven.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Fietsen geparkeerd langs een grachtkade in een Nederlandse stad onder een grijze lucht"
          />
          <figcaption>
            Nederlandse studentencultuur beweegt op twee wielen. Gedeelde huizen voelen dat ritme vóór iemand de
            groepschat opent.
          </figcaption>
        </figure>

        <h2>Waarom de fiets huisgenoten-infrastructuur is</h2>

        <p>
          Vraag een Nederlandse student wat &quot;te laat&quot; betekent en je hoort vaak een fietsverhaal: een
          lekke band, gestolen lampjes, een ketting die pas faalt als het scheef regent. CBS-cijfers over 2023 laten
          zien dat 18- tot 25-jarigen nog steeds ongeveer <strong>2,6 kilometer</strong> per dag fietsen, terwijl
          winkelen, uitgaan, sport en hobby samen meer dan vier op de tien fietsverplaatsingen vormen (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2023
          </a>
          ). Precies die ritten binden een huishouden: boodschappen, verenigingsavonden, de supermarket-run die
          niemand alleen wilde doen.
        </p>

        <p>
          Campusleven weerspiegelt het patroon. Bij Tilburg University ontvangt de campusfietsenwinkel zo&apos;n{' '}
          <strong>vijftig</strong> bezoekers per dag, met een seizoenspiek van lekke banden in de herfst - een klein
          maar treffend signaal dat studentenmobiliteit onderhoud vraagt, niet optioneel is (
          <a
            href="https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            Univers, 2026
          </a>
          ). Als de fiets van één huisgenoot stilvalt, kan het hele dinerplan vastlopen. Compatibiliteit gaat niet
          alleen over afwas; het gaat over of jullie logistiek bij elkaar past.
        </p>

        <h2>Herfst: wanneer buiten-cultuur naar binnen schuift</h2>

        <p>
          Oktober is de scharniermaand. CBS-maandcijfers laten een dagelijkse fietsafstand van ongeveer{' '}
          <strong>3,0 km</strong> in oktober zien, daarna dalend naar ruwweg <strong>2,4 km</strong> in november en{' '}
          <strong>1,9 km</strong> in december (
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2023
          </a>
          ). Universitaire studententips bevestigen de praktijk: laagjes, lampjes, regenbroek, en meer indoor-plannen
          zodra terrassen minder spontaan voelen (
          <a
            href="https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/?tag=student-tips"
            target="_blank"
            rel="noreferrer"
          >
            Universiteit Twente student stories
          </a>
          ).
        </p>

        <p>
          In die seizoensverschuiving wordt huisgenootcultuur getest. Zomerbinding gebeurt op fietsen en stoepen.
          Late-herfstbinding gebeurt in de woonkamer - bordspellen, samen koken, de stille afspraak dat iemand water
          kookt als het weer begint te regenen. Huizen die alleen buiten socialiseren ontdekken rond de midterms dat
          ze nooit een indoor-script hebben gebouwd. Hetzelfde patroon zie je bij{' '}
          <Link href="/blog/exam-week-house-rules-netherlands">tentamenweek-huisregels</Link>: stress comprimeert
          routines, en onuitgesproken normen worden luid.
        </p>

        <h3>Do&apos;s en don&apos;ts voor fietsvormige huizen</h3>

        <ul>
          <li>
            <strong>Do</strong> afspreken waar natte fietsen, druipende jassen en modderige schoenen landen.
            Gangchaos is geen karaktereigenschap; het is een ontbrekende opslagafspraak.
          </li>
          <li>
            <strong>Do</strong> lampjes en sloten als gedeeld risico behandelen. Eén donkere fiets in een gedeelde
            stalling kan ieders verzekeringskopzorg worden.
          </li>
          <li>
            <strong>Do</strong> één low-effort indoor ritueel plannen voor grijze weken: een roulerende kookavond,
            een zondagse boodschappenloop, een telefoonvrij woonkameruur.
          </li>
          <li>
            <strong>Don&apos;t</strong> aannemen dat iedereen is opgegroeid met haaientanden en
            voorrangsinstincten. ANS-verslaglegging over onderzoek van Wies Biekens laat zien dat internationals
            vaak via de fiets een mental map van de stad bouwen - maar vroege ritten voelen intens, en thuisgevoel
            levert niet automatisch Nederlandse vriendschappen op (
            <a
              href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
              target="_blank"
              rel="noreferrer"
            >
              ANS, 2026
            </a>
            ).
          </li>
          <li>
            <strong>Don&apos;t</strong> de groepschat alleen gebruiken om te blamen nadat iemand het trappenhuis
            blokkeert. Schrijf eerst de saaie regel - dezelfde gewoonte die{' '}
            <Link href="/blog/group-chats-ground-rules">groepschat-huisafspraken</Link> laten werken.
          </li>
        </ul>

        <h2>Thuisgevoel op twee wielen - en de grenzen daarvan</h2>

        <p>
          Biekens&apos; interviews met zestien internationale studenten in Amsterdam en Nijmegen beschrijven fietsen
          als fysieke fitheid, sociale flexibiliteit en een culturele shortcut: op de fiets meng je je in het verkeer
          ook als je Nederlands nog dun is. Geïnterviewden grapten dat elke extra uitstapje de fiets goedkoper liet
          voelen omdat de aanschaf al was gedaan (
          <a
            href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            ANS-samenvatting van Biekens, 2026
          </a>
          ). Dat is een krachtig welzijnsverhaal - en een onvolledig integratieverhaal. Fietsen met andere
          internationals kan thuisgevoel verhogen zonder de contactkloof met Nederlandse peers te dichten, een thema
          dat ook terugkomt in{' '}
          <Link href="/blog/international-students-dutch-housemates-language">
            taalkloven met Nederlandse huisgenoten
          </Link>
          .
        </p>

        <p>
          Voor gemengde huizen is de praktische vertaling bescheiden. Bied een fietsbuddy aan voor de eerste natte
          forens. Deel de reparatielocatie zoals je het wifi-wachtwoord deelt. Verwar &quot;ze hebben een fiets
          gekocht&quot; niet met &quot;ze voelen zich thuis aan tafel.&quot; De{' '}
          <Link href="/universities">universiteiten- en programma-directory</Link> plaatst studenten in
          institutionele context; de{' '}
          <Link href="/about">over-pagina</Link> legt uit hoe Domu Match over studentensystemen denkt zonder elke
          culturele gewoonte tot productpitch te maken. Huur- en borgsom-rekenwerk blijft relevant voor het
          huishoudbudget - de{' '}
          <Link href="/rent-calculator">huurcalculator</Link> is één neutrale plek om die cijfers eerlijk te houden
          - maar de fiets is vaak de eerste gedeelde cultuurtest na het contract.
        </p>

        <h2>Een eenvoudige herfst-huischecklist</h2>

        <p>Gebruik dit als agenda voor een huisvergadering van tien minuten, niet als manifest:</p>

        <ul>
          <li>Waar gaan natte fietsen en druipende spullen na 18:00 heen?</li>
          <li>Wie heeft reservelampjes, en wat is de leen-of-vervang-regel?</li>
          <li>Welke avond is de default indoor hang - optioneel, niet verplicht?</li>
          <li>Hoe nodigen we de nieuwste huisgenoot uit voor een boodschappenrit zonder dat het een test wordt?</li>
          <li>Wat is het stilteplan wanneer midterms en regen in dezelfde week aankomen?</li>
        </ul>

        <p>
          Nederlandse studentencultuur romantiseert de fiets met reden: vrijheid, zuinigheid en een dagelijkse
          civiele oefening. Gedeelde huizen voelen de keerzijde wanneer logistiek onzichtbaar blijft tot het faalt.
          Als de dagen korter worden, blijven niet de huizen met de mooiste fietsen warm - maar de huizen die
          buitenritme omzetten in indoor-afspraken vóór wrok de planning overneemt.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          CBS. (2023/2024 visualisatie). Hoeveel fietsen inwoners van Nederland?{' '}
          <a
            href="https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/visualisaties/verkeer-en-vervoer/personen/fietsen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Klaassen, J. / ANS. (2026). Wies Biekens over fietsen en thuisgevoel bij internationale studenten.{' '}
          <a
            href="https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            https://ans-online.nl/artikelen/wies-biekens-21-ontdekte-dat-internationale-studenten-zich-meer-thuis-voelen-in-nederland-wanneer-ze-fietsen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Univers. (2026). Campusfietsenwinkel als ontmoetingsplaats (Tilburg University).{' '}
          <a
            href="https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/"
            target="_blank"
            rel="noreferrer"
          >
            https://universonline.nl/nieuws/2026/01/13/de-fietsenwinkel-op-de-campus-als-ontmoetingsplaats-als-het-moet-leren-we-je-zelfs-fietsen/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Universiteit Twente. Zo overleef je de herfst als student.{' '}
          <a
            href="https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/?tag=student-tips"
            target="_blank"
            rel="noreferrer"
          >
            https://www.utwente.nl/stories/student/647126/zo-overleef-je-de-herfst-als-student/
          </a>
        </p>
      </div>
    ),
  },
}

export function DutchStudentBikeCultureHousematesArticle() {
  const { locale } = useApp()
  const article = content[locale]

  return (
    <BlogPostLayout
      title={article.title}
      excerpt={article.excerpt}
      publishDate={article.publishDate}
      readTime={article.readTime}
      relatedLinks={article.relatedLinks}
      ctaTitle={article.ctaTitle}
      ctaDescription={article.ctaDescription}
      ctaHref={article.ctaHref}
      ctaText={article.ctaText}
    >
      {article.body()}
    </BlogPostLayout>
  )
}
