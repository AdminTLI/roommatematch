import {
  Moon,
  Sparkles,
  MessageCircle,
  Users,
  Package,
  type LucideIcon,
} from 'lucide-react'

/** Copy for the full harmony questionnaire intro (shown when unlocking scores later). */
export const HARMONY_MODULES: {
  label: string
  Icon: LucideIcon
  iconClass: string
}[] = [
  { label: 'Logistics', Icon: Package, iconClass: 'text-sky-600 dark:text-sky-400' },
  { label: 'Rhythms', Icon: Moon, iconClass: 'text-violet-600 dark:text-violet-400' },
  { label: 'Cleanliness', Icon: Sparkles, iconClass: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Communication', Icon: MessageCircle, iconClass: 'text-orange-600 dark:text-orange-400' },
  { label: 'Social Life', Icon: Users, iconClass: 'text-fuchsia-600 dark:text-fuchsia-400' },
]

export const HARMONY_WELCOME_COPY = {
  title: 'See how well you’d click at home',
  subtitle: 'Answer a few living-habit questions to unlock Harmony scores and clearer reasons.',
  badgeModules: '5 Quick Modules',
  badgeTime: '~6-8 Minutes',
  coverLabel: "What we'll cover",
  tip: 'Tip: Honest answers lead to better fits',
} as const
