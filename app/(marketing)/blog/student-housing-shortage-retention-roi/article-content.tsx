'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'Student Housing Shortage Is a Retention Line Item: What Dutch Data Says About Staying Home',
    excerpt:
      'Fewer students can move out, rents keep climbing, and international arrivals face long searches. Here is why that is not only a market problem, but a measurable risk to wellbeing, completion, and city talent pipelines.',
    publishDate: '2026-05-13',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'The Hidden Cost of the Wrong Roommate (It is Not Just Rent)',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'See how preventable housing friction shows up in deposits, moves, and academic load, and why compatibility work pays off before you sign.',
      },
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Practical steps for the Dutch student market, from verification to behaviour-based questions you can reuse in intake.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'Learn how Domu Match turns lifestyle signals into transparent compatibility scores for students and operators.',
      },
    ],
    ctaTitle: 'Turn housing intake into a retention asset',
    ctaDescription:
      'Domu Match helps universities, housing partners, and students align on habits and boundaries early, before conflict becomes a withdrawal risk.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Get Started',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          If you still treat student housing as a side office that forwards links to Facebook groups, the last eighteen months of Dutch headlines should
          force a reset. Reporting from{' '}
          <a href="https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/" target="_blank" rel="noreferrer">
            DutchNews.nl (September 2025)
          </a>{' '}
          and follow-up coverage in{' '}
          <a href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/" target="_blank" rel="noreferrer">
            February 2026
          </a>{' '}
          describes the same structural squeeze: more young people want to live near campus, fewer regulated rooms are available, and a growing share
          stay at the parental home for longer stretches of their degree. That is not a lifestyle preference story alone. It is a throughput story for
          cities, institutions, and any team responsible for student success.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt="Students on a university campus with buildings in the background"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            When stable rooms disappear, the hidden invoice shows up in commutes, counselling queues, and completion risk, not only in rent tables.
          </figcaption>
        </figure>

        <h2>What the numbers imply for “student experience” budgets</h2>

        <p>
          The public narrative often stops at average rent per square metre or wait-list length. The operational narrative should go further. Students
          who cannot secure predictable housing spend cognitive bandwidth on logistics instead of coursework. They travel longer, socialise less on
          campus, and hit wellbeing services with stressors that look like anxiety on the intake form but trace back to eviction fear, discrimination in
          listings, or a third month of crashing on a sofa. DutchNews reporting tied the shortage to students remaining at home and described ripple
          effects on study patterns and emotional strain, not only on monthly housing spend (
          <a href="https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/" target="_blank" rel="noreferrer">
            DutchNews.nl, 2025
          </a>
          ). That is the bridge between bricks-and-mortar policy and your retention dashboard.
        </p>

        <p>
          For municipalities, the hidden cost is talent friction. Graduates who never managed to anchor locally are less likely to pay local tax,
          join early-career hiring pools, or fill the small rooms that keep neighbourhoods mixed-age. For universities, the hidden cost is support
          load: every unstable tenancy is a potential case file across study advisers, legal aid, international office check-ins, and peer mentors who
          burn out when the root issue is structural scarcity, not a single bad flatmate week.
        </p>

        <h2>International students: satisfaction can coexist with a broken intake path</h2>

        <p>
          Surveys of international students often show high satisfaction with academic quality while still flagging housing as a primary pain point. A{' '}
          <a href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/" target="_blank" rel="noreferrer">
            DutchNews.nl overview in March 2026
          </a>{' '}
          fits that pattern: overall sentiment can read positive while accommodation search times, information gaps, and perceived unfairness in the
          private market remain acute. Trade reporting has highlighted long search durations and discrimination in listings for non-Dutch applicants (
          <a
            href="https://internationalinvestment.biz/en/netherlands/7655-dutch-housing-crunch-hits-international-students.html"
            target="_blank"
            rel="noreferrer"
          >
            International Investment, Netherlands coverage
          </a>
          ). Those are not “soft” issues. They are onboarding defects that show up as late arrivals, missed induction, weaker cohort bonding in week
          one, and higher propensity to leave after year one even when grades are fine.
        </p>

        <p>
          If your institution markets global classrooms but routes housing to informal channels, you are externalising risk to seventeen-year-old group
          chats and landlord WhatsApp threads. That is fragile at scale.
        </p>

        <h2>Where community infrastructure earns ROI</h2>

        <p>
          Building more beds is the long game. The medium game is to make every existing bed less likely to blow up socially. That is where roommate
          and house-fit infrastructure stops being a consumer nice-to-have and becomes a retention lever. When students match on{' '}
          <strong>sleep, guests, cleaning cadence, and conflict style</strong> before they sign, you reduce the preventable slice of housing-driven
          transfers, silent withdrawals, and mid-semester moves that do not always surface as “housing” in your CRM.
        </p>

        <p>
          Domu Match is built for that layer: transparent, behaviour-first questionnaires, explainable compatibility signals, and flows that work for
          individuals while also supporting partners who want repeatable intake instead of one-off PDFs. The point is not to replace supply policy. It
          is to stop treating compatibility as luck once a scarce key is finally handed over.
        </p>

        <ul>
          <li>
            <strong>Publish clear behavioural baselines</strong> alongside room offers so expectations are comparable, not vibes-only.
          </li>
          <li>
            <strong>Pair international orientation</strong> with structured matching touchpoints, not only a link to classifieds.
          </li>
          <li>
            <strong>Measure what matters</strong>: time-to-stable-room, repeat counselling contacts tagged housing-adjacent, and voluntary room changes
            in weeks one to six.
          </li>
        </ul>

        <h2>A practical agenda for decision makers this month</h2>

        <p>
          If you sit on a university executive team or a city economic board, ask three questions in your next housing workstream: First, what share
          of our students still lack a signed lease four weeks before arrival, and how does that split by faculty and nationality? Second, which
          support teams see the overflow when the answer is “sofa, hotel, or home two hours away”? Third, what single intake upgrade (verification,
          behavioural questionnaire, or certified match partner) could we pilot before autumn intake without waiting for new concrete?
        </p>

        <p>
          Students deserve honesty about scarcity. They also deserve systems that do not waste the rooms that already exist on preventable
          incompatibility. Explore how Domu Match fits your stack on our{' '}
          <Link href="/how-it-works">how it works</Link> page, or route cohorts straight into matching from{' '}
          <Link href="/matches">the matching experience</Link>.
        </p>

        <h2>Sources</h2>

        <p className="text-sm text-slate-300">
          DutchNews.nl. (2025, September 16). More students are stuck at home as housing shortage grows.{' '}
          <a
            href="https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/
          </a>
        </p>
        <p className="text-sm text-slate-300">
          DutchNews.nl. (2026, February 4). High prices and room shortages lead more students to stay home.{' '}
          <a href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/" target="_blank" rel="noreferrer">
            https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/
          </a>
        </p>
        <p className="text-sm text-slate-300">
          DutchNews.nl. (2026, March 6). Most international students are happy but housing is a big issue.{' '}
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/
          </a>
        </p>
        <p className="text-sm text-slate-300">
          International Investment. Dutch housing crunch hits international students.{' '}
          <a
            href="https://internationalinvestment.biz/en/netherlands/7655-dutch-housing-crunch-hits-international-students.html"
            target="_blank"
            rel="noreferrer"
          >
            https://internationalinvestment.biz/en/netherlands/7655-dutch-housing-crunch-hits-international-students.html
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Studentenhuisvesting als retentiepost: wat Nederlandse cijfers zeggen over thuiswonen',
    excerpt:
      'Krapte en hoge huren duwen meer studenten langer thuis of ver weg van campus. Dat raakt niet alleen portemonnee, maar ook studiesucces, welzijn en internationale werving.',
    publishDate: '2026-05-13',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'Van borg tot verhuizing: waarom compatibiliteit vóór het tekenen goedkoper is dan een jaar frictie.',
      },
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Praktische stappen voor de Nederlandse markt, inclusief gedragsgerichte vragen voor intake.',
      },
      {
        title: 'Zo werkt onze matching',
        href: '/how-it-works',
        description:
          'Lees hoe Domu Match leefstijl en voorkeuren omzet in uitlegbare scores.',
      },
    ],
    ctaTitle: 'Maak huisvestingsintake een retentie-instrument',
    ctaDescription:
      'Domu Match helpt onderwijsinstellingen, partners en studenten vroeg te alignen op gewoontes en grenzen.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Nederlandse berichtgeving laat een hard patroon zien: meer studenten blijven thuiswonen of worstelen lang met een kamer, terwijl huren
          verder oplopen. Volgens{' '}
          <a href="https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/" target="_blank" rel="noreferrer">
            DutchNews.nl (september 2025)
          </a>{' '}
          en vervolg in{' '}
          <a href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/" target="_blank" rel="noreferrer">
            februari 2026
          </a>{' '}
          raakt dat niet alleen individuele budgetten, maar ook reistijd, sociale binding op campus en mentale belasting. Voor gemeenten en hogescholen
          is dat een throughput- en welzijnsvraagstuk, niet alleen een woningmarktgrafiek.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt="Studenten op een universiteitscampus"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Stabiliteit op de kamer bepaalt mee of ondersteuning naar studie gaat of naar crisislogistiek.
          </figcaption>
        </figure>

        <h2>Internationale studenten: tevreden, maar vaak lang zoeken</h2>

        <p>
          Onderzoek in de media laat zien dat internationale studenten hun opleiding vaak waarderen, terwijl huisvesting toch een hoofdpijndossier
          blijft (
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews.nl, maart 2026
          </a>
          ). Aanvullend wordt gewezen op lange zoektijden en problemen op de vrije markt (
          <a
            href="https://internationalinvestment.biz/en/netherlands/7655-dutch-housing-crunch-hits-international-students.html"
            target="_blank"
            rel="noreferrer"
          >
            International Investment
          </a>
          ). Laatkomers missen netwerkmomenten in week één, wat indirect op retentie en stadskanalen drukt.
        </p>

        <h2>Waar community- en matchinfra terugverdient</h2>

        <p>
          Nieuwbouw duurt jaren. Elke bestaande kamer verliezen aan voorspelbare huisgenootconflicten is verspilde capaciteit. Domu Match richt zich op
          gedrag: slaap, gasten, schoonmaak en conflictaanpak vóór het contract. Dat vervangt geen beleid voor meer kamers, maar verkleint de
          voorkombare frictie waar beleid alleen niet bij stil staat.
        </p>

        <p>
          Lees meer op{' '}
          <Link href="/how-it-works">Zo werkt het</Link> of start bij{' '}
          <Link href="/matches">matchen</Link>.
        </p>

        <h2>Bronnen</h2>

        <p className="text-sm text-slate-300">
          DutchNews.nl. (2025, 16 september). More students are stuck at home as housing shortage grows.{' '}
          <a
            href="https://www.dutchnews.nl/2025/09/more-students-are-stuck-at-home-as-housing-shortage-grows/"
            target="_blank"
            rel="noreferrer"
          >
            Link
          </a>
        </p>
        <p className="text-sm text-slate-300">
          DutchNews.nl. (2026, 4 februari). High prices and room shortages lead more students to stay home.{' '}
          <a href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/" target="_blank" rel="noreferrer">
            Link
          </a>
        </p>
        <p className="text-sm text-slate-300">
          DutchNews.nl. (2026, 6 maart). Most international students are happy but housing is a big issue.{' '}
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            Link
          </a>
        </p>
        <p className="text-sm text-slate-300">
          International Investment. Dutch housing crunch hits international students.{' '}
          <a
            href="https://internationalinvestment.biz/en/netherlands/7655-dutch-housing-crunch-hits-international-students.html"
            target="_blank"
            rel="noreferrer"
          >
            Link
          </a>
        </p>
      </div>
    ),
  },
}

export function StudentHousingRetentionRoiArticle() {
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
