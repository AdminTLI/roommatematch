'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
    excerpt:
      'Every flat has “rules”. The healthy ones write them down. Learn how to turn Domu Match’s behavioural questions into simple, shared house norms before the group chat explodes.',
    publishDate: '2026-02-02',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'The "Third Wheel" Policy',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'Set fair expectations around partners and overnight guests in shared spaces.',
      },
      {
        title: 'Why "I’m Clean" Is a Lie',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          'Learn how to make cleaning expectations concrete instead of vague labels.',
      },
      {
        title: 'Start Matching on House Norms',
        href: '/matches',
        description:
          'Use Domu Match to find people whose answers on noise, guests and cleaning can be turned into simple rules everyone understands.',
      },
    ],
    ctaTitle: 'Turn Quiet Expectations Into Clear Agreements',
    ctaDescription:
      'Domu Match surfaces the friction points - noise, guests, cleaning - so you can turn them into ground rules before they blow up your group chat.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Match with Rule-Compatible Roommates',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Most student houses have rules. In the calm ones, they are written down. In the chaotic ones, they
          only appear as 37‑message group chat arguments at 1 a.m. Ground rules are not about being strict;
          they are about giving everyone the same script so you are not constantly guessing what is okay.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
            alt="Students sitting around a table with phones and drinks, checking a group chat"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Group chats are great for memes and logistics - but terrible as the only place to negotiate house
            rules.
          </figcaption>
        </figure>

        <h2>Why Houses Without Ground Rules Feel So Tense</h2>

        <p>
          In a house with no clear norms, everyone quietly brings their own assumptions from family or past
          housing. One person thinks &quot;open‑door policy, friends anytime&quot;; another thinks
          &quot;home = decompression zone&quot;. One person assumes dishes can wait a day; another sees
          anything left overnight as gross.
        </p>

        <p>
          Psychologically, unclear expectations increase anxiety and conflict: you are constantly monitoring
          for whether you have crossed an invisible line. When friction finally surfaces, it often comes out
          as blame instead of collaboration.
        </p>

        <h2>Let Domu Match Do the Awkward Part</h2>

        <p>
          Domu Match already asks the uncomfortable questions during onboarding. Things like:
        </p>

        <ul>
          <li>How often you want guests and overnight stays.</li>
          <li>How long dishes sit in the sink.</li>
          <li>Preferred quiet hours on weeknights and weekends.</li>
          <li>Whether you prefer a social hub or a calm base.</li>
        </ul>

        <p>
          That means you can use your{' '}
          <Link href="/matches">
            compatibility report
          </Link>{' '}
          as a ready‑made agenda for your first house meeting. You are not inventing issues; you are simply
          turning existing answers into explicit agreements.
        </p>

        <h2>A Simple House-Meeting Template</h2>

        <p>Keep it short, specific and low‑pressure. For example:</p>

        <ol>
          <li>
            <strong>Noise &amp; quiet hours</strong> – “What’s a reasonable quiet time on weeknights and
            weekends?”
          </li>
          <li>
            <strong>Guests &amp; partners</strong> – “Roughly how many nights a week are people okay with
            overnight guests?”
          </li>
          <li>
            <strong>Cleaning system</strong> – “Do we want a rota, checklist, or another system? What’s the
            minimum standard?”
          </li>
          <li>
            <strong>Shared items</strong> – “What do we share - cleaning stuff, oil and spices, toilet paper?
            How do we split costs?”
          </li>
        </ol>

        <p>
          Write the answers down in a simple note or document. You do not need legal language; you just need
          shared memory.
        </p>

        <h2>How to Use the Group Chat Without Letting It Explode</h2>

        <p>Some quick rules of thumb:</p>

        <ul>
          <li>Use the chat for logistics (“bin day”, “delivery arrived”), not full conflicts.</li>
          <li>If a thread starts spiralling, suggest a short in‑person chat instead.</li>
          <li>Refer back to your agreed rules: “We said max 2 overnights a week - can we stick to that?”</li>
        </ul>

        <p>
          The more specific your initial agreements, the less interpretation - and drama - the group chat has to
          carry.
        </p>

        <h2>Turn Matching Data Into House Rules</h2>

        <p>
          Domu Match gives you the raw ingredients: how everyone answered on guests, noise, cleanliness and
          more. You turn that into a simple, shared “house agreement” that you can revisit once or twice a
          semester.
        </p>

        <p>
          You can start by creating a profile, matching with compatible housemates and then using their
          answers as a starting point for your first house meeting. Start that process on our{' '}
          <Link href="/auth/sign-up">
            sign‑up page
          </Link>
          .
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Groepsapps & huisregels: afspraken maken zonder de sfeer te slopen',
    excerpt:
      'Elke studentenwoning heeft “regels”. In de rustige huizen staan ze zwart op wit. Gebruik Domu Match om samen simpele, duidelijke afspraken te maken.',
    publishDate: '2026-02-02',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'De “derde wiel”-regel',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'Maak eerlijke afspraken over partners en logees in een gedeeld huis.',
      },
    ],
    ctaTitle: 'Maak stille verwachtingen bespreekbaar',
    ctaDescription:
      'Gebruik de antwoorden uit Domu Match als basis voor huisregels waar iedereen achter staat.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          De meeste huisruzies worden niet in het echt uitgevochten, maar in de groepsapp. Door afspraken
          vroeg en concreet te maken, hoeft je telefoon geen slagveld te worden.
        </p>

        <p>
          Domu Match helpt je alvast door lastige onderwerpen – geluid, gasten, schoonmaak – in de
          vragenlijst te verwerken. Gebruik die antwoorden als startpunt voor een kort huisoverleg in de
          eerste weken. Schrijf de uitkomst op en verwijs ernaar als er later discussie ontstaat.
        </p>
      </div>
    ),
  },
}

export function GroupChatsGroundRulesArticle() {
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

