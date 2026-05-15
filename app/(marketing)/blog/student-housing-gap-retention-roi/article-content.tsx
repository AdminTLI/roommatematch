'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title:
      'Beyond Beds: The Hidden ROI of Fixing Europe’s Student Housing Gap Before Retention Breaks',
    excerpt:
      'Room shortages and mismatch stress are not “market noise”. They are predictable drag on wellbeing, grades, and completion. Here is what institutions miss—and how early compatibility pays back.',
    publishDate: '2026-05-06',
    readTime: '9 min read',
    relatedLinks: [
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'See how financial losses stack up when compatibility is treated as optional.',
      },
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Practical steps for assessing lifestyle fit before you sign.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'Understand how Domu Match scores habits and boundaries transparently.',
      },
    ],
    ctaTitle: 'Treat Housing Like Academic Infrastructure',
    ctaDescription:
      'Match on routines and boundaries before move-in week chaos. Domu Match turns compatibility into an upfront decision—not a crisis managed in group chats.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Get Started',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          When classrooms reopen each autumn, leaders optimistically reset dashboards on retention and wellbeing. Too often, those dashboards ignore the{' '}
          <strong>quiet infrastructure underneath learning</strong>: where students sleep, whether they feel safe, and whether their housemates help them focus—or drain them before lectures begin.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
            alt="City skyline and residential buildings at dusk"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            A bed is not a strategy. Stable, compatible housing is an operating layer for academic performance and retention.
          </figcaption>
        </figure>

        <h2>The Market Signal Universities Cannot Wish Away</h2>

        <p>
          In the Netherlands, the student housing squeeze is now front-page economics. Reporting on CBS figures noted that among graduates in 2023,{' '}
          <strong>43% had lived with their parents throughout their studies</strong>, up from 31% for the cohort graduating in 2016—while{' '}
          <strong>79%</strong> of 2023 graduates were still at home after year one, compared with <strong>63%</strong> in 2016 (
          <a
            href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ). Parallel reporting describes landlords selling off thousands of student rooms and rents climbing sharply—context where “find housing” becomes a part-time job (
          <a
            href="https://www.dutchnews.nl/2025/11/private-landlords-sell-off-student-housing-worsening-shortage/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2025
          </a>
          ).
        </p>

        <p>
          For internationally mobile students—often carrying visa timelines and higher scam exposure—the signal is equally blunt. International enrolments have{' '}
          <strong>fallen for a third consecutive year</strong> (
          <a
            href="https://www.dutchnews.nl/2026/02/new-international-student-numbers-fall-for-third-year-in-a-row/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ), while surveys highlight housing search friction and dissatisfaction with information provision (
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ). These are not anecdotes; they are structural warnings that{' '}
          <strong>access and integration begin at the front door</strong>.
        </p>

        <h2>The Hidden Cost Stack (It Is Larger Than Rent)</h2>

        <p>
          Budget owners often anchor student housing debates to euros per square metre. That misses the productivity ledger. Noise, overcrowding, landlord instability, and roommate conflict{' '}
          <strong>tax attention</strong>—the same scarce resource lectures compete for. Students experiencing housing stress show up tired, avoid campus, delay coursework, and disengage from cohort belonging—the upstream drivers of persistence.
        </p>

        <p>
          Peer-reviewed work reinforces the mechanism. A 2025 structural equation study of tertiary students reported that{' '}
          <strong>inadequate housing was significantly associated with poorer mental health</strong>, and that mental health was positively associated with academic performance—indicating that{' '}
          <strong>poorer housing links to weaker outcomes through mental health pathways</strong> (
          <a
            href="https://www.frontiersin.org/articles/10.3389/feduc.2025.1627192/full"
            target="_blank"
            rel="noreferrer"
          >
            Imran et al., 2025, <em>Frontiers in Education</em>
          </a>
          ). You do not need a controversial thesis to act on that evidence: if housing quality moves mental health, and mental health moves marks, then{' '}
          <strong>housing policy is academic policy</strong>.
        </p>

        <p>
          This is not an argument for blaming students when markets fail. It is an argument for reallocating attention from reactive counselling queues toward{' '}
          <strong>preventable stressors</strong> embedded in daily life. Sleep continuity, noise exposure, safety of tenure, and predictable chore rhythms are not lifestyle trivia for stretched cohorts—they are conditions that decide whether someone studies tonight or scrolls until 2 a.m. avoiding their kitchen.
        </p>

        <p>
          Recent wellbeing scholarship underscores why loneliness and anxiety amplify academic strain across cohorts—and why vulnerable mobility paths deserve sharper safeguards (
          <a
            href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1481328/full"
            target="_blank"
            rel="noreferrer"
          >
            Frontiers in Psychology, 2025
          </a>
          ). Housing cannot cure loneliness by itself, but <strong>unsafe or chaotic housing reliably consumes the bandwidth friendship networks otherwise provide</strong>.
        </p>

        <h2>Where “Community Building” Becomes ROI</h2>

        <p>
          Stickers and welcome fairs generate visibility; they do not manufacture compatibility. The return on intentional community infrastructure shows up when institutions and cities fund{' '}
          <strong>predictable matching</strong>,{' '}
          <strong>transparent norms</strong>, and{' '}
          <strong>early dispute rails</strong>—so small frictions do not become lease breaks or transfers.
        </p>

        <ul>
          <li>
            <strong>Front-load clarity.</strong> Translate vague promises—“we’re all chill”—into observable behaviours: sleep windows, guest cadence, cleaning cadence, study vs. social defaults.
          </li>
          <li>
            <strong>Measure what breaks cohorts.</strong> Track accommodation incidents, mid-year moves, and wellbeing contacts alongside classroom metrics; intervene where patterns cluster.
          </li>
          <li>
            <strong>Partner for throughput.</strong> Align municipalities, housing providers, and student associations on shared intake timelines so fewer students are priced into desperation deals.
          </li>
          <li>
            <strong>Fund mediation early.</strong> Train resident assistants and peer mentors on chore norms and boundary conversations—not only crisis escalation—so persistent friction resolves before academic alerts fire.
          </li>
        </ul>

        <p>
          For municipalities competing for talent pipelines, the calculus mirrors employer incentives: every avoidable mid-year move dumps distraction into lecture halls and shifts advising capacity toward preventable chaos. When intake teams publish realistic timelines and scam-aware guidance alongside enrolment offers—mirroring how Dutch institutions now warn applicants about housing friction—you shrink the gap between{' '}
          <strong>letters of acceptance</strong> and <strong>stable tenancy</strong>.
        </p>

        <h2>What Domu Match Changes in the Workflow</h2>

        <p>
          Domu Match is built for the layer universities historically underserve:{' '}
          <strong>who you live with</strong>. Our questionnaire encodes habits and boundaries—sleep, cleanliness, guests, stress responses—into explainable compatibility signals you can discuss before keys change hands. That shifts conflict from{' '}
          <em>surprise and shame</em> to <em>alignment and negotiation</em>.
        </p>

        <p>
          If you are shaping retention strategy for 2026 and beyond, start where students actually recover cognitive bandwidth: home. Explore{' '}
          <Link href="/how-it-works">how matching works</Link>, browse housing-ready connections on{' '}
          <Link href="/matches">matches</Link>, and help your cohort enter the year strong—not scrambling.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          Imran, M., Alghafli, M., Maqbool, M., Farooq, M., & Fatima, N. (2025). Mental health and academic performance of students at tertiary level: the role of housing.{' '}
          <em>Frontiers in Education</em>, 10, 1627192.{' '}
          <a
            href="https://doi.org/10.3389/feduc.2025.1627192"
            target="_blank"
            rel="noreferrer"
          >
            https://doi.org/10.3389/feduc.2025.1627192
          </a>
        </p>

        <p className="text-sm text-slate-300">
          DutchNews. (2025, November 18). Private landlords sell off student housing, worsening shortage. Retrieved from{' '}
          <a
            href="https://www.dutchnews.nl/2025/11/private-landlords-sell-off-student-housing-worsening-shortage/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2025/11/private-landlords-sell-off-student-housing-worsening-shortage/
          </a>
        </p>

        <p className="text-sm text-slate-300">
          DutchNews. (2026, February 4). High prices and room shortages lead more students to stay home. Retrieved from{' '}
          <a
            href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/
          </a>
        </p>

        <p className="text-sm text-slate-300">
          DutchNews. (2026, February 15). New international student numbers fall for third year in a row. Retrieved from{' '}
          <a
            href="https://www.dutchnews.nl/2026/02/new-international-student-numbers-fall-for-third-year-in-a-row/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2026/02/new-international-student-numbers-fall-for-third-year-in-a-row/
          </a>
        </p>

        <p className="text-sm text-slate-300">
          DutchNews. (2026, March 9). Most international students are happy but housing is a big issue. Retrieved from{' '}
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/
          </a>
        </p>

        <p className="text-sm text-slate-300">
          Frontiers in Psychology. (2025). Student well-being: the impact of belonging, COVID-19 pandemic related student stress, loneliness, and academic anxiety. Retrieved from{' '}
          <a
            href="https://doi.org/10.3389/fpsyg.2025.1481328"
            target="_blank"
            rel="noreferrer"
          >
            https://doi.org/10.3389/fpsyg.2025.1481328
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title:
      'Meer dan een bed: de verborgen ROI van de studentenhuisvestingskloof vóór je retentie kraakt',
    excerpt:
      'Kamertekorten en woonstress zijn geen “marktruis”. Ze raken welzijn, cijfers en volhoudbaarheid. Dit mist het beleid vaak—en dit levert vroege compatibiliteit op.',
    publishDate: '2026-05-06',
    readTime: '9 min lezen',
    relatedLinks: [
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'Zie hoe financiële schade oploopt als compatibiliteit optioneel blijft.',
      },
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Concrete stappen om leefstijl te toetsen vóór je tekent.',
      },
      {
        title: 'Zo werkt onze matching',
        href: '/how-it-works',
        description:
          'Lees hoe Domu Match gewoontes en grenzen transparant scoret.',
      },
    ],
    ctaTitle: 'Behandel huisvesting als studie-infrastructuur',
    ctaDescription:
      'Match op routines en grenzen vóór de chaos van introductieweken. Domu Match maakt compatibiliteit een keuze vóór ingaan—niet een crisis in de groepsapp.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Retentie en welzijn worden vaak gemeten in colleges en dashboards. Zichtbaar minder vaak:{' '}
          <strong>waar studenten slapen</strong>, of ze zich veilig voelen, en of huisgenoten rust geven of energie kosten vóór het eerste college.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
            alt="Stadsgezicht met woongebouwen bij schemering"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Een bed is geen strategie. Stabiele, passende huisvesting is een laag onder prestatie en volhoudbaarheid.
          </figcaption>
        </figure>

        <h2>Signalen uit de markt (Nederland / Europa)</h2>

        <p>
          Nederlandse berichtgeving over CBS-cijfers laat zien dat <strong>43%</strong> van de afgestudeerden in 2023 het hele traject bij de ouders woonde (was 31% bij de lichting van 2016) en dat <strong>79%</strong> na jaar één nog thuis zat (
          <a
            href="https://www.dutchnews.nl/2026/02/high-prices-and-room-shortages-lead-more-students-to-stay-home/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ). Private verhuurders verkopen studentenwoningen door; tekorten en huren lopen op (
          <a
            href="https://www.dutchnews.nl/2025/11/private-landlords-sell-off-student-housing-worsening-shortage/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2025
          </a>
          ). Het aantal internationale studenten daalt het derde jaar op rij (
          <a
            href="https://www.dutchnews.nl/2026/02/new-international-student-numbers-fall-for-third-year-in-a-row/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ); surveys benadrukken woningzoekfrictie en ontevredenheid over informatie (
          <a
            href="https://www.dutchnews.nl/2026/03/most-international-students-are-happy-but-housing-is-a-big-issue/"
            target="_blank"
            rel="noreferrer"
          >
            DutchNews, 2026
          </a>
          ).{' '}
          <strong>Toegang en integratie beginnen bij de voordeur.</strong>
        </p>

        <h2>Verborgen kosten (groter dan huur alleen)</h2>

        <p>
          Geluid, overbewoning, onzekere verhuur en huisgenootconflicten kosten <strong>aandacht</strong>—dezelfde bron die colleges nodig hebben. Internationaal onderzoek laat via een structureel vergelijkingsmodel zien dat <strong>onprettige huisvesting samenhangt met slechtere mentale gezondheid</strong> en dat mentale gezondheid weer samenhangt met academische prestaties (
          <a
            href="https://www.frontiersin.org/articles/10.3389/feduc.2025.1627192/full"
            target="_blank"
            rel="noreferrer"
          >
            Imran et al., 2025
          </a>
          ). Als kwaliteit van wonen het welzijn beïnvloedt, is <strong>huisvestingsbeleid studiebeleid</strong>.
        </p>

        <p>
          Aanvullend onderzoek naar studentwelzijn benadrukt eenzaamheid en academische spanning als versterkende factoren (
          <a
            href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1481328/full"
            target="_blank"
            rel="noreferrer"
          >
            Frontiers in Psychology, 2025
          </a>
          ). Een woning lost eenzaamheid niet automatisch op, maar <strong>chaos thuis vreet de energie die sociale netten normaal opvangen</strong>.
        </p>

        <h2>ROI van community-infrastructuur</h2>

        <p>
          Welkomstmessen alleen maken geen compatibiliteit. Rendement ontstaat bij vroege normen: slaapvensters, gasten, schoonmaak, studie vs. sociaal—en bij het meten van verhuizingen en incidenten naast klassieke cohortdata. Gemeenten en hogescholen winnen wanneer intake, anti-fraude-informatie en peer-mediation dezelfde planning krijgen als curriculum—zo voorkom je dat kleine wrijving leasebreuk wordt.
        </p>

        <h2>Hoe Domu Match helpt</h2>

        <p>
          Domu Match vertaalt gedrag en grenzen naar uitlegbare matches vóór sleuteloverdracht. Lees{' '}
          <Link href="/how-it-works">hoe het werkt</Link> en ontdek opties op{' '}
          <Link href="/matches">matches</Link>.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          Imran et al. (2025).{' '}
          <a
            href="https://doi.org/10.3389/feduc.2025.1627192"
            target="_blank"
            rel="noreferrer"
          >
            https://doi.org/10.3389/feduc.2025.1627192
          </a>
        </p>

        <p className="text-sm text-slate-300">
          DutchNews (2025–2026). Zie links hierboven voor volledige URLs.
        </p>

        <p className="text-sm text-slate-300">
          Frontiers in Psychology (2025).{' '}
          <a
            href="https://doi.org/10.3389/fpsyg.2025.1481328"
            target="_blank"
            rel="noreferrer"
          >
            https://doi.org/10.3389/fpsyg.2025.1481328
          </a>
        </p>
      </div>
    ),
  },
}

export function StudentHousingGapRetentionRoiArticle() {
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
