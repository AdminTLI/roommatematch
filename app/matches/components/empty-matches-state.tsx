'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, RefreshCw, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyMatchesStateProps {
  hasCompletedQuestionnaire: boolean
  onRefresh?: () => void
}

export function EmptyMatchesState({ 
  hasCompletedQuestionnaire, 
  onRefresh 
}: EmptyMatchesStateProps) {
  const router = useRouter()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12 px-4 sm:px-6">
        {/* Illustration */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
        </div>

        {/* Message */}
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No matches yet
        </h3>
        
        {hasCompletedQuestionnaire ? (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
              We're working on finding your perfect roommate matches. This can take a few hours after completing your questionnaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onRefresh}
                variant="default"
                className="min-w-[140px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Matches
              </Button>
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className="min-w-[140px]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Adjust Preferences
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
              Suggestions are automatically generated every 6 hours. Try adjusting your preferences to see more matches.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
              Complete your questionnaire to start finding compatible roommates. The more questions you answer, the better your matches will be.
            </p>
            <Button
              onClick={() => router.push('/onboarding')}
              variant="default"
              className="min-w-[180px]"
            >
              Complete Questionnaire
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
              It only takes a few minutes to complete, and you can always update your answers later.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}















