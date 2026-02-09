'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
    excerpt:
      'You usually know in the first two weeks if something feels off. Learn which early warning signs to take seriously, what you can still change, and how to avoid repeating the pattern.',
    publishDate: '2026-02-09',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'See how ignoring early warning signs can lead to broken leases, lost deposits and burnt-out semesters.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Protect yourself legally and financially if you decide a housing situation is not safe or sustainable.',
      },
      {
        title: 'Start Planning Your Next Match',
        href: '/matches',
        description:
          'Use Domu Match to build a safer, more compatible plan for your next move instead of repeating the same dynamic.',
      },
    ],
    ctaTitle: 'Trust Your Nervous System - Then Make a Plan',
    ctaDescription:
      'If move‑in week feels wrong, you are allowed to notice that. Domu Match can help you design a better match next time.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Plan a Better Match',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Most students know within the first two weeks if a living situation feels off. The problem is that
          you are also being told - directly or indirectly - to &quot;give it time&quot;, &quot;be more chill&quot;
          or &quot;everyone struggles at first&quot;. There is a difference between normal adjustment and
          genuine red flags.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"
            alt="Student sitting on moving boxes looking uncertain"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Move‑in week is when you see the raw version of how people actually live - before everyone starts
            masking.
          </figcaption>
        </figure>

        <h2>Normal Awkward vs. Real Red Flag</h2>

        <p>Some discomfort is normal:</p>

        <ul>
          <li>Forgetting names, bumping into each other in the kitchen, small talk overload.</li>
          <li>Not knowing whose mug is whose yet.</li>
          <li>Minor noise or timing clashes while everyone figures out routines.</li>
        </ul>

        <p>
          Red flags are patterns that signal safety, respect or compatibility problems - not just personality
          quirks.
        </p>

        <h2>Move-In Week Red Flags to Take Seriously</h2>

        <p>Pay attention if you notice:</p>

        <ul>
          <li>
            <strong>Repeated boundary breaks</strong>: people walking into your room without knocking, going
            through your things, or dismissing &quot;I need to sleep&quot; as overreacting.
          </li>
          <li>
            <strong>Disrespect for agreements</strong>: house rules you agreed before moving in are ignored on
            day one.
          </li>
          <li>
            <strong>Concerning substance use</strong>: heavy use that makes you feel unsafe or affects your
            ability to rest or study.
          </li>
          <li>
            <strong>Hostility or bullying dynamics</strong>: people being mocked in group chats, ganging up or
            being frozen out.
          </li>
          <li>
            <strong>Pressure to sign or pay for things you do not understand</strong>: rushed contracts,
            additional &quot;fees&quot; that were not discussed, or pressure to pay cash without records.
          </li>
        </ul>

        <p>
          Your nervous system is there to keep you alive, not to keep everyone comfortable. If you feel
          constantly on edge at home, that information matters.
        </p>

        <h2>What You Can Still Adjust in the First Weeks</h2>

        <p>Before you jump to moving out, there are steps you can try:</p>

        <ul>
          <li>
            <strong>Clarify expectations</strong> – use a short house meeting to agree on quiet hours, guests
            and cleaning (see our article{' '}
            <Link href="/blog/group-chats-ground-rules">
              Group Chats, Ground Rules
            </Link>
            ).
          </li>
          <li>
            <strong>Use &quot;I&quot; statements</strong> – &quot;I am finding it hard to sleep when there’s
            noise after midnight. Could we agree on a quiet time on weeknights?&quot;
          </li>
          <li>
            <strong>Document serious issues</strong> – especially safety, harassment or illegal behaviour.
          </li>
          <li>
            <strong>Involve support</strong> – talk to your university housing or student support service
            early, not after months of misery.
          </li>
        </ul>

        <p>
          If things improve after clear conversations, you may simply have had a rough landing. If nothing
          changes - or you are punished for speaking up - that is important data.
        </p>

        <h2>If You Need to Leave</h2>

        <p>
          Sometimes the safest, sanest choice is to get out. In that case, your financial and legal safety net
          matters. Our{' '}
          <Link href="/blog/safety-checklist-for-student-renters">
            safety checklist
          </Link>{' '}
          covers contracts, deposits and your tenant rights. Many universities also have mediation or housing
          advisers who can help you navigate next steps.
        </p>

        <p>
          Yes, there are costs to leaving - but there are also costs to staying somewhere that is wrecking your
          sleep, focus and mental health. Those costs often show up later as failed modules, extended degrees
          and heavy burnout (American Psychological Association, 2019).
        </p>

        <h2>Designing the Next Chapter Differently</h2>

        <p>
          Whether you stay or go, move‑in week is valuable data for your next choice. Ask yourself:
        </p>

        <ul>
          <li>What specifically felt off - sleep, guests, cleanliness, communication, safety?</li>
          <li>What warning signs did I ignore because I felt desperate for housing?</li>
          <li>What are my non‑negotiables for the next place?</li>
        </ul>

        <p>
          You can literally encode those lessons into your Domu Match profile. Be honest about your sleep
          needs, guest boundaries, cleaning standards and social battery. Then let the matching engine help
          you filter for people whose answers align.
        </p>

        <p>
          You can start that reset any time on our{' '}
          <Link href="/auth/sign-up">
            sign‑up page
          </Link>
          .
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
      </div>
    ),
  },
  nl: {
    title: 'Red flags in je eerste woonweek: signalen dat deze woonsituatie je jaar kan slopen',
    excerpt:
      'Vaak voel je binnen twee weken al dat een huis niet goed zit. Leer welke signalen je serieus moet nemen en hoe je voorkomt dat je dezelfde fout nóg een keer maakt.',
    publishDate: '2026-02-09',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'Lees hoe blijven in een slechte situatie je geld, energie en cijfers kost.',
      },
    ],
    ctaTitle: 'Vertrouw je gevoel – en maak een plan',
    ctaDescription:
      'Gebruik je ervaringen van deze woning om via Domu Match bewuster een volgende match te kiezen.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Plan je volgende match',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Als je in de eerste week al denkt “oef, dit wordt hem niet”, dan klopt dat gevoel vaak. Dat betekent
          niet dat je meteen weg moet, wel dat je alert mag zijn en hulp mag inschakelen als het nodig is.
        </p>

        <p>
          Maak onderscheid tussen normale opstart-chaos en echte rode vlaggen zoals grensoverschrijdend gedrag,
          onveiligheid of afspraken die direct worden genegeerd. Praat op tijd met je opleiding, huisvesting
          of een vertrouwenspersoon en leg ernstige dingen vast. Gebruik die ervaring vervolgens in je Domu
          Match-profiel: wat zijn vanaf nu je absolute no‑go’s? Zo vergroot je de kans dat je volgende huis een
          stuk rustiger wordt.
        </p>
      </div>
    ),
  },
}

export function MoveInWeekRedFlagsArticle() {
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

