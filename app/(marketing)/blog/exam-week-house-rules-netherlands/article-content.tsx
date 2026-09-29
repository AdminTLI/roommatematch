'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Exam Week House Rules for Dutch Housemates',
    excerpt:
      'MMMS-2025 shows most HBO and university students still report heavy study stress. Shared houses need temporary quiet, kitchen, and guest norms when tentamenweek arrives.',
    publishDate: '2026-09-16',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'How mismatched sleep schedules create predictable conflict before exam season intensifies them.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to write short house norms without turning every request into a late-night message war.',
      },
      {
        title: 'Roommate Conflict Resolution Tips',
        href: '/blog/roommate-conflict-resolution-tips-netherlands',
        description:
          'How to de-escalate noise and cleanliness friction before it reaches grades and mental health.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Tentamenweek does not invent new personality types. It compresses existing ones. The housemate who always
          cooks late still cooks late, only now someone has a 08:30 exam. The living-room film night that felt
          friendly in September feels like sabotage in January. National student monitoring shows why that friction is
          not a private quirk: in spring 2025, more than half of participating HBO and university students reported
          (very) high stress in the previous four weeks, and four in ten often felt under pressure to perform (
          <a
            href="https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/"
            target="_blank"
            rel="noreferrer"
          >
            Trimbos / RIVM / GGD GHOR, MMMS-2025
          </a>
          ). Study is the dominant stress source. Shared housing is where that pressure meets someone else’s playlist.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Top-down view of a wooden desk at night with hands writing in a planner beside a laptop, books, glasses, and a cup of coffee"
          />
          <figcaption>
            Exam weeks turn shared houses into competing calendars: focus blocks, kitchen timing, and sleep all collide.
          </figcaption>
        </figure>

        <h2>What the 2025 student monitor actually measures</h2>

        <p>
          The Monitor Mentale gezondheid en Middelengebruik Studenten (MMMS-2025) surveyed more than 27,000 HBO and
          university students. Mental health improved slightly compared with 2021, mostly between 2021 and 2023, yet a
          large share still reports strain. Among the headline measures:{' '}
          <strong>53% reported (very) high stress in the past four weeks</strong>, 56% reported emotional exhaustion
          symptoms, and 41% often felt performance pressure (
          <a
            href="https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf"
            target="_blank"
            rel="noreferrer"
          >
            MMMS-2025 national report
          </a>
          ). Among students who reported at least some stress, 58% named study as a source of (very) high stress in
          that same window. Those figures do not prove that housemates cause exam anxiety. They do show that exam
          season lands in houses already carrying academic load.
        </p>

        <p>
          Protective factors in the same monitor matter for co-living design. Better mental health was more common
          among students who felt they had enough time for restorative activities and who experienced substantial
          social support from their immediate circle. A flat cannot replace professional care. It can still decide
          whether evening hours protect recovery or erase it. For institutional context on living arrangements and
          student life, see the overview for{' '}
          <Link href="/universities">universities and housing partners</Link> and background on{' '}
          <Link href="/about">about Domu Match</Link>.
        </p>

        <h2>Why tentamenweek breaks default house norms</h2>

        <p>
          Year-round house rules usually optimise for average weeks: flexible guests, background music until midnight,
          kitchen traffic whenever someone finishes a shift. Exam weeks are not average. They demand temporary,
          calendar-linked constraints. Consumer reporting on student-house irritations keeps returning to the same
          clash: housemates who party while someone has an exam the next morning, and the practical fix of announcing
          gatherings and agreeing quieter hours in advance (
          <a
            href="https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48"
            target="_blank"
            rel="noreferrer"
          >
            vtwonen on student-house annoyances
          </a>
          ). That advice sounds basic because the failure mode is basic: silence is treated as a personality request
          instead of a time-bounded system.
        </p>

        <p>
          Research on student performance pressure also flags co-living conflict as a stress pathway. Trimbos’
          mixed-methods report on performance pressure and stress notes that living with others can produce conflict,
          and that friction with housemates appears in the international literature as a meaningful stress source (
          <a
            href="https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Harder Better Faster Stronger?, Trimbos / ECIO / RIVM
          </a>
          ). During exam weeks, the conflict is often not “who is right,” but “whose deadline wins tonight.”
        </p>

        <h2>Three temporary systems that reduce exam-week friction</h2>

        <h3>1. A visible quiet calendar, not a vibe</h3>

        <p>
          Put hard quiet windows on a shared calendar or kitchen whiteboard for the next ten to fourteen days: for
          example 22:00–08:00 on corridors and living rooms on nights before scheduled exams, with headphones as the
          default for music and calls. Name the dates. Vague “be considerate” language collapses the first time two
          people have mismatched exam slots. Sleep-schedule mismatches already predict conflict in ordinary weeks; see{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">Night Owl vs. 8 A.M. Lecture</Link>. Exam season simply raises
          the cost of pretending everyone’s rhythm is identical.
        </p>

        <h3>2. Kitchen timing as infrastructure</h3>

        <p>
          Shared kitchens amplify stress when someone reheats food at 01:00 while another person is still revising at
          the table. Agree a short evening cooking window and a “quiet cook” rule after it: no blender, no loud pans,
          clean as you go so the next person is not stuck washing before an early exam. This is not a cleanliness
          morality play. It is queue management under compressed sleep.
        </p>

        <h3>3. Guests and social invitations with an opt-out</h3>

        <p>
          Exam weeks turn “gezelligheid” into a test of consent. A standing invitation to hang out can feel like social
          pressure when someone needs recovery time, which MMMS links to better mental health when that time is
          actually available. Use a simple guest rule for the exam block: overnight guests announced 24 hours ahead,
          living-room gatherings cancelled or moved out when two or more housemates have exams the next morning, and an
          explicit opt-out that does not require a justification essay in the group chat. Written norms help here; see{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>.
        </p>

        <h2>How to ask without starting a conflict spiral</h2>

        <p>
          Requests fail when they arrive as character judgments (“you are so loud”) instead of operational needs (“I
          have an exam at 09:00; can we keep the living room quiet after 22:00 tonight?”). Lead with the date, the
          hour, and the trade: offer to host a louder night after results week, or take an extra cleaning turn. If
          tension is already high, use the de-escalation patterns in{' '}
          <Link href="/blog/roommate-conflict-resolution-tips-netherlands">
            Roommate Conflict Resolution Tips
          </Link>{' '}
          rather than stacking complaints into one midnight message.
        </p>

        <p>
          Emotional support between housemates is a separate negotiation, covered in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            Housemate Support When Living Away From Home
          </Link>
          . Exam-week rules are narrower: protect sleep, study blocks, and recovery time so support conversations are
          possible at all.
        </p>

        <h2>What institutions and house boards can do</h2>

        <p>
          Student houses, associations, and campus housing teams often publish general house rules and miss seasonal
          overlays. A one-page “tentamenweek addendum” - quiet hours, guest limits, kitchen windows, and a contact
          person for mediation - costs little and matches what national monitoring says about study stress and the
          value of restorative time. MMMS-2025 frames student wellbeing as partly environmental. During exam periods,
          the microenvironment of a shared flat is one of the few environments students can actually renegotiate in a
          week.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-600">
          Trimbos-instituut. (2025, 20 November). Mentale gezondheid hbo- en wo-studenten is licht verbeterd.{' '}
          <a
            href="https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut, RIVM &amp; GGD GHOR Nederland. (2025). Monitor Mentale gezondheid en Middelengebruik
          Studenten hbo en wo 2025.{' '}
          <a
            href="https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut, ECIO &amp; RIVM. (2025). Harder Better Faster Stronger?{' '}
          <a
            href="https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          vtwonen. Ergernissen in een studentenhuis + oplossingen.{' '}
          <a
            href="https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48"
            target="_blank"
            rel="noreferrer"
          >
            https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Tentamenweek-huisregels voor Nederlandse huisgenoten',
    excerpt:
      'MMMS-2025 laat zien dat veel hbo- en wo-studenten nog steeds hoge studiestress melden. Gedeelde huizen hebben tijdelijke stilte-, keuken- en bezoeknormen nodig in de tentamenweek.',
    publishDate: '2026-09-16',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Nachtuil vs. college om 8 uur',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Hoe botsende slaapritmes al in gewone weken conflict voorspellen, vóór tentamenperiodes die druk verhogen.',
      },
      {
        title: 'Groepsappen, huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Hoe je korte huisnormen opschrijft zonder dat elk verzoek een middernachtelijke app-oorlog wordt.',
      },
      {
        title: 'Roommate conflict oplossen',
        href: '/blog/roommate-conflict-resolution-tips-netherlands',
        description:
          'Hoe je herrie- en netheidsfrictie de-escaleert vóór cijfers en mentale gezondheid schade oplopen.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Tentamenweek bedenkt geen nieuwe persoonlijkheden. Ze comprimeert bestaande. De huisgenoot die altijd laat
          kookt, kookt nog steeds laat, alleen heeft iemand nu een tentamen om 08:30. De filmavond die in september
          gezellig voelde, voelt in januari als sabotage. Landelijke studentenmonitoring laat zien waarom die wrijving
          geen privé-eigenaardigheid is: in het voorjaar van 2025 meldde meer dan de helft van de deelnemende hbo- en
          wo-studenten (heel) veel stress in de voorgaande vier weken, en vier op de tien voelden zich vaak onder druk
          staan om te presteren (
          <a
            href="https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/"
            target="_blank"
            rel="noreferrer"
          >
            Trimbos / RIVM / GGD GHOR, MMMS-2025
          </a>
          ). Studie is de dominante stressbron. Gedeeld wonen is waar die druk iemands anders playlist tegenkomt.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Bovenaanzicht van een houten bureau 's avonds met handen die in een planner schrijven naast laptop, boeken, bril en een kop koffie"
          />
          <figcaption>
            Tentamenweken maken van studentenhuizen concurrerende agenda’s: focusblokken, keukentijden en slaap botsen.
          </figcaption>
        </figure>

        <h2>Wat de studentenmonitor 2025 precies meet</h2>

        <p>
          De Monitor Mentale gezondheid en Middelengebruik Studenten (MMMS-2025) peilde meer dan 27.000 hbo- en
          wo-studenten. De mentale gezondheid verbeterde licht ten opzichte van 2021, vooral tussen 2021 en 2023, maar
          een groot deel ervaart nog steeds druk. Onder de kernmaten:{' '}
          <strong>53% meldde in de afgelopen vier weken (heel) veel stress</strong>, 56% emotionele
          uitputtingsklachten, en 41% voelde zich vaak onder prestatiedruk (
          <a
            href="https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf"
            target="_blank"
            rel="noreferrer"
          >
            landelijk rapport MMMS-2025
          </a>
          ). Onder studenten die minstens enige stress meldden, noemde 58% studie als bron van (heel) veel stress in
          die periode. Die cijfers bewijzen niet dat huisgenoten tentamenangst veroorzaken. Ze laten wel zien dat
          tentamenperiodes landen in huizen die al academische last dragen.
        </p>

        <p>
          Beschermende factoren in dezelfde monitor tellen voor samenwonen. Betere mentale gezondheid kwam vaker voor
          bij studenten die genoeg tijd ervaarden voor herstellende activiteiten en die veel sociale steun uit hun
          directe kring kregen. Een flat vervangt geen professionele zorg. Hij kan wel bepalen of avonduren herstel
          beschermen of uitwissen. Voor institutionele context over woonvormen en campusleven, zie het overzicht voor{' '}
          <Link href="/universities">universiteiten en huisvestingspartners</Link> en achtergrond op{' '}
          <Link href="/about">over Domu Match</Link>.
        </p>

        <h2>Waarom tentamenweek standaard huisregels breekt</h2>

        <p>
          Jaarronde huisregels optimaliseren meestal voor gemiddelde weken: flexibel bezoek, achtergrondmuziek tot
          middernacht, keukenverkeer wanneer iemands dienst eindigt. Tentamenweken zijn niet gemiddeld. Ze vragen
          tijdelijke, agenda-gebonden begrenzingen. Consumentenverslaggeving over ergernissen in studentenhuizen komt
          steeds terug op dezelfde botsing: huisgenoten die feesten terwijl iemand de volgende ochtend een tentamen
          heeft, en de praktische oplossing om bijeenkomsten vooraf aan te kondigen en stillere uren af te spreken (
          <a
            href="https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48"
            target="_blank"
            rel="noreferrer"
          >
            vtwonen over ergernissen in studentenhuizen
          </a>
          ). Dat advies klinkt basaal omdat de faalmodus basaal is: stilte wordt behandeld als persoonlijkheidswens in
          plaats van als tijdelijk systeem.
        </p>

        <p>
          Onderzoek naar prestatiedruk bij studenten markeert conflict in samenwonen ook als stresspad. Het
          mixed-methods rapport van Trimbos over prestatiedruk en stress noteert dat samenwonen tot conflicten kan
          leiden, en dat wrijving met huisgenoten in de internationale literatuur als betekenisvolle stressbron
          voorkomt (
          <a
            href="https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Harder Better Faster Stronger?, Trimbos / ECIO / RIVM
          </a>
          ). In tentamenweken is het conflict vaak niet “wie heeft gelijk,” maar “wiens deadline wint vanavond.”
        </p>

        <h2>Drie tijdelijke systemen die tentamenfrictie verlagen</h2>

        <h3>1. Een zichtbare stilte-agenda, geen vibe</h3>

        <p>
          Zet harde stilteblokken op een gedeelde agenda of keukenwhiteboard voor de komende tien tot veertien dagen:
          bijvoorbeeld 22:00–08:00 op gangen en woonkamer in nachten vóór geplande tentamens, met koptelefoon als
          standaard voor muziek en belletjes. Noem de data. Vaag “houd rekening met elkaar” stort in zodra twee mensen
          verschillende tentamenslots hebben. Botsende slaapritmes voorspellen al conflict in gewone weken; zie{' '}
          <Link href="/blog/night-owl-vs-8am-lecture">Nachtuil vs. college om 8 uur</Link>. Tentamenseizoen verhoogt
          alleen de prijs van doen alsof ieders ritme gelijk is.
        </p>

        <h3>2. Keukentijden als infrastructuur</h3>

        <p>
          Gedeelde keukens versterken stress wanneer iemand om 01:00 eten opwarmt terwijl een ander nog aan tafel
          studeert. Spreek een kort avond-kookvenster af en een “stil koken”-regel daarna: geen blender, geen luide
          pannen, meteen opruimen zodat de volgende niet vóór een vroeg tentamen moet afwassen. Dit is geen
          netheidsmoraal. Het is wachtrijbeheer onder verkorte slaap.
        </p>

        <h3>3. Bezoek en sociale uitnodigingen met opt-out</h3>

        <p>
          Tentamenweken maken van “gezelligheid” een consent-test. Een staande uitnodiging om te chillen kan als
          sociale druk voelen wanneer iemand hersteltijd nodig heeft, die MMMS koppelt aan betere mentale gezondheid
          wanneer die tijd er echt is. Gebruik een eenvoudige bezoekregel voor het tentamenblok: overnight guests 24
          uur van tevoren aankondigen, woonkamer-bijeenkomsten schrappen of verplaatsen als twee of meer huisgenoten de
          volgende ochtend tentamen hebben, en een expliciete opt-out zonder rechtvaardigingsessay in de groepsapp.
          Geschreven normen helpen; zie{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsappen, huisregels</Link>.
        </p>

        <h2>Hoe je vraagt zonder een conflictspiraal te starten</h2>

        <p>
          Verzoeken mislukken wanneer ze als karakteroordelen binnenkomen (“jij bent zo luid”) in plaats van als
          operationele behoefte (“ik heb om 09:00 tentamen; kunnen we vanavond na 22:00 de woonkamer stil houden?”).
          Begin met de datum, het uur en de ruil: bied een luidere avond na de uitslagenweek aan, of neem een extra
          schoonmaakbeurt. Als de spanning al hoog is, gebruik de de-escalatiepatronen in{' '}
          <Link href="/blog/roommate-conflict-resolution-tips-netherlands">
            Roommate conflict oplossen
          </Link>{' '}
          in plaats van klachten te stapelen in één middernachtelijk bericht.
        </p>

        <p>
          Emotionele steun tussen huisgenoten is een aparte onderhandeling, behandeld in{' '}
          <Link href="/blog/housemate-support-living-away-from-home">
            Steun van huisgenoten als je uit huis woont
          </Link>
          . Tentamenweek-regels zijn smaller: bescherm slaap, studieblokken en hersteltijd zodat steungesprekken
          überhaupt mogelijk blijven.
        </p>

        <h2>Wat instellingen en huisbesturen kunnen doen</h2>

        <p>
          Studentenhuizen, verenigingen en campus-huisvesters publiceren vaak algemene huisregels en missen seizoens-
          overlays. Een éénpagina “tentamenweek-addendum” - stilte-uren, bezoeklimieten, keukenvensters en een
          contactpersoon voor bemiddeling - kost weinig en sluit aan bij wat nationale monitoring zegt over
          studiestress en de waarde van hersteltijd. MMMS-2025 kader studentenwelzijn deels als omgevingsvraagstuk.
          In tentamenperiodes is het micromilieu van een gedeelde flat een van de weinige omgevingen die studenten in
          een week echt kunnen heronderhandelen.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-600">
          Trimbos-instituut. (2025, 20 november). Mentale gezondheid hbo- en wo-studenten is licht verbeterd.{' '}
          <a
            href="https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/actueel/nieuws/mentale-gezondheid-hbo-en-wo-studenten-is-licht-verbeterd/
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut, RIVM &amp; GGD GHOR Nederland. (2025). Monitor Mentale gezondheid en Middelengebruik
          Studenten hbo en wo 2025.{' '}
          <a
            href="https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.rivm.nl/bibliotheek/rapporten/2025-0106.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          Trimbos-instituut, ECIO &amp; RIVM. (2025). Harder Better Faster Stronger?{' '}
          <a
            href="https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf"
            target="_blank"
            rel="noreferrer"
          >
            https://www.trimbos.nl/wp-content/uploads/2025/10/AF2084-Harder-Better-Faster-Stronger.pdf
          </a>
        </p>
        <p className="text-sm text-slate-600">
          vtwonen. Ergernissen in een studentenhuis + oplossingen.{' '}
          <a
            href="https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48"
            target="_blank"
            rel="noreferrer"
          >
            https://www.vtwonen.nl/studentenkamer/ergernissen-studentenhuis-met-oplossingen~2c43d48
          </a>
        </p>
      </div>
    ),
  },
}

export function ExamWeekHouseRulesArticle() {
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
