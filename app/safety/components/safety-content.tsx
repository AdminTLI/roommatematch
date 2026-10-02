'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield,
  AlertTriangle,
  Phone,
  Users,
  Eye,
  Lock,
  CheckCircle,
  Home,
  FileText,
  Heart,
  Bike,
  Info,
  Building2,
  DollarSign,
  Scale,
  Zap,
  Volume2,
  Stethoscope,
  Train,
  Lightbulb,
  Ban,
  ListOrdered,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
}

const shell =
  'relative overflow-hidden bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]'
const linkClass =
  'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 font-medium'

type GuideTone = 'default' | 'do' | 'dont' | 'steps'

function GuideBlock({
  title,
  icon: Icon,
  tone = 'default',
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  tone?: GuideTone
  children: ReactNode
}) {
  const toneMeta: Record<
    GuideTone,
    { label: string; wrap: string; iconWrap: string; iconColor: string; bar: string }
  > = {
    default: {
      label: 'Guide',
      wrap: 'border-zinc-200/80 dark:border-white/10 bg-gradient-to-br from-zinc-50/90 to-white dark:from-white/[0.04] dark:to-transparent',
      iconWrap: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bar: 'bg-indigo-400/70',
    },
    do: {
      label: 'Recommended',
      wrap: 'border-emerald-200/60 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-500/[0.08] dark:to-transparent',
      iconWrap: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
    },
    dont: {
      label: 'Avoid',
      wrap: 'border-rose-200/60 dark:border-rose-500/20 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-500/[0.08] dark:to-transparent',
      iconWrap: 'bg-rose-500/15',
      iconColor: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
    },
    steps: {
      label: 'How to',
      wrap: 'border-indigo-200/60 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-500/[0.1] dark:to-transparent',
      iconWrap: 'bg-indigo-500/15',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bar: 'bg-indigo-500',
    },
  }

  const meta = toneMeta[tone]

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border p-5', meta.wrap)}>
      <div className={cn('absolute left-0 top-0 h-full w-1', meta.bar)} />
      <div className="mb-4 flex items-start gap-3 pl-1">
        <div className={cn('mt-0.5 rounded-xl p-2.5', meta.iconWrap)}>
          <Icon className={cn('h-4 w-4', meta.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {meta.label}
          </p>
          <h4 className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-white">
            {title}
          </h4>
        </div>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  )
}

function BulletList({
  items,
  tone = 'default',
}: {
  items: ReactNode[]
  tone?: GuideTone
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          {tone === 'do' ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
          ) : tone === 'dont' ? (
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
          ) : (
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/80" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function StepList({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white shadow-sm shadow-indigo-500/25">
            {i + 1}
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  )
}

function TopicTrigger({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint?: string
}) {
  return (
    <AccordionTrigger className="group px-5 py-4 text-zinc-900 dark:text-white hover:bg-indigo-50/50 dark:hover:bg-indigo-500/[0.06] hover:no-underline transition-colors">
      <div className="flex items-center gap-3 pr-2">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-2.5 transition-transform group-hover:scale-105">
          <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="text-left">
          <span className="block font-semibold">{label}</span>
          {hint && (
            <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
              {hint}
            </span>
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

interface SafetyContentProps {
  universitySecurityPhone?: string | null
  universityName?: string | null
}

export function SafetyContent({
  universitySecurityPhone,
  universityName,
}: SafetyContentProps) {
  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3"
      >
        <div className="mb-1 flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Safety & Security
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
          Stay{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            Safe
          </span>
        </h1>
        <p className="max-w-xl text-lg font-medium text-zinc-500 dark:text-zinc-400">
          Everything you need to feel confident on Domu Match, from emergency numbers to chat tips.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="#platform-guide"
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
          >
            Platform guide
            <ArrowRight className="h-3 w-3" />
          </a>
          <a
            href="#nl-guide"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            Living in NL
            <ArrowRight className="h-3 w-3" />
          </a>
          <a
            href="#safety-tips"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            Quick tips
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="relative">
        <Card className={shell}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-400/10 blur-3xl"
          />
          <CardHeader className="relative border-b border-zinc-200/80 dark:border-white/10 bg-gradient-to-r from-rose-50/60 via-white/40 to-indigo-50/40 dark:from-rose-500/[0.06] dark:via-transparent dark:to-indigo-500/[0.06]">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="rounded-xl bg-rose-500/15 p-2.5">
                <Phone className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href="tel:112"
                className="group relative overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-rose-500/25 dark:from-rose-500/15 dark:to-zinc-900/40"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Immediate help
                  </p>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Emergency Services
                </h4>
                <p className="mt-1 text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  112
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Police, Fire, Ambulance
                </p>
              </a>

              <div className="relative overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm dark:border-indigo-500/25 dark:from-indigo-500/15 dark:to-zinc-900/40">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Campus
                </p>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  University Security
                </h4>
                {universitySecurityPhone ? (
                  <>
                    <a
                      href={`tel:${universitySecurityPhone.replace(/\s/g, '')}`}
                      className="mt-1 block text-2xl font-bold tracking-tight text-indigo-700 transition-colors hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      {universitySecurityPhone}
                    </a>
                    {universityName && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {universityName}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      For emergencies, call{' '}
                      <a href="tel:112" className={linkClass}>
                        112
                      </a>
                      .
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {universityName
                        ? `For ${universityName} non-emergency concerns, contact your university office.`
                        : 'Contact your university office for non-emergency security concerns.'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Compact trust strip */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {[
          {
            icon: Shield,
            title: 'Real people only',
            body: 'University email + ID checks',
            tint: 'from-emerald-500/15 to-teal-500/10',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            icon: Eye,
            title: 'We’ve got your back',
            body: 'Manual checks when needed',
            tint: 'from-indigo-500/15 to-violet-500/10',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            icon: Lock,
            title: 'Private by default',
            body: 'You’re in control of your profile',
            tint: 'from-violet-500/15 to-fuchsia-500/10',
            iconColor: 'text-violet-600 dark:text-violet-400',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50"
          >
            <div
              className={cn(
                'rounded-xl bg-gradient-to-br p-2.5',
                feature.tint,
              )}
            >
              <feature.icon className={cn('h-4 w-4', feature.iconColor)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {feature.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {feature.body}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Platform Safety Guide */}
      <motion.div
        id="platform-guide"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative scroll-mt-24"
      >
        <Card className={shell}>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-0 h-36 w-36 rounded-full bg-indigo-400/15 blur-3xl"
          />
          <CardHeader className="relative border-b border-zinc-200/80 dark:border-white/10 bg-gradient-to-r from-indigo-50/70 via-white/50 to-violet-50/50 dark:from-indigo-500/[0.08] dark:via-transparent dark:to-violet-500/[0.06]">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 p-2.5">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Safety guide
            </CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              We’ve seen the scammy stuff – here’s how to stay safe on bios, chat, reporting, and blocking.
            </p>
          </CardHeader>
          <CardContent className="relative p-0">
            <Accordion type="single" collapsible className="w-full" defaultValue="profile-bio">
              <AccordionItem value="profile-bio" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger
                  icon={FileText}
                  label="Profile Bio Guidelines"
                  hint="What to share, and what to skip"
                />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="What to include in your bio" icon={FileText} tone="do">
                    <BulletList
                      tone="do"
                      items={[
                        'Your lifestyle preferences (early bird vs night owl, quiet vs social)',
                        'Living habits (cleanliness standards, cooking frequency)',
                        'Study schedule and work patterns',
                        'Hobbies and interests that matter to you',
                        "What you're looking for in a roommate",
                        'Any important house rules or preferences',
                        'Your personality traits and communication style',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="What not to include" icon={AlertTriangle} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Personal contact information (phone, email, social media)',
                        'Your exact address or location details',
                        'Financial information or payment requests',
                        'Inappropriate or offensive content',
                        'Spam or promotional content',
                        'Links to external websites',
                        'Any information that could compromise your safety',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="How to update your bio" icon={ListOrdered} tone="steps">
                    <StepList
                      items={[
                        'Open Settings from the bottom navigation',
                        'Select the Profile tab',
                        'Find Bio under About You',
                        'Type or edit your bio (up to 500 characters)',
                        'Click Save Changes',
                        'Your bio will be visible to potential matches',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chat-safety" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger
                  icon={Lock}
                  label="Chat Safety"
                  hint="Stay protected while you message"
                />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Safe chat practices" icon={Shield} tone="do">
                    <BulletList
                      tone="do"
                      items={[
                        "Keep conversations on Domu Match. Don't share personal contact info right away",
                        'Take your time getting to know someone before meeting in person',
                        'Trust your instincts. If something feels off, it probably is',
                        'Never share financial information or send money to anyone',
                        'Be cautious of users who ask for personal details too quickly',
                        'Report suspicious behavior from the chat menu right away',
                        'Stay in-app so reporting, blocking, and message filters can protect you',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Automatic message protection" icon={Lock} tone="default">
                    <BulletList
                      items={[
                        'Links are automatically blocked in messages for your safety',
                        'Email addresses cannot be sent in messages',
                        'Phone numbers are automatically filtered out',
                        'Some suspicious content may be flagged for review',
                        'These protections help prevent scams and phishing attempts',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Red flags to watch for" icon={AlertTriangle} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Asking for money or financial assistance',
                        'Pressuring you to move chats off here too fast',
                        'Refusing to answer questions about themselves',
                        'Being overly aggressive or inappropriate',
                        'Making you feel uncomfortable or unsafe',
                        'Asking for personal information too quickly',
                        'Threatening or harassing behavior',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="reporting" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger
                  icon={AlertTriangle}
                  label="Reporting Users"
                  hint="How we handle reports"
                />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="How to report a user" icon={ListOrdered} tone="steps">
                    <StepList
                      items={[
                        'Open Chats, open the conversation, tap ⋯ in the header, then choose Report user',
                        'Or open a message menu and choose Report message',
                        'Select the category that best fits what happened',
                        'Optionally add details, then agree so moderators can review the 10 most recent messages in that chat',
                        'Tap Submit report. Our team reviews reports promptly',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Report categories" icon={Info} tone="default">
                    <BulletList
                      items={[
                        'Harassment or bullying',
                        'Swearing or abusive language',
                        "Using someone else's account",
                        'Fake profile / impersonation',
                        'Threats or intimidation',
                        'Scam, fraud, or phishing',
                        'Hate or discrimination',
                        'Spam or unwanted contact',
                        'Inappropriate content',
                        'Other',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="What happens after reporting" icon={Shield} tone="default">
                    <BulletList
                      items={[
                        'Your report is logged immediately',
                        'Our team is notified and reviews it',
                        'If you report the same person 3 times within 24 hours, they are automatically blocked for you',
                        'Admins may warn, suspend, or remove an account after review',
                        'You can submit up to 5 reports per hour',
                        "Reports stay confidential. The reported user won't know who filed it",
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="blocking" className="border-b-0 border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger
                  icon={Users}
                  label="Blocking Users"
                  hint="Instant control over who can reach you"
                />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="How to block a user" icon={ListOrdered} tone="steps">
                    <StepList
                      items={[
                        'Open Chats, open the conversation, tap ⋯ in the header, then choose Block user',
                        'Confirm the block. It takes effect immediately',
                        'They can no longer message you, and matching between you is stopped',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="What blocking does" icon={Lock} tone="default">
                    <BulletList
                      items={[
                        'Stops messaging between you and that user',
                        'Hides messages from them while the block is active',
                        'Removes them from your match suggestions',
                        'Prevents new chats from starting between you',
                        'You can unblock later from the same chat menu',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Unblocking users" icon={ListOrdered} tone="steps">
                    <StepList
                      items={[
                        'Open the chat with that person',
                        'Tap ⋯ in the header, then choose Unblock user',
                        'Confirm if prompted',
                        'Unblocking does not restore messages from while you were blocked',
                        'Be cautious about unblocking. Trust your instincts',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Blocking vs reporting" icon={Info} tone="default">
                    <BulletList
                      items={[
                        'Blocking: stops contact for you right away',
                        'Reporting: alerts us so we can act across the platform',
                        'You can do both: block for protection, report for others',
                        'If someone is harassing you: block first, then report',
                        'Reporting helps protect other users from the same behavior',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Tips */}
      <motion.div
        id="safety-tips"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative scroll-mt-24"
      >
        <Card className={shell}>
          <CardHeader className="border-b border-zinc-200/80 dark:border-white/10 bg-gradient-to-r from-violet-50/60 via-white/40 to-indigo-50/40 dark:from-violet-500/[0.06] dark:via-transparent dark:to-indigo-500/[0.06]">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/10 p-2.5">
                <Heart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              Quick Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 p-5 sm:p-6 md:grid-cols-2">
            {[
              'Meet in public the first few times',
              "Double-check who you’re talking to",
              'If a chat feels weird, trust that',
              'Tell a friend where you’re going',
              'Keep early chats here first',
            ].map((tip) => (
              <div
                key={tip}
                className="flex items-center gap-3 rounded-2xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 to-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-indigo-500/15 dark:from-indigo-500/[0.08] dark:to-transparent"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                  <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {tip}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Netherlands Safety Guide */}
      <motion.div
        id="nl-guide"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="relative scroll-mt-24"
      >
        <Card className={shell}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 top-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl"
          />
          <CardHeader className="relative border-b border-zinc-200/80 dark:border-white/10 bg-gradient-to-r from-sky-50/70 via-white/50 to-indigo-50/40 dark:from-sky-500/[0.07] dark:via-transparent dark:to-indigo-500/[0.06]">
            <CardTitle className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="rounded-xl bg-gradient-to-br from-sky-500/15 to-indigo-500/10 p-2.5">
                <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              Living in the Netherlands
            </CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Housing, emergencies, scams, healthcare, and more. Tap a topic to expand.
            </p>
          </CardHeader>
          <CardContent className="relative p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="housing" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={Home} label="Housing Issues" hint="Landlords, deposits, rent" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Landlord not fixing issues" icon={Building2} tone="steps">
                    <StepList
                      items={[
                        'Document all issues with photos and written requests',
                        'Send formal written notice to your landlord (keep copies)',
                        <>
                          Contact your local municipality&apos;s housing department or{' '}
                          <Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Woonbond
                          </Link>{' '}
                          (tenants&apos; union)
                        </>,
                        <>
                          If urgent (heating, water, safety), call{' '}
                          <Link href="tel:112" className={linkClass}>
                            112
                          </Link>
                        </>,
                        <>
                          Consider joining a tenants&apos; union (
                          <Link href="https://www.woonbond.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Huurdersvereniging
                          </Link>
                          ) for legal support
                        </>,
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Deposit disputes" icon={DollarSign} tone="default">
                    <BulletList
                      items={[
                        'Take photos/videos when moving in and out',
                        'Landlord must return deposit within 14 days after move-out',
                        'Deductions must be reasonable and documented',
                        <>
                          Contact{' '}
                          <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Juridisch Loket
                          </Link>{' '}
                          for free legal advice
                        </>,
                        <>
                          File with the{' '}
                          <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Rent Tribunal (Huurcommissie)
                          </Link>{' '}
                          if needed
                        </>,
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Illegal rent increases" icon={Scale} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Rent increases are regulated and limited annually',
                        'Check if the increase exceeds the legal maximum (usually 3-4%)',
                        'Request a written explanation from your landlord',
                        <>
                          Contact{' '}
                          <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Huurcommissie
                          </Link>{' '}
                          to challenge illegal increases
                        </>,
                        'You can refuse to pay illegal increases',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="emergency" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={AlertTriangle} label="Emergency Situations" hint="112 vs campus vs police" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="When to call 112" icon={Phone} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Life-threatening emergencies (medical, fire, crime in progress)',
                        'Serious accidents requiring immediate medical attention',
                        'Active break-ins or violent crimes',
                        'Fires or gas leaks',
                        'Speak clearly: location, what happened, how many people involved',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="When to call university security" icon={Shield} tone="default">
                    <BulletList
                      items={[
                        'Non-emergency security concerns on campus',
                        'Lost or found items',
                        'Building access issues',
                        "Minor incidents that don't require police",
                        'General safety questions or concerns',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Non-emergency police: 0900-8844" icon={Phone} tone="default">
                    <BulletList
                      items={[
                        <>
                          Report theft (after the fact) via the{' '}
                          <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            police website
                          </Link>{' '}
                          or call{' '}
                          <Link href="tel:09008844" className={linkClass}>
                            0900-8844
                          </Link>
                        </>,
                        <>
                          File reports through{' '}
                          <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            online reporting
                          </Link>
                        </>,
                        <>
                          General inquiries:{' '}
                          <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            politie.nl
                          </Link>
                        </>,
                        'Not for immediate emergencies',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scams" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={AlertTriangle} label="Common Scams" hint="Rental and deposit traps" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Rental scams" icon={AlertTriangle} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Never pay a deposit before viewing the property',
                        'Be suspicious of prices that seem too good to be true',
                        'Verify landlord identity and property ownership',
                        "Don't send money via wire transfer or cryptocurrency",
                        'Always view the property in person before signing',
                        <>
                          Check the property exists via{' '}
                          <Link href="https://www.kadaster.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Kadaster
                          </Link>
                        </>,
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Fake landlords" icon={Users} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Ask for ID and verify ownership documents',
                        <>
                          Check registration with{' '}
                          <Link href="https://www.kvk.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            KvK
                          </Link>
                        </>,
                        "Be wary of landlords who can't meet in person",
                        'Verify through official channels before paying anything',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Deposit fraud" icon={DollarSign} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        "Deposits should be held separately, not in the landlord's personal account",
                        'Get a receipt for all payments',
                        'Use bank transfer (not cash) for traceability',
                        'Maximum deposit is usually 1-2 months rent',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="legal" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={FileText} label="Legal Rights" hint="Tenant protections & help" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Tenant rights" icon={Shield} tone="do">
                    <BulletList
                      tone="do"
                      items={[
                        'Right to privacy: landlord must give 24-48 hours notice before visits',
                        'Right to habitable living conditions',
                        'Protection against discrimination',
                        'Right to challenge unfair rent increases',
                        'Protection against illegal eviction',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Housing regulations" icon={FileText} tone="default">
                    <BulletList
                      items={[
                        'Rent control applies to properties under certain price thresholds',
                        'Minimum room size requirements exist',
                        'Maximum number of tenants per property',
                        <>
                          Registration with municipality required (
                          <Link
                            href="https://www.rijksoverheid.nl/onderwerpen/persoonsgegevens/basisregistratie-personen-brp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            Basisregistratie Personen
                          </Link>
                          )
                        </>,
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Complaint procedures" icon={Scale} tone="default">
                    <BulletList
                      items={[
                        <>
                          <Link href="https://www.huurcommissie.nl/en/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Huurcommissie
                          </Link>
                          : free rent assessment and dispute resolution
                        </>,
                        <>
                          <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Juridisch Loket
                          </Link>
                          : free legal advice (income-dependent)
                        </>,
                        <>
                          Municipality: housing violations. Contact your local{' '}
                          <Link href="https://www.rijksoverheid.nl/onderwerpen/gemeenten" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            municipality
                          </Link>
                        </>,
                        <>
                          <Link href="https://www.politie.nl/en/contact" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Police
                          </Link>
                          : criminal matters (theft, fraud, harassment)
                        </>,
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="utilities" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={Lightbulb} label="Utilities & Bills" hint="Cut-offs and disputes" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Utilities cut off" icon={Zap} tone="steps">
                    <StepList
                      items={[
                        'Contact the utility company immediately',
                        "Set up a payment plan if you're behind",
                        'Utilities cannot be cut off without proper notice',
                        <>
                          Contact{' '}
                          <Link href="https://www.juridischloket.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Juridisch Loket
                          </Link>{' '}
                          if a cut-off seems illegal
                        </>,
                        'In winter, heating cannot be cut off for vulnerable households',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Billing disputes" icon={FileText} tone="default">
                    <BulletList
                      items={[
                        'Request a detailed breakdown of charges',
                        'Check meter readings yourself',
                        'Dispute in writing within 30 days',
                        <>
                          Contact{' '}
                          <Link href="https://www.acm.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            ACM
                          </Link>{' '}
                          for unfair practices
                        </>,
                        'Keep all correspondence and bills',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="neighbors" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={Users} label="Neighbor Disputes" hint="Noise and mediation" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Noisy neighbors" icon={Volume2} tone="steps">
                    <StepList
                      items={[
                        'Talk to your neighbor politely first',
                        'Check local noise rules (usually quiet hours 22:00-07:00)',
                        'Document incidents (times, dates, recordings if legal)',
                        'Contact building manager or VVE',
                        'Contact the municipality if it persists',
                        'Police can be called for excessive noise during quiet hours',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Other conflicts" icon={Users} tone="default">
                    <BulletList
                      items={[
                        'Try mediation before legal action',
                        'Contact VVE or building management',
                        'Municipality mediation services may be available',
                        'Document all incidents',
                        'For harassment or threats, contact police',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="healthcare" className="border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={Heart} label="Healthcare Emergencies" hint="GP, ER, and 112" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="When to go to hospital" icon={AlertTriangle} tone="dont">
                    <BulletList
                      tone="dont"
                      items={[
                        'Life-threatening emergencies: call 112',
                        'Severe injuries, chest pain, difficulty breathing',
                        'Loss of consciousness',
                        'Severe allergic reactions',
                        'Go to ER (Spoedeisende Hulp) for urgent but non-life-threatening issues',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="GP vs emergency" icon={Stethoscope} tone="default">
                    <BulletList
                      items={[
                        'GP (Huisarts): for non-urgent medical issues',
                        'Register with a GP as soon as you arrive',
                        'GP can refer you to specialists',
                        "After-hours: call your GP's number for instructions",
                        'Huisartsenpost: after-hours GP service at hospitals',
                        '112: only for life-threatening emergencies',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="transportation" className="border-b-0 border-zinc-200/80 dark:border-white/10 px-1">
                <TopicTrigger icon={Bike} label="Transportation" hint="Bikes, OV, and lost items" />
                <AccordionContent className="space-y-4 px-5 pb-6 pt-1">
                  <GuideBlock title="Bike stolen" icon={Bike} tone="steps">
                    <StepList
                      items={[
                        <>
                          Report to police:{' '}
                          <Link href="tel:09008844" className={linkClass}>
                            0900-8844
                          </Link>{' '}
                          or{' '}
                          <Link href="https://www.politie.nl/en/report" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            report online
                          </Link>
                        </>,
                        'Get a police report number for insurance',
                        'Check if you have bike insurance (often in home insurance)',
                        <>
                          Register your bike at{' '}
                          <Link
                            href="https://www.rijksoverheid.nl/onderwerpen/fiets/fietsregistratie"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            rijksoverheid.nl
                          </Link>
                        </>,
                        'Use two locks (frame + wheel)',
                        'Lock to fixed objects, not just the wheel',
                      ]}
                    />
                  </GuideBlock>

                  <GuideBlock title="Public transport issues" icon={Train} tone="default">
                    <BulletList
                      items={[
                        <>
                          OV-chipkaart problems:{' '}
                          <Link href="https://www.ov-chipkaart.nl/" target="_blank" rel="noopener noreferrer" className={cn(linkClass, 'inline-flex items-center gap-1')}>
                            customer service
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </>,
                        <>
                          Delays: check{' '}
                          <Link href="https://www.ns.nl/en" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            NS
                          </Link>{' '}
                          or{' '}
                          <Link href="https://9292.nl/en" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            9292
                          </Link>
                        </>,
                        <>
                          Lost items:{' '}
                          <Link href="https://www.verlorenofgevonden.nl/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                            Gevonden Voorwerpen
                          </Link>
                        </>,
                        'Unfair fines: appeal within 6 weeks',
                        'Student discounts: apply for a student OV-chipkaart',
                      ]}
                    />
                  </GuideBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
