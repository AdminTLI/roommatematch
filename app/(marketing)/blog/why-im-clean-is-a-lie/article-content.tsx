'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
    excerpt:
      '“Clean” is subjective. One person means “no mould”, another means “bleached daily”. Learn how to ask behaviour-based questions so dishes and dust do not ruin your flat.',
    publishDate: '2025-12-15',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Go beyond first impressions with evidence-based questions about lifestyle and responsibilities.',
      },
      {
        title: 'Start Matching by Habits',
        href: '/matches',
        description:
          'Use Domu Match’s behavioural questions about cleaning, chores and shared spaces to find compatible housemates.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Protect yourself with clear agreements and understanding of your tenant rights in shared housing.',
      },
    ],
    ctaTitle: 'Match on Behaviours, Not Buzzwords',
    ctaDescription:
      'Domu Match skips vague labels like “clean” and “chill” and goes straight to concrete, day-to-day behaviours.',
    ctaHref: '/auth/sign-up',
    ctaText: 'See Your Compatibility',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          “I’m clean.” “I’m pretty tidy.” “I don’t like mess.” You have probably heard all three. Maybe you
          have said them. The problem is that they mean nothing without context. Two people can both call
          themselves “clean” and still end up fighting over a chopping board.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80"
            alt="Student cleaning a shared kitchen counter"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Most roommate conflicts over cleanliness start with mismatched definitions, not malice.
          </figcaption>
        </figure>

        <h2>"Clean" Is Not a Standard, It’s a Story</h2>

        <p>
          When someone says “I’m clean”, they are telling you a story about themselves - how they like to
          see themselves - not giving you an objective standard. For one person, “clean” means no visible
          rubbish and no mould. For another, it means floors vacuumed weekly, surfaces disinfected and no
          clothes on chairs.
        </p>

        <p>
          Research on household labour shows that people often underestimate the work they do and see their
          own level of contribution as “fair”, even when it is not shared equally (Carlson et al., 2016).
          In shared housing, that same bias shows up as “I already do enough”, even when your experience is
          very different.
        </p>

        <h2>Where Cleaning Fights Really Start</h2>

        <p>Most cleaning arguments are not about one catastrophic mess. They start small:</p>

        <ul>
          <li>Dishes that “soak” for days in the sink.</li>
          <li>Bathroom floors that are always slightly damp and never really wiped.</li>
          <li>Hair in the drain that no one claims.</li>
          <li>Takeaway boxes living on the counter long after the meal.</li>
        </ul>

        <p>
          At first, you let it go. Then you quietly start doing more of the work yourself. Over time, that
          unpaid, unrecognised labour becomes resentment: <em>apparently, I’m the only one who cares</em>.
        </p>

        <h2>Why "Are You Clean?" Is the Wrong Question</h2>

        <p>
          When you ask a potential roommate “Are you clean?”, they answer based on their own internal
          standard. You hear it through yours. You both walk away thinking, “We’re on the same page.” You
          are not.
        </p>

        <p>
          To avoid that gap, you need questions that anchor to <strong>behaviour, not adjectives</strong>.
          That is exactly how Domu Match approaches cleanliness.
        </p>

        <h2>The Domu Method: Behaviour-Based Cleaning Questions</h2>

        <p>
          Instead of asking people to rate themselves as “clean” or “messy”, we ask questions like:
        </p>

        <ul>
          <li>&quot;How long do dishes usually stay in your sink?&quot;</li>
          <li>&quot;How often do you clean the bathroom (toilet, shower, sink)?&quot;</li>
          <li>&quot;Which best describes your room most of the time?&quot;</li>
          <li>&quot;How stressed do you feel when shared spaces are cluttered?&quot;</li>
        </ul>

        <p>
          Those answers map directly to day-to-day reality. They also give you neutral language to talk
          about expectations with potential housemates. You can explore those patterns in detail on your{' '}
          <Link href="/matches">
            Domu Match compatibility report
          </Link>
          .
        </p>

        <h2>Questions You Should Ask in Real Life</h2>

        <p>Whether or not you use Domu Match, steal these questions for your next viewing:</p>

        <ul>
          <li>&quot;When you say you’re clean, what does that look like in a typical week?&quot;</li>
          <li>&quot;What was the cleaning system in your last place? Did it work for you?&quot;</li>
          <li>&quot;How do you feel if someone leaves their dishes until the next day?&quot;</li>
          <li>&quot;Who usually notices mess first - you or the people you live with?&quot;</li>
        </ul>

        <p>
          Listen less to whether they say the “right” thing and more to whether their answers are specific
          and realistic. Vague answers now usually mean vague effort later.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=1200&q=80"
            alt="Shared student kitchen with dishes and cleaning supplies"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            A simple, shared system for dishes and cleaning is less about perfection and more about fairness.
          </figcaption>
        </figure>

        <h2>Agree on Systems, Not Just Standards</h2>

        <p>
          Even if you do not perfectly agree on what “clean” means, you can still live together if you agree
          on <strong>systems</strong>:
        </p>

        <ul>
          <li>A rota for bathroom and kitchen cleaning.</li>
          <li>Ground rules like “no dishes left overnight” or “clear counters by the next day”.</li>
          <li>What happens if someone consistently does not pull their weight.</li>
        </ul>

        <p>
          Domu Match makes it easier to build those systems because you are starting from aligned habits.
          You are not forcing a neat freak and a chaos goblin into the same kitchen and hoping for the best.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          Carlson, D. L., Hanson, S., &amp; Fitzroy, A. (2016). The division of child care, sexual
          intimacy, and relationship quality in couples. <em>Gender &amp; Society, 30</em>(3), 442–466.{' '}
          <a
            href="https://journals.sagepub.com/doi/10.1177/0891243215626709"
            target="_blank"
            rel="noreferrer"
          >
            https://journals.sagepub.com/doi/10.1177/0891243215626709
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Waarom “ik ben netjes” weinig zegt (en wat je beter kunt vragen)',
    excerpt:
      '“Netjes” is subjectief. Voor de één betekent het “geen schimmel”, voor de ander “alles wekelijks schrobben”. Leer hoe je op gedrag matcht in plaats van op bijvoeglijke naamwoorden.',
    publishDate: '2025-12-15',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Evidence-based tips om verder te kijken dan eerste indrukken en mooie woorden.',
      },
      {
        title: 'Match op gewoontes',
        href: '/matches',
        description:
          'Gebruik de vragen van Domu Match over schoonmaak, afwas en gedeelde ruimtes om passende huisgenoten te vinden.',
      },
    ],
    ctaTitle: 'Match op gedrag, niet op labels',
    ctaDescription:
      'Domu Match vraagt niet “ben je netjes?”, maar “hoe lang blijven je afwas en troep staan?”.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Start je profiel',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Als iemand zegt “ik ben netjes”, weet je eigenlijk nog niets. De één bedoelt “er ligt geen vuilnis
          op de grond”, de ander “ik poets wekelijks de voegen”. Conflicten ontstaan precies in dat gat
          tussen twee definities.
        </p>

        <p>
          Vraag daarom niet óf iemand netjes is, maar hoe hun week er praktisch uitziet: hoe snel doen ze
          afwas, hoe vaak pakken ze de badkamer aan en hoe snel stoort rommel hen. Domu Match helpt daarbij
          door die vragen al voor je te stellen in de{' '}
          <Link href="/onboarding">
            compatibiliteitsvragenlijst
          </Link>
          .
        </p>

        <h2>Referentie</h2>

        <p className="text-sm text-slate-300">
          Carlson, D. L., Hanson, S., &amp; Fitzroy, A. (2016). The division of child care, sexual
          intimacy, and relationship quality in couples. <em>Gender &amp; Society, 30</em>(3), 442–466.{' '}
          <a
            href="https://journals.sagepub.com/doi/10.1177/0891243215626709"
            target="_blank"
            rel="noreferrer"
          >
            https://journals.sagepub.com/doi/10.1177/0891243215626709
          </a>
        </p>
      </div>
    ),
  },
}

export function WhyImCleanIsALieArticle() {
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

