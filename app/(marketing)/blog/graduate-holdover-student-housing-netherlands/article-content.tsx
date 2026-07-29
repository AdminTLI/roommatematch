'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Graduate Holdover Blocks Dutch Student Room Turnover',
    excerpt:
      'When more than half of graduates still occupy student rooms a year after finishing, the shortage is not only about new builds. Kences and NOS data show a blocked turnover pipeline that affects incoming students and city retention.',
    publishDate: '2026-07-29',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage Is a Retention Line Item',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How Dutch monitoring data links room scarcity to students staying at home and stressed international searches.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Why room access is an integration indicator, not a side file, for international arrivals.',
      },
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Behaviour-based questions for screening routines, boundaries, and shared-living expectations.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates often focus on how many rooms to build next year. That framing misses a
          second bottleneck: rooms that already exist but never turn over. According to the latest Landelijke
          Monitor Studentenhuisvesting, published by Kences and reported by{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS (September 2025)
          </a>
          , <strong>57 percent of graduates still live in their student room one year after completing their degree</strong>.
          They are not squatting. They are stuck between a student contract and a regular rental market that has no
          affordable place for them to go.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Student cycling past residential buildings in a Dutch university city — graduate holdover and room turnover"
          />
          <figcaption>
            When graduates cannot exit student housing, incoming students compete for a smaller pool of rooms than
            headline supply figures suggest.
          </figcaption>
        </figure>

        <h2>Why graduate holdover is a turnover problem, not a lifestyle choice</h2>

        <p>
          The official shortage figure in the 2025-26 monitor stands at roughly 21,000 rooms across twenty student
          cities. Kences notes that the real gap is likely larger, because fewer students even report searching for
          a room when they believe none exists. Graduate holdover adds a hidden layer: every graduate who remains in
          a student unit is one fewer room for a first-year, an international arrival, or a domestic student who
          has been living at home longer than they planned.
        </p>

        <p>
          The mechanism is straightforward. Student housing was designed for temporary occupancy during a degree.
          When graduates cannot move into starter rentals, studios, or shared flats on the open market, they keep
          paying student rents, hold onto scarce inventory, and delay the handover that the system assumes will
          happen each summer. Housing economist Jolan de Bie of Kences told NOS Nieuwsuur that campus contracts,
          which require tenants to leave after graduation, are one policy lever, but they only work if graduates
          have somewhere else to go (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ).
        </p>

        <h2>Fewer students live out, and fewer still believe they can</h2>

        <p>
          The monitor also documents a widening gap between where students live and where they would prefer to live.
          Eight years ago, 52 percent of students lived in a room and 59 percent said they wanted to. In the current
          college year, only 44 percent live out while 49 percent would still choose to. The chart below shows how
          both actual out-of-home living and stated preference have declined in parallel.
        </p>

        <BlogBarChart
          data={[
            { label: 'Lived out (8y ago)', value: 52 },
            { label: 'Wanted out (8y ago)', value: 59 },
            { label: 'Lives out (now)', value: 44 },
            { label: 'Wants out (now)', value: 49 },
          ]}
          yLabel="Share of students"
          valueFormat="percent"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting, reported via NOS, September 2025."
        />

        <p>
          Kences interprets the pattern as students giving up on the search. That is different from a cultural shift
          toward living at home. Separate research from CBS and NIDI shows that among students who graduated in
          2023, 43 percent never moved out during their entire degree, compared with 31 percent of the 2016 cohort (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, February 2026
          </a>
          ). Affordability and scarcity reinforce each other: if you cannot find a room early, you may never leave;
          if you graduate without a foothold in the rental market, you may never release the room you finally secured.
        </p>

        <h3>Supply is shrinking while demand queues lengthen</h3>

        <p>
          Turnover pressure is not abstract in Eindhoven. The municipality, TU/e, Fontys, and major housing
          providers announced plans for 5,400 new student units over eight years after the university reported that
          roughly 500 students had to end their studies early because they could not find housing (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, July 2026
          </a>
          ). Even with that ambition, the national picture shows 17,800 fewer students housed in the private rental
          sector than the previous year, and total room supply in the twenty monitored cities estimated down by
          13,500 to about 322,400, according to the same Kences monitor cited by NOS.
        </p>

        <p>
          Part of the contraction comes from private landlords selling properties. An ABF Research report
          commissioned by the Ministry of Housing and Kences found more than 5,000 student dwellings sold in a
          single year, equivalent to roughly 10,000 rooms (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). New corporate and social-housing builds have not fully replaced that loss. When supply falls and
          graduates stay put, incoming cohorts face a market that looks full on paper but functions as if it were
          smaller.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="internationalCampus"
            alt="International students on a Dutch university campus — housing turnover affects integration pipelines"
          />
          <figcaption>
            Blocked turnover affects domestic movers and international students who must secure housing before
            arrival windows close.
          </figcaption>
        </figure>

        <h2>What blocked turnover means for retention and integration</h2>

        <p>
          Universities do not operate the rental market, but they absorb the consequences. When rooms do not cycle,
          orientation teams field more deferral requests, international offices repeat warnings about arriving
          without accommodation, and study advisers see stress that traces back to housing rather than coursework.
          Nuffic survey research found that 37 percent of international graduates who left the Netherlands cited
          not finding proper housing as an important reason (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). The figure sits alongside labour-market and financing barriers, but it underlines that housing is a
          post-graduation retention variable, not only a move-in problem.
        </p>

        <p>
          Municipalities and institutions that publish housing guidance, such as those outlined on pages like{' '}
          <Link href="/universities">university partnership resources</Link>, increasingly treat room access as
          infrastructure. That framing matches what student unions report on the ground. LSVb chair Maaike Krom told
          NOS that students spend a growing share of income on rent, have limited hours to work alongside full-time
          study, and see wellbeing decline when housing search becomes a permanent background task (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, September 2025
          </a>
          ).
        </p>

        <h2>Policy responses on the table</h2>

        <p>
          The national response mixes supply acceleration with rental-market adjustments. The cabinet has announced
          measures to speed prefabricated housing, simplify permitting, and expand temporary student contracts beyond
          the current exception for students from outside the municipality (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Kences continues to argue for vergunningsvrij room rental in some cases so private landlords regain
          incentives to keep units in the student pool. None of these fixes alone restores turnover if graduates
          still cannot access the mid-market.
        </p>

        <p>
          For students navigating the system today, the practical implication is to treat housing as a multi-year
          plan rather than a September sprint. Understanding roommate expectations early, as explored in resources
          like <Link href="/blog/move-in-week-red-flags">move-in week warning signs</Link>, can reduce the risk of
          signing into a flat that becomes harder to leave. For policymakers, the metric to watch alongside new
          builds is <em>release rate</em>: how many student rooms actually change hands each academic year.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-500">
          Kences. (2025). <em>Landelijke Monitor Studentenhuisvesting</em>. Reported via{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          . Centraal Bureau voor de Statistiek &amp; Nederlands Interdisciplinair Demografisch Instituut. (2026).
          Thuiswonende studenten na leenstelsel. Reported via{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          . Nuffic. (2023). International graduate stay and leave factors.{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Afgestudeerden houden studentenkamers vast en remmen doorstroom',
    excerpt:
      'Meer dan de helft van de afgestudeerden woont een jaar later nog in de studentenkamer. Kences- en NOS-cijfers laten zien dat het tekort niet alleen om nieuwbouw gaat, maar om geblokkeerde omloop.',
    publishDate: '2026-07-29',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Studentenhuisvesting als retentiepost',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe Nederlandse monitoringsdata kamerschaarste koppelt aan thuiswonen en stress bij internationale zoektochten.',
      },
      {
        title: 'Internationale studentenhuisvesting in Nederland',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Waarom kamer toegang een integratie-indicator is, niet een bijzaak.',
      },
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Gedragsgerichte vragen over routines, grenzen en verwachtingen in gedeeld wonen.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting draait vaak om hoeveel kamers er volgend jaar bij komen. Die blik
          mist een tweede knelpunt: kamers die er al zijn maar niet vrijkomen. Volgens de nieuwste Landelijke
          Monitor Studentenhuisvesting van Kences, zoals{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS (september 2025)
          </a>{' '}
          rapporteert, woont <strong>57 procent van de afgestudeerden een jaar na het diploma nog in de studentenkamer</strong>.
          Ze zijn geen krakers. Ze zitten klem tussen een studentencontract en een reguliere huurmarkt zonder
          betaalbare doorstroom.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Student op de fiets langs woonblokken in een Nederlandse studentenstad — vastzittende afgestudeerden en kameromloop"
          />
          <figcaption>
            Als afgestudeerden niet uit studentenwoningen kunnen, concurreren nieuwe studenten om een kleinere
            pool dan de totaalcijfers suggereren.
          </figcaption>
        </figure>

        <h2>Waarom vastzittende afgestudeerden een omloopprobleem zijn</h2>

        <p>
          Het officiële tekort in de monitor 2025-26 ligt rond 21.000 kamers in twintig studentensteden. Kences
          waarschuwt dat het echte gat groter is, omdat minder studenten nog zeggen te zoeken als ze denken dat er
          niets is. Vastzittende afgestudeerden voegen een verborgen laag toe: elke graduate die blijft is één
          kamer minder voor een eerstejaars, een internationale aankomst of een thuiswonende student die langer
          wacht dan gepland.
        </p>

        <p>
          Het mechanisme is eenvoudig. Studentenhuisvesting is bedoeld als tijdelijk verblijf tijdens een studie.
          Kunnen afgestudeerden niet door naar starterswoningen of de vrije sector, dan houden ze studentenhuur,
          bezette schaarse voorraad en vertragen ze de omloop die het systeem elk zomer verwacht. Kences-directeur
          Jolan de Bie vertelde NOS Nieuwsuur dat campuscontracten, waarbij je na afstuderen moet vertrekken, alleen
          werken als er ergens anders heen kan (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ).
        </p>

        <h2>Minder studenten wonen uit, en minder geloven dat het kan</h2>

        <p>
          De monitor laat ook een groeiende kloof zien tussen waar studenten wonen en waar ze willen wonen. Acht
          jaar geleden woonde 52 procent op kamers en wilde 59 procent dat. Nu woont 44 procent uit terwijl 49
          procent dat nog steeds zou willen. De grafiek hieronder laat zien dat zowel feitelijk uitwonen als
          gewenst uitwonen parallel zijn gedaald.
        </p>

        <BlogBarChart
          data={[
            { label: 'Woonde uit (8j geleden)', value: 52 },
            { label: 'Wilde uit (8j geleden)', value: 59 },
            { label: 'Woont uit (nu)', value: 44 },
            { label: 'Wil uit (nu)', value: 49 },
          ]}
          yLabel="Aandeel studenten"
          valueFormat="percent"
          caption="Bron: Kences Landelijke Monitor Studentenhuisvesting, via NOS, september 2025."
        />

        <p>
          Kences leest dit als studenten die de hoop opgeven. Dat verschilt van een culturele verschuiving naar
          thuiswonen. Onderzoek van CBS en NIDI toont dat van de studenten die in 2023 afstudeerden, 43 procent
          nooit uit huis ging, tegenover 31 procent van de cohort 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, februari 2026
          </a>
          ). Betaalbaarheid en schaarste versterken elkaar.
        </p>

        <h3>Aanbod krimpt terwijl wachtrijen groeien</h3>

        <p>
          De druk is concreet in Eindhoven. Gemeente, TU/e, Fontys en verhuurders kondigden 5.400 nieuwe
          studentenwoningen in acht jaar aan nadat de universiteit meldde dat ongeveer 500 studenten hun studie
          vroegtijdig moesten stoppen door gebrek aan huisvesting (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, juli 2026
          </a>
          ). Landelijk wonen 17.800 minder studenten in de particuliere sector dan het jaar ervoor, en daalde het
          totale aanbod in twintig steden met naar schatting 13.500 naar circa 322.400 kamers.
        </p>

        <p>
          Particuliere verhuurders verkopen vaker. Een ABF-onderzoek in opdracht van VRO en Kences telde meer dan
          5.000 verkochte studentenwoningen in een jaar, goed voor ongeveer 10.000 kamers (
          <a
            href="https://nos.nl/artikel/2589051-particulieren-verkopen-steeds-vaker-hun-studentenwoningen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Nieuwbouw compenseert dat niet volledig.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="internationalCampus"
            alt="Internationale studenten op een Nederlandse campus — kameromloop raakt integratie"
          />
          <figcaption>
            Geblokkeerde omloop raakt thuiswonende studenten en internationale aankomsten die huisvesting vóór
            aankomst moeten regelen.
          </figcaption>
        </figure>

        <h2>Gevolgen voor retentie en integratie</h2>

        <p>
          Instellingen beheren de huurmarkt niet, maar dragen de gevolgen. Als kamers niet omdraaien, stijgen
          uitstelverzoeken, herhaalt de international office waarschuwingen, en zien studieadviseurs stress die
          terug te voeren is op wonen. Nuffic-onderzoek meldt dat 37 procent van internationale afgestudeerden die
          Nederland verlieten, gebrek aan passende huisvesting noemde (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ).
        </p>

        <p>
          Gemeenten en instellingen die woonbeleid publiceren, zoals op pagina&apos;s over{' '}
          <Link href="/universities">samenwerking met universiteiten</Link>, behandelen kamer toegang steeds vaker
          als infrastructuur. LSVb-voorzitter Maaike Krom vertelde NOS dat studenten een groter deel van hun inkomen
          aan huur besteden en dat welzijn achteruitgaat wanneer zoeken een permanente achtergrondtaak wordt.
        </p>

        <h2>Beleidsreacties</h2>

        <p>
          Het kabinet kondigde maatregelen aan voor snellere prefabbouw, vereenvoudigde vergunningen en ruimere
          tijdelijke studentencontracten (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Kences pleit voor vergunningsvrij kamerverhuren om particuliere aanbod te behouden. Geen enkele maatregel
          herstelt omloop als afgestudeerden de middenhuur niet bereiken.
        </p>

        <p>
          Voor studenten betekent dit dat huisvesting een meerjarig plan is, niet alleen een september sprint.
          Inzicht in huisgenootverwachtingen, zoals in{' '}
          <Link href="/blog/move-in-week-red-flags">signalen in de eerste woonweken</Link>, kan helpen voorkomen dat
          je vastzit in een situatie die moeilijk te verlaten is. Voor beleidsmakers is naast nieuwbouw de{' '}
          <em>vrijkomstsnelheid</em> cruciaal: hoeveel kamers wisselen echt van bewoner per collegejaar.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-500">
          Kences. (2025). <em>Landelijke Monitor Studentenhuisvesting</em>. Via{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          . CBS &amp; NIDI. (2026). Thuiswonende studenten. Via{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS
          </a>
          . Nuffic. (2023). Internationale afgestudeerden blijven of vertrekken.{' '}
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands
          </a>
        </p>
      </div>
    ),
  },
}

export function GraduateHoldoverStudentHousingArticle() {
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
