'use client'

interface SectionScoresProps {
  scores: Record<string, number>
}

export function SectionScores({ scores }: SectionScoresProps) {
  if (!scores) return null

  const entries = Object.entries(scores)
  if (entries.length === 0) return null

  // Standard order: Academic, Personality, Social, Lifestyle, Schedule
  const orderMap: Record<string, number> = {
    academic: 1,
    personality: 2,
    social: 3,
    lifestyle: 4,
    schedule: 5
  }

  // Sort entries by the standard order
  const sortedEntries = entries.sort((a, b) => {
    const orderA = orderMap[a[0].toLowerCase()] || 999
    const orderB = orderMap[b[0].toLowerCase()] || 999
    return orderA - orderB
  })

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h4 className="text-xs sm:text-sm font-medium text-text-primary">Compatibility Breakdown</h4>
      <div className="space-y-1 sm:space-y-1">
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
