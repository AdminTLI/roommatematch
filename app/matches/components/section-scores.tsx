'use client'

import {
  Moon,
  Sparkles,
  MessageCircle,
  Users,
  ClipboardList,
} from 'lucide-react'

interface SectionScoresProps {
  scores: Record<string, number>
}

// v2 dimension display config
const V2_DIMENSIONS: {
  key: string
  label: string
  tooltip: string
  order: number
  Icon: React.ElementType
}[] = [
  {
    key: 'environment',
    label: 'Environment',
    tooltip: 'Sleep schedules, noise sensitivity, lighting and temperature preferences',
    order: 1,
    Icon: Moon,
  },
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    tooltip: 'Kitchen habits, chore routines, and shared-space upkeep standards',
    order: 2,
    Icon: Sparkles,
  },
  {
    key: 'communication',
    label: 'Communication',
    tooltip: 'How you give feedback, handle conflict, and coordinate day-to-day',
    order: 3,
    Icon: MessageCircle,
  },
  {
    key: 'social',
    label: 'Social Life',
    tooltip: 'Guest frequency, overnight visitors, shared-space use, and social energy at home',
    order: 4,
    Icon: Users,
  },
  {
    key: 'logistics_context',
    label: 'Logistics',
    tooltip: 'Practical fit: stay length, move-in timing, financial norms, and house rules style',
    order: 5,
    Icon: ClipboardList,
  },
]

const V2_KEYS = new Set(V2_DIMENSIONS.map((d) => d.key))

// Legacy v1 order map (backward compat)
const V1_ORDER: Record<string, number> = {
  academic: 1,
  personality: 2,
  social: 3,
  lifestyle: 4,
  schedule: 5,
}

export function SectionScores({ scores }: SectionScoresProps) {
  if (!scores) return null

  const entries = Object.entries(scores).filter(([k]) =>
    !['harmony', 'context', 'algo', 'gate_conflicts', 'soft_gate_override',
      'academic_bonus', 'top_alignment', 'watch_out'].includes(k),
  )
  if (entries.length === 0) return null

  const isV2 = entries.some(([k]) => V2_KEYS.has(k))

  if (isV2) {
    // Render v2 dimensions in defined order, with icon + tooltip
    const v2Entries = V2_DIMENSIONS.filter(({ key }) => scores[key] != null)

    return (
      <div className="space-y-1.5 sm:space-y-2">
        <h4 className="text-xs sm:text-sm font-medium text-text-primary">Compatibility Breakdown</h4>
        <div className="space-y-1">
          {v2Entries.map(({ key, label, tooltip, Icon }) => {
            const pct = Math.round((scores[key] ?? 0) * 100)
            return (
              <div key={key} className="flex items-center gap-2 sm:gap-3 group">
                <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" aria-hidden />
                <span
                  className="w-24 text-xs sm:text-sm text-text-secondary flex-shrink-0 cursor-help"
                  title={tooltip}
                >
                  {label}
                </span>
                <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-0">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 sm:w-10 text-right text-xs font-medium text-text-muted flex-shrink-0">
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Legacy v1 rendering
  const sortedEntries = entries.sort((a, b) => {
    const orderA = V1_ORDER[a[0].toLowerCase()] ?? 999
    const orderB = V1_ORDER[b[0].toLowerCase()] ?? 999
    return orderA - orderB
  })

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h4 className="text-xs sm:text-sm font-medium text-text-primary">Compatibility Breakdown</h4>
      <div className="space-y-1">
        {sortedEntries.map(([section, value]) => (
          <div key={section} className="flex items-center gap-2 sm:gap-3">
            <span className="w-20 sm:w-24 text-xs sm:text-sm capitalize text-text-secondary flex-shrink-0">
              {section.replace('_', ' ')}
            </span>
            <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-0">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${Math.round((value || 0) * 100)}%` }}
              />
            </div>
            <span className="w-8 sm:w-10 text-right text-xs font-medium text-text-muted flex-shrink-0">
              {Math.round((value || 0) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
