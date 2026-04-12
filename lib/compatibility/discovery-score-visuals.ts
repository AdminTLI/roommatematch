/**
 * Shared Tailwind classes for Discovery-style match / harmony / context scores (0–100 scale).
 * Keeps dashboard, /matches cards, and chat profile pane visually aligned in light and dark mode.
 */
export function discoveryScoreTextClass(percent: number): string {
  if (percent >= 85) return 'text-emerald-600 dark:text-emerald-400'
  if (percent >= 70) return 'text-indigo-600 dark:text-indigo-400'
  if (percent >= 55) return 'text-violet-600 dark:text-violet-400'
  return 'text-amber-600 dark:text-amber-400'
}

export function discoveryScoreBarClass(percent: number): string {
  if (percent >= 85) return 'bg-emerald-500'
  if (percent >= 70) return 'bg-indigo-500'
  if (percent >= 55) return 'bg-violet-500'
  return 'bg-amber-500'
}

export function discoveryMatchTierLabel(percent: number): string {
  if (percent >= 85) return 'Amazing'
  if (percent >= 70) return 'Great'
  if (percent >= 55) return 'Good'
  return 'Low'
}
