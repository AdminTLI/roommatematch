'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
    excerpt:
      'Partners and guests can quietly turn a two-person flat into a three-person one. Learn how to set fair expectations around overnight stays, space, and resources before it becomes a crisis.',
    publishDate: '2025-11-28',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Protect yourself with clear agreements, safe contacts, and an understanding of your tenant rights.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'See how Domu Match asks about guest frequency and social habits before you move in.',
      },
      {
        title: 'Start Matching on Guest Preferences',
        href: '/matches',
        description:
          'Filter roommates by how often they want guests and partners to stay over, so you agree on the rules in advance.',
      },
    ],
    ctaTitle: 'Avoid Becoming the Third Wheel in Your Own Home',
    ctaDescription:
      'Use Domu Match’s guest frequency and social habits filters to find housemates who share your boundaries around partners and visitors.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Match on Guest Policies',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Nobody mentions this on campus tours, but here it is: when you choose a roommate, you are also
          choosing every partner and situationship that comes with them. If you do not talk about that up
          front, your two-person room can quietly become a three-person one - and you become the permanent
          third wheel in your own home.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
            alt="Three students sitting on a sofa where one looks left out"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Without a shared guest policy, partners can accidentally turn your home into a place you feel
            squeezed out of.
          </figcaption>
        </figure>

        <h2>The Unwritten Rule No One Actually Agrees On</h2>

        <p>
          Most shared flats operate on a vague &quot;understanding&quot; about partners staying over:
          &quot;a few nights is fine&quot;, &quot;as long as they are respectful&quot;, &quot;they help out
          sometimes&quot;. But because nobody wants to sound jealous or controlling,{' '}
          <strong>no one gets specific</strong>.
        </p>

        <p>
          That is how you end up with:
        </p>

        <ul>
          <li>A partner effectively living there five nights a week.</li>
          <li>One more person using the shower, kitchen, Wi‑Fi and fridge every day.</li>
          <li>Higher bills for electricity and water that no one planned for.</li>
          <li>You timing your day around when someone else&apos;s relationship is happening in your space.</li>
        </ul>

        <p>
          The tension is rarely about the partner as a person. It is about <strong>space, resources, and
          consent</strong>. You never agreed to live with them, but it slowly starts to feel like you do.
        </p>

        <h2>It Is Not About the Person, It Is About the Space</h2>

        <p>
          From a psychological angle, chronic roommate frustration around partners usually maps to a few core
          needs:
        </p>

        <ul>
          <li>
            <strong>Autonomy</strong>: you want to feel you have a say over who is in your home, and when.
          </li>
          <li>
            <strong>Fairness</strong>: if someone is effectively using the flat like home, it feels fair that
            they contribute.
          </li>
          <li>
            <strong>Safety and privacy</strong>: you need spaces where you can relax without an audience.
          </li>
        </ul>

        <p>
          When those needs are not met, your brain does not think &quot;this is about fridge space.&quot; It
          thinks, <em>my room does not feel like mine anymore</em>.
        </p>

        <p>
          That sense of crowding has real wellbeing impacts. Studies on shared housing and student mental
          health link perceived lack of control at home with more stress and lower life satisfaction (e.g.,
          see reviews on student housing experiences by the European Students&apos; Union, 2021). Your guest
          policy is not a petty detail - it is infrastructure for your nervous system.
        </p>

        <h2>Why You Need a "Third Wheel" Policy</h2>

        <p>
          A &quot;Third Wheel&quot; policy is just a clear, shared agreement on:
        </p>

        <ul>
          <li>How many nights per week partners or guests can stay over.</li>
          <li>What happens when that limit is regularly exceeded.</li>
          <li>When a frequent guest is expected to chip in for utilities.</li>
          <li>Where lines are around privacy, noise and shared spaces.</li>
        </ul>

        <p>
          The key is timing. You want this conversation to happen{' '}
          <strong>before you move in together, not mid-crisis</strong>. It is much easier to set ground rules
          while everyone is calm than after months of built-up resentment.
        </p>

        <h2>How Domu Match Handles Guest Frequency Up Front</h2>

        <p>
          Domu Match bakes this into the questionnaire so you do not have to improvise. Instead of asking,
          &quot;Are you okay with guests?&quot; (everyone says yes), we ask:
        </p>

        <ul>
          <li>&quot;How many nights per week are you comfortable with overnight guests?&quot;</li>
          <li>
            &quot;What best describes your ideal guest policy?&quot; with options ranging from &quot;rarely
            ever&quot; to &quot;partner basically lives with me.&quot;
          </li>
          <li>&quot;Should long-term partners contribute to utilities if they stay often?&quot;</li>
        </ul>

        <p>
          When you match through Domu Match, you can <strong>filter and compare people</strong> not just on
          lifestyle and study habits, but specifically on guest expectations. That means you can:
        </p>

        <ul>
          <li>Match with people who also prefer a &quot;no regular sleepovers&quot; home.</li>
          <li>Or, if you are the one in a long-term relationship, match with people who are explicitly okay
            with that.
          </li>
          <li>See potential friction before you sign a lease together.</li>
        </ul>

        <p>
          You can explore those options any time via the{' '}
          <Link href="/matches">
            matching dashboard
          </Link>
          .
        </p>

        <h2>Scripts You Can Borrow for Real Life</h2>

        <p>Some language you can use with current or future roommates:</p>

        <ul>
          <li>
            <strong>Before you move in:</strong> &quot;I know guests are part of student life, but I function
            best if our home does not feel crowded. Could we agree a rough cap on overnights, like 1–2 nights
            a week?&quot;
          </li>
          <li>
            <strong>If it is already a problem:</strong> &quot;I really like [name], but the number of nights
            they are here is making the flat feel more crowded than we agreed. Can we set a weekly limit that
            feels fair to everyone?&quot;
          </li>
          <li>
            <strong>On money:</strong> &quot;If someone is staying here three or more nights a week, using
            the shower and cooking here, could we talk about them contributing a bit to utilities?&quot;
          </li>
        </ul>

        <h2>Designing a Home Where Everyone Feels Invited - Not Replaced</h2>

        <p>
          The goal is not to ban partners. It is to design a home where:
        </p>

        <ul>
          <li>You feel safe bringing up discomfort without being labelled jealous.</li>
          <li>Partners feel welcome, but not like unofficial tenants who never got consent from everyone.</li>
          <li>Your home still feels like <em>your</em> base, even when relationships evolve.</li>
        </ul>

        <p>
          Domu Match helps by turning messy, emotional topics into neutral data points and filters. Instead
          of silently hoping your roommate is &quot;reasonable&quot;, you can match with people whose guest
          expectations actually look like yours.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          European Students&apos; Union. (2021). <em>Student housing and wellbeing in Europe</em>. Brussels,
          Belgium. Retrieved from{' '}
          <a
            href="https://www.esu-online.org/?policy=student-housing"
            target="_blank"
            rel="noreferrer"
          >
            https://www.esu-online.org/?policy=student-housing
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'De “derde wiel”-regel: zo ga je om met partners in een gedeeld huis',
    excerpt:
      'Wanneer partners vaak blijven slapen, verandert je huis stilletjes in een driepersoonshuishouden. Leer hoe je eerlijke afspraken maakt over logees, ruimte en kosten.',
    publishDate: '2025-11-28',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Bescherm jezelf met duidelijke afspraken, veilige contacten en kennis van je huurdersrechten.',
      },
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description:
          'Lees hoe Domu Match vooraf naar logeer- en gastvoorkeuren vraagt.',
      },
      {
        title: 'Match op logeerbeleid',
        href: '/matches',
        description:
          'Vind huisgenoten die hetzelfde denken over logees en partners, vóórdat je een contract tekent.',
      },
    ],
    ctaTitle: 'Voorkom dat jij de derde wiel wordt',
    ctaDescription:
      'Gebruik de gast- en logeerfilters van Domu Match om huisgenoten te vinden die jouw grenzen respecteren.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Partners horen bij studentenleven, maar zonder duidelijke afspraken kunnen ze je huis ongemerkt
          overnemen. De “derde wiel”-regel draait niet om mensen buitensluiten, maar om samen bepalen wat
          eerlijk en leefbaar is.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
            alt="Drie studenten op een bank waarvan één zich buitengesloten voelt"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Zonder heldere afspraken kan een partner langzaam de rol van onzichtbare huisgenoot krijgen.
          </figcaption>
        </figure>

        <p>
          Bespreek vóórdat je gaat samenwonen hoe vaak logees welkom zijn, wanneer iemand feitelijk meewoond
          en of er dan meebetaald wordt. De vragenlijst van Domu Match maakt dit gesprek makkelijker door
          concrete vragen te stellen over overnachtingen en gasten. Meer daarover lees je op{' '}
          <Link href="/how-it-works">
            “Zo werkt het”
          </Link>
          .
        </p>

        <h2>Referentie</h2>

        <p className="text-sm text-slate-300">
          European Students&apos; Union. (2021). <em>Student housing and wellbeing in Europe</em>. Brussel,
          België. Geraadpleegd via{' '}
          <a
            href="https://www.esu-online.org/?policy=student-housing"
            target="_blank"
            rel="noreferrer"
          >
            https://www.esu-online.org/?policy=student-housing
          </a>
        </p>
      </div>
    ),
  },
}

export function ThirdWheelPolicyArticle() {
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

