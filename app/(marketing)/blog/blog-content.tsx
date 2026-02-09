'use client'

import Section from '@/components/ui/primitives/section'
import Container from '@/components/ui/primitives/container'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, Shield, Brain } from 'lucide-react'
import { useApp } from '@/app/providers'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const content = {
  en: {
    title: 'Insights & Resources',
    titleHighlight: 'Resources',
    subtitle: 'Expert guidance on finding compatible roommates, staying safe while renting, and understanding how technology can help you make better housing decisions.',
    readArticle: 'Read article',
    posts: [
      {
        slug: 'move-in-week-red-flags',
        title: 'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
        excerpt:
          'You usually know in the first two weeks if something feels off. Learn which early warning signs to take seriously and what you can still change.',
        readTime: '7 min read',
        date: '2026-02-09',
        category: 'Wellbeing',
        icon: Shield,
      },
      {
        slug: 'group-chats-ground-rules',
        title: 'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
        excerpt:
          'Avoid 1 a.m. passive‑aggressive messages. Learn how to turn Domu Match’s behavioural questions into simple, shared house rules.',
        readTime: '7 min read',
        date: '2026-02-02',
        category: 'Boundaries',
        icon: BookOpen,
      },
      {
        slug: 'when-dishes-equal-disrespect',
        title: 'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
        excerpt:
          'It is rarely about one plate. Understand the psychology of chores in shared spaces and how to match with people who pull their weight.',
        readTime: '7 min read',
        date: '2026-01-27',
        category: 'Compatibility',
        icon: BookOpen,
      },
      {
        slug: 'night-owl-vs-8am-lecture',
        title: 'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
        excerpt:
          'Sleep is your quiet superpower. Learn how mismatched sleep schedules wreck grades — and how Domu Match helps you align on routines.',
        readTime: '8 min read',
        date: '2026-01-20',
        category: 'Health',
        icon: Brain,
      },
      {
        slug: 'surviving-the-winter-blues',
        title: 'Surviving the Winter Blues: Why Who You Live With Matters',
        excerpt:
          'Short days and exam stress hit hard. The right housemates can give you social momentum; the wrong ones can leave you feeling isolated.',
        readTime: '8 min read',
        date: '2026-01-10',
        category: 'Wellbeing',
        icon: Shield,
      },
      {
        slug: 'introverts-survival-guide-shared-living',
        title: 'The Introvert’s Survival Guide to Shared Living',
        excerpt:
          'If your social battery drains fast, home needs to be a charging dock, not another performance. Learn how to match with people who get it.',
        readTime: '8 min read',
        date: '2026-01-03',
        category: 'Wellbeing',
        icon: BookOpen,
      },
      {
        slug: 'why-im-clean-is-a-lie',
        title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
        excerpt:
          '“Clean” is subjective. Learn how to ask behaviour‑based questions so dishes and dust do not quietly ruin your flat.',
        readTime: '7 min read',
        date: '2025-12-15',
        category: 'Compatibility',
        icon: BookOpen,
      },
      {
        slug: 'hidden-cost-of-wrong-roommate',
        title: 'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
        excerpt:
          'Breaking leases, lost deposits, moving costs, and slipping grades all add up. Learn why investing in compatibility upfront is cheaper than surviving a bad match.',
        readTime: '7 min read',
        date: '2025-12-05',
        category: 'Finance',
        icon: BookOpen,
      },
      {
        slug: 'third-wheel-policy-significant-others',
        title: 'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
        excerpt:
          'Partners and overnight guests can quietly turn a two-person flat into a three-person one. Set fair boundaries around stays, space, and resources before it becomes a problem.',
        readTime: '7 min read',
        date: '2025-11-28',
        category: 'Boundaries',
        icon: Shield,
      },
      {
        slug: 'best-friend-trap-worst-roommate',
        title: 'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
        excerpt:
          'Friendship chemistry does not always translate into living compatibility. Learn how to protect both your friendship and your grades by matching on habits, not vibes.',
        readTime: '7 min read',
        date: '2025-11-20',
        category: 'Compatibility',
        icon: BookOpen,
      },
      {
        slug: 'how-to-find-a-great-roommate',
        title: 'How to Find a Great Roommate',
        excerpt:
          'Evidence-based tips for compatibility and harmony in student housing. Learn how to navigate the Dutch student housing market and find your perfect match.',
        readTime: '4 min read',
        date: '2025-11-15',
        category: 'Compatibility',
        icon: BookOpen,
      },
      {
        slug: 'safety-checklist-for-student-renters',
        title: 'Safety Checklist for Student Renters',
        excerpt:
          'Verification, contracts, and best practices for safe living in the Netherlands. Protect yourself from rental scams and understand your tenant rights.',
        readTime: '5 min read',
        date: '2025-11-10',
        category: 'Safety',
        icon: Shield,
      },
      {
        slug: 'why-explainable-ai-matters',
        title: 'Why Explainable AI Matters',
        excerpt:
          'Understanding your matches builds trust and better decisions. Learn how transparency in AI matching aligns with EU regulations and protects your rights.',
        readTime: '8 min read',
        date: '2025-11-05',
        category: 'Technology',
        icon: Brain,
      },
    ],
  },
  nl: {
    title: 'Inzichten &',
    titleHighlight: 'hulpmiddelen',
    subtitle: 'Deskundige tips om compatibele huisgenoten te vinden, veilig te huren en te begrijpen hoe technologie je helpt betere woonbeslissingen te nemen.',
    readArticle: 'Lees artikel',
    posts: [
      {
        slug: 'move-in-week-red-flags',
        title: 'Red flags in je eerste woonweek',
        excerpt:
          'Vaak voel je binnen twee weken al of een woonsituatie niet klopt. Leer welke signalen je serieus moet nemen en wat je nog kunt bijsturen.',
        readTime: '7 min lezen',
        date: '2026-02-09',
        category: 'Welzijn',
        icon: Shield,
      },
      {
        slug: 'group-chats-ground-rules',
        title: 'Groepsapps & huisregels: afspraken maken zonder de sfeer te slopen',
        excerpt:
          'Voorkom passief-agressieve appjes om 01.00 uur. Gebruik de vragen van Domu Match als basis voor simpele, duidelijke huisregels.',
        readTime: '7 min lezen',
        date: '2026-02-02',
        category: 'Grenzen',
        icon: BookOpen,
      },
      {
        slug: 'when-dishes-equal-disrespect',
        title: 'Als afwas = disrespect: hoe kleine taken grote irritaties worden',
        excerpt:
          'Het gaat zelden om één bord. Begrijp de psychologie achter klusjes in een gedeelde keuken en hoe je matcht met mensen die meedoen.',
        readTime: '7 min lezen',
        date: '2026-01-27',
        category: 'Compatibiliteit',
        icon: BookOpen,
      },
      {
        slug: 'night-owl-vs-8am-lecture',
        title: 'Nachtbraker vs. 8‑uurcollege: match je slaapschema vóórdat het botst',
        excerpt:
          'Slaap is je stille superkracht. Lees hoe verschillende ritmes je cijfers raken en hoe Domu Match helpt dat te voorkomen.',
        readTime: '8 min lezen',
        date: '2026-01-20',
        category: 'Gezondheid',
        icon: Brain,
      },
      {
        slug: 'surviving-the-winter-blues',
        title: 'Overleven in de winterdip: waarom huisgenoten nu extra tellen',
        excerpt:
          'Donkere dagen en tentamenstress maken je kwetsbaarder voor somberheid. De juiste huisgenoten kunnen dat lichter maken.',
        readTime: '8 min lezen',
        date: '2026-01-10',
        category: 'Welzijn',
        icon: Shield,
      },
      {
        slug: 'introverts-survival-guide-shared-living',
        title: 'De overlevingsgids voor introverten in een studentenhuis',
        excerpt:
          'Als je sociale batterij snel leeg is, moet thuis een laadpunt zijn – geen extra podium. Match met mensen die dat begrijpen.',
        readTime: '8 min lezen',
        date: '2026-01-03',
        category: 'Welzijn',
        icon: BookOpen,
      },
      {
        slug: 'why-im-clean-is-a-lie',
        title: 'Waarom “ik ben netjes” weinig zegt (en wat je beter kunt vragen)',
        excerpt:
          '“Netjes” is subjectief. Leer hoe je op gedrag matcht in plaats van op vage labels, zodat afwas geen oorlog wordt.',
        readTime: '7 min lezen',
        date: '2025-12-15',
        category: 'Compatibiliteit',
        icon: BookOpen,
      },
      {
        slug: 'hidden-cost-of-wrong-roommate',
        title: 'De verborgen kosten van de verkeerde huisgenoot',
        excerpt:
          'Een slechte match kost meer dan alleen huur. Lees hoe contractbreuk, verhuizen en slechtere cijfers samen optellen — en hoe je dat voorkomt.',
        readTime: '7 min lezen',
        date: '2025-12-05',
        category: 'Financiën',
        icon: BookOpen,
      },
      {
        slug: 'third-wheel-policy-significant-others',
        title: 'De “derde wiel”-regel: partners in een gedeeld huis',
        excerpt:
          'Wanneer partners vaak blijven slapen, verandert je huis stilletjes in een driepersoonshuishouden. Leer hoe je eerlijke afspraken maakt over logees, ruimte en kosten.',
        readTime: '7 min lezen',
        date: '2025-11-28',
        category: 'Grenzen',
        icon: Shield,
      },
      {
        slug: 'best-friend-trap-worst-roommate',
        title: 'De “beste vriend”-valkuil: waarom je bestie geen ideale huisgenoot hoeft te zijn',
        excerpt:
          'Vriendschap garandeert geen wooncompatibiliteit. Ontdek hoe je je relatie én je studie beschermt door op gewoontes te matchen in plaats van op gevoel.',
        readTime: '7 min lezen',
        date: '2025-11-20',
        category: 'Compatibiliteit',
        icon: BookOpen,
      },
      {
        slug: 'how-to-find-a-great-roommate',
        title: 'Zo vind je een fijne huisgenoot',
        excerpt:
          'Evidence-based tips voor harmonieus samenwonen. Leer hoe je de Nederlandse studentenhuisvestingsmarkt navigeert en je ideale match vindt.',
        readTime: '4 min lezen',
        date: '2025-11-15',
        category: 'Compatibiliteit',
        icon: BookOpen,
      },
      {
        slug: 'safety-checklist-for-student-renters',
        title: 'Veiligheidschecklist voor studenthuurders',
        excerpt:
          'Verificatie, contracten en best practices voor veilig wonen in Nederland. Bescherm jezelf tegen fraude en ken je huurdersrechten.',
        readTime: '5 min lezen',
        date: '2025-11-10',
        category: 'Veiligheid',
        icon: Shield,
      },
      {
        slug: 'why-explainable-ai-matters',
        title: 'Waarom uitlegbare AI belangrijk is',
        excerpt:
          'Begrijp je matches en neem betere beslissingen. Zie hoe transparantie in AI-matching aansluit bij EU-regels en je rechten beschermt.',
        readTime: '8 min lezen',
        date: '2025-11-05',
        category: 'Technologie',
        icon: Brain,
      },
    ],
  },
}

export function BlogContent() {
  const { locale } = useApp()
  const t = content[locale]
  const reducedMotion = useReducedMotion()

  const fadeIn = {
    initial: reducedMotion ? {} : { opacity: 0, y: 20 },
    whileInView: reducedMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  }

  return (
    <>
      {/* Hero section - matching About/How it works style */}
      <Section className="relative overflow-hidden pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-purple-950/20 pointer-events-none" aria-hidden />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" aria-hidden />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" aria-hidden />

        <Container className="relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.title}</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.titleHighlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Blog post cards */}
      <Section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-transparent to-purple-950/15 pointer-events-none" aria-hidden />

        <Container className="relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.posts.map((post, index) => {
              const Icon = post.icon
              const dateFormatter = new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <motion.div
                  key={post.slug}
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full group">
                    <div
                      className={cn(
                        'glass noise-overlay h-full flex flex-col p-6 md:p-8 transition-all duration-300',
                        'hover:border-white/30 hover:bg-white/15'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                          <Icon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                          {post.category}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-200 mb-6 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{dateFormatter.format(new Date(post.date))}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                          {t.readArticle}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </Section>
    </>
  )
}
