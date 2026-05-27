'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Student Housing and Loneliness: What Dutch Data Show',
    excerpt:
      'National monitors describe room shortages. CBS and NIDI describe who still lives with parents through graduation. Kences has long warned that building type shapes social contact. Here is how those layers fit together without flattening anyone into a headline.',
    publishDate: '2026-05-27',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'International student housing and integration signals',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Companion analysis on Nuffic graduate data, Kences wish-versus-reality room figures, and municipal routing in Breda.',
      },
      {
        title: 'Student housing, retention, and hidden load',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'Why room access sits on the same ledger as persistence and wellbeing metrics institutions already track.',
      },
      {
        title: 'Editorial standards and evidence bar',
        href: '/about',
        description:
          'How this site frames research-led writing on shared living, separate from product surfaces.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Public debate often treats &quot;loneliness&quot; as a feeling category and &quot;housing&quot; as a budget category. In the Netherlands, the past five years of reporting and official statistics make a narrower claim easier to defend:{' '}
          <strong>who gets a room, when they leave the parental home, and what type of unit is financed</strong> are measurable inputs to the same social infrastructure students rely on to study, work part-time, and build networks.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Residential street and apartment blocks in a Dutch city at dusk, illustrating student housing supply and municipal planning context"
          />
          <figcaption>
            National headlines on shortages translate differently in each city, but the underlying monitors are designed to be comparable year to year.
          </figcaption>
        </figure>

        <h2>Who still lives at home when they graduate?</h2>

        <p>
          In February 2026, NOS reported findings from the Centraal Bureau voor de Statistiek (CBS) and the Nederlands Interdisciplinair Demografisch Instituut (NIDI) on living arrangements after the loan-system era. Among students who completed a degree in 2023,{' '}
          <strong>43 percent</strong> had lived with their parents for the full five years before graduation, compared with <strong>31 percent</strong> among 2016 graduates (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). The same article notes that students who did move out did so later: <strong>79 percent</strong> of 2023 graduates still lived at home after year one, against <strong>63 percent</strong> for the 2016 cohort, and <strong>60 percent</strong> were still at home after three years of study compared with <strong>43 percent</strong> in the older group (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <h3>HBO and university lines diverge</h3>

        <p>
          The CBS and NIDI breakdown in that reporting is not uniform across sectors. For university graduates in 2023, <strong>32 percent</strong> had never moved to non-family housing during the observed window, up from <strong>19 percent</strong> in 2016. For graduates of universities of applied sciences (HBO), the share who never moved out rose from <strong>41 to 55 percent</strong> across the same comparison (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Those figures describe addresses, not mood, yet they constrain how many evenings per week a student can plausibly spend on campus societies, late labs, or informal study groups without a long commute.
        </p>

        <h2>What Kences monitors add on top of address data</h2>

        <p>
          Kences, the national knowledge centre for student housing, publishes the Landelijke Monitor Studentenhuisvesting. In September 2025, NOS summarised a fresh monitor cycle: <strong>44 percent</strong> of students lived in a rented room while <strong>49 percent</strong> said they wanted to, a gap that was smaller eight years earlier when <strong>52 percent</strong> lived out and <strong>59 percent</strong> wanted to (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The piece quoted Kences director Jolan de Bie on students who remain at their parents&apos; home missing part of social-emotional development and standing partly outside student life, with possible consequences for self-image and later labour-market access as described in that interview-based reporting (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Those are expert framings relayed by journalists, not individual predictions, but they explain why ministries and institutions treat housing as more than a markets topic.
        </p>

        <h3>Building type: studios versus shared rooms</h3>

        <p>
          Earlier Kences commentary, also carried by NOS in October 2021, flagged a structural trend: developers favour self-contained studios over shared rooms. The article quoted a Kences policy official stating that, because students often experience loneliness (&quot;vereenzaming&quot;), the organisation views that studio shift as highly undesirable, and that shared housing is better for wellbeing and social development (
          <a
            href="https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2021
          </a>
          ). The policy detail has aged, but the tension between unit economics and contact density is still visible in newer shortage reporting.
        </p>

        <h2>Municipal rules as part of the same picture</h2>

        <p>
          National percentages can feel abstract when you are cycling between campus blocks in North Brabant. Two local anchors keep the map honest. Gemeente Breda explains the national &quot;hospitaregeling&quot; for landlords who live on site and share facilities, and it directs owners who want student tenants to the published accommodation mailboxes of{' '}
          <strong>Avans University of Applied Sciences</strong> and <strong>Breda University of Applied Sciences (BUas)</strong> (
          <a
            href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling"
            target="_blank"
            rel="noreferrer"
          >
            Gemeente Breda, n.d.
          </a>
          ). Gemeente Tilburg states that letting rooms to <strong>three or more</strong> people typically requires an omzettingsvergunning, lists physical planning checks such as bicycle and waste storage, and charges <strong>694.90 euros</strong> to process an application, with an eight-week decision timeline (
          <a href="https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/" target="_blank" rel="noreferrer">
            Gemeente Tilburg, n.d.
          </a>
          ). Neither page replaces a monitor, but both show how supply is gated in places where many students actually enrol.
        </p>

        <h2>Housing as a stated reason graduates leave the country</h2>

        <p>
          Nuffic&apos;s mixed-method &quot;Staying after graduation&quot; work, summarised on its English news channel, reported that among international alumni who left the Netherlands, <strong>37 percent</strong> cited not finding suitable housing as an important reason, the same share as for financing life in the country (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ). That statistic does not prove causality for any one person, but it does justify reading room access next to labour-market and integration policy, not only next to rent tables.
        </p>

        <h3>How to read the stack without over-claiming</h3>

        <p>
          Three checks keep this topic honest. First, treat <strong>address statistics</strong> (CBS and NIDI), <strong>stock and wish monitors</strong> (Kences via NOS), and <strong>graduate surveys</strong> (Nuffic) as different instruments with different margins. Second, treat quoted warnings about wellbeing in news pieces as <strong>hypotheses for monitoring</strong>, not as diagnoses of individual students. Third, compare cities using local landlord pages and institution housing desks, not only national averages. For a longer integration-focused read on the same evidence chain, see{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            international student housing in the Netherlands
          </Link>
          . For retention framing, see{' '}
          <Link href="/blog/student-housing-gap-retention-roi">student housing and retention</Link>. Institution-level geography is summarised under{' '}
          <Link href="/universities">universities</Link>, and the editorial evidence bar is described on the{' '}
          <Link href="/about">about</Link> page.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (n.d.). <em>Kamer verhuren met de hospitaregeling</em>. Retrieved May 27, 2026, from{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Gemeente Tilburg. (n.d.). <em>Kamerverhuur</em>. Retrieved May 27, 2026, from{' '}
          <a href="https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/" target="_blank" rel="noreferrer">
            https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2021, October 7). <em>Landelijk tekort studentenwoningen met 20 procent gestegen naar 26.500</em>. Retrieved May 27, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, September 3). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved May 27, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026, February 6). <em>Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen</em>. Retrieved May 27, 2026, from{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023, December 5). <em>This is why international students stay (or leave) after graduating in the Netherlands</em>. Retrieved May 27, 2026, from{' '}
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
    title: 'Studentenhuisvesting en eenzaamheid: wat Nederlandse data laten zien',
    excerpt:
      'CBS en NIDI over thuiswonen, NOS over Kences-monitoren, en gemeentelijke regels in Breda en Tilburg: een evidence-led dossier zonder anekdotes als nationale waarheid.',
    publishDate: '2026-05-27',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Internationale studentenhuisvesting en integratiesignalen',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Verdieping op Nuffic, Kences en gemeentelijke verwijzingen, met dezelfde bronnenbenadering.',
      },
      {
        title: 'Huisvesting, retentie en verborgen belasting',
        href: '/blog/student-housing-gap-retention-roi',
        description:
          'Waarom kamertoegang op dezelfde lijn staat als doorstroom en welzijn in instellingsdata.',
      },
      {
        title: 'Redactionele standaarden',
        href: '/about',
        description:
          'Kader voor evidence-led schrijven over samenwonen op deze site.',
      },
    ],
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In het publieke debat worden &quot;eenzaamheid&quot; en &quot;huisvesting&quot; vaak in verschillende hokjes gezet. Wat de afgelopen jaren in Nederland wél stevig te onderbouwen valt, is smaller:{' '}
          <strong>wie een kamer heeft, wanneer studenten uitwonen, en welk woontype wordt bijgebouwd</strong> zijn meetbare factoren in dezelfde infrastructuur waaronder ook netwerken en deelname aan campusleven vallen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Woonstraten en appartementen in een Nederlandse stad, als beeld voor studentenhuisvesting en gemeentelijke regelgeving"
          />
          <figcaption>
            Landelijke tekorten voelen lokaal anders; monitors zijn juist bedoeld om trends tussen jaren te vergelijken.
          </figcaption>
        </figure>

        <h2>Wie woont er nog thuis bij afstuderen?</h2>

        <p>
          NOS berichtte in februari 2026 over onderzoek van het CBS en het NIDI naar thuiswonen na invoering van het leenstelsel. Van de studenten die in 2023 afstudeerden, bleef <strong>43 procent</strong> in de vijf jaar daarvoor thuiswonen, tegen <strong>31 procent</strong> bij afgestudeerden in 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Studenten die wél uit huis gingen, deden dat later: <strong>79 procent</strong> woonde na jaar één nog thuis (2023-cohort) tegen <strong>63 procent</strong> (2016), en na drie jaar studie was dat <strong>60 tegen 43 procent</strong> (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <h3>Hbo en universiteit lopen uiteen</h3>

        <p>
          Uit dezelfde berichtgeving blijkt het beeld niet uniform. Bij universitair afgestudeerden in 2023 had <strong>32 procent</strong> in de beschouwde periode nooit op zichzelf gewoond (tegen <strong>19 procent</strong> in 2016). Bij hbo was dat <strong>55 procent</strong> in 2023 tegen <strong>41 procent</strong> in 2016 (
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Het zijn adrescijfers, geen stemmingen, maar ze beperken hoe vaak studenten fysiek op campus kunnen zijn zonder lange reistijd.
        </p>

        <h2>Wat Kences-monitoren toevoegen</h2>

        <p>
          Kences publiceert de Landelijke Monitor Studentenhuisvesting. NOS vatte in september 2025 een nieuwe ronde samen: <strong>44 procent</strong> woonde op een kamer, <strong>49 procent</strong> wilde dat, terwijl dat acht jaar eerder <strong>52 tegen 59 procent</strong> was (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Het artikel citeerde Kences-directeur Jolan de Bie over sociaal-emotionele ontwikkeling en meedoen aan studentenleven bij thuiswoners (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Dat zijn kaders uit interviews, geen individuele voorspellingen, maar ze verklaren waarom OCW en instellingen huisvesting breed plaatsen.
        </p>

        <h3>Studios versus kamers</h3>

        <p>
          In oktober 2021 beschreef NOS op basis van Kences ook een trend naar zelfstandige studio&apos;s ten opzichte van kamers. Een Kences-functionaris stelde dat bij studenten vaak sprake is van vereenzaming en dat gedeeld wonen beter is voor welzijn en sociale ontwikkeling (
          <a
            href="https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2021
          </a>
          ). Het beleidsjaar is ouder, maar de spanning tussen projecteconomie en contactdichtheid blijft actueel in nieuwere tekortberichtgeving.
        </p>

        <h2>Gemeentelijke regels als onderdeel van het aanbod</h2>

        <p>
          Gemeente Breda legt de landelijke hospitaregeling uit en verwijst verhuurders van studentenkamers naar de huisvestingsmail van <strong>Avans</strong> en <strong>BUas</strong> (
          <a
            href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling"
            target="_blank"
            rel="noreferrer"
          >
            Gemeente Breda, z.d.
          </a>
          ).           Gemeente Tilburg schrijft dat kamerverhuur aan <strong>drie of meer</strong> personen in de regel een omzettingsvergunning vereist, met toetsing aan onder meer stallingsruimte voor fietsen en afval, een leges van <strong>694,90 euro</strong> en een beslistermijn van acht weken (
          <a href="https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/" target="_blank" rel="noreferrer">
            Gemeente Tilburg, z.d.
          </a>
          ). Dit vervangt geen landelijke monitor, maar maakt zichtbaar waar aanbod in Brabantse studentensteden juridisch wordt begrensd.
        </p>

        <h2>Nuffic: huisvesting als vertrekreden</h2>

        <p>
          In Nuffics samenvatting van &quot;Staying after graduation&quot; noemde <strong>37 procent</strong> van de internationale afgestudeerden die vertrokken &quot;geen geschikte huisvesting vinden&quot; als belangrijke reden, naast dezelfde mate voor financiering (
          <a
            href="https://www.nuffic.nl/en/news/this-is-why-international-students-stay-or-leave-after-graduating-in-the-netherlands"
            target="_blank"
            rel="noreferrer"
          >
            Nuffic, 2023
          </a>
          ).
        </p>

        <h3>Zo lees je de bronnenstack eerlijk</h3>

        <p>
          Houd adresstatistiek (CBS en NIDI), voorraad- en wensmonitoren (Kences via NOS), en enquêtes onder alumni (Nuffic) methodologisch uit elkaar. Behandel welzijnswaarschuwingen in nieuws als monitorhypotheses, niet als diagnose per student. Vergelijk steden lokaal. Verder lezen:{' '}
          <Link href="/blog/international-student-housing-netherlands-isolation">
            internationale studentenhuisvesting in Nederland
          </Link>
          ,{' '}
          <Link href="/blog/student-housing-gap-retention-roi">studentenhuisvesting en retentie</Link>, het overzicht{' '}
          <Link href="/universities">universiteiten en hogescholen</Link>, en het kader op de{' '}
          <Link href="/about">about</Link>-pagina.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Gemeente Breda. (z.d.). <em>Kamer verhuren met de hospitaregeling</em>. Geraadpleegd 27 mei 2026,{' '}
          <a href="https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling" target="_blank" rel="noreferrer">
            https://www.breda.nl/kamer-verhuren-met-de-hospitaregeling
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Gemeente Tilburg. (z.d.). <em>Kamerverhuur</em>. Geraadpleegd 27 mei 2026,{' '}
          <a href="https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/" target="_blank" rel="noreferrer">
            https://www.tilburg.nl/inwoners/vergunningen/kamerverhuur/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2021, 7 oktober). <em>Landelijk tekort studentenwoningen met 20 procent gestegen naar 26.500</em>. Geraadpleegd 27 mei 2026,{' '}
          <a
            href="https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2400662-landelijk-tekort-studentenwoningen-met-20-procent-gestegen-naar-26-500
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2025, 3 september). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Geraadpleegd 27 mei 2026,{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>
        <p className="text-sm text-slate-600">
          NOS. (2026, 6 februari). <em>Meer studenten bleven na invoering leenstelsel gehele studententijd thuis wonen</em>. Geraadpleegd 27 mei 2026,{' '}
          <a
            href="https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2601121-meer-studenten-bleven-na-invoering-leenstelsel-gehele-studententijd-thuis-wonen
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Nuffic. (2023, 5 december). <em>This is why international students stay (or leave) after graduating in the Netherlands</em>. Geraadpleegd 27 mei 2026,{' '}
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

export function StudentHousingLonelinessNetherlandsArticle() {
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
