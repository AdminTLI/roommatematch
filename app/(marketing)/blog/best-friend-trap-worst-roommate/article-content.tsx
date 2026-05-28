'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
    excerpt:
      'Friendship chemistry is real, but it is not the same as living compatibility. Before you sign a lease together, stress-test the boring stuff: sleep, guests, chores, money, and conflict style.',
    publishDate: '2025-11-20',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'A practical checklist for screening routines, boundaries, chores, and communication.',
      },
      {
        title: 'The "Third Wheel" Policy',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'How partners and overnight guests change the household system, and how to set fair rules.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'How to set norms without passive-aggressive late-night messages.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Living with your best friend sounds like the safest option: you trust them, you already laugh
          together, and you assume “we get on” will translate into “we will live well”. The trap is that{' '}
          <strong>liking someone is not the same as being compatible in a shared system</strong>. Houses and
          flats run on routines, not vibes.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Two students laughing together on a sofa in a shared apartment"
          />
          <figcaption>
            Great chemistry at brunch does not automatically mean compatible habits on a Tuesday morning.
          </figcaption>
        </figure>

        <h2>Friendship compatibility vs. living compatibility</h2>

        <p>
          Friendship is built on shared memories, humour, and emotional safety. Living compatibility is built
          on small, repeated behaviours: how you handle noise, how you share space, how you manage money, and
          how you repair conflict.
        </p>

        <p>
          Many student conflicts start in the same few domains: privacy, cleanliness, and noise. When those
          expectations are misaligned, resentment accumulates quietly until the friendship starts to feel
          unsafe. For an accessible overview of how stress and mental health pressures show up during study,
          see the American Psychological Association’s reporting on college mental health ({' '}
          <a
            href="https://www.apa.org/monitor/2019/09/cover-college-mental-health"
            target="_blank"
            rel="noreferrer"
          >
            American Psychological Association, 2019
          </a>
          ).
        </p>

        <h2>The micro-frictions that break good friendships</h2>

        <p>
          Most roommate fallouts do not start with betrayal. They start with predictable, repeated irritations:
        </p>

        <ul>
          <li>Five alarms every morning.</li>
          <li>A partner “just happens” to be over most nights.</li>
          <li>One person becomes the default cleaner because they cannot tolerate the mess.</li>
          <li>“I’ll do it later” becomes a lifestyle.</li>
        </ul>

        <p>
          The emotional shift is subtle. You stop reading the behaviour as a habit and start reading it as a
          message: <em>my time matters less</em>, <em>my sleep is optional</em>, <em>my boundaries are negotiable</em>.
          That is where the friendship starts to change.
        </p>

        <h2>The conversation most friends avoid (and later wish they had)</h2>

        <p>
          Before you sign anything, have one deliberately boring conversation. Not about decor, not about
          neighbourhoods, not about who gets which wardrobe. The boring conversation is about:
        </p>

        <ul>
          <li>
            <strong>Sleep</strong>: bedtimes, alarms, exam-week quiet, and what “late night” means.
          </li>
          <li>
            <strong>Guests</strong>: frequency, partners, overnight stays, and what counts as asking.
          </li>
          <li>
            <strong>Chores</strong>: how long dishes sit, how bathrooms get cleaned, and what “messy” means.
          </li>
          <li>
            <strong>Money</strong>: rent timing, bills, shared basics, and what happens if someone is late.
          </li>
          <li>
            <strong>Conflict repair</strong>: do you talk immediately, cool off first, or schedule a house meeting?
          </li>
        </ul>

        <p>
          If this conversation feels awkward, you are normal. But awkward is cheaper than a broken lease or a
          broken friendship.
        </p>

        <h2>Use behaviour, not labels</h2>

        <p>
          You do not need a fancy framework. You just need questions that force specificity. Replace “Are you
          tidy?” with “How long do dishes usually stay in your sink?” Replace “Are you chill?” with “What would
          make you feel taken for granted at home?”
        </p>

        <p>
          If you want examples of behaviour-based questions, start with{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Why “I’m Clean” Is a Lie</Link>. For guests and partner dynamics,
          read{' '}
          <Link href="/blog/third-wheel-policy-significant-others">The “Third Wheel” Policy</Link>.
        </p>

        <h2>If you decide not to live together</h2>

        <p>
          “I love you, but I don’t think we should live together” can feel brutal. In the long run, it is
          often an act of care. A simple script:
        </p>

        <blockquote>
          “I really value our friendship. The more I think about daily routines - quiet hours, guests, and
          cleaning - the more I realise we want different things at home. I would rather keep the friendship
          easy than risk resenting you in the same space.”
        </blockquote>

        <h2>Friendship first, housing second</h2>

        <p>
          Your home is infrastructure for your degree. Your friends are infrastructure for your sanity. Treat
          them as two separate systems and you will make clearer decisions.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          American Psychological Association. (2019). <em>College mental health: The costs of depression, anxiety and stress</em>. In{' '}
          <em>Monitor on Psychology</em>. Retrieved from{' '}
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
    title: 'De “beste vriend”-valkuil: waarom je bestie geen ideale huisgenoot hoeft te zijn',
    excerpt:
      'Vriendschapsklik is echt, maar het is niet hetzelfde als wooncompatibiliteit. Stress-test vóór je tekent de saaie onderwerpen: slaap, logees, klusjes, geld en hoe je conflict herstelt.',
    publishDate: '2025-11-20',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Een praktische checklist om ritme, grenzen, klusjes en communicatie te screenen.',
      },
      {
        title: 'De “derde wiel”-regel',
        href: '/blog/third-wheel-policy-significant-others',
        description:
          'Hoe partners en logees het huishouden veranderen en hoe je eerlijke afspraken maakt.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Huisnormen afspreken zonder passief-agressieve appjes midden in de nacht.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Samenwonen met je beste vriend(in) voelt als de veiligste keuze: je vertrouwt elkaar, je lacht samen,
          en je denkt dat “we kunnen goed met elkaar” automatisch betekent “we wonen lekker samen”. De valkuil is
          dat <strong>iemand leuk vinden</strong> niet hetzelfde is als <strong>compatibel zijn in een huishouden</strong>.
          Een huis draait op routines, niet op gevoel.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Twee studenten die lachen op een bank in een gedeeld appartement"
          />
          <figcaption>
            Een goede klik op het terras betekent niet automatisch dat je ook elkaars leefritme aankunt.
          </figcaption>
        </figure>

        <h2>Vriendschapsklik vs. woonklik</h2>

        <p>
          Vriendschap draait om gedeelde ervaringen, humor en emotionele veiligheid. Samenwonen draait om kleine,
          herhaalde gewoontes: geluid, ruimte delen, geld, en hoe je een conflict repareert.
        </p>

        <p>
          Veel studentconflicten beginnen in dezelfde domeinen: privacy, schoonmaak en geluid. Als die verwachtingen
          niet matchen, stapelt irritatie zich op tot de vriendschap onveilig voelt. Voor een toegankelijke achtergrond
          over stress en mentale druk tijdens studie kun je de APA lezen ({' '}
          <a
            href="https://www.apa.org/monitor/2019/09/cover-college-mental-health"
            target="_blank"
            rel="noreferrer"
          >
            American Psychological Association, 2019
          </a>
          ).
        </p>

        <h2>De micro-fricties die goede vriendschappen slopen</h2>

        <p>Meestal gaat het niet mis door één groot drama, maar door herhaling:</p>

        <ul>
          <li>Vijf wekkers elke ochtend.</li>
          <li>Een partner die “toevallig” bijna altijd blijft slapen.</li>
          <li>Eén persoon die standaard schoonmaakt omdat die rommel niet kan negeren.</li>
          <li>“Ik doe het straks” als vaste modus.</li>
        </ul>

        <p>
          Op een gegeven moment lees je het niet meer als een gewoonte maar als een boodschap: <em>mijn tijd telt minder</em>,
          <em>mijn slaap is optioneel</em>, <em>mijn grenzen zijn onderhandelbaar</em>. Daar groeit wrok.
        </p>

        <h2>Het gesprek dat vrienden vaak vermijden</h2>

        <p>
          Voor je tekent, heb je één bewust saai gesprek nodig. Niet over inrichting, niet over de buurt, maar over:
        </p>

        <ul>
          <li>
            <strong>Slaap</strong>: bedtijden, wekkers, stilte tijdens tentamens, en wat “laat” betekent.
          </li>
          <li>
            <strong>Logees</strong>: frequentie, partners, overnachten, en wat “vragen” betekent.
          </li>
          <li>
            <strong>Klusjes</strong>: hoe snel afwas weg is, badkamerstandaard, en wat “rommelig” is.
          </li>
          <li>
            <strong>Geld</strong>: huur timing, rekeningen, basics, en wat er gebeurt bij te late betaling.
          </li>
          <li>
            <strong>Herstel na conflict</strong>: direct praten, eerst afkoelen, of een huisoverleg plannen.
          </li>
        </ul>

        <p>
          Als dit ongemakkelijk voelt, ben je niet de enige. Maar ongemak is goedkoper dan een gebroken contract of
          een gebroken vriendschap.
        </p>

        <h2>Gebruik gedrag, niet labels</h2>

        <p>
          Je hebt geen ingewikkeld model nodig. Je hebt vragen nodig die concreet maken wat iemand bedoelt. Vervang
          “Ben je netjes?” door “Hoe lang blijft afwas meestal staan?” Vervang “Ben je chill?” door “Wanneer voel jij je
          vanzelfsprekend genomen in een huis?”
        </p>

        <p>
          Voor voorbeelden van gedragsvragen: <Link href="/blog/why-im-clean-is-a-lie">Waarom “ik ben netjes” weinig zegt</Link>.
          Voor logees en partners: <Link href="/blog/third-wheel-policy-significant-others">De “derde wiel”-regel</Link>.
        </p>

        <h2>Als je besluit niet samen te wonen</h2>

        <p>
          “Ik hou van je, maar ik denk niet dat we samen moeten wonen” voelt hard. Op de lange termijn is het vaak zorg.
          Een simpel script:
        </p>

        <blockquote>
          “Ik waardeer onze vriendschap echt. Hoe meer ik nadenk over routines - stilte, logees en klusjes - hoe meer ik
          zie dat we thuis andere dingen willen. Ik hou liever de vriendschap licht dan dat we elkaar gaan irriteren in
          dezelfde ruimte.”
        </blockquote>

        <h2>Vriendschap eerst, huisvesting daarna</h2>

        <p>
          Je huis is infrastructuur voor je studie. Je vrienden zijn infrastructuur voor je sanity. Zie het als twee systemen
          en je kiest helderder.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          American Psychological Association. (2019). <em>College mental health: The costs of depression, anxiety and stress</em>. In{' '}
          <em>Monitor on Psychology</em>. Geraadpleegd via{' '}
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
}

export function BestFriendTrapArticle() {
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

