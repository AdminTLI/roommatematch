'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Student Housing Search Abandonment in the Netherlands',
    excerpt:
      'Kences reports that fewer Dutch students even try to find a room. When 44% live away but only 49% still want to, the gap between measured shortage and lived scarcity widens.',
    publishDate: '2026-08-19',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'More Dutch Students Live at Home',
        href: '/blog/thuiswonend-studenten-nederland-cbs-data',
        description:
          'CBS cohort data on students who never move out during a degree, and what that shift means for cities.',
      },
      {
        title: 'Student Housing Loneliness in the Netherlands',
        href: '/blog/student-housing-loneliness-netherlands',
        description:
          'How room scarcity reshapes social isolation when fewer students can access shared housing.',
      },
      {
        title: 'Graduate Holdover and the Housing Pipeline',
        href: '/blog/graduate-holdover-student-housing-netherlands',
        description:
          'Why graduates who cannot leave student rooms make the queue longer for everyone behind them.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing policy often tracks a single question: how many rooms are missing? In the 2025
          Landelijke Monitor Studentenhuisvesting (LMS), Kences, the national knowledge centre for student
          housing, reported a theoretical shortage of roughly <strong>21,500</strong> rooms (
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ;{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That headline is severe. But the same monitor describes a quieter shift that makes the crisis feel
          worse on campus than the spreadsheet suggests:{' '}
          <strong>student housing search abandonment</strong>, the tendency for students to stop looking for a
          room when years of scarcity teach them the market will not deliver.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Dutch student city skyline — student housing search abandonment when room supply shrinks in university towns"
          />
          <figcaption>
            When search effort falls, vacancy dashboards look calmer than student life on the ground.
          </figcaption>
        </figure>

        <h2>What search abandonment means in housing data</h2>

        <p>
          Housing economists distinguish between <em>expressed demand</em> (students who actively search) and{' '}
          <em>latent demand</em> (students who want a room but no longer believe one is reachable). Kences
          director Jolan de Bie told NOS that students are giving up hope of securing a room (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The monitor shows the mechanism in two parallel trends among Dutch hbo and wo students: the share
          who actually live away from home, and the share who say they want to.
        </p>

        <p>
          Eight years ago, <strong>52 percent</strong> of Dutch hbo and wo students lived in rented student
          housing while <strong>59 percent</strong> said they wanted to. In the 2025 monitor year, only{' '}
          <strong>44 percent</strong> lived away and <strong>49 percent</strong> still wanted to (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). The living-away share fell by eight percentage points. The desire to live away fell by ten. That
          second drop is the abandonment signal: fewer students are willing to treat room hunting as a realistic
          project.
        </p>

        <p>
          The chart below puts those four monitor figures side by side. Notice that the gap between
          &quot;want to live away&quot; and &quot;actually live away&quot; narrowed not because more students
          secured rooms, but because fewer students still report the wish.
        </p>

        <BlogBarChart
          data={[
            { label: '8 yrs ago (living away)', value: 52 },
            { label: 'Now (living away)', value: 44 },
            { label: '8 yrs ago (want to)', value: 59 },
            { label: 'Now (want to)', value: 49 },
          ]}
          yLabel="Share of Dutch hbo/wo students"
          unit="%"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting 2025, reported via NOS, September 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Why official shortage figures understate pressure</h2>

        <p>
          Kences calculates shortage as measured supply minus expressed demand among students who still search.
          When chronic scarcity suppresses that demand, the theoretical shortage can look stable even as lived
          scarcity intensifies. Kences explicitly notes that the lowered share of students who say they want to
          live away makes the <em>experienced</em> shortage much larger than the theoretical one (
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ).
        </p>

        <p>
          NOS reported the headline shortage at roughly <strong>21,000</strong> rooms while stressing that the
          practical gap is higher because fewer students admit they are searching, because graduates occupy
          rooms meant for enrolled students, and because mbo students who want to leave home are excluded from
          the count (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Search abandonment sits in the first of those three gaps. It is the reason intake counsellors hear
          &quot;I stopped looking&quot; more often than &quot;I am on fifteen waiting lists.&quot;
        </p>

        <h2>MBO demand still missing from the national ledger</h2>

        <p>
          The LMS has begun reporting mbo students aged twenty-five and younger, who account for about{' '}
          <strong>10 percent</strong> of students living away from home (
          <a
            href="https://www.kences.nl/publicaties/landelijke-monitor-studentenhuisvesting-2024/"
            target="_blank"
            rel="noreferrer"
          >
            Kences LMS 2024, 2024
          </a>
          ). Because mbo housing figures are not yet fully comparable with higher-education totals,{' '}
          <strong>mbo students who want to leave home are not included in the national shortage figure</strong>{' '}
          (
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ). That omission matters for cities with large vocational colleges. A student who stops searching
          before national statistics count them still experiences the same housing stress.
        </p>

        <p>
          Institutions publishing local guidance on housing markets, as summarised in the{' '}
          <Link href="/universities">university and city overview</Link>, increasingly route students toward
          realistic timelines rather than optimistic intake brochures. The editorial approach behind that
          guidance is described on the <Link href="/about">about page</Link>.
        </p>

        <h2>Supply loss keeps teaching the abandonment lesson</h2>

        <p>
          Search abandonment is not only psychology. It follows a supply curve that keeps moving backward. In
          the nineteen largest student cities, Kences estimated total room supply at{' '}
          <strong>322,400</strong>, down about <strong>13,500</strong> units from the previous academic year (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Roughly <strong>5,000</strong> new student rooms were built, but about <strong>17,800</strong>{' '}
          fewer students lived in private rental student housing than a year earlier as landlords sold
          properties after rental reforms (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ;{' '}
          <a
            href="https://www.kences.nl/publicaties/steeds-minder-studentenkamers-in-de-grote-steden/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ).
        </p>

        <p>
          A deeper analysis commissioned by Kences found that private sales concentrated in Amsterdam (
          <strong>2,080</strong> rooms), Rotterdam (<strong>1,025</strong>), and Utrecht (
          <strong>810</strong>) between the first quarter of 2024 and the first quarter of 2025 (
          <a
            href="https://www.kences.nl/publicaties/steeds-minder-studentenkamers-in-de-grote-steden/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ). When sales run at one and a half times last year&apos;s pace, students learn quickly that waiting
          lists are not temporary queues. They are semi-permanent fixtures. Maaike Krom of the national student
          union LSVb told NOS that wellbeing erodes when students spend study years juggling finances instead of
          coursework (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <h2>Wellbeing when the search ends before a lease begins</h2>

        <p>
          De Bie warned NOS that students who remain at home miss part of their social-emotional development and
          can feel partially outside student life, with network effects that later touch labour-market access (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That aligns with broader reporting on{' '}
          <Link href="/blog/student-housing-loneliness-netherlands">
            housing-linked loneliness among Dutch students
          </Link>
          : isolation is not only about who shares your kitchen. It is also about whether you ever reach the
          kitchen at all.
        </p>

        <p>
          For students who do secure a room, abandonment among peers reshapes house culture. Shared flats become
          harder to staff with stable cohorts when turnover is blocked by graduates who cannot move on, a
          pipeline issue explored in our reporting on{' '}
          <Link href="/blog/graduate-holdover-student-housing-netherlands">
            graduate holdover in student housing
          </Link>
          . The student who &quot;got lucky&quot; may still live beside someone who stopped applying two years
          ago and now commutes three hours by train.
        </p>

        <h2>Forward projections and policy responses</h2>

        <p>
          Even with expected declines in future student numbers, Kences raised its shortage projection to{' '}
          <strong>26,000 to 63,200</strong> rooms by 2032-2033, driven mainly by continued private sales (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Policymakers responded in 2026 with construction acceleration, including a target to raise
          prefabricated new homes from just over <strong>20 percent</strong> of builds to half within four
          years, partial relaxation of the Wet betaalbare huur, and temporary rental contracts for all
          students rather than only those from outside the municipality (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). LSVb continues to press municipalities to ease house-sharing rules that block splitting existing
          homes into additional rooms (
          <a
            href="https://nos.nl/regio/utrecht/artikel/750805-in-strijd-tegen-kamertekort-wil-studentenbond-dat-woningdelen-makkelijker-wordt"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Those supply measures matter because abandonment is learned behaviour. When students see five
          thousand new rooms offset by tens of thousands of sales, the rational response is to downgrade
          expectations early. Rebuilding search confidence requires visible, sustained net additions, not only
          policy announcements.
        </p>

        <h2>What institutions should measure instead of waiting lists alone</h2>

        <p>
          Housing officers who only track active housing applications will undercount risk. Useful complementary
          indicators include the share of first-year students who never open a housing portal account, survey
          items on whether students consider moving out realistic, and counselling tags that mention commute
          fatigue or parental-home isolation. Those signals surface abandonment before it appears in Kences
          shortage arithmetic.
        </p>

        <p>
          Student housing search abandonment in the Netherlands is not a story about lazy applicants. It is a
          market feedback loop: sustained scarcity trains cohorts to treat independent living as optional, which
          in turn makes national shortage figures look smaller than the lived experience on campus. Until net
          supply stabilises, the quietest statistic in the LMS may remain the one that never makes a headline:
          the shrinking share of students who still believe a room is possible.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          Kences. (2025). <em>Student geeft kamerzoektocht op</em>. Retrieved from{' '}
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/
          </a>
        </p>

        <p className="text-sm text-slate-600">
          Kences. (2025). <em>Steeds minder studentenkamers in de grote steden</em>. Retrieved from{' '}
          <a
            href="https://www.kences.nl/publicaties/steeds-minder-studentenkamers-in-de-grote-steden/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.kences.nl/publicaties/steeds-minder-studentenkamers-in-de-grote-steden/
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2025). <em>Steeds meer studenten geven de hoop om een kamer te vinden op</em>. Retrieved from{' '}
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op
          </a>
        </p>

        <p className="text-sm text-slate-600">
          NOS. (2026). <em>Kabinet wil sneller bouwen met prefabwoningen en versoepelt de huurwet</em>.
          Retrieved from{' '}
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
    title: 'Studenten die stoppen met kamer zoeken: wat de cijfers missen',
    excerpt:
      'Kences ziet dat minder studenten nog op kamers zoeken. 44 procent woont uit, 49 procent wil dat nog - maar het tekort in de praktijk is groter dan het officiële cijfer.',
    publishDate: '2026-08-19',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Meer thuiswonende studenten',
        href: '/blog/thuiswonend-studenten-nederland-cbs-data',
        description:
          'CBS-data over studenten die hun hele studie thuis wonen en wat dat betekent voor steden.',
      },
      {
        title: 'Eenzaamheid en studentenhuisvesting',
        href: '/blog/student-housing-loneliness-netherlands',
        description:
          'Hoe krapte op de kamermarkt sociale isolatie versterkt wanneer minder studenten samenwonen.',
      },
      {
        title: 'Afgestudeerd maar niet vertrokken',
        href: '/blog/graduate-holdover-student-housing-netherlands',
        description:
          'Waarom afgestudeerden die blijven zitten de wachtrij voor nieuwe studenten verlengen.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Nederlands studentenhuisvestingsbeleid volgt vaak één vraag: hoeveel kamers missen we? In de Landelijke
          Monitor Studentenhuisvesting (LMS) 2025 meldt Kences een theoretisch tekort van circa{' '}
          <strong>21.500</strong> kamers (
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ). Ernstig genoeg. Maar dezelfde monitor beschrijft een stillere verschuiving:{' '}
          <strong>studenten die stoppen met zoeken</strong> wanneer jaren van krapte hen leren dat de markt niet
          levert.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="housingCityscape"
            alt="Skyline van een Nederlandse studentenstad — minder studenten zoeken een kamer bij aanhoudend tekort"
          />
          <figcaption>
            Wanneer zoekgedrag afneemt, zien dashboards rustiger dan het studentenleven op straat.
          </figcaption>
        </figure>

        <h2>Wat &quot;zoeken opgeven&quot; betekent in de data</h2>

        <p>
          Kences-directeur Jolan de Bie zei aan NOS dat studenten de hoop opgeven om een kamer te vinden (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Acht jaar geleden woonde <strong>52 procent</strong> van de Nederlandse hbo- en wo-studenten op
          kamers en <strong>59 procent</strong> wilde dat. In 2025 woont <strong>44 procent</strong> uit en{' '}
          <strong>49 procent</strong> wil nog uitwonen. De wens daalde harder dan het uitwonende aandeel - dat is
          het signaal dat minder studenten kamerzoeken als realistisch project zien.
        </p>

        <BlogBarChart
          data={[
            { label: '8 jr geleden (woont uit)', value: 52 },
            { label: 'Nu (woont uit)', value: 44 },
            { label: '8 jr geleden (wil uit)', value: 59 },
            { label: 'Nu (wil uit)', value: 49 },
          ]}
          yLabel="Aandeel Nederlandse hbo/wo-studenten"
          unit="%"
          caption="Bron: Kences LMS 2025, via NOS, september 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h2>Waarom het officiële tekort het druktebeeld onderschat</h2>

        <p>
          Kences berekent tekort als aanbod minus uitgesproken vraag. Wanneer krapte die vraag onderdrukt, kan
          het theoretische tekort stabiel lijken terwijl de ervaren krapte groeit. Thuiswonende mbo-studenten met
          uitwonende wens zitten nog niet in het totaalcijfer (
          <a
            href="https://www.kences.nl/nieuws/student-geeft-kamerzoektocht-op/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ). NOS benadrukt dat het praktijktekort hoger is door minder zoekers, afgestudeerden die blijven zitten
          en uitgesloten mbo-vraag (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <p>
          Instellingen die lokale huisvestingsinformatie publiceren, zoals samengevat op{' '}
          <Link href="/universities">universiteiten en steden</Link>, wijzen studenten steeds vaker op realistische
          tijdlijnen. De redactionele context staat op de <Link href="/about">about-pagina</Link>.
        </p>

        <h2>Aanbod dat achteruitgaat</h2>

        <p>
          In negentien studiesteden schat Kences het aanbod op <strong>322.400</strong> kamers, circa{' '}
          <strong>13.500</strong> minder dan vorig jaar. Er kwamen circa <strong>5.000</strong> kamers bij, maar{' '}
          <strong>17.800</strong> minder studenten woonden in particuliere studentenhuur na verkoop door
          verhuurders (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Verkopen concentreerden in Amsterdam, Rotterdam en Utrecht (
          <a
            href="https://www.kences.nl/publicaties/steeds-minder-studentenkamers-in-de-grote-steden/"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2025
          </a>
          ).
        </p>

        <h2>Welzijn en vooruitzicht</h2>

        <p>
          De Bie waarschuwde dat thuiswonende studenten sociaal-emotionele ontwikkeling missen (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Dat sluit aan bij{' '}
          <Link href="/blog/student-housing-loneliness-netherlands">
            eenzaamheid rond studentenhuisvesting
          </Link>{' '}
          en{' '}
          <Link href="/blog/graduate-holdover-student-housing-netherlands">
            holdover na afstuderen
          </Link>
          . Kences verhoogde de prognose naar <strong>26.000 tot 63.200</strong> kamers tekort in 2032-2033 (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Het kabinet kondigde in 2026 versnelde bouw en versoepeling van tijdelijke studentencontracten aan (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ).
        </p>

        <p>
          Zoeken opgeven is geleerd gedrag. Tot het netto-aanbod stabiel groeit, blijft het stille LMS-signaal
          het aandeel studenten dat uitwonen nog als mogelijk ziet.
        </p>
      </div>
    ),
  },
}

export function StudentHousingSearchAbandonmentArticle() {
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
