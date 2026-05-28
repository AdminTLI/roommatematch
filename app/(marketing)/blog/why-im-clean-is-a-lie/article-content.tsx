'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
    excerpt:
      '“Clean” is not a standard, it is a self-image. Use behaviour-based questions to align expectations about dishes, bathrooms, and shared spaces before resentment starts.',
    publishDate: '2025-12-15',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'A practical checklist for screening routines, boundaries, chores, money reliability, and communication.',
      },
      {
        title: 'When Dishes = Disrespect',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Why tiny chores turn into big conflict, and how fairness becomes an emotional issue.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to set house norms without passive-aggressive messages and escalating tension.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          “I’m clean.” “I’m tidy.” “I don’t like mess.” You have probably heard all three. Maybe you have said
          them. The problem is that they mean almost nothing without context. Two people can both believe they
          are “clean” and still end up fighting over a chopping board.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Person wiping down a kitchen counter in a shared flat"
          />
          <figcaption>
            Most cleaning conflict starts with mismatched definitions, not malice.
          </figcaption>
        </figure>

        <h2>&quot;Clean&quot; is not a standard, it is a story</h2>

        <p>
          When someone says “I’m clean”, they are often describing how they like to see themselves, not an
          objective routine. For one person, “clean” means no visible rubbish and no mould. For another, it
          means vacuuming weekly, disinfecting surfaces, and never leaving clothes on chairs.
        </p>

        <p>
          Household labour research also shows a common pattern: people underestimate what they do, and
          perceive their contribution as fair even when labour is uneven (Carlson et al., 2016). In a shared
          flat, that bias shows up as “I already do enough” while the other person feels like the default
          cleaner.
        </p>

        <h2>Where cleaning fights actually start</h2>

        <p>Most arguments are not about one catastrophic mess. They start small and repeat:</p>

        <ul>
          <li>Dishes that “soak” for days.</li>
          <li>Bathroom floors that stay damp and never get wiped.</li>
          <li>Hair in the drain that no one claims.</li>
          <li>Takeaway boxes living on the counter long after the meal.</li>
        </ul>

        <p>
          At first you let it go. Then you quietly do more of the work yourself. Over time, that unpaid,
          unrecognised labour turns into resentment: <em>apparently, I’m the only one who cares</em>.
        </p>

        <h2>Why “Are you clean?” is the wrong question</h2>

        <p>
          When you ask a potential roommate “Are you clean?”, they answer using their own internal standard.
          You hear it through yours. You both walk away thinking you are aligned. You are not.
        </p>

        <p>
          To avoid that gap, you need questions anchored to <strong>behaviour</strong>, not adjectives. You want
          answers you can picture in real life.
        </p>

        <h2>Behaviour-based questions you can copy</h2>

        <p>Use questions like these in viewings or first-week house meetings:</p>

        <ul>
          <li>How long do dishes usually stay in your sink after cooking?</li>
          <li>How often do you clean the bathroom (toilet, shower, sink)?</li>
          <li>What does “a normal weekday at home” look like for you?</li>
          <li>How do you feel if shared spaces are cluttered for a day or two?</li>
          <li>Do you prefer a rota, or “whoever sees it does it”?</li>
        </ul>

        <p>
          Listen less for the “right” answer and more for specificity. Vague answers now usually mean vague
          effort later.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Clean kitchen with dishes and cooking supplies on the counter"
          />
          <figcaption>
            A shared system for dishes and cleaning is less about perfection and more about fairness.
          </figcaption>
        </figure>

        <h2>Agree on systems, not just standards</h2>

        <p>
          Even if you do not perfectly agree on what “clean” means, you can still live together if you agree
          on systems:
        </p>

        <ul>
          <li>A rota for bathroom and kitchen cleaning.</li>
          <li>Ground rules like “no dishes left overnight” or “clear counters by the next day”.</li>
          <li>What happens if someone repeatedly does not pull their weight.</li>
        </ul>

        <p>
          If you want the emotional side of chores, read{' '}
          <Link href="/blog/when-dishes-equal-disrespect">When Dishes = Disrespect</Link>. If you want a
          lightweight way to turn preferences into house norms, use{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>.
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
    title: 'Waarom “ik ben netjes” weinig zegt (en wat je beter kunt vragen)',
    excerpt:
      '“Netjes” is geen standaard maar een zelfbeeld. Gebruik gedragsvragen om verwachtingen over afwas, badkamer en gedeelde ruimtes gelijk te trekken vóórdat irritatie ontstaat.',
    publishDate: '2025-12-15',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Een praktische checklist om ritme, grenzen, klusjes, geld en communicatie te screenen.',
      },
      {
        title: 'Als afwas = disrespect',
        href: '/blog/when-dishes-equal-disrespect',
        description:
          'Waarom kleine klusjes grote conflicten worden en waarom eerlijkheid emotioneel wordt.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Huisnormen afspreken zonder passief-agressieve appjes en escalatie.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          “Ik ben netjes.” “Ik ben schoon.” “Ik houd niet van rommel.” Je hoort het vaak, en misschien zeg je
          het zelf ook. Het probleem is dat het zonder context bijna niets betekent. Twee mensen kunnen zich
          allebei netjes noemen en alsnog ruzie krijgen over een snijplank.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="sharedKitchen"
            alt="Iemand veegt een aanrecht schoon in een gedeelde keuken"
          />
          <figcaption>
            De meeste schoonmaakconflicten beginnen bij verschillende definities, niet bij slechte intenties.
          </figcaption>
        </figure>

        <h2>“Netjes” is geen standaard, het is een verhaal</h2>

        <p>
          Als iemand zegt “ik ben netjes”, beschrijft die vaak een zelfbeeld, niet een vaste routine. Voor de één
          betekent netjes “geen afval, geen schimmel”. Voor de ander betekent het “wekelijks stofzuigen,
          oppervlakken desinfecteren en geen kleren op stoelen”.
        </p>

        <p>
          Onderzoek naar huishoudelijk werk laat ook zien dat mensen vaak onderschatten wat ze doen en hun bijdrage
          als eerlijk ervaren, zelfs als de verdeling scheef is (Carlson et al., 2016). In een studentenhuis zie
          je dat terug als “ik doe al genoeg”, terwijl de ander zich de standaard-opruimer voelt.
        </p>

        <h2>Waar schoonmaakruzies echt beginnen</h2>

        <p>Meestal gaat het niet om één gigantische puinhoop. Het begint klein en herhaalt zich:</p>

        <ul>
          <li>Afwas die “even weken” en dan dagen blijft staan.</li>
          <li>Badkamervloer die altijd nat is en nooit echt wordt gedroogd.</li>
          <li>Haar in het putje waar niemand verantwoordelijk voor is.</li>
          <li>Bakjes en verpakkingen die op het aanrecht blijven wonen.</li>
        </ul>

        <p>
          Eerst laat je het gaan. Daarna ga je stilletjes meer doen. Uiteindelijk wordt die onbetaalde, onzichtbare
          arbeid wrok: <em>blijkbaar ben ik de enige die het ziet</em>.
        </p>

        <h2>Waarom “Ben je netjes?” de verkeerde vraag is</h2>

        <p>
          Als je vraagt “ben je netjes?”, antwoordt iemand vanuit een eigen standaard. Jij hoort het vanuit die van jou.
          Jullie denken allebei dat jullie op één lijn zitten. Dat is meestal niet zo.
        </p>

        <p>
          Daarom heb je gedragsvragen nodig, geen bijvoeglijke naamwoorden. Je wilt antwoorden die je kunt
          visualiseren in het dagelijks leven.
        </p>

        <h2>Gedragsvragen die je kunt kopiëren</h2>

        <p>Gebruik deze vragen tijdens een bezichtiging of in een huisoverleg in week 1:</p>

        <ul>
          <li>Hoe lang blijft afwas meestal staan na het koken?</li>
          <li>Hoe vaak maak jij de badkamer schoon (toilet, douche, wastafel)?</li>
          <li>Hoe ziet een normale doordeweekse avond thuis eruit?</li>
          <li>Hoe voel je je als gedeelde ruimtes één of twee dagen rommelig zijn?</li>
          <li>Wil je liever een schema, of “wie het ziet doet het”?</li>
        </ul>

        <p>
          Luister minder naar het “juiste” antwoord en meer naar concreetheid. Vage antwoorden nu betekenen vaak vage
          inzet later.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Opgeruimde keuken met enkele spullen op het aanrecht"
          />
          <figcaption>
            Een gedeeld systeem voor afwas en schoonmaak gaat minder over perfectie en meer over eerlijkheid.
          </figcaption>
        </figure>

        <h2>Spreek systemen af, niet alleen standaarden</h2>

        <p>Ook als jullie niet dezelfde standaard hebben, kun je goed samenwonen als je systemen afspreekt:</p>

        <ul>
          <li>Een rota voor keuken en badkamer.</li>
          <li>Huisregels zoals “geen afwas ’s nachts” of “aanrecht leeg voor morgen”.</li>
          <li>Wat er gebeurt als iemand structureel niet meedoet.</li>
        </ul>

        <p>
          Voor de emotionele kant van klusjes: <Link href="/blog/when-dishes-equal-disrespect">Als afwas = disrespect</Link>.
          Voor het omzetten van voorkeuren naar afspraken: <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link>.
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

