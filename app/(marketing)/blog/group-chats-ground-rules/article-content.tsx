'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
    excerpt:
      'Every flat has rules. The healthy ones write them down. Use a short house meeting to turn invisible expectations about noise, guests and cleaning into clear agreements.',
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
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'A plain-language framework for the topics that matter in shared living and how to structure the conversation.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Most student houses have rules. In the calm ones, they are written down. In the chaotic ones, they
          only appear as 37‑message group chat arguments at 1 a.m. Ground rules are not about being strict;
          they are about giving everyone the same script so you are not constantly guessing what is okay.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Housemates at a shared table with laptops, chatting and coordinating"
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
          If you have never had a house meeting, it can feel awkward to raise these topics. The easiest way
          to reduce awkwardness is to use a neutral agenda: noise, guests, chores, shared items, and how
          conflicts get repaired. You can treat the first meeting like a setup step, not a confrontation.
        </p>

        <ul>
          <li>How often you want guests and overnight stays.</li>
          <li>How long dishes sit in the sink.</li>
          <li>Preferred quiet hours on weeknights and weekends.</li>
          <li>Whether you prefer a social hub or a calm base.</li>
        </ul>

        <p>
          If you want a framework for which topics matter (and why), see <Link href="/how-it-works">How Matching Works</Link>.
          The point is not to outsource the conversation, it is to make the conversation easier to have.
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

        <h2>Turn expectations into a one-page agreement</h2>

        <p>
          The most effective “house rules” document is short. One page. A few bullet points per topic. The
          point is shared memory, not perfect compliance. Review it once after the first month, then again
          around exam season when routines change.
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Groepsapps & huisregels: afspraken maken zonder de sfeer te slopen',
    excerpt:
      'Elke studentenwoning heeft regels. In de rustige huizen staan ze zwart op wit. Maak met één kort huisoverleg verwachtingen over geluid, logees en schoonmaak concreet.',
    publishDate: '2026-02-02',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'De “derde wiel”-regel',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'Maak eerlijke afspraken over partners en logees in een gedeeld huis.',
      },
      {
        title: 'Waarom “ik ben netjes” weinig zegt',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          'Maak schoonmaakverwachtingen concreet met gedragsvragen in plaats van vage labels.',
      },
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description:
          'Een raamwerk voor welke onderwerpen ertoe doen, en hoe je een gesprek structureert zonder drama.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          De meeste huisruzies worden niet in het echt uitgevochten, maar in de groepsapp. Door afspraken vroeg
          en concreet te maken, hoeft je telefoon geen slagveld te worden.
        </p>

        <p>
          Het helpt om lastige onderwerpen - geluid, gasten, schoonmaak - niet pas te bespreken als iemand al
          boos is. Plan één kort huisoverleg in de eerste weken. Gebruik een neutrale agenda: stilte-uren,
          logees, afwas, gedeelde kosten en hoe je irritaties bespreekt. Schrijf de uitkomst op in één notitie
          en verwijs ernaar als er later discussie ontstaat.
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

