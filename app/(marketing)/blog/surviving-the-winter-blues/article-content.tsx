'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Surviving the Winter Blues: Why Who You Live With Matters',
    excerpt:
      'Short days and exam stress can make isolation feel heavier. The right living situation adds gentle structure and support, while the wrong one can amplify withdrawal.',
    publishDate: '2026-01-10',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'The Introvert’s Survival Guide to Shared Living',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'If your social battery drains quickly, learn how to build a home that helps you recharge instead of burning you out.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to set small house norms that keep winter routines predictable and supportive.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'A framework for which habits matter in shared living and how to talk about them early.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          January hits differently. It is dark when you wake up and dark before dinner. Money is tighter after
          the holidays. Deadlines pile up. If you are far from home or already prone to low mood, this is prime
          time for the winter blues to kick in - and your living situation can either buffer that or make it
          worse.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Student looking out of a window on a dark winter day"
          />
          <figcaption>
            In winter, isolation hits harder - the people you live with have a direct impact on how heavy it
            feels.
          </figcaption>
        </figure>

        <h2>What the Winter Blues Actually Are</h2>

        <p>
          Seasonal Affective Disorder (SAD) is a type of depression that follows a seasonal pattern, usually
          getting worse in autumn and winter when there is less daylight. Common symptoms include low mood,
          sleeping more, craving carbohydrates, and withdrawing from social contact (
          <a
            href="https://www.nhs.uk/mental-health/conditions/seasonal-affective-disorder-sad/"
            target="_blank"
            rel="noreferrer"
          >
            NHS, 2023
          </a>
          ). Even if you do not meet the full criteria for SAD, many students feel a &quot;winter dip&quot; in
          energy and motivation.
        </p>

        <p>
          Mental health resources often recommend routines like regular daylight exposure, movement and
          staying socially connected to help prevent mood from spiralling (
          <a
            href="https://www.nimh.nih.gov/health/publications/seasonal-affective-disorder"
            target="_blank"
            rel="noreferrer"
          >
            National Institute of Mental Health, 2023
          </a>
          ). The people you live with can make those habits easier - or much harder.
        </p>

        <h2>When Home Amplifies Isolation</h2>

        <p>A home that works against you in winter often looks like this:</p>

        <ul>
          <li>Everyone hides in their rooms with doors closed and headphones in.</li>
          <li>No one notices if you have not left the house all weekend.</li>
          <li>There is tension or conflict, so you avoid common areas.</li>
          <li>You feel like a burden if you mention you are struggling.</li>
        </ul>

        <p>
          That kind of environment can quietly compound low mood. You end up with the worst of both worlds:
          exhausted by uni, and emotionally alone at home.
        </p>

        <h2>When Home Helps You Cope</h2>

        <p>A winter‑friendly home does not have to be hyper‑extroverted. It just needs:</p>

        <ul>
          <li>Housemates who check in on each other in small, non‑dramatic ways.</li>
          <li>Enough shared routine that you do not go days without seeing another human.</li>
          <li>Respect for quiet days without pressure to be “on”.</li>
          <li>People who will say, &quot;Want to go for a short walk while it’s still light?&quot;</li>
        </ul>

        <p>
          Matching with people who have similar social habits and empathy levels makes it much more likely
          that your flat naturally behaves like this.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Group of students drinking hot drinks together indoors"
          />
          <figcaption>
            In winter, even small rituals - tea in the kitchen, a shared series - can help keep you connected.
          </figcaption>
        </figure>

        <h2>Build a winter support system at home</h2>

        <p>
          Winter is easier when home has gentle structure. That does not require an extrovert house. It requires
          predictable, low-pressure contact: seeing another person in the kitchen once a day, having one shared
          habit (tea, a short walk, a weekly shop), and knowing you can say “I’m not doing great” without it becoming
          drama.
        </p>

        <p>
          The practical move is to turn support into small agreements. A weekly check-in, a default quiet time
          that protects sleep during exams, and a norm that nobody disappears for days without anyone noticing.
          If you want a template for that, use <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>.
        </p>

        <h2>Especially for International Students</h2>

        <p>
          If you moved countries for university, winter can feel even heavier. Different climate, different
          food, different holidays - and family in another time zone. Your flatmates might be the closest
          thing you have to a local support system.
        </p>

        <p>
          Matching with people who are open to cultural differences, or who are also international students,
          can make it easier to be honest about homesickness and low mood. You should not have to explain from
          scratch why certain dates are hard or why you are calling home late at night.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          National Health Service. (2023). <em>Seasonal affective disorder (SAD)</em>. NHS. Retrieved from{' '}
          <a
            href="https://www.nhs.uk/mental-health/conditions/seasonal-affective-disorder-sad/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nhs.uk/mental-health/conditions/seasonal-affective-disorder-sad/
          </a>
        </p>
        <p className="text-sm text-slate-300">
          National Institute of Mental Health. (2023). <em>Seasonal affective disorder</em>. U.S. Department
          of Health and Human Services. Retrieved from{' '}
          <a
            href="https://www.nimh.nih.gov/health/publications/seasonal-affective-disorder"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nimh.nih.gov/health/publications/seasonal-affective-disorder
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Overleven in de winterdip: waarom huisgenoten nu extra tellen',
    excerpt:
      'Donkere dagen en tentamenstress maken isolement zwaarder. Een passende woonsituatie geeft zacht ritme en steun, terwijl een verkeerde match terugtrekgedrag kan versterken.',
    publishDate: '2026-01-10',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'De overlevingsgids voor introverten',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'Lees hoe je als introverte student een huis vindt dat oplaadt in plaats van uitput.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Kleine huisnormen die winterroutines voorspelbaar en steunend houden.',
      },
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description:
          'Een raamwerk voor welke onderwerpen ertoe doen in een gedeeld huis, en hoe je ze bespreekt.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          In januari is het vroeg donker, koud en druk met deadlines. Als je dan thuiskomt in een huis waar
          iedereen langs elkaar heen leeft, wordt de winterdip alleen maar dieper.
        </p>

        <p>
          Seizoensgebonden depressie (SAD) komt vaker voor in de donkere maanden en gaat vaak samen met meer
          slaap, minder energie en minder zin in sociaal contact{' '}
          <span className="italic">
            (NHS, 2023)
          </span>
          . In zo’n periode helpt het als huisgenoten elkaar even checken, samen een wandeling plannen of
          gewoon de woonkamer gezellig houden.
        </p>

        <p>
          De praktische stap is om steun om te zetten in kleine afspraken. Eén wekelijks check-in moment, een
          standaard stilte-uur tijdens tentamens, en een norm dat niemand dagenlang verdwijnt zonder dat iemand
          het merkt. Voor taal en templates kun je <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link>
          gebruiken.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          National Health Service. (2023). <em>Seasonal affective disorder (SAD)</em>. NHS.{' '}
          <a
            href="https://www.nhs.uk/mental-health/conditions/seasonal-affective-disorder-sad/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nhs.uk/mental-health/conditions/seasonal-affective-disorder-sad/
          </a>
        </p>
      </div>
    ),
  },
}

export function SurvivingWinterBluesArticle() {
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

