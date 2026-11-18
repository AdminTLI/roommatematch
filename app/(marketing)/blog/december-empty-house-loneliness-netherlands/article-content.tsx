'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

/** Selected via selectHeroImageKey({ category: 'Wellbeing', secondaryCategory: 'Lifestyle' }); last-4 avoided sharedKitchen/cityBikeStudent/internationalCampus. */
const heroImageKey = 'quietRoommate' as const

const content = {
  en: {
    title: 'December Stay-Behind Loneliness for Students',
    excerpt:
      'After exams, Dutch student houses empty as people leave for Christmas. A practical guide for internationals and locals who stay behind and feel the quiet.',
    publishDate: '2026-11-18',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Housemate Support When Living Away From Home',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'How everyday emotional support works between housemates when family is not next door.',
      },
      {
        title: 'Autumn Huisavond: Indoor Bonding',
        href: '/blog/autumn-huisavond-indoor-bonding-netherlands',
        description:
          'Low-pressure rituals that keep shared houses connected when daylight shrinks - useful before the December empty-out.',
      },
      {
        title: 'Exam Week House Rules',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Temporary quiet and kitchen norms when tentamenweek compresses the calendar.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          December in a Dutch studentenhuis has two acts. Act one is isolation by study: doors closed, library
          headphones on, kitchen conversations reduced to &quot;is the dishwasher free?&quot; Act two is isolation by
          departure: suitcases, last-minute oven pizza, then a hallway that stops smelling like other people&apos;s
          shampoo. The quiet after exams is not rest for everyone. For stay-behinds - internationals who cannot fly,
          Dutch students with herexamens or work, anyone whose home is expensive to reach - the empty house is the
          real exam.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Student sitting alone in a quiet shared bedroom with a desk lamp on during a dark December evening"
            priority
          />
          <figcaption>
            The lonely stretch is rarely the exam itself. It is the week after, when the house still has your name on
            the lease and nobody else&apos;s footsteps.
          </figcaption>
        </figure>

        <h2>Why December hits the stay-behind harder</h2>

        <p>
          Campus reporting keeps rediscovering the same pattern: many people leave because December was academically
          heavy and family rituals pull hard; that exit thins the social net for whoever remains. A Delft Delta feature
          on international Christmas plans quotes a student organiser saying the irony is sharp - advising people to go
          home also leaves less company for those who must stay (
          <a
            href="https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont"
            target="_blank"
            rel="noreferrer"
          >
            Delta / TU Delft, December 2025
          </a>
          ). Tickets, distance, visas, and money decide the split more than vibes.
        </p>

        <p>
          National wellbeing data already show loneliness is not a niche mood. In the MMMS-2025 monitor,{' '}
          <strong>60%</strong> of participating HBO and university students reported loneliness feelings, even as some
          other mental-health indicators improved slightly since 2021 (
          <a
            href="https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten"
            target="_blank"
            rel="noreferrer"
          >
            Delta summary of MMMS-2025 / Trimbos-RIVM
          </a>
          ). Among international respondents in that wave, fatigue and loneliness showed up more often than in 2023 -
          while stress eased for some. Layer Christmas advertising, dark afternoons, and a suddenly empty woonkamer on
          top of that baseline, and &quot;I am fine studying alone&quot; can flip into &quot;the building forgot I live
          here.&quot;
        </p>

        <h2>Dutch cheat-sheet for the empty-house weeks</h2>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-900">Dutch term</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Practical meaning in December</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Kerstvakantie</td>
                <td className="px-4 py-3 text-slate-700">
                  Roughly mid/late December into early January; campus social life collapses even if your lease does
                  not.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Herexamen</td>
                <td className="px-4 py-3 text-slate-700">
                  Resit. Often the reason Dutch students stay while housemates vanish to family dinners.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Winter Weeks / Winter University</td>
                <td className="px-4 py-3 text-slate-700">
                  Free or low-cost campus programmes for students who stay - Leiden runs Winter Weeks 21 Dec 2026 to
                  2 Jan 2027.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Buddyprogramma</td>
                <td className="px-4 py-3 text-slate-700">
                  Matched local/international pairs for holiday contact, meals, or game nights - used by several
                  universities.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Gezelligheid</td>
                <td className="px-4 py-3 text-slate-700">
                  Cosy social warmth. In an empty house it must be scheduled, not assumed.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Uitwonend</td>
                <td className="px-4 py-3 text-slate-700">
                  Living away from parents. The Christmas contrast with thuiswonend peers can sting harder.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Studentenreisproduct</td>
                <td className="px-4 py-3 text-slate-700">
                  Student OV right. Week vs weekend rules flip on feestdagen - useful if you visit a stay-behind friend
                  in another city.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Three loneliness traps after the last exam</h2>

        <h3>1. Solo-study isolation that never reopens</h3>

        <p>
          During tentamenweek, retreating to your room is rational. The trap is keeping that door-closed habit when the
          exam is over and three housemates have already left. Shared-living research and house-practice guides keep
          repeating the same fix: name the quiet periods out loud before they start, then schedule one low-pressure
          reopen - a shared breakfast, a walk, a film - so solitude does not become the default operating system. If
          your house already struggles with emotional-support boundaries, revisit{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            housemate support when living away from home
          </Link>{' '}
          before December turns every worry into a late-night monologue.
        </p>

        <h3>2. The departure cascade</h3>

        <p>
          Once two people book trains home, the remaining group often feels &quot;too small for gezelligheid,&quot; so
          they also leave or hide. Delta&apos;s Christmas reporting captures that cascade for internationals: most leave
          if they can; those who cannot inherit a quieter city. Dutch stay-behinds get the same cascade when family
          pressure or cheaper travel home wins. Treat &quot;who stays which nights&quot; as logistics, not a popularity
          contest.
        </p>

        <h3>3. Comparing your kitchen to their Instagram</h3>

        <p>
          Family dinners, airport selfies, and Sinterklaas lootjes from houses that emptied on the 20th will hit your
          feed while you reheat leftovers. Universities now build counter-rituals on purpose: Leiden&apos;s Winter Weeks
          (21 December 2026 to 2 January 2027) invite internationals and Dutch students who remain into free meetups
          across Leiden and The Hague (
          <a
            href="https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks"
            target="_blank"
            rel="noreferrer"
          >
            Leiden University Winter Weeks 2026
          </a>
          ). Fontys and TU/e have run Winter University weeks with dinners, games, and &quot;bring a friend&quot; slots
          for the same reason - connection beats heroic solitude (
          <a
            href="https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/"
            target="_blank"
            rel="noreferrer"
          >
            Fontys Bron on Winter University
          </a>
          ). Check your own{' '}
          <Link href="/universities">university page</Link> early; these programmes fill after exams, not before.
        </p>

        <h2>Screenshot checklist: plan the empty house before people leave</h2>

        <ol className="list-decimal space-y-2 pl-5 text-slate-700">
          <li>
            <strong>Map the roster.</strong> In the huisgroepchat, list leave dates, return dates, and who stays which
            nights. Do this the week exams end - not on the platform.
          </li>
          <li>
            <strong>Name the stay-behind cluster.</strong> Even two people count. Agree one shared meal or walk every
            two or three days.
          </li>
          <li>
            <strong>Protect the commons.</strong> Who owns hallway lights, bin day, and thermostat while others are
            gone? Write it once.
          </li>
          <li>
            <strong>Book one external anchor.</strong> Winter Weeks, ESN event, buddy dinner, sport hall, or a friend in
            another city via studentenreisproduct.
          </li>
          <li>
            <strong>Set a study reopen rule.</strong> After your last exam, schedule a living-room evening within 48
            hours so the door-closed habit does not auto-extend.
          </li>
          <li>
            <strong>Decide guest policy for leavers&apos; friends.</strong> Empty rooms invite &quot;can my cousin
            crash?&quot; chaos. Confirm overnight rules before people depart.
          </li>
          <li>
            <strong>Pick a help line in advance.</strong> Student dean, huisarts/POH-GGZ path, or campus wellbeing chat
            - saved before you need it at 01:00 on Boxing Day.
          </li>
        </ol>

        <h2>Copy-paste WhatsApp scripts</h2>

        <p>
          <strong>For the whole house (send before the first suitcase leaves):</strong>
        </p>

        <blockquote className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700">
          Quick December logistics: can everyone drop (1) leave date, (2) return date, and (3) whether you stay any of
          the Christmas week nights? Stay-behinds - want a shared dinner on [date] so the house does not go fully silent?
          No pressure to be festive. Just planning so nobody discovers an empty fridge and an empty chat at once.
        </blockquote>

        <p>
          <strong>For a stay-behind housemate you are worried about:</strong>
        </p>

        <blockquote className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700">
          I am around on [days]. Fancy a cheap kitchen dinner or a walk after your exam - no big plans, just company?
          If you prefer quiet, say so. I would rather ask now than assume you want total radio silence.
        </blockquote>

        <h2>Do&apos;s and don&apos;ts for leavers</h2>

        <p>
          <strong>Do:</strong> tell stay-behinds your real calendar, leave a shared staple (milk, bin bags), and send one
          check-in message mid-break that is not a family-dinner photo dump.
        </p>
        <p>
          <strong>Do:</strong> invite a stay-behind to one concrete thing before you go - Winter Weeks signup link,
          market walk, or a call slot - so &quot;we should hang sometime&quot; becomes a date.
        </p>
        <p>
          <strong>Don&apos;t:</strong> frame staying as failure. Expensive tickets, herexamens, work shifts, and care
          duties are adult reasons, not character flaws.
        </p>
        <p>
          <strong>Don&apos;t:</strong> turn the empty house into an unsupervised party venue for your hometown friends.
          The people who remain still live there.
        </p>

        <h2>What this season asks of houses and campuses</h2>

        <p>
          Loneliness in December is often a design problem: exams reward solitude, travel empties corridors, and festive
          culture assumes a full table. Housemates cannot replace family, and Domu Match is not a therapy substitute -
          but compatibility and explicit calendars still shape whether a shared lease feels like infrastructure or a
          waiting room. The{' '}
          <Link href="/about">about page</Link> frames that living layer neutrally; money stress that keeps people from
          flying home still belongs in tools like the{' '}
          <Link href="/rent-calculator">rent calculator</Link>. The editorial point is simpler: treat the post-exam empty
          house as a planned micro-community for whoever stays, not an accidental silence.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Bakker, K. / Delta. (2025, 16 December). Internationale studenten: Hoe vier je kerst als je familie ver weg
          woont?{' '}
          <a
            href="https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont"
            target="_blank"
            rel="noreferrer"
          >
            https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Delta. Lichte verbetering van welzijn studenten (MMMS-2025 summary).{' '}
          <a
            href="https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten"
            target="_blank"
            rel="noreferrer"
          >
            https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Leiden University. Winter Weeks 2026 (21 December 2026 - 2 January 2027).{' '}
          <a
            href="https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks"
            target="_blank"
            rel="noreferrer"
          >
            https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Fontys Bron. Winter University verbindt internationale studenten.{' '}
          <a
            href="https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/"
            target="_blank"
            rel="noreferrer"
          >
            https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          University of Twente. Loneliness during the winter holidays.{' '}
          <a
            href="https://www.utwente.nl/en/stories/student/42418/loneliness-during-the-winter-holidays/?tag=internationals&tag=well-being"
            target="_blank"
            rel="noreferrer"
          >
            https://www.utwente.nl/en/stories/student/42418/loneliness-during-the-winter-holidays/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'December-thuisblijvers: eenzaamheid in het lege huis',
    excerpt:
      'Na de tentamens leegt het studentenhuis omdat iedereen naar huis gaat met kerst. Praktische gids voor internationals en Nederlanders die blijven en de stilte voelen.',
    publishDate: '2026-11-18',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Steun van huisgenoten als je uitwonend bent',
        href: '/blog/housemate-support-living-away-from-home',
        description:
          'Hoe alledaagse emotionele steun tussen huisgenoten werkt als familie niet naast de deur woont.',
      },
      {
        title: 'Herfst-huisavond: indoor bonding',
        href: '/blog/autumn-huisavond-indoor-bonding-netherlands',
        description:
          'Lage-druk rituelen die gedeelde huizen verbinden als het daglicht krimpt - nuttig vóór de december-exodus.',
      },
      {
        title: 'Tentamenweek-huisregels',
        href: '/blog/exam-week-house-rules-netherlands',
        description:
          'Tijdelijke stilte- en keukennormen wanneer tentamenweek de kalender comprimeert.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          December in een Nederlands studentenhuis heeft twee bedrijven. Bedrijf één is isolatie door studie: deuren
          dicht, bibliotheekkoptelefoon op, keukengesprekken gereduceerd tot &quot;is de vaatwasser vrij?&quot; Bedrijf
          twee is isolatie door vertrek: koffers, last-minute ovenpizza, en dan een gang die niet meer ruikt naar andermans
          shampoo. De stilte na de tentamens is niet voor iedereen rust. Voor thuisblijvers - internationals die niet
          kunnen vliegen, Nederlandse studenten met herexamens of werk, iedereen voor wie thuis duur is om te bereiken -
          is het lege huis het echte tentamen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey={heroImageKey}
            alt="Student alleen in een stille studentenkamer met bureaulamp op een donkere decemberavond"
            priority
          />
          <figcaption>
            Het eenzame stuk is zelden het tentamen zelf. Het is de week erna, wanneer jouw naam nog op het contract
            staat en niemand anders meer voetstappen maakt.
          </figcaption>
        </figure>

        <h2>Waarom december de thuisblijver harder raakt</h2>

        <p>
          Campusjournalistiek blijft hetzelfde patroon vinden: veel mensen vertrekken omdat december academisch zwaar
          was en familierituelen hard trekken; dat vertrek dunt het sociale net voor wie blijft. Een Delta-stuk over
          internationale kerstplannen citeert een studentorganisator die de ironie scherp zet - mensen adviseren om naar
          huis te gaan laat ook minder gezelschap over voor wie moet blijven (
          <a
            href="https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont"
            target="_blank"
            rel="noreferrer"
          >
            Delta / TU Delft, december 2025
          </a>
          ). Tickets, afstand, visa en geld bepalen de splijting meer dan sfeer.
        </p>

        <p>
          Landelijke welzijnscijfers laten al zien dat eenzaamheid geen niche-mood is. In de MMMS-2025-monitor meldde{' '}
          <strong>60%</strong> van de deelnemende hbo- en wo-studenten eenzaamheidsgevoelens, ook al verbeterden sommige
          andere mentale indicatoren licht sinds 2021 (
          <a
            href="https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten"
            target="_blank"
            rel="noreferrer"
          >
            Delta-samenvatting MMMS-2025 / Trimbos-RIVM
          </a>
          ). Bij internationale respondenten in die golf kwamen levensmoeheid en eenzaamheid vaker voor dan in 2023 -
          terwijl stress voor sommigen afnam. Leg kerstreclame, donkere middagen en een plots lege woonkamer op die
          baseline, en &quot;ik studeer prima alleen&quot; kan omslaan in &quot;het pand is mij vergeten.&quot;
        </p>

        <h2>Nederlandse cheat-sheet voor de lege-huisweken</h2>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-900">Nederlandse term</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Praktische betekenis in december</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Kerstvakantie</td>
                <td className="px-4 py-3 text-slate-700">
                  Grofweg half/eind december tot begin januari; campusleven valt stil terwijl jouw huur doorloopt.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Herexamen</td>
                <td className="px-4 py-3 text-slate-700">
                  Hertentamen. Vaak de reden dat Nederlandse studenten blijven terwijl huisgenoten naar
                  familiediners verdwijnen.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Winter Weeks / Winter University</td>
                <td className="px-4 py-3 text-slate-700">
                  Gratis of goedkope campusprogramma&apos;s voor wie blijft - Leiden Winter Weeks loopt 21 dec 2026 tot
                  2 jan 2027.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Buddyprogramma</td>
                <td className="px-4 py-3 text-slate-700">
                  Gekoppelde lokale/internationale duo&apos;s voor vakantiecontact, eten of spelletjesavonden.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Gezelligheid</td>
                <td className="px-4 py-3 text-slate-700">
                  Cosy sociale warmte. In een leeg huis moet je die plannen, niet aannemen.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Uitwonend</td>
                <td className="px-4 py-3 text-slate-700">
                  Wonen zonder ouders. Het kerstcontrast met thuiswonende peers kan harder aankomen.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Studentenreisproduct</td>
                <td className="px-4 py-3 text-slate-700">
                  Studenten-OV. Week- vs weekendregels kantelen op feestdagen - handig voor een bezoek aan een
                  thuisblijvende vriend in een andere stad.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Drie eenzaamheidsvallen na het laatste tentamen</h2>

        <h3>1. Solo-studie-isolatie die nooit heropent</h3>

        <p>
          In tentamenweek is terugtrekken op je kamer rationeel. De valkuil is die dichte-deur-gewoonte aanhouden als
          het tentamen voorbij is en drie huisgenoten al weg zijn. Gedeeld-wonenpraktijk herhaalt dezelfde fix: benoem
          stille periodes hardop vóór ze beginnen, en plan daarna één low-pressure heropening - ontbijt, wandeling, film
          - zodat solitude niet het standaardbesturingssysteem wordt. Als jullie huis al worstelt met
          emotionele-steungrenzen, herlees{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            steun van huisgenoten als je uitwonend bent
          </Link>{' '}
          voordat december elke piekeravond tot een monoloog maakt.
        </p>

        <h3>2. De vertrekcascade</h3>

        <p>
          Zodra twee mensen treinen naar huis boeken, voelt de restgroep vaak &quot;te klein voor gezelligheid,&quot;
          dus vertrekken of verstoppen zij ook. Delta&apos;s kerstberichtgeving vangt die cascade voor internationals:
          de meesten gaan als het kan; wie niet kan erft een stillere stad. Nederlandse thuisblijvers krijgen dezelfde
          cascade als familiedruk of goedkoper thuisreizen wint. Behandel &quot;wie blijft welke nachten&quot; als
          logistiek, niet als populariteitswedstrijd.
        </p>

        <h3>3. Jouw keuken vergelijken met hun Instagram</h3>

        <p>
          Familiediners, luchthavenselfies en Sinterklaaslootjes uit huizen die op de 20e leegliepen raken je feed terwijl
          jij restjes opwarmt. Universiteiten bouwen daarom bewust tegengif: Leiden&apos;s Winter Weeks (21 december 2026
          tot 2 januari 2027) nodigen internationals én Nederlandse studenten die blijven uit voor gratis meetups in
          Leiden en Den Haag (
          <a
            href="https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks"
            target="_blank"
            rel="noreferrer"
          >
            Leiden University Winter Weeks 2026
          </a>
          ). Fontys en TU/e draaiden Winter University-weken met diners, games en &quot;bring a friend&quot;-plekken om
          dezelfde reden - verbinding wint van heldhaftige solitude (
          <a
            href="https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/"
            target="_blank"
            rel="noreferrer"
          >
            Fontys Bron over Winter University
          </a>
          ). Check vroeg je eigen{' '}
          <Link href="/universities">universiteitspagina</Link>; die programma&apos;s vullen ná tentamens, niet ervoor.
        </p>

        <h2>Screenshot-checklist: plan het lege huis vóór iedereen vertrekt</h2>

        <ol className="list-decimal space-y-2 pl-5 text-slate-700">
          <li>
            <strong>Maak de roostertabel.</strong> In de huisgroepchat: vertrekdatum, terugkomstdatum, en wie welke
            kerstnachten blijft. Doe dit in de week dat tentamens eindigen - niet op het perron.
          </li>
          <li>
            <strong>Benoem de thuisblijf-cluster.</strong> Zelfs twee mensen tellen. Spreek één gedeelde maaltijd of
            wandeling per twee à drie dagen af.
          </li>
          <li>
            <strong>Bescherm de commons.</strong> Wie doet ganglicht, klikodag en thermostaat terwijl anderen weg zijn?
            Schrijf het één keer op.
          </li>
          <li>
            <strong>Boek één extern anker.</strong> Winter Weeks, ESN, buddy-diner, sportzaal, of een vriend in een
            andere stad via het studentenreisproduct.
          </li>
          <li>
            <strong>Zet een heropenregel.</strong> Na je laatste tentamen: binnen 48 uur een woonkameravond, zodat de
            dichte-deur-modus niet automatisch doorloopt.
          </li>
          <li>
            <strong>Regel logees van vertrekkers.</strong> Lege kamers nodigen uit tot &quot;mag mijn neef crashen?&quot;
            Bevestig overnachtingsregels vóór mensen vertrekken.
          </li>
          <li>
            <strong>Kies vooraf een hulplijn.</strong> Studentendecaan, huisarts/POH-GGZ of campus-welzijnschat - bewaard
            vóór je het om 01:00 op tweede kerstdag nodig hebt.
          </li>
        </ol>

        <h2>Copy-paste WhatsApp-scripts</h2>

        <p>
          <strong>Voor het hele huis (stuur vóór de eerste koffer weggaat):</strong>
        </p>

        <blockquote className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700">
          Korte december-logistiek: kan iedereen (1) vertrekdatum, (2) terugkomstdatum en (3) of je kerstnachten blijft
          droppen? Thuisblijvers - zin in een gedeeld diner op [datum] zodat het huis niet volledig stilvalt? Geen druk
          om feestelijk te doen. Alleen plannen zodat niemand tegelijk een lege koelkast én een lege chat ontdekt.
        </blockquote>

        <p>
          <strong>Voor een thuisblijvende huisgenoot om wie je je zorgen maakt:</strong>
        </p>

        <blockquote className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700">
          Ik ben er op [dagen]. Zin in een goedkoop keukendiner of een wandeling na je tentamen - geen groot plan, alleen
          gezelschap? Liever stilte, zeg het. Ik vraag het liever nu dan dat ik totale radio silence aanneem.
        </blockquote>

        <h2>Do&apos;s en don&apos;ts voor vertrekkers</h2>

        <p>
          <strong>Do:</strong> geef thuisblijvers je echte kalender, laat een gedeeld basisproduct achter (melk,
          vuilniszakken) en stuur halverwege de vakantie één check-in die geen familiediner-fotodump is.
        </p>
        <p>
          <strong>Do:</strong> nodig een thuisblijver vóór je gaat uit voor één concreet ding - Winter Weeks-link,
          marktwandeling of belmoment - zodat &quot;we moeten iets doen&quot; een datum wordt.
        </p>
        <p>
          <strong>Don&apos;t:</strong> framen van blijven als falen. Dure tickets, herexamens, diensten en zorgtaken zijn
          volwassen redenen, geen karakterfout.
        </p>
        <p>
          <strong>Don&apos;t:</strong> maak van het lege huis een feestzaal voor je thuisvrienden. De mensen die blijven
          wonen er nog.
        </p>

        <h2>Wat dit seizoen vraagt van huizen en campussen</h2>

        <p>
          Eenzaamheid in december is vaak een ontwerpprobleem: tentamens belonen solitude, reizen leegt gangen, en
          feestcultuur gaat uit van een volle tafel. Huisgenoten vervangen geen familie, en Domu Match is geen
          therapievervanger - maar compatibiliteit en expliciete kalenders bepalen nog steeds of een gedeeld contract als
          infrastructuur voelt of als wachtkamer. De{' '}
          <Link href="/about">about-pagina</Link> kaderst die woonlaag neutraal; geldstress die mensen thuis houdt hoort
          ook in tools als de{' '}
          <Link href="/rent-calculator">huurcalculator</Link>. Het redactionele punt is eenvoudiger: behandel het lege huis
          na tentamens als een geplande micro-community voor wie blijft, niet als per ongeluk stilte.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Bakker, K. / Delta. (2025, 16 december). Internationale studenten: Hoe vier je kerst als je familie ver weg
          woont?{' '}
          <a
            href="https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont"
            target="_blank"
            rel="noreferrer"
          >
            https://delta.tudelft.nl/article/internationale-studenten-hoe-vier-je-kerst-als-je-familie-ver-weg-woont
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Delta. Lichte verbetering van welzijn studenten (MMMS-2025-samenvatting).{' '}
          <a
            href="https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten"
            target="_blank"
            rel="noreferrer"
          >
            https://delta.tudelft.nl/article/lichte-verbetering-van-welzijn-studenten
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Leiden University. Winter Weeks 2026 (21 december 2026 - 2 januari 2027).{' '}
          <a
            href="https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks"
            target="_blank"
            rel="noreferrer"
          >
            https://www.student.universiteitleiden.nl/en/events/2026/12/leiden-universitys-winter-weeks
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Fontys Bron. Winter University verbindt internationale studenten.{' '}
          <a
            href="https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/"
            target="_blank"
            rel="noreferrer"
          >
            https://bron.fontys.nl/winter-university-verbindt-internationale-studenten/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          University of Twente. Loneliness during the winter holidays.{' '}
          <a
            href="https://www.utwente.nl/en/stories/student/42418/loneliness-during-the-winter-holidays/?tag=internationals&tag=well-being"
            target="_blank"
            rel="noreferrer"
          >
            https://www.utwente.nl/en/stories/student/42418/loneliness-during-the-winter-holidays/
          </a>
        </p>
      </div>
    ),
  },
}

export function DecemberEmptyHouseLonelinessNetherlandsArticle() {
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
