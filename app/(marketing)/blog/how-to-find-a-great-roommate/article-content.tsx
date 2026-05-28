'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'How to Find a Great Roommate',
    excerpt:
      'A great roommate is less about “good vibes” and more about predictable habits. Use this checklist to screen for routines, boundaries, money reliability, and communication before you share a kitchen.',
    publishDate: '2025-11-15',
    readTime: '7 min read',
    relatedLinks: [
      {
        title: 'Why "I’m Clean" Is a Lie',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          '“Clean” is vague. Use behaviour-based questions to avoid mismatched expectations around chores.',
      },
      {
        title: 'Night Owl vs. 8 A.M. Lecture',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Sleep schedules are one of the fastest ways to create conflict. Learn how to talk about it early.',
      },
      {
        title: 'Safety Checklist for Student Renters',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'A practical safety and contract checklist to use before you pay a deposit or sign anything.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Finding the right roommate is not just about splitting rent. It is about building a living situation
          that protects your sleep, your study time, and your nervous system. In a tight housing market, people
          often rush the decision. That is when “seems nice” gets mistaken for “will be easy to live with”.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Students studying together in a shared living space"
          />
          <figcaption>
            A good roommate fit is mostly about routines you can rely on, not personality tests.
          </figcaption>
        </figure>

        <h2>Start with the reality: shared living is a system</h2>

        <p>
          Most roommate conflict is not about a single dramatic event. It is about systems that were never
          defined: who buys basics, how noise works on weekdays, what “clean” means, how guests are handled, and
          how money is managed. If you define those systems early, you do not need to “hope” your way into a
          calm home.
        </p>

        <p>
          If you are also navigating location, rules, and contracts, start with the basics on{' '}
          <Link href="/housing">student housing in the Netherlands</Link>. Then treat roommate selection like a
          screening process, not a vibe check.
        </p>

        <h2>The four domains that predict day-to-day friction</h2>

        <p>
          Instead of trying to decide whether someone is “a good person”, focus on whether their habits will
          create friction with yours. In practice, four domains do most of the work.
        </p>

        <ul>
          <li>
            <strong>Time and sleep</strong>: weekday bedtimes, morning alarms, exam-week quiet, and whether
            people live on “late night kitchen” schedules.
          </li>
          <li>
            <strong>Guests and boundaries</strong>: spontaneous friends, partners, overnight stays, and what
            counts as “asking”.
          </li>
          <li>
            <strong>Chores and shared spaces</strong>: dish timelines, bathroom standards, bin routines, and
            what happens when someone is too busy.
          </li>
          <li>
            <strong>Money and reliability</strong>: rent transfer habits, bills, deposits, and what “late”
            means when a landlord is involved.
          </li>
        </ul>

        <h2>Questions that beat vague labels</h2>

        <p>
          “I’m tidy.” “I’m chill.” “I’m not that social.” These labels are where misunderstandings begin. Use
          questions that force a concrete answer:
        </p>

        <ul>
          <li>How long do dishes usually stay in the sink after cooking?</li>
          <li>What time do you normally need the flat to be quiet on weekdays?</li>
          <li>How many nights a week are overnight guests OK?</li>
          <li>What happens when you are stressed, do you want space or company?</li>
          <li>How do you prefer to handle conflict: quick talk, written message, or scheduled house meeting?</li>
        </ul>

        <h2>Red Flags to Watch For</h2>

        <p>
          A “red flag” is not someone being different from you. It is a pattern that signals unreliability,
          unclear boundaries, or refusal to be specific. Take it seriously if someone:
        </p>

        <ul>
          <li>Refuses to discuss money, chores, guests, or quiet hours.</li>
          <li>Minimises reasonable boundaries (“you’re overreacting”).</li>
          <li>Is inconsistent in communication during the “easy” phase.</li>
          <li>Expects you to adapt completely without compromise.</li>
          <li>Is vague about what they are actually agreeing to (rules, subletting, contracts).</li>
        </ul>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Two people having a conversation on a sofa in a living room"
          />
          <figcaption>
            A 20-minute conversation about routines can prevent a semester of passive-aggressive tension.
          </figcaption>
        </figure>

        <h2>When to walk away, even if housing feels scarce</h2>

        <p>
          Scarcity makes people accept bad deals. But living in a home that damages your sleep and focus can
          create costs you do not see until later. If your gut says “this will be chaos”, pause. Use your
          non-negotiables as a filter: quiet hours, safety, money reliability, and basic respect.
        </p>

        <p>
          If you need a due-diligence checklist for the housing itself, use{' '}
          <Link href="/blog/safety-checklist-for-student-renters">Safety Checklist for Student Renters</Link>.
          If the friction is likely to be chores and standards, start with{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Why “I’m Clean” Is a Lie</Link>.
        </p>

        <h2>A simple process you can follow</h2>

        <p>
          1. Write your non-negotiables in one sentence each (sleep, guests, chores, money, safety).\n+          2. Ask concrete questions during viewings or first chats.\n+          3. Look for consistency between what people say and how the place looks.\n+          4. Agree on a lightweight system: quiet hours, guest norms, and how shared costs are tracked.\n+          5. Put the basics in writing if you can (even a shared note).
        </p>

        <p>
          If you want a more structured way to think about “fit”, see <Link href="/how-it-works">How Matching Works</Link>.
          Treat it as a framework for which topics matter, not as a substitute for real conversation.
        </p>

        <h2>Conclusion</h2>

        <p>
          A great roommate is not “perfect”. They are predictable. When you screen for routines, boundaries,
          money reliability, and communication, you reduce the chance that small issues turn into big resentment.
        </p>

        <p>
          Prioritise specificity over labels, and you will be much more likely to land in a home that supports
          your semester rather than draining it.
        </p>
      </div>
    )
  },
  nl: {
    title: 'Zo vind je een fijne huisgenoot',
    excerpt:
      'Een fijne huisgenoot gaat minder over “klik” en meer over voorspelbare gewoontes. Gebruik deze checklist om te screenen op ritme, grenzen, geld en communicatie vóórdat je een keuken deelt.',
    publishDate: '2025-11-15',
    readTime: '7 min lezen',
    relatedLinks: [
      {
        title: 'Waarom “ik ben netjes” weinig zegt',
        href: '/blog/why-im-clean-is-a-lie',
        description:
          '“Netjes” is vaag. Stel gedragsvragen om misverstanden over schoonmaak te voorkomen.',
      },
      {
        title: 'Nachtbraker vs. 8‑uurcollege',
        href: '/blog/night-owl-vs-8am-lecture',
        description:
          'Slaapschema’s botsen snel. Leer hoe je dit vroeg bespreekt, zonder drama.',
      },
      {
        title: 'Veiligheidschecklist voor studenthuurders',
        href: '/blog/safety-checklist-for-student-renters',
        description:
          'Een checklist voor contracten, verificatie en veiligheid vóór je betaalt of tekent.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Een fijne huisgenoot vinden draait niet alleen om huur delen. Het gaat om een woonsituatie die je
          slaap, studie en rust beschermt. In een krappe markt beslissen studenten vaak te snel. Dan wordt “lijkt
          aardig” verward met “is prettig om mee samen te wonen”.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studentsCollaborating"
            alt="Studenten die samen studeren in een gedeelde woonruimte"
          />
          <figcaption>
            Een goede match gaat vooral over routines waar je op kunt rekenen, niet over een perfecte vibe.
          </figcaption>
        </figure>

        <h2>Begin met de realiteit: samenwonen is een systeem</h2>

        <p>
          De meeste huisgenootconflicten gaan niet over één groot incident. Ze gaan over systemen die nooit zijn
          afgesproken: wie koopt basics, hoe werkt geluid doordeweeks, wat betekent “netjes”, hoe ga je om met
          logees, en hoe regel je geld. Als je die systemen vroeg definieert, hoef je niet te hopen dat het goed
          komt.
        </p>

        <p>
          Als je ook nog contracten en regels moet uitzoeken, start dan met{' '}
          <Link href="/housing">studentenhuisvesting in Nederland</Link>. Behandel huisgenootkeuze daarna als een
          screeningproces, niet als een vibe check.
        </p>

        <h2>Vier domeinen die frictie voorspellen</h2>

        <p>
          In plaats van te bepalen of iemand “een goed mens” is, kijk of hun gewoontes frictie gaan creëren met
          die van jou. In de praktijk doen vier domeinen het meeste werk:
        </p>

        <ul>
          <li>
            <strong>Tijd en slaap</strong>: bedtijden, wekkers, stilte tijdens tentamens, en “late night keuken”.
          </li>
          <li>
            <strong>Logees en grenzen</strong>: spontane vrienden, partners, overnachten, en wat “vragen” betekent.
          </li>
          <li>
            <strong>Klusjes en gedeelde ruimtes</strong>: afwas-tijdlijnen, badkamer-standaard, vuilnis, en wat je doet
            als iemand te druk is.
          </li>
          <li>
            <strong>Geld en betrouwbaarheid</strong>: huur overmaken, rekeningen, borg, en wat “te laat” betekent.
          </li>
        </ul>

        <h2>Vragen die beter werken dan labels</h2>

        <p>
          “Ik ben netjes.” “Ik ben chill.” “Ik ben niet zo sociaal.” Deze labels zijn waar misverstanden beginnen.
          Stel vragen die een concreet antwoord afdwingen:
        </p>

        <p>
          Platforms kunnen helpen om het gesprek te structureren, maar het belangrijkste is dat jij het onderwerp
          niet uitstelt.
        </p>

        <ul>
          <li>Hoe lang blijft afwas meestal staan na het koken?</li>
          <li>Welke tijd moet het doordeweeks rustig zijn?</li>
          <li>Hoeveel nachten per week zijn logees OK?</li>
          <li>Wat doe je als je gestrest bent: ruimte of gezelschap?</li>
          <li>Hoe bespreek je irritaties: direct, via app, of in een huisoverleg?</li>
        </ul>

        <p>
          Een “rode vlag” is niet iemand die anders is dan jij. Het is een patroon dat wijst op onbetrouwbaarheid,
          vage grenzen of weigeren om concreet te worden. Neem het serieus als iemand:
        </p>

        <ul>
          <li>Niet wil praten over geld, klusjes, logees of stilte-uren.</li>
          <li>Redelijke grenzen wegwuift (“stel je niet aan”).</li>
          <li>In de makkelijke fase al inconsistent communiceert.</li>
          <li>Verwacht dat jij je volledig aanpast zonder compromis.</li>
          <li>Vaag blijft over wat er precies afgesproken wordt (regels, onderhuur, contract).</li>
        </ul>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Twee studenten in gesprek in een moderne woonkamer"
          />
          <figcaption>
            Twintig minuten praten over routines voorkomt vaak maanden aan stille irritatie.
          </figcaption>
        </figure>

        <h2>Wanneer je beter kunt afhaken, ook als het schaars voelt</h2>

        <p>
          Schaarste zorgt ervoor dat je slechte deals accepteert. Maar wonen op een plek die je slaap en focus
          sloopt, heeft kosten die je later pas voelt. Als je gevoel zegt “dit wordt chaos”, pauzeer. Gebruik je
          non-negotiables als filter: stilte, veiligheid, geldbetrouwbaarheid en basisrespect.
        </p>

        <p>
          Voor due diligence van de woning zelf gebruik je{' '}
          <Link href="/blog/safety-checklist-for-student-renters">de veiligheidschecklist</Link>. Voor klusjes en
          standaarden start je met{' '}
          <Link href="/blog/why-im-clean-is-a-lie">Waarom “ik ben netjes” weinig zegt</Link>.
        </p>

        <h2>Een simpel proces dat je kunt volgen</h2>

        <p>
          1. Schrijf je non-negotiables op (slaap, logees, klusjes, geld, veiligheid).\n+          2. Stel concrete vragen in bezichtigingen of eerste chats.\n+          3. Let op consistentie tussen wat iemand zegt en hoe de plek er echt uitziet.\n+          4. Spreek een licht systeem af: stilte-uren, logees-norm, en gedeelde kosten.\n+          5. Zet de basis in een gedeelde notitie of app.
        </p>

        <p>
          Als je een denkkader wilt voor “fit”, zie <Link href="/how-it-works">Zo werkt matching</Link>. Gebruik
          het als lijst met gespreksonderwerpen, niet als vervanging van echt contact.
        </p>

        <h2>Conclusie</h2>

        <p>
          Een fijne huisgenoot is niet “perfect”. Die is voorspelbaar. Als je screent op ritme, grenzen,
          betrouwbaarheid en communicatie, voorkom je dat kleine irritaties grote frustraties worden.
        </p>

        <p>
          Kies voor concreetheid boven labels, dan is de kans veel groter dat je huis je semester ondersteunt in
          plaats van leeg trekt.
        </p>
      </div>
    )
  },
}

export function HowToFindGreatRoommateArticle() {
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
