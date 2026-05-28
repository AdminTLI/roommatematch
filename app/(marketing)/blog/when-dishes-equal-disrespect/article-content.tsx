'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
    excerpt:
      'No one explodes over one plate. A guide to the psychology of chores in shared spaces, why “fair” is emotional, and what questions prevent a slow resentment build.',
    publishDate: '2026-01-27',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'Why "I’m Clean" Is a Lie',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          '“Clean” is subjective. Learn which behaviour-based questions to ask before you move in.',
      },
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Evidence-based tips for choosing roommates who respect your time, space and boundaries.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'Turn chore expectations into an agreement that does not rely on passive-aggressive reminders.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Very few people genuinely lose it over a single plate in the sink. They lose it over the fiftieth
          plate, after months of feeling like the only adult in the kitchen. In shared living, chores are
          never just about soap and sponges - they are about respect, fairness and feeling seen.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Sink full of dirty dishes in a shared student kitchen"
          />
          <figcaption>
            A sink like this is rarely about “forgetfulness” alone; it often signals unequal emotional and
            practical labour.
          </figcaption>
        </figure>

        <h2>Why Chores Feel So Personal</h2>

        <p>
          Household labour research shows that when one person consistently does more invisible work, it is
          strongly linked with lower relationship satisfaction and more conflict (Carlson, Hanson, &amp;
          Fitzroy, 2016). In a house or flat, that “invisible work” includes:
        </p>

        <ul>
          <li>Noticing the bin is full.</li>
          <li>Remembering to buy bin bags and dish soap.</li>
          <li>Scraping plates, wiping counters and cleaning the microwave.</li>
          <li>Being the one who cannot ignore the smell or the mess.</li>
        </ul>

        <p>
          If you are the person who notices, it is easy for your brain to translate &quot;they left the pan
          again&quot; into &quot;my time matters less than theirs&quot;.
        </p>

        <h2>How Tiny Tasks Turn Into Big Stories</h2>

        <p>Over time, repeated patterns of “forgetting” or “I’ll do it later” write quiet stories in your head:</p>

        <ul>
          <li>&quot;I guess I’m the only one who cares if this place is livable.&quot;</li>
          <li>&quot;They assume I’ll clean it because I always have.&quot;</li>
          <li>&quot;If I do not clean it, no one will.&quot;</li>
        </ul>

        <p>
          That narrative is what explodes over a frying pan. The pan is just the last straw. When you feel
          like someone does not see or respect your effort, every new dish feels like disrespect.
        </p>

        <h2>Ask behaviour, not identity</h2>

        <p>
          The fastest way to avoid a chores war is to stop asking identity questions like “Are you tidy?” and
          ask behaviour questions instead:
        </p>

        <ul>
          <li>&quot;How long do dishes usually stay in your sink?&quot;</li>
          <li>&quot;How often do you clean shared spaces like the kitchen and bathroom?&quot;</li>
          <li>&quot;How do you feel if someone leaves their things in shared spaces for a few days?&quot;</li>
          <li>&quot;Do you prefer a rota, or ‘whoever sees it does it’?&quot;</li>
        </ul>

        <p>
          These questions do two things. They reveal the real standard, and they give you neutral language for
          agreements. If you want a simple way to turn answers into house rules, use{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="contractSigning"
            alt="Hands washing dishes in a shared kitchen sink"
          />
          <figcaption>
            You do not need identical standards - just a shared sense of fairness and a system that everyone
            actually follows.
          </figcaption>
        </figure>

        <h2>Questions to Ask Before You Share a Kitchen</h2>

        <p>Use these in viewings or first‑week house meetings:</p>

        <ul>
          <li>&quot;In your last place, who usually did the cleaning? How did that feel?&quot;</li>
          <li>&quot;What is your ideal system for chores: rota, checklist, or flexible?&quot;</li>
          <li>&quot;How quickly should dishes be done after cooking? Same day, next day, end of week?&quot;</li>
          <li>&quot;What would make you feel taken for granted around cleaning?&quot;</li>
        </ul>

        <p>
          The goal is not to get perfect answers, but to see whether people are self‑aware and willing to be
          specific.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          Carlson, D. L., Hanson, S., &amp; Fitzroy, A. (2016). The division of child care, sexual intimacy,
          and relationship quality in couples. <em>Gender &amp; Society, 30</em>(3), 442–466.{' '}
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
    title: 'Als afwas = disrespect: hoe kleine taken grote irritaties worden',
    excerpt:
      'Niemand ontploft door één bord. Leer hoe ongelijk verdeelde klusjes onder je huid kruipen – en hoe Domu Match je helpt matchen met mensen die meedoen.',
    publishDate: '2026-01-27',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Waarom “ik ben netjes” weinig zegt',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          '“Netjes” is een label. Ontdek welke concrete vragen je beter stelt over schoonmaak.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Afwasconflicten gaan zelden over één keer “vergeten”. Ze gaan over steeds weer dezelfde persoon die
          opdraait voor troep die niet van hen is. Dat voelt op den duur niet meer als rommel, maar als
          minachting voor je tijd.
        </p>

        <p>
          In Domu Match kun je al vroeg zien hoe iemand naar klusjes kijkt: via vragen over hoe snel afwas
          gedaan wordt, hoe vaak er wordt schoongemaakt en of iemand liever een strak schema of een losse
          afspraak heeft. Zo voorkom je dat jij straks de enige bent met een afwasspons in je hand.
        </p>

        <h2>Referentie</h2>

        <p className="text-sm text-slate-300">
          Carlson, D. L., Hanson, S., &amp; Fitzroy, A. (2016). The division of child care, sexual intimacy,
          and relationship quality in couples. <em>Gender &amp; Society, 30</em>(3), 442–466.{' '}
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

export function WhenDishesEqualDisrespectArticle() {
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

