'use client'

import Link from 'next/link'
import type { HostType } from '@/lib/host/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Shield,
  Eye,
  Home,
  AlertTriangle,
  Phone,
  Camera,
  Banknote,
  HeartHandshake,
  BadgeCheck,
  Clock,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

const shell =
  'relative overflow-hidden bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]'

export function HostSafetyContent({ hostType }: { hostType: HostType }) {
  const isAgency = hostType === 'agency'
  const audience = isAgency ? 'your listings' : 'your place'
  const quickWinsLabel = isAgency
    ? 'Tighten dealbreakers to cut low-fit volume'
    : 'Set clear house rules so the right people apply'

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Host safety</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Stay safe & fill {audience} well
        </h1>
        <p className="max-w-2xl text-ink-500">
          Practical guidance for {isAgency ? 'agencies' : 'landlords'}: screen fairly, chat
          carefully after Accept, and improve how you attract the right applicants.
        </p>
      </header>

      <section className={`${shell} p-6 sm:p-8`}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Quick wins</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            'Verify your email so students can apply and book viewings',
            'Add 5+ clear photos and a concrete title',
            quickWinsLabel,
            'Complete lifestyle preferences for better fit ranking',
            'Reply to applications and viewing requests within 24 hours',
            'Upload WWS documents when relevant for trust badges',
          ].map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-3 py-2.5 text-sm text-ink-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-zinc-200"
            >
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/host/listings/wizard"
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Improve a listing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/host/settings"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
          >
            Host settings
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">Stay safe</h2>
        <div className={shell}>
          <Accordion type="multiple" className="px-4 sm:px-6">
            <AccordionItem value="screen">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-500" /> Fair screening
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Review fit scores, lifestyle alignment, and verification badges before Accept.
                  Avoid questions about protected characteristics (race, religion, sexual
                  orientation, disability, etc.).
                </p>
                <p>
                  Names stay hidden until you Accept. After Accept, identity is revealed and chat
                  unlocks so you can discuss details.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="viewings">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-indigo-500" /> Viewing meetups
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Confirm viewings in the portal. For first meetings, prefer daylight and bring
                  another person when possible. Keep early logistics in Domu chat where possible.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="scams">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-indigo-500" /> Payment & deposit scams
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Never accept deposits via unusual links or prepaid cards. Formal offers should
                  follow a clear conversation. If something feels off, reject and report.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="report">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" /> Report & block
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Use in-chat report tools if an applicant harasses you or tries to move you off
                  platform for suspicious payments. You can also reject applications with a reason.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="emergency">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-500" /> Emergency contacts (NL)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Emergency: <strong>112</strong>. Police non-emergency: <strong>0900-8844</strong>.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">
          Attract the right people
        </h2>
        <div className={shell}>
          <Accordion type="multiple" className="px-4 sm:px-6">
            <AccordionItem value="photos">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-indigo-500" /> Strong first impression
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Photos, title, and description drive browse conversion. Bright, honest room
                  photos and a specific title outperform vague copy.
                </p>
                <Link href="/host/listings" className="font-medium text-indigo-600 hover:underline">
                  Edit listings →
                </Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pricing">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-indigo-500" /> Clear money & dates
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Accurate rent, deposit, utilities, and available-from dates reduce mismatched
                  applications on budget and move-in timing.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fit">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-indigo-500" /> House rules & lifestyle
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Dealbreakers (pets, smoking, Airbnb, BRP, group size) hard-filter applicants.
                  Lifestyle preferences power soft ranking — complete them so fit scores are
                  meaningful.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="trust">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-indigo-500" /> Trust signals
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Verified email unlocks applications and viewings. WWS documents and a complete
                  host profile (KvK for agencies, bio/phone for landlords) build student trust.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="speed">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" /> Respond faster
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Your response time can appear on the listing. Confirm viewings and Accept or
                  pass on applications promptly — serious applicants notice.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="presence">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" /> Host presence
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-ink-600 dark:text-zinc-300">
                <p>
                  Keep display name, phone, and {isAgency ? 'company / license details' : 'a short bio'}{' '}
                  up to date in settings so students know who they are talking to.
                </p>
                <Link href="/host/settings" className="font-medium text-indigo-600 hover:underline">
                  Open settings →
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
