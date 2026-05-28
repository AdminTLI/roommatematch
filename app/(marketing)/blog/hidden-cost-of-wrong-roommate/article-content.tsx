'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
    excerpt:
      'Bad roommate matches are expensive in ways students rarely budget for: stress, sleep loss, broken agreements, emergency moves, and the slow damage to study focus.',
    publishDate: '2025-12-05',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'A practical checklist for screening routines, boundaries, chores, money reliability, and communication.',
      },
      {
        title: 'Move-In Week Red Flags',
        href: '/blog/move-in-week-red-flags',
        description:
          'How to spot early warning signs and distinguish normal adjustment from real red flags.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'A practical checklist for contracts, deposits, and verification before you commit.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          On paper, a random roommate looks like the cheapest option. You split the rent, you sign the lease,
          and you hope for the best. But the real cost of the wrong roommate rarely shows up in the initial
          budget. It shows up months later - in broken leases, emergency moves, lost deposits and grades that
          quietly slip.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="cityBikeStudent"
            alt="Person sitting among cardboard boxes while moving out"
          />
          <figcaption>
            Moving out of a bad living situation costs more than just time and stress - it often comes with a
            serious financial bill.
          </figcaption>
        </figure>

        <h2>The Visible Costs: Leases, Deposits, and Moving Vans</h2>

        <p>
          Imagine this: you move in with a roommate you barely know because the room is cheap and the timing
          works. By November, it is clear the match is off - constant noise, ignored cleaning, different ideas
          of “home”. By January, you want out.
        </p>

        <p>The line items most students underestimate:</p>

        <ul>
          <li>
            <strong>Lease break fees</strong>: Many contracts charge one to two months’ rent to leave early.
          </li>
          <li>
            <strong>Lost deposits</strong>: Damage, deep cleaning, or a hostile landlord can eat your whole
            deposit.
          </li>
          <li>
            <strong>Moving costs</strong>: Vans, storage, replacement furniture, new public transport passes.
          </li>
        </ul>

        <p>
          In a market where average student rents are already high, those extra costs can easily push you into
          a situation you did not plan for. If you want housing context and source material, start with Kences
          (student housing knowledge centre) and its publications (
          <a
            href="https://www.kences.nl"
            target="_blank"
            rel="noreferrer"
          >
            Kences, 2023
          </a>
          ). The key point is not the exact number, it is that an emergency move is rarely “just inconvenient”.
        </p>

        <h2>The Academic Cost: Sleep, Stress and GPA</h2>

        <p>
          The wrong roommate does not just drain your bank account. They quietly drain your ability to study.
          Chronic sleep disruption, tension at home, or feeling unsafe in your space all hit concentration,
          memory and motivation.
        </p>

        <p>
          Meta-analyses on sleep deprivation show that even partial sleep loss significantly impairs attention
          and cognitive performance (Pilcher &amp; Huffcutt, 1996). A review of sleep and academic outcomes
          in students found that short or poor-quality sleep is consistently linked with lower grades and
          worse learning capacity (
          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231"
            target="_blank"
            rel="noreferrer"
          >
            Curcio et al., 2006
          </a>
          ).
        </p>

        <p>
          Translation: if your roommate&apos;s 2 a.m. gaming, parties, or constant guests are stealing your
          sleep, they are also quietly taxing your exam results.
        </p>

        <h2>The Emotional Cost: Burnout, Isolation and Dropout Risk</h2>

        <p>
          Your home is supposed to be your recovery space. When it becomes another source of stress, you are
          effectively in &quot;performance mode&quot; 24/7. That chronic stress has been linked to higher
          rates of depression, anxiety and burnout among university students (
          <a
            href="https://www.apa.org/monitor/2019/09/cover-college-mental-health"
            target="_blank"
            rel="noreferrer"
          >
            American Psychological Association, 2019
          </a>
          ).
        </p>

        <p>
          In the worst cases, students in hostile or unstable housing consider taking leaves of absence or
          dropping out altogether. When that happens, the cost of a bad roommate is not just this semester’s
          rent - it is extra semesters of tuition or a full restart somewhere else.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Student studying with a laptop at a cafe, looking tired"
          />
          <figcaption>
            When home is exhausting rather than restorative, your brain is already half burnt out before you
            even open your laptop.
          </figcaption>
        </figure>

        <h2>Why prevention is cheaper than recovery</h2>

        <p>
          Compared to the price of moving twice, repeating classes or extending your degree,{' '}
          <strong>investing time in compatibility up front is a bargain</strong>. The goal is not to find a
          clone of yourself. It is to avoid predictable friction in areas that matter most:
        </p>

        <ul>
          <li>Sleep routines and noise tolerance.</li>
          <li>Cleanliness standards and chore expectations.</li>
          <li>Guest frequency and partner stays.</li>
          <li>Study vs. social balance at home.</li>
        </ul>

        <p>
          The prevention work is boring, but it is cheap. Ask behaviour-based questions up front, agree on a
          simple system for chores and guests, and be honest about sleep. If you want a framework for which
          topics matter, see <Link href="/how-it-works">How Matching Works</Link>.
        </p>

        <h2>Practical Questions to Ask Before You Commit</h2>

        <p>Whether or not you use Domu Match, borrow these questions for your next roommate chat:</p>

        <ul>
          <li>&quot;What time do you usually go to bed and wake up on weekdays?&quot;</li>
          <li>&quot;How long do dishes typically stay in your sink?&quot;</li>
          <li>
            &quot;How often do you like having people over, and how do you feel about overnight guests?&quot;
          </li>
          <li>&quot;When you are stressed with exams, what do you need from home life?&quot;</li>
          <li>&quot;Have you had issues with previous roommates? What happened, and how was it handled?&quot;</li>
        </ul>

        <p>
          If someone cannot or will not answer those clearly, that is useful data too. You are not just
          choosing a person; you are choosing a pattern.
        </p>

        <h2>Conclusion</h2>

        <p>
          The wrong roommate is rarely &quot;just rent&quot;. It is stress, sleep loss, damaged grades, and
          sometimes thousands of euros in hidden costs. The right match will not make life perfect, but it
          will give you a stable base to do what you came to university to do.
        </p>

        <p>
          The wrong roommate is rarely “just rent”. It is stress, sleep loss, damaged focus, and sometimes an
          expensive escape plan. A more careful selection process will not guarantee harmony, but it will
          reduce predictable conflict in the areas that matter most.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          American Psychological Association. (2019). <em>College mental health: The costs of depression,
          anxiety and stress</em>. In <em>Monitor on Psychology</em>. Retrieved from{' '}
          <a
            href="https://www.apa.org/monitor/2019/09/cover-college-mental-health"
            target="_blank"
            rel="noreferrer"
          >
            https://www.apa.org/monitor/2019/09/cover-college-mental-health
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Curcio, G., Ferrara, M., &amp; De Gennaro, L. (2006). Sleep loss, learning capacity and academic
          performance. <em>Sleep Medicine Reviews, 10</em>(5), 323–337.{' '}
          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231"
            target="_blank"
            rel="noreferrer"
          >
            https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Kences. (2023). <em>Landelijke monitor studentenhuisvesting</em>. Retrieved from{' '}
          <a
            href="https://www.kences.nl"
            target="_blank"
            rel="noreferrer"
          >
            https://www.kences.nl
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Pilcher, J. J., &amp; Huffcutt, A. I. (1996). Effects of sleep deprivation on performance: A
          meta-analysis. <em>Sleep, 19</em>(4), 318–326.{' '}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/8776790/"
            target="_blank"
            rel="noreferrer"
          >
            https://pubmed.ncbi.nlm.nih.gov/8776790/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'De verborgen kosten van de verkeerde huisgenoot (het is meer dan huur)',
    excerpt:
      'Een slechte match kost je niet alleen geld, maar ook slaap, focus en energie. De echte rekening komt vaak later: stress, conflict en soms een noodverhuizing.',
    publishDate: '2025-12-05',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Een praktische checklist om ritme, grenzen, klusjes, geld en communicatie te screenen.',
      },
      {
        title: 'Red flags in je eerste woonweek',
        href: '/blog/move-in-week-red-flags',
        description:
          'Signalen die je serieus mag nemen, en hoe je onderscheid maakt tussen opstart-chaos en echte problemen.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Checklist voor contracten, borg en verificatie vóór je vastzit aan een verkeerde deal.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          De “goedkope” random huisgenoot blijkt vaak allesbehalve goedkoop. Een verkeerde match kost geld,
          tijd, concentratie en soms zelfs studievertraging. Investeren in compatibiliteit is uiteindelijk
          goedkoper dan verhuizen uit een rampzalige woonsituatie.
        </p>

        <p>
          Denk aan contractboetes, kwijtgeraakte borg, verhuisbus, nieuwe meubels én de impact op je cijfers
          als je wekenlang slecht slaapt. Onderzoek laat zien dat slaaptekort je leervermogen en prestaties
          aantast{' '}
          <span className="italic">
            (Curcio et al., 2006; Pilcher &amp; Huffcutt, 1996)
          </span>
          .
        </p>

        <p>
          De preventie is saai, maar goedkoop. Stel gedragsvragen vóór je tekent, spreek een simpel systeem af
          voor klusjes en logees, en wees eerlijk over slaap. Voor een denkkader van welke onderwerpen ertoe
          doen kun je <Link href="/how-it-works">Zo werkt matching</Link> gebruiken.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          Curcio, G., Ferrara, M., &amp; De Gennaro, L. (2006). Sleep loss, learning capacity and academic
          performance. <em>Sleep Medicine Reviews, 10</em>(5), 323–337.{' '}
          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231"
            target="_blank"
            rel="noreferrer"
          >
            https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Pilcher, J. J., &amp; Huffcutt, A. I. (1996). Effects of sleep deprivation on performance: A
          meta-analysis. <em>Sleep, 19</em>(4), 318–326.{' '}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/8776790/"
            target="_blank"
            rel="noreferrer"
          >
            https://pubmed.ncbi.nlm.nih.gov/8776790/
          </a>
        </p>
      </div>
    ),
  },
}

export function HiddenCostWrongRoommateArticle() {
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

