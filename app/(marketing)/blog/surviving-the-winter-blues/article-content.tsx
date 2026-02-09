'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Surviving the Winter Blues: Why Who You Live With Matters',
    excerpt:
      'Short days, cold weather and exam stress hit hard. The right housemates can give you social momentum; the wrong ones can leave you feeling isolated.',
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
        title: 'Start Matching on Social Habits',
        href: '/matches',
        description:
          'Use Domu Match’s questions about social routines and home vibe to find winter-friendly housemates.',
      },
      {
        title: 'Safety & Support',
        href: '/safety',
        description:
          'Read how Domu Match designs for psychological safety and student wellbeing, not just housing logistics.',
      },
    ],
    ctaTitle: 'Build a Winter Support System at Home',
    ctaDescription:
      'Use Domu Match to match with housemates whose social habits and empathy levels help you get through the darker months.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Find Compatible Housemates',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          January hits differently. It is dark when you wake up and dark before dinner. Money is tighter after
          the holidays. Deadlines pile up. If you are far from home or already prone to low mood, this is prime
          time for the winter blues to kick in - and your living situation can either buffer that or make it
          worse.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80"
            alt="Student looking out of a window on a dark winter day"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
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
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
            alt="Group of students drinking hot drinks together indoors"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            In winter, even small rituals - tea in the kitchen, a shared series - can help keep you connected.
          </figcaption>
        </figure>

        <h2>How Domu Match Helps You Build a Winter Support System</h2>

        <p>
          Domu Match does not just match on rent and location; it looks at{' '}
          <strong>social rhythms, coping styles and home vibe</strong>. Our questionnaire includes items
          about:
        </p>

        <ul>
          <li>How often you like to hang out at home.</li>
          <li>Whether you want spontaneous gatherings or more planned social time.</li>
          <li>How you tend to cope when stressed - reaching out vs. withdrawing.</li>
          <li>What kind of home feels safest when you are under pressure.</li>
        </ul>

        <p>
          That means you can purposely look for matches who also value mutual support, low‑key togetherness,
          or calm, introvert‑friendly spaces. You are not leaving your winter mental health to chance.
        </p>

        <p>
          You can start exploring those matches by creating a profile and completing the questionnaire on our{' '}
          <Link href="/auth/sign-up">
            sign‑up page
          </Link>
          .
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
      'Donkere dagen, kou en tentamenstress maken je kwetsbaarder voor somberheid. De juiste huisgenoten kunnen het verschil maken tussen vereenzamen en je gedragen voelen.',
    publishDate: '2026-01-10',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'De overlevingsgids voor introverten',
        href: '/blog/introverts-survival-guide-shared-living',
        description:
          'Lees hoe je als introverte student een huis vindt dat oplaadt in plaats van uitput.',
      },
    ],
    ctaTitle: 'Bouw een winters vangnet in huis',
    ctaDescription:
      'Match via Domu Match met huisgenoten die jouw behoefte aan steun en rust in de winter begrijpen.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Begin met matchen',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
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
          Domu Match laat je vooraf matchen op sociale gewoontes, copingstijl en huisvibe. Zo vergroot je de
          kans dat je in een huis komt waar winter niet alleen iets is dat je uitzit, maar iets dat je samen
          doorkomt. Meer info vind je op onze{' '}
          <Link href="/safety">
            veiligheidspagina
          </Link>
          .
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

