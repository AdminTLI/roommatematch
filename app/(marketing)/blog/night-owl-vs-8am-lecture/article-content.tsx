'use client'

import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'
import { BlogHeroImage } from '@/components/marketing/blog-hero-image'
import { useApp } from '@/app/providers'

const content = {
  en: {
    title: 'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
    excerpt:
      'Sleep is the quiet engine behind your degree. Learn how mismatched sleep schedules create predictable conflict, and how to talk about routines before you share a wall.',
    publishDate: '2026-01-20',
    readTime: '8 min read',
    relatedLinks: [
      {
        title: 'The Hidden Cost of the Wrong Roommate',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'See how sleep, stress and broken leases all add up when you ignore compatibility.',
      },
      {
        title: 'Group Chats, Ground Rules',
        href: '/blog/group-chats-ground-rules',
        description:
          'A practical template for turning routines into agreements so you are not negotiating at 1 a.m.',
      },
      {
        title: 'How Matching Works',
        href: '/how-it-works',
        description:
          'A plain-language overview of which habits matter and how to structure a compatibility conversation.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          You can budget for rent, travel and textbooks. You cannot easily budget for the cost of a roommate
          who games until 3 a.m. when you have an 8 a.m. lab three times a week. Sleep is the quiet engine
          behind your degree - and your roommate has a huge say in whether you actually get any.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="studyLateNight"
            alt="Student studying late at night with a laptop in a dark room"
          />
          <figcaption>
            When one person’s normal is 2 a.m. and the other’s is 7 a.m., the walls of a student room are too
            thin for wishful thinking.
          </figcaption>
        </figure>

        <h2>Why Sleep Matters More Than You Think</h2>

        <p>
          Large reviews of sleep research show that even partial sleep loss - cutting a few hours each night -
          significantly impairs attention, working memory and decision‑making (Pilcher &amp; Huffcutt, 1996).
          Another review focused on students found that poor sleep quality and short sleep duration are
          consistently linked with lower academic performance (Curcio, Ferrara, &amp; De Gennaro, 2006).
        </p>

        <p>
          Translation: trying to revise, sit exams and write essays from a sleep‑deprived brain is like trying
          to run a marathon in flip‑flops. You might technically finish, but it will be slow, painful and far
          more likely to go wrong.
        </p>

        <h2>Night Owl vs. Early Riser: Built‑In Conflict</h2>

        <p>Most sleep clashes in shared housing fall into a few patterns:</p>

        <ul>
          <li>
            <strong>The staggered schedule</strong>: One person starts winding down at 22:30; the other’s
            “evening” starts at midnight.
          </li>
          <li>
            <strong>The alarm war</strong>: Multiple alarms with snooze, thin walls and a light sleeper on the
            other side.
          </li>
          <li>
            <strong>The social jet lag</strong>: Weekdays are (sort of) aligned, but weekends turn the flat
            into a nightclub while someone is trying to reset for Monday.
          </li>
        </ul>

        <p>
          None of these people are villains. But in a small student room, the combination of different
          schedules, limited sound‑proofing and exam pressure creates constant micro‑stress.
        </p>

        <h2>Turn sleep from “personal preference” into a household agreement</h2>

        <p>
          Sleep is often treated as private, but in shared housing it is collective. Thin walls, shared
          kitchens, and different schedules mean you need explicit agreements, not assumptions.
        </p>

        <ul>
          <li>Weeknight quiet hours (and what “quiet” actually means).</li>
          <li>Alarm rules (snooze, volume, location).</li>
          <li>Late-night kitchen behaviour (microwave, dishes, calls).</li>
          <li>Weekend exceptions (and notice expectations).</li>
        </ul>

        <p>
          If you want a template for setting rules without killing the vibe, see{' '}
          <Link href="/blog/group-chats-ground-rules">Group Chats, Ground Rules</Link>. The goal is not to
          police each other. It is to stop sleep deprivation becoming the default.
        </p>

        <figure>
          <BlogHeroImage
            imageKey="quietRoommate"
            alt="Student yawning in a lecture hall"
          />
          <figcaption>
            Chronic 2 a.m. bedtimes plus 8 a.m. lectures is not a personality quirk - it is an academic risk
            factor.
          </figcaption>
        </figure>

        <h2>Questions to Ask Before You Share a Wall</h2>

        <p>Use these questions in real‑life roommate chats (or as a checklist for yourself):</p>

        <ul>
          <li>&quot;What time do you usually go to bed and wake up on weekdays?&quot;</li>
          <li>&quot;Do you need quiet and dark to sleep, or can you sleep through noise and light?&quot;</li>
          <li>&quot;How many alarms do you set in the morning and how quickly do you get up?&quot;</li>
          <li>&quot;What does a typical weeknight look like at home for you?&quot;</li>
        </ul>

        <p>
          If your answers clash hard - and neither of you is willing to adjust - that does not mean you are bad
          people. It means you should probably not be thin‑wall neighbours.
        </p>

        <h2>Protecting your 8 A.M. (or your late-night flow)</h2>

        <p>
          Whether you are the early‑morning lab person or the late‑night coder, the key is the same: be honest
          in your Domu Match profile about how you actually live, not how you wish you lived. Then look for
          matches whose habits are close enough that small compromises feel realistic, not exhausting.
        </p>

        <p>
          If you need a reminder of why sleep quality matters for learning, the research summaries in Curcio et
          al. (2006) and Pilcher &amp; Huffcutt (1996) are a good starting point.
        </p>

        <h2>References</h2>

        <p className="text-sm text-slate-300">
          Curcio, G., Ferrara, M., &amp; De Gennaro, L. (2006). Sleep loss, learning capacity and academic
          performance. <em>Sleep Medicine Reviews, 10</em>(5), 323–337.{' '}
          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231"
            target="_blank"
            rel="noreferrer"
          >
            https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Pilcher, J. J., &amp; Huffcutt, A. I. (1996). Effects of sleep deprivation on performance: A
          meta-analysis. <em>Sleep, 19</em>(4), 318–326.{' '}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/8776790/"
            target="_blank"
            rel="noreferrer"
          >
            https://pubmed.ncbi.nlm.nih.gov/8776790/
          </a>
        </p>
      </div>
    ),
  },
  nl: {
    title: 'Nachtbraker vs. 8‑uurcollege: match je slaapschema vóórdat het botst',
    excerpt:
      'Slaap is je stille superkracht. Ontdek hoe verschillende ritmes voorspelbare frictie veroorzaken, en hoe je afspraken maakt vóórdat je naast elkaar woont.',
    publishDate: '2026-01-20',
    readTime: '8 min lezen',
    relatedLinks: [
      {
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        href: '/blog/hidden-cost-of-wrong-roommate',
        description:
          'Lees hoe slechte nachten, stress en contractgedoe samen een dure combinatie worden.',
      },
      {
        title: 'Groepsapps & huisregels',
        href: '/blog/group-chats-ground-rules',
        description:
          'Een template om routines om te zetten in afspraken zodat je niet om 01.00 uur hoeft te onderhandelen.',
      },
      {
        title: 'Zo werkt matching',
        href: '/how-it-works',
        description:
          'Welke onderwerpen ertoe doen, en hoe je een compatibiliteitsgesprek structureert.',
      },
    ],
    ctaTitle: undefined,
    ctaDescription: undefined,
    ctaHref: undefined,
    ctaText: undefined,
    body: () => (
      <div className="space-y-10">
        <p className="text-lg text-slate-700 leading-relaxed">
          Een huisgenoot die tot diep in de nacht gamet en een rooster vol 8‑uurcolleges zijn geen goede
          combinatie. Slaap voelt persoonlijk, maar in een huis met dunne muren is het een gedeeld systeem.
          Als je daar geen afspraken over maakt, ontstaat de frictie vanzelf.
        </p>

        <p>
          Maak slaap concreet. Niet “ben jij een nachtbraker?”, maar: wanneer moet het doordeweeks rustig zijn,
          hoe gaan jullie om met wekkers, hoe werkt de keuken laat, en wat zijn uitzonderingen in het weekend?
          Voor een manier om dit zonder drama af te spreken kun je{' '}
          <Link href="/blog/group-chats-ground-rules">Groepsapps & huisregels</Link> gebruiken. Voor een raamwerk
          van gespreksonderwerpen: <Link href="/how-it-works">Zo werkt matching</Link>.
        </p>

        <h2>Referenties</h2>

        <p className="text-sm text-slate-300">
          Curcio, G., Ferrara, M., &amp; De Gennaro, L. (2006). Sleep loss, learning capacity and academic
          performance. <em>Sleep Medicine Reviews, 10</em>(5), 323–337.{' '}
          <a
            href="https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231"
            target="_blank"
            rel="noreferrer"
          >
            https://www.sciencedirect.com/science/article/abs/pii/S1087079205001231
          </a>
        </p>
        <p className="text-sm text-slate-300">
          Pilcher, J. J., &amp; Huffcutt, A. I. (1996). Effects of sleep deprivation on performance: A
          meta-analysis. <em>Sleep, 19</em>(4), 318–326.{' '}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/8776790/"
            target="_blank"
            rel="noreferrer"
          >
            https://pubmed.ncbi.nlm.nih.gov/8776790/
          </a>
        </p>
      </div>
    ),
  },
}

export function NightOwlVs8amLectureArticle() {
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

