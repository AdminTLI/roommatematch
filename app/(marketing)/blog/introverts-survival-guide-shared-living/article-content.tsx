'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'The Introvert’s Survival Guide to Shared Living',
    excerpt:
      'If your social battery drains fast, home needs to be a charging dock, not another performance. A practical guide to quiet hours, boundaries, and choosing housemates who respect alone time.',
    publishDate: '2026-01-03',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'Surviving the Winter Blues',
        href: '/blog/surviving-the-winter-blues',
        description:
          'How home routines and low-pressure support matter when energy and mood dip.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'See how our compatibility engine balances social preferences with lifestyle and study needs.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'A simple template for turning quiet-hour needs into a shared agreement.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          If you are introverted or neurodivergent, university can feel like a never‑ending group project:
          lectures, seminars, group work, societies, part‑time jobs. By the time you get home, the last thing
          you want is to keep performing. You need a place where your brain can actually power down.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Student reading quietly with headphones in a shared living space"
          />
          <figcaption>
            For many introverts, a quiet evening alone is not antisocial - it is basic maintenance.
          </figcaption>
        </figure>

        <h2>The Exhaustion of Being &quot;On&quot; 24/7</h2>

        <p>
          A lot of introverts and neurodivergent students spend most of their day masking - carefully managing
          how they come across, filtering sensory input and holding themselves together in busy spaces.
          Research on social fatigue shows that continuous social performance without adequate recovery is
          linked to increased stress and burnout symptoms (e.g.,{' '}
          <a
            href="https://doi.org/10.1037/pspp0000377"
            target="_blank"
            rel="noreferrer"
          >
            Wagner et al., 2021
          </a>
          ).
        </p>

        <p>
          If your home is also loud, busy and unpredictable, you never get out of &quot;performance mode&quot;.
          That can show up as:
        </p>

        <ul>
          <li>Snapping at people over small things.</li>
          <li>Cancelled plans you actually wanted to go to.</li>
          <li>Brain fog when you try to study.</li>
          <li>Feeling guilty for “not being more fun”.</li>
        </ul>

        <h2>Needing Alone Time ≠ Hating Your Roommates</h2>

        <p>
          Wanting alone time is not a rejection of your housemates; it is how your nervous system resets. But
          in many student flats, closing your door gets interpreted as &quot;they don’t like us&quot;. That
          misunderstanding can make introverts feel pressured to hang out even when they are running on empty.
        </p>

        <p>
          Mental health organisations consistently recommend building in quiet, low‑stimulation time as a core
          coping strategy for anxiety and overload (
          <a
            href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
            target="_blank"
            rel="noreferrer"
          >
            National Institute of Mental Health, 2022
          </a>
          ). Your living situation can support that - or sabotage it.
        </p>

        <h2>Make “quiet” measurable</h2>

        <p>Instead of trying to be “easygoing”, define what you actually need:</p>

        <ul>
          <li>
            <strong>Social battery</strong>: how often you like to socialise at home, from &quot;most
            evenings&quot; to &quot;only occasionally&quot;.
          </li>
          <li>
            <strong>Quiet hours</strong>: what times you need the flat to be low‑noise on weekdays and
            weekends.
          </li>
          <li>
            <strong>Home vibe</strong>: whether you want a social hub, chill base or mostly quiet sanctuary.
          </li>
        </ul>

        <p>Look for people who:</p>

        <ul>
          <li>Also value quiet evenings.</li>
          <li>Understand that closed doors mean &quot;recharging&quot;, not rejection.</li>
          <li>Do not expect you to be “on” 24/7 just because you share a hallway.</li>
        </ul>

        <p>
          If you want a neutral framework for these topics, see <Link href="/how-it-works">How Matching Works</Link>.
          The goal is not to label yourself “introvert” or “extrovert”. It is to set expectations that keep
          your home restorative.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Two students quietly working at a table with laptops and notebooks"
          />
          <figcaption>
            Compatible roommates do not have to be identical - they just need compatible rhythms and respect.
          </figcaption>
        </figure>

        <h2>Language You Can Use to Set Boundaries</h2>

        <p>Some scripts you can borrow:</p>

        <ul>
          <li>
            &quot;If my door is closed, it usually just means I’m recharging. It’s not personal - I’ll come
            hang out when my brain comes back online.&quot;
          </li>
          <li>
            &quot;Could we agree that after [time] on weeknights the flat is mostly quiet? It really helps my
            sleep and anxiety.&quot;
          </li>
          <li>
            &quot;I’d love to join, but I’m out of social battery tonight. Can we plan another night this
            week?&quot;
          </li>
        </ul>

        <h2>Designing a Flat That Recharges You</h2>

        <p>When you are looking for housing, prioritise:</p>

        <ul>
          <li>Roommates whose social battery answers are similar to yours.</li>
          <li>People who describe home as &quot;chill&quot;, &quot;low‑key&quot; or &quot;quiet&quot;.</li>
          <li>Matches who agree on quiet hours and respect for alone time.</li>
        </ul>

        <p>
          Use Domu Match as your filter for this. Build your profile honestly, then narrow down to matches
          whose social habits and quiet‑hour expectations feel soothing rather than stressful.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          National Institute of Mental Health. (2022). <em>Anxiety disorders</em>. U.S. Department of Health
          and Human Services. Retrieved from{' '}
          <a
            href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nimh.nih.gov/health/topics/anxiety-disorders
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Wagner, D. D., et al. (2021). The exhausting nature of social interactions: Social fatigue and
          well‑being. <em>Personality and Social Psychology Bulletin</em>. Advance online publication.{' '}
          <a
            href="https://doi.org/10.1177/01461672211031296"
            target="_blank"
            rel="noreferrer"
          >
            https://doi.org/10.1177/01461672211031296
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'De overlevingsgids voor introverten in een studentenhuis',
    excerpt:
      'Als je sociale batterij snel leeg is, moet thuis een laadpunt zijn – geen extra podium. Leer hoe je huisgenoten vindt die jouw behoefte aan rust begrijpen.',
    publishDate: '2026-01-03',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'Match op sociale batterij',
        href: '/matches',
        description:
          'Gebruik de vragen van Domu Match over sociale energie, stilte-uren en huisvibe om passende huisgenoten te vinden.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          De hele dag colleges, projectgroepen en drukke gangen is voor veel introverten al een marathon. Als
          het thuis óók altijd druk en luid is, kom je nooit echt bij. Dan voelt elke dag alsof je op halve
          batterij draait.
        </p>

        <p>
          Met Domu Match kun je vooraf matchen op sociale batterij, stilte-uren en huisvibe. Zo beland je
          eerder in een huis waar “even niks” normaal is in plaats van iets dat je steeds moet uitleggen. Op{' '}
          <Link href="/how-it-works">
            “Zo werkt het”
          </Link>{' '}
          lees je meer over deze filters.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          National Institute of Mental Health. (2022). <em>Anxiety disorders</em>. U.S. Department of Health
          and Human Services.{' '}
          <a
            href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
            target="_blank"
            rel="noreferrer"
          >
            https://www.nimh.nih.gov/health/topics/anxiety-disorders
          </a>
        </p>
      </div>
    ),
  },
}

export function IntrovertsSurvivalGuideArticle() {
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

