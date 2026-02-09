'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
    excerpt:
      'Friendship chemistry does not always translate into living compatibility. Learn how to protect both your grades and your closest relationships by matching on habits, not vibes.',
    publishDate: '2025-11-20',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'How to Find a Great Roommate',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Evidence-based tips for assessing roommate compatibility beyond friendship and first impressions.',
      },
      {
        title: 'Start Matching',
        href: '/matches',
        description:
          'Use Domu Match’s lifestyle and values questionnaire to see how compatible you really are with potential roommates.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'See how our explainable AI turns your habits and preferences into transparent compatibility scores.',
      },
    ],
    ctaTitle: 'Protect the Friendship, Upgrade the Match',
    ctaDescription:
      'Use Domu Match to reality-check your compatibility with friends, classmates, and new connections before you sign a lease together.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Get Started',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          On paper, living with your best friend feels like the obvious move. You already know each other,
          you have the same jokes, and it seems safer than a stranger. But in shared housing,{' '}
          <strong>who you like is not the same as how you live</strong>. Confusing the two is how a lot of
          students lose both a home and a friendship in the same year.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&q=80"
            alt="Two students laughing together on a sofa in a shared apartment"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Great chemistry at brunch does not guarantee compatible habits at 7 a.m. on a Tuesday.
          </figcaption>
        </figure>

        <h2>Friendship Compatibility vs. Living Compatibility</h2>

        <p>
          Friendship is built on shared experiences, humour, and emotional safety. Living compatibility is
          built on <strong>routines, boundaries, and tiny habits</strong>. You can adore someone&apos;s
          personality and still struggle with their lifestyle.
        </p>

        <p>
          Research on roommate relationships consistently shows that conflict usually stems from misaligned
          expectations around privacy, cleanliness, and noise rather than &quot;personality clashes&quot;{' '}
          (e.g., see housing conflict summaries in American college counselling reports;
          <a
            href="https://www.apa.org/monitor/2019/09/cover-college-mental-health"
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            American Psychological Association, 2019
          </a>
          ). In other words, it is the <em>system</em> of your shared life that cracks first, not the
          friendship itself.
        </p>

        <p>
          Examples of where this difference shows up:
        </p>

        <ul>
          <li>
            You love your friend&apos;s chaotic &quot;always down&quot; energy - until it is 1:30 a.m. and
            they are still talking on speaker while you have an exam.
          </li>
          <li>
            You bond over not being &quot;fussy&quot; - until you realise their definition of &quot;not
            dirty&quot; includes plates sitting in the sink for three days.
          </li>
          <li>
            You both say you are &quot;chill&quot; - but one of you needs alone time after class while the
            other wants the door open and the music on.
          </li>
        </ul>

        <h2>How Tiny Habits Quietly Ruin Good Friendships</h2>

        <p>
          Most roommate breakups do not start with a huge betrayal. They start with{' '}
          <strong>micro-frictions</strong>:
        </p>

        <ul>
          <li>They &quot;forget&quot; to take the bin out again.</li>
          <li>Their partner is over four nights a week, unspoken.</li>
          <li>
            They snooze five alarms every morning while you lie there, awake and furious, pretending you are
            fine.
          </li>
        </ul>

        <p>
          Over time, your brain stops reading those things as &quot;habits&quot; and starts reading them as
          messages: <em>my time is less valuable</em>, <em>my sleep does not matter</em>,{' '}
          <em>they do not respect me</em>. That shift is where resentment lives.
        </p>

        <p>
          Because you are friends, you might wait longer to say something. You laugh it off, then vent to
          other people, then explode over a cereal bowl that is not really about the cereal bowl at all.
        </p>

        <h2>The Conversation Most Friends Skip (And Regret)</h2>

        <p>
          If you are even thinking about living with a close friend, you need one honest conversation that is
          not about decor, neighbourhoods, or who gets which wardrobe. You need to talk about:
        </p>

        <ul>
          <li>
            <strong>Sleep</strong>: Typical bed and wake times, alarms, noise tolerance, and exam-season
            expectations.
          </li>
          <li>
            <strong>Cleanliness</strong>: How long dishes sit in the sink, how often bathrooms are cleaned,
            and what &quot;messy&quot; actually means to each of you.
          </li>
          <li>
            <strong>Guests</strong>: How often friends and partners stay over, and how you feel about
            unplanned sleepovers.
          </li>
          <li>
            <strong>Study vs. social</strong>: Whether home is more of a study base or a social hub.
          </li>
        </ul>

        <p>
          If that feels awkward to bring up, you are not alone - but awkward is cheaper than a broken lease
          or a broken friendship.
        </p>

        <h2>Using Domu Match to "Interview" Your Best Friend</h2>

        <p>
          Instead of trying to invent all the hard questions yourself, you can let Domu Match do the heavy
          lifting. Our questionnaire is built around <strong>behaviours, not labels</strong>. Rather than
          asking, &quot;Are you clean?&quot; or &quot;Are you chill?&quot; we ask:
        </p>

        <ul>
          <li>&quot;How long do dishes usually stay in your sink?&quot;</li>
          <li>&quot;How many nights per week are you comfortable with overnight guests?&quot;</li>
          <li>&quot;What time do you typically go to bed on weekdays?&quot;</li>
          <li>&quot;When you are stressed, do you prefer company or space?&quot;</li>
        </ul>

        <p>
          Here is one simple way to reality-check your friendship as a living situation:
        </p>

        <ol>
          <li>
            <strong>Both of you create profiles on Domu Match.</strong> Answer as if you were matching with a
            stranger. No &quot;aspirational&quot; answers.
          </li>
          <li>
            <strong>Compare your compatibility report together.</strong> Look at where you align - and where
            you really do not.
          </li>
          <li>
            <strong>Talk about the gaps.</strong> Could you actually compromise on those, or would that
            compromise make one of you quietly miserable?
          </li>
          <li>
            <strong>Decide from the data, not from guilt.</strong> If the report shows major clashes on
            sleep, guests, or cleanliness, it might be kinder to each other to stay friends, not roommates.
          </li>
        </ol>

        <p>
          Our explainable matching makes this easier: you can see <em>why</em> you are a strong or weak match
          across multiple categories, instead of staring at one mysterious score. Learn more about how that
          works on our{' '}
          <Link href="/how-it-works">
            how it works
          </Link>{' '}
          page.
        </p>

        <h2>If You Decide Not to Live Together</h2>

        <p>
          Saying, &quot;I love you, but I do not think we should live together&quot; can feel brutal in the
          moment. But in the long term, it is usually an act of care.
        </p>

        <p>
          One helpful script:
        </p>

        <blockquote>
          &quot;I really value our friendship, and I do not want to put it under pressure. When I filled in
          my Domu Match profile I realised I need really strict quiet hours and fewer guests than you enjoy.
          I would rather keep enjoying living with you during the day than risk resenting you at night.&quot;
        </blockquote>

        <p>
          You are not rejecting the person. You are respecting the reality that your nervous systems, study
          needs, and living habits might not be compatible in one small space.
        </p>

        <h2>Friendship First, Housing Second</h2>

        <p>
          Your home is infrastructure for your wellbeing and your degree. Your friends are infrastructure for
          your sanity. Protecting one by sacrificing the other is not a smart trade.
        </p>

        <p>
          If you are planning next year&apos;s housing right now:
        </p>

        <ul>
          <li>Use Domu Match to test compatibility with your closest people, not just strangers.</li>
          <li>Let the questionnaire give you neutral language for difficult topics.</li>
          <li>Choose arrangements that protect your sleep, your grades, and your relationships.</li>
        </ul>

        <p>
          You can explore compatible options - with friends or with new matches - on our{' '}
          <Link href="/matches">
            matching page
          </Link>
          . You do not have to gamble your favourite friendship on guesswork.
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
    title: 'De “beste vriend”-valkuil: waarom je bestie geen ideale huisgenoot hoeft te zijn',
    excerpt:
      'Vriendschap garandeert geen wooncompatibiliteit. Ontdek hoe je je relatie én je studie beschermt door op gewoontes te matchen in plaats van op gevoel.',
    publishDate: '2025-11-20',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Zo vind je een fijne huisgenoot',
        href: '/blog/how-to-find-a-great-roommate',
        description:
          'Evidence-based tips om verder te kijken dan eerste indrukken bij het kiezen van een huisgenoot.',
      },
      {
        title: 'Begin met matchen',
        href: '/matches',
        description:
          'Gebruik de vragenlijst van Domu Match om te zien hoe compatibel jij en je vrienden écht zijn.',
      },
      {
        title: 'Zo werkt onze matching',
        href: '/how-it-works',
        description:
          'Lees hoe onze uitlegbare AI je leefstijl en voorkeuren omzet in transparante compatibiliteitsscores.',
      },
    ],
    ctaTitle: 'Bescherm de vriendschap, kies de juiste match',
    ctaDescription:
      'Gebruik Domu Match om je compatibiliteit met vrienden en nieuwe contacten te checken vóórdat je samen tekent.',
    ctaHref: '/auth/sign-up',
    ctaText: 'Aan de slag',
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-200 leading-relaxed">
          Samenwonen met je beste vriend(in) voelt logisch en veilig, maar vriendschapsklik is niet hetzelfde
          als wooncompatibiliteit. Wie je leuk vindt is iets anders dan hoe je leeft. Als je dat door elkaar
          haalt, loop je kans om én een huis én een vriendschap kwijt te raken.
        </p>

        <figure>
          <Image
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&q=80"
            alt="Twee studenten die lachen op een bank in een gedeeld appartement"
            width={1200}
            height={630}
            className="w-full rounded-2xl"
          />
          <figcaption>
            Een goede klik op het terras betekent niet automatisch dat je ook elkaars leefritme aankunt.
          </figcaption>
        </figure>

        <h2>Vriendschapsklik vs. woonklik</h2>

        <p>
          Vriendschap draait om gedeelde ervaringen, humor en emotionele veiligheid. Samenwonen draait om{' '}
          <strong>routines, grenzen en kleine gewoontes</strong>. Je kunt iemands persoonlijkheid geweldig
          vinden en toch botsen op dagelijks gedrag.
        </p>

        <p>
          Onderzoek naar huisgenoten laat zien dat conflicten meestal ontstaan rond verwachtingen over
          privacy, schoonmaak en geluid – niet omdat “de karakters niet matchen”{' '}
          <span className="italic">
            (American Psychological Association, 2019)
          </span>
          . Met andere woorden: het zijn de <em>systemen</em> thuis die scheuren, niet per se de band.
        </p>

        <p>
          Gebruik Domu Match als neutrale tussenstap: vul allebei eerlijk de vragenlijst in, vergelijk jullie
          rapport en bespreek de verschillen. Op onze{' '}
          <Link href="/how-it-works">
            pagina “Zo werkt het”
          </Link>{' '}
          leggen we precies uit welke factoren we meenemen.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          American Psychological Association. (2019). <em>College mental health: The costs of depression,
          anxiety and stress</em>. In <em>Monitor on Psychology</em>. Geraadpleegd via{' '}
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

