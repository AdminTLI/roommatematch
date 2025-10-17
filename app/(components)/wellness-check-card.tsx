// Wellness Check Card Component for displaying and managing wellness assessments

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Moon,
  Users,
  BookOpen,
  Activity
} from 'lucide-react'
import type { WellnessCheck } from '@/lib/safety/types'
import { WELLNESS_CHECK_CONFIGS, WELLNESS_CHECK_STATUS_CONFIG } from '@/lib/safety/types'
import { calculateWellnessScore, getWellnessScoreRange, getRiskLevel } from '@/lib/safety/utils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface WellnessCheckCardProps {
  check: WellnessCheck
  currentUserId?: string
  onComplete?: (id: string) => void
  onView?: (id: string) => void
  className?: string
}

const wellnessIcons = {
  automated: Clock,
  manual: User,
  scheduled: Calendar,
  emergency: AlertTriangle
}

const moodIcons = {
  excellent: Smile,
  good: Smile,
  fair: Meh,
  poor: Frown
}

export function WellnessCheckCard({
  check,
  currentUserId,
  onComplete,
  onView,
  className
}: WellnessCheckCardProps) {
  const config = WELLNESS_CHECK_CONFIGS[check.check_type]
  const statusConfig = WELLNESS_CHECK_STATUS_CONFIG[check.status]
  const Icon = wellnessIcons[check.check_type]
  
  const overallScore = check.overall_wellness || 0
  const calculatedScore = calculateWellnessScore(check)
  const wellnessRange = getWellnessScoreRange(calculatedScore)
  const riskLevel = getRiskLevel(calculatedScore)
  const MoodIcon = moodIcons[wellnessRange.key as keyof typeof moodIcons]
  
  const isOwner = currentUserId === check.user_id
  const isPending = check.status === 'pending'
  const isOverdue = check.status === 'overdue'
  const needsFollowUp = check.follow_up_required

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isOverdue && 'border-red-200 bg-red-50/50',
      needsFollowUp && 'border-yellow-200 bg-yellow-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{config.name}</CardTitle>
              {check.trigger_reason && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Triggered by: {check.trigger_reason}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                
                {needsFollowUp && (
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Follow-up needed
                  </Badge>
                )}
                
                {isOverdue && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {check.created_at && formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
            </div>
            {check.scheduled_at && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Scheduled: {new Date(check.scheduled_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Wellness Score */}
        {check.status === 'completed' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Overall Wellness Score
              </h4>
              <div className="flex items-center gap-2">
                <MoodIcon className="h-4 w-4" />
                <span className={cn('text-sm font-medium', wellnessRange.color)}>
                  {calculatedScore.toFixed(1)}/10
                </span>
              </div>
            </div>
            
            <Progress value={calculatedScore * 10} className="h-2" />
            
            <div className="flex items-center justify-between text-xs">
              <span className={cn('px-2 py-1 rounded', 
                riskLevel.level === 'high' ? 'bg-red-100 text-red-800' :
                riskLevel.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              )}>
                {riskLevel.label}
              </span>
              <span className="text-gray-500">
                {wellnessRange.label}
              </span>
            </div>
          </div>
        )}
        
        {/* Individual Scores */}
        {check.status === 'completed' && (
          <div className="grid grid-cols-2 gap-3">
            {check.stress_level && (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Stress:</span>
                <span className="text-sm font-medium">{check.stress_level}/10</span>
              </div>
            )}
            
            {check.sleep_quality && (
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Sleep:</span>
                <span className="text-sm font-medium">{check.sleep_quality}/10</span>
              </div>
            )}
            
            {check.social_connections && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Social:</span>
                <span className="text-sm font-medium">{check.social_connections}/10</span>
              </div>
            )}
            
            {check.academic_pressure && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Academic:</span>
                <span className="text-sm font-medium">{check.academic_pressure}/10</span>
              </div>
            )}
          </div>
        )}
        
        {/* Concerns and Support */}
        {check.status === 'completed' && (
          <div className="space-y-3">
            {check.concerns && check.concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Concerns
                </h4>
                <div className="space-y-1">
                  {check.concerns.map((concern, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {check.positive_notes && check.positive_notes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Positive Notes
                </h4>
                <div className="space-y-1">
                  {check.positive_notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {check.support_needed && check.support_needed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Support Needed
                </h4>
                <div className="flex flex-wrap gap-1">
                  {check.support_needed.map((support, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {support}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Response */}
        {check.response_text && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Response
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {check.response_text}
            </p>
          </div>
        )}
        
        {/* Follow-up Information */}
        {check.follow_up_required && check.follow_up_date && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Calendar className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Follow-up scheduled
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                {new Date(check.follow_up_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isPending && isOwner && (
            <Button
              size="sm"
              onClick={() => onComplete?.(check.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Check
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(check.id)}
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface WellnessCheckListProps {
  checks: WellnessCheck[]
  currentUserId?: string
  onComplete?: (id: string) => void
  onView?: (id: string) => void
  className?: string
}

export function WellnessCheckList({
  checks,
  currentUserId,
  onComplete,
  onView,
  className
}: WellnessCheckListProps) {
  if (checks.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Wellness Checks
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No wellness checks found.
        </p>
      </div>
    )
  }

  // Sort checks by status and date
  const sortedChecks = [...checks].sort((a, b) => {
    // Pending/overdue first
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (b.status === 'pending' && a.status !== 'pending') return 1
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (b.status === 'overdue' && a.status !== 'overdue') return 1
    
    // Then by date (most recent first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className={cn('space-y-4', className)}>
      {sortedChecks.map((check) => (
        <WellnessCheckCard
          key={check.id}
          check={check}
          currentUserId={currentUserId}
          onComplete={onComplete}
          onView={onView}
        />
      ))}
    </div>
  )
}

interface WellnessStatsProps {
  checks: WellnessCheck[]
  className?: string
}

export function WellnessStats({ checks, className }: WellnessStatsProps) {
  const completedChecks = checks.filter(c => c.status === 'completed')
  const pendingChecks = checks.filter(c => c.status === 'pending')
  const overdueChecks = checks.filter(c => c.status === 'overdue')
  
  const averageScore = completedChecks.length > 0 
    ? completedChecks.reduce((sum, check) => sum + (check.overall_wellness || 0), 0) / completedChecks.length
    : 0
  
  const highRiskChecks = completedChecks.filter(check => {
    const score = calculateWellnessScore(check)
    return score < 4
  }).length

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {checks.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Checks
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {pendingChecks.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Pending
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {averageScore.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Avg Score
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {highRiskChecks}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          High Risk
        </div>
      </div>
    </div>
  )
}
