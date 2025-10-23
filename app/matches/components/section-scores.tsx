'use client'

interface SectionScoresProps {
  scores: Record<string, number>
}

export function SectionScores({ scores }: SectionScoresProps) {
  if (!scores) return null

  const entries = Object.entries(scores)
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Compatibility Breakdown</h4>
      <div className="space-y-1">
        {entries.map(([section, value]) => (
          <div key={section} className="flex items-center gap-3">
            <span className="w-24 text-sm capitalize text-gray-600">
              {section.replace('_', ' ')}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${Math.round((value || 0) * 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-medium text-gray-500">
              {Math.round((value || 0) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
