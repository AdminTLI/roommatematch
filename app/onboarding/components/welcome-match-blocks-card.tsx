'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Brain,
  Moon,
  Volume2,
  Home,
  Users,
  MessageCircle,
  Lock,
  ListChecks,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const MATCH_BLOCKS: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: 'Personality and Values',
    description: 'Traits, priorities, and what matters most in a home.',
    Icon: Brain,
  },
  {
    title: 'Sleep and Circadian',
    description: 'Bedtimes, mornings, and rhythm with the household.',
    Icon: Moon,
  },
  {
    title: 'Noise and Sensory',
    description: 'Sound tolerance, alerts, and sensory comfort.',
    Icon: Volume2,
  },
  {
    title: 'Home Operations',
    description: 'Chores, cleanliness, and how shared spaces run day to day.',
    Icon: Home,
  },
  {
    title: 'Social, Hosting, and Language',
    description: 'Guests, hosting style, and languages at home.',
    Icon: Users,
  },
  {
    title: 'Communication and Conflict',
    description: 'How you talk through friction, money, and house norms.',
    Icon: MessageCircle,
  },
  {
    title: 'Privacy and Territoriality',
    description: 'Personal space, boundaries, and shared vs. private areas.',
    Icon: Lock,
  },
  {
    title: 'Reliability and Logistics',
    description: 'Move timing, budget, commute, and follow-through on plans.',
    Icon: ListChecks,
  },
]

export function WelcomeMatchBlocksCard({ heading }: { heading: string }) {
  return (
    <Card className="rounded-3xl border-border-subtle/25 bg-bg-surface-alt/40 backdrop-blur-xl">
      <CardContent className="space-y-5 p-5 sm:p-6 lg:p-7">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">{heading}</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 sm:gap-y-6 xl:grid-cols-3 xl:gap-y-7">
          {MATCH_BLOCKS.map(({ title, description, Icon }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-surface-alt/60 text-sky-400 ring-1 ring-white/5">
                <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-[15px] font-semibold leading-snug text-text-primary">{title}</p>
                <p className="text-sm leading-relaxed text-text-primary/90">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
