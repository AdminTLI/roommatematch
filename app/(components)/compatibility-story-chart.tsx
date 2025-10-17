'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompatibilityStory } from '@/lib/matching/debrief'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'

interface CompatibilityStoryChartProps {
  story: CompatibilityStory
}

export function CompatibilityStoryChart({ story }: CompatibilityStoryChartProps) {
  const { breakdown, chart_data } = story

  // Convert scores to percentages for display
  const personalityScore = Math.round((breakdown.similarity_score || 0) * 100)
  const scheduleScore = Math.round((breakdown.schedule_overlap || 0) * 100)
  const lifestyleScore = Math.round((breakdown.cleanliness_align || 0) * 100)
  const socialScore = Math.round((breakdown.guests_noise_align || 0) * 100)

  const chartData = [
    {
      category: 'Personality',
      score: personalityScore,
      icon: Users,
      description: 'Communication style and temperament alignment'
    },
    {
      category: 'Schedule',
      score: scheduleScore,
      icon: Clock,
      description: 'Daily routine and sleep schedule compatibility'
    },
    {
      category: 'Lifestyle',
      score: lifestyleScore,
      icon: BarChart3,
      description: 'Cleanliness and living habits alignment'
    },
    {
      category: 'Social',
      score: socialScore,
      icon: TrendingUp,
      description: 'Guest preferences and noise tolerance'
    }
  ]

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Compatibility Breakdown
        </CardTitle>
        <CardDescription>
          How well your preferences align across different areas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.map((item, index) => {
          const IconComponent = item.icon
          const isTopScore = item.score === Math.max(...chartData.map(d => d.score))
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${isTopScore ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isTopScore ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.category}
                  </span>
                  {isTopScore && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Top Match
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.score}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isTopScore ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          )
        })}

        {/* Academic Bonuses */}
        {breakdown.academic_bonus && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-300">
              Academic Connections
            </h4>
            <div className="flex flex-wrap gap-2">
              {breakdown.academic_bonus.university_affinity && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  Same University
                </span>
              )}
              {breakdown.academic_bonus.program_affinity && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  Same Programme
                </span>
              )}
              {breakdown.academic_bonus.faculty_affinity && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                  Same Faculty
                </span>
              )}
              {breakdown.academic_bonus.study_year_gap && breakdown.academic_bonus.study_year_gap > 2 && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                  {breakdown.academic_bonus.study_year_gap} year gap
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
