'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { BlogBarChart } from '@/components/marketing/blog-bar-chart'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Graduate Holdover: The Hidden Student Housing Bottleneck',
    excerpt:
      'When graduates cannot leave student rooms, the pipeline stalls for everyone behind them. Kences monitoring data, CBS housing flows, and recent policy shifts explain why the Dutch shortage is deeper than vacancy headlines suggest.',
    publishDate: '2026-08-12',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'Student Housing Shortage and Retention',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'How national room scarcity connects to students staying home and institutions measuring persistence risk.',
      },
      {
        title: 'International Student Housing in the Netherlands',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Why accommodation friction is an integration indicator, not a side file in internationalisation policy.',
      },
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'When housing stress shows up as academic load, deposits, and mid-semester moves rather than a labelled housing case.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Dutch student housing debates often focus on how many rooms are missing: roughly{' '}
          <strong>21,000</strong> according to Kences, the national knowledge centre for student housing, as
          reported by NOS in September 2025 (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). That headline figure is serious enough. But the same monitor describes a quieter mechanism that
          makes the crisis feel worse in practice than on paper:{' '}
          <strong>graduate holdover</strong>, the share of finished students who remain in rooms meant for
          people still enrolled.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Graduate reviewing rental documents at a desk, transition from student room to general housing market"
          />
          <figcaption>
            A signed lease is only the first step. When graduates cannot move on, the room behind them never
            opens.
          </figcaption>
        </figure>

        <h2>What graduate holdover means in the data</h2>

        <p>
          In the Landelijke Monitor Studentenhuisvesting, Kences reported that{' '}
          <strong>57 percent of graduates still lived in their student room one year after finishing</strong>{' '}
          (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). They are not blocking turnover because they prefer campus life. They are stuck: the general rental
          and owner-occupier markets that should absorb young professionals are themselves under pressure.
          Statistics Netherlands (CBS) reported in 2026 that only{' '}
          <strong>96,000 people under 25</strong> entered the housing market after leaving the parental home in
          2024, down from <strong>125,000</strong> in 2023 (
          <a
            href="https://www.cbs.nl/en-gb/news/2026/17/fewer-young-people-entering-the-housing-market"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ). Among 25- to 34-year-olds, the number living with parents rose by{' '}
          <strong>5.6 percent</strong> in the same period (
          <a
            href="https://www.cbs.nl/en-gb/news/2026/17/fewer-young-people-entering-the-housing-market"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ).
        </p>

        <p>
          Holdover is therefore not a moral story about graduates refusing to grow up. It is inventory
          accounting. Every graduate who cannot exit a regulated or student-labelled room is one fewer
          turnover event for an incoming first-year. In cities where institutions already report early
          drop-outs linked to housing, such as Eindhoven, where TU/e leadership cited roughly{' '}
          <strong>500 students</strong> ending studies early in September for lack of a room (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ), holdover sits on the same ledger as new construction delays.
        </p>

        <h2>The wish-versus-reality gap is widening</h2>

        <p>
          Kences also tracks how many students actually live out versus how many say they want to. Eight years
          before the 2025 monitor, <strong>52 percent</strong> of students lived in a rented room and{' '}
          <strong>59 percent</strong> wanted to. By 2025, only <strong>44 percent</strong> lived out while{' '}
          <strong>49 percent</strong> still wanted to (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Kences concluded that more students are effectively giving up the search, which means published
          shortage figures understate demand (
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
          The chart below compares those four monitor figures side by side. The gap between wanting a room and
          having one has narrowed not because ambition fell, but because attainment did.
        </p>

        <BlogBarChart
          data={[
            { label: '2017 lived out', value: 52 },
            { label: '2017 wanted out', value: 59 },
            { label: '2025 lived out', value: 44 },
            { label: '2025 wanted out', value: 49 },
          ]}
          yLabel="Share of students"
          valueFormat="percent"
          caption="Source: Kences Landelijke Monitor Studentenhuisvesting, reported by NOS, September 2025. https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
        />

        <h3>Supply loss compounds the bottleneck</h3>

        <p>
          Holdover would be painful even if the stock stayed flat. It did not. NOS relayed Kences estimates
          that roughly <strong>5,000</strong> student rooms were built, yet{' '}
          <strong>17,800 fewer students</strong> lived in the private rental segment than the previous academic
          year, and total room supply across twenty student cities fell by about{' '}
          <strong>13,500</strong> to roughly <strong>322,400</strong> (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Reporting on the Wet Betaalbare Huur linked part of that divestment to landlords selling
          properties after rent-cap rules reduced returns (
          <a
            href="https://nos.nl/nieuwsuur/artikel/2573960-door-nieuwe-verhuurregels-komen-studenten-nog-moeilijker-aan-een-kamer"
            target="_blank"
            rel="noreferrer"
          >
            NOS Nieuwsuur, 2025
          </a>
          ). Kamernet separately reported average student room rents at about <strong>683 euros</strong> per
          month in early 2025, up more than <strong>6 percent</strong> year on year (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ).
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Shared student kitchen with multiple place settings, turnover depends on who can move in next"
          />
          <figcaption>
            Student rooms are a conveyor belt. When the exit is blocked, the entrance jams for the cohort
            behind.
          </figcaption>
        </figure>

        <h2>Why this is a wellbeing and equity issue, not only a planning spreadsheet</h2>

        <p>
          Kences director Jolan de Bie told NOS that students forced to stay at home miss part of their
          social-emotional development, and that standing partly outside student life can feed isolation and
          lower self-image, with network effects that later touch labour-market access (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). CBS cohort research on higher education students who started before age twenty shows the same
          housing pressure from another angle: among those who graduated in 2016, <strong>63 percent</strong>{' '}
          still lived with parents after the first study year; by the 2023 graduating cohort that figure was{' '}
          <strong>79 percent</strong>, and after three years of study the share living at home rose from{' '}
          <strong>43 percent</strong> to <strong>60 percent</strong> (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ).
        </p>

        <p>
          The pattern is sharper at universities of applied sciences (hbo) than at research universities (wo):
          among hbo graduates, the share who never moved out during a five-year programme rose from{' '}
          <strong>41 percent</strong> in 2016 to <strong>55 percent</strong> in 2023, compared with{' '}
          <strong>19 percent</strong> to <strong>32 percent</strong> among wo graduates (
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ). Holdover at the top of the pipeline and thuiswonen at the bottom squeeze the same middle cohort:
          students who do secure a room but face unstable housemates, rising rents, or the fear of having nowhere
          to go after graduation. For context on how that friction surfaces in daily life, see our earlier
          reporting on{' '}
          <Link href="/blog/move-in-week-red-flags">move-in week warning signs</Link> and{' '}
          <Link href="/blog/student-housing-gap-retention-roi">housing gaps and retention</Link>.
        </p>

        <h2>Policy responses on the table in 2026</h2>

        <p>
          Policymakers are not treating the issue as static. Housing minister Mona Boekholt-O&apos;Sullivan
          announced measures in 2026 to
          speed construction, including a target to raise the share of prefabricated new homes from just over{' '}
          <strong>20 percent</strong> today to half of new builds within four years, alongside{' '}
          <strong>90 million euros</strong> for housing innovation (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). The same package includes a partial relaxation of the Wet Betaalbare Huur and a return to
          temporary rental contracts for all students, not only those from outside the municipality (
          <a
            href="https://nos.nl/artikel/2611199-kabinet-wil-sneller-bouwen-met-prefabwoningen-en-versoepelt-de-huurwet"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Kences had earlier argued that campus-style contracts tying tenancy to enrolment status could help
          turnover, while also calling on municipalities to ease house-sharing permits for up to three or
          four tenants (
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
          Municipal build programmes matter too. Eindhoven&apos;s plan for <strong>5,400</strong> new student
          homes over eight years, presented with TU/e, Fontys, and social landlords, is explicitly framed as
          talent retention for the Brainport region (
          <a
            href="https://nos.nl/artikel/2606070-eindhoven-gaat-5400-studentenwoningen-bouwen-om-kamertekort-tegen-te-gaan"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2026
          </a>
          ). Universities publishing guidance on local housing markets, as described in our{' '}
          <Link href="/universities">university city overview</Link>, remain part of the intake layer even when
          bricks-and-mortar timelines stretch across election cycles.
        </p>

        <h2>What students and institutions can read from the numbers</h2>

        <p>
          If you are searching for a room, the practical implication is timing. A market with holdover behaves
          like a queue where the front row moves slowly. Rooms that look vacant on paper may already be
          occupied by someone negotiating a move they cannot afford. Average advertised rents near{' '}
          <strong>683 euros</strong> (
          <a
            href="https://nos.nl/artikel/2566474-gemiddelde-kamerprijs-stijgt-tot-bijna-700-euro-aanbod-blijft-achter"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ) mean that even a successful match can strain budgets, which is why LSVb, the national student union,
          has highlighted fear of challenging unfair rents on temporary contracts (
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
          For housing officers and city planners, holdover suggests metrics beyond &quot;beds built this year&quot;.
          Useful indicators include median months-from-graduation to exit for campus-contract tenants, repeat
          counselling contacts tagged housing-adjacent among final-year students, and the share of incoming
          internationals without a signed lease four weeks before arrival. Those measures surface pipeline risk
          earlier than a single shortage headline.
        </p>

        <p>
          Graduate holdover will not disappear while the general market remains tight. But naming it clarifies
          why incremental construction can feel invisible on campus: new keys matter only when old keys are
          returned. Until young graduates can access starter homes and mid-market rentals, student cities will
          keep recycling the same scarcity downstream, no matter how many policy papers call housing a
          &quot;student experience&quot; issue.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-600">
          CBS. (2026). <em>Steeds meer studenten wonen hun hele studie thuis</em>. Retrieved from{' '}
          <a
            href="https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/nl-nl/nieuws/2026/06/steeds-meer-studenten-wonen-hun-hele-studie-thuis
          </a>
        </p>

        <p className="text-sm text-slate-600">
          CBS. (2026). <em>Fewer young people entering the housing market</em>. Retrieved from{' '}
          <a
            href="https://www.cbs.nl/en-gb/news/2026/17/fewer-young-people-entering-the-housing-market"
            target="_blank"
            rel="noreferrer"
          >
            https://www.cbs.nl/en-gb/news/2026/17/fewer-young-people-entering-the-housing-market
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
      </div>
    ),
  },
  nl: {
    title: 'Afgestudeerd maar niet vertrokken: het verborgen knelpunt in studentenhuisvesting',
    excerpt:
      'Kences meldt dat 57 procent van de afgestudeerden na een jaar nog in de studentenkamer woont. Zo legt holdover het kamertekort zwaarder op de schouders van nieuwe studenten.',
    publishDate: '2026-08-12',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'Kamertekort en studiesucces',
        href: '/blog/student-housing-shortage-retention-roi',
        description:
          'Hoe nationaal tekort samenhangt met thuiswonen en doorstroomrisico.',
      },
      {
        title: 'Internationale studenten en huisvesting',
        href: '/blog/international-student-housing-netherlands-isolation',
        description:
          'Waarom huisvesting een integratie-indicator is, niet een bijlage.',
      },
      {
        title: 'Verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'Wanneer woonstress zich uit als studieschade en verhuizingen.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Het debat over studentenhuisvesting draait vaak om het tekort: circa{' '}
          <strong>21.000</strong> kamers volgens Kences, zoals NOS in september 2025 berichtte (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). Minstens zo belangrijk is <strong>holdover</strong>: afgestudeerden die nog in een studentenkamer
          wonen omdat doorstromen naar de gewone woningmarkt niet lukt.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Afgestudeerde met huurcontract, overgang van studentenkamer naar reguliere woningmarkt"
          />
          <figcaption>
            Een getekend contract is pas het begin. Zolang afgestudeerden niet vertrekken, opent de kamer
            erachter niet.
          </figcaption>
        </figure>

        <p>
          Kences meldde dat <strong>57 procent</strong> van de afgestudeerden na een jaar nog in de
          studentenkamer woonde (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). CBS cijfers uit 2026 laten zien dat jongeren moeilijker de woningmarkt op komen: in 2024 ging{' '}
          <strong>96.000</strong> jongeren onder 25 van huis naar een huur- of koopwoning, tegen{' '}
          <strong>125.000</strong> in 2023 (
          <a
            href="https://www.cbs.nl/en-gb/news/2026/17/fewer-young-people-entering-the-housing-market"
            target="_blank"
            rel="noreferrer"
          >
            CBS, 2026
          </a>
          ).
        </p>

        <p>
          Tegelijkertijd woont een kleiner deel uit dan vroeger: <strong>44 procent</strong> op kamers tegen{' '}
          <strong>49 procent</strong> die dat wil, terwijl dat acht jaar eerder <strong>52</strong> en{' '}
          <strong>59 procent</strong> was (
          <a
            href="https://nos.nl/artikel/2581086-steeds-meer-studenten-geven-de-hoop-om-een-kamer-te-vinden-op"
            target="_blank"
            rel="noreferrer"
          >
            NOS, 2025
          </a>
          ). De grafiek in het Engelse artikel zet die vier monitorcijfers naast elkaar.
        </p>

        <p>
          Voor achtergrond over signalen in de eerste woonweek, zie{' '}
          <Link href="/blog/move-in-week-red-flags">red flags in je eerste woonweek</Link>. Over
          gemeentelijke en institutionele context:{' '}
          <Link href="/universities">universiteiten en steden</Link> en{' '}
          <Link href="/about">onze redactionele aanpak</Link>.
        </p>
      </div>
    ),
  },
}

export function GraduateHoldoverArticle() {
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
