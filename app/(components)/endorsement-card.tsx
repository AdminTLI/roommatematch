// Endorsement Card Component for displaying individual endorsements

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  Shield, 
  MessageCircle, 
  Sparkles, 
  CheckCircle, 
  Heart, 
  Smile, 
  BookOpen, 
  CreditCard,
  User
} from 'lucide-react'
import type { Endorsement } from '@/lib/reputation/types'
import { ENDORSEMENT_CATEGORIES, RATING_DESCRIPTIONS } from '@/lib/reputation/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface EndorsementCardProps {
  endorsement: Endorsement
  showEndorser?: boolean
  className?: string
}

const categoryIcons = {
  cleanliness: Sparkles,
  communication: MessageCircle,
  responsibility: CheckCircle,
  respect: Heart,
  reliability: Shield,
  friendliness: Smile,
  study_habits: BookOpen,
  financial_trust: CreditCard,
  general: Star
}

const ratingColors = {
  1: 'text-red-600 bg-red-50 border-red-200',
  2: 'text-orange-600 bg-orange-50 border-orange-200',
  3: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  4: 'text-blue-600 bg-blue-50 border-blue-200',
  5: 'text-green-600 bg-green-50 border-green-200'
}

export function EndorsementCard({ 
  endorsement, 
  showEndorser = true,
  className 
}: EndorsementCardProps) {
  const category = ENDORSEMENT_CATEGORIES[endorsement.category]
  const Icon = categoryIcons[endorsement.category]
  const ratingColor = ratingColors[endorsement.rating as keyof typeof ratingColors]
  const ratingDescription = RATING_DESCRIPTIONS[endorsement.rating as keyof typeof RATING_DESCRIPTIONS]

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showEndorser && !endorsement.is_anonymous ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/api/avatar/${endorsement.endorser_id}`} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {category.name}
                </span>
                {endorsement.is_verified && (
                  <Shield className="h-4 w-4 text-green-600" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn('text-xs px-2 py-0.5 border', ratingColor)}
                >
                  {endorsement.rating}/5
                </Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {ratingDescription}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(endorsement.created_at), { addSuffix: true })}
            </div>
            {endorsement.context && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {endorsement.context}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {endorsement.comment && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            &quot;{endorsement.comment}&quot;
          </p>
        </CardContent>
      )}
    </Card>
  )
}

interface EndorsementListProps {
  endorsements: Endorsement[]
  showEndorser?: boolean
  maxDisplay?: number
  className?: string
}

export function EndorsementList({ 
  endorsements, 
  showEndorser = true,
  maxDisplay,
  className 
}: EndorsementListProps) {
  const displayEndorsements = maxDisplay ? endorsements.slice(0, maxDisplay) : endorsements

  return (
    <div className={cn('space-y-4', className)}>
      {displayEndorsements.map((endorsement) => (
        <EndorsementCard
          key={endorsement.id}
          endorsement={endorsement}
          showEndorser={showEndorser}
        />
      ))}
      
      {maxDisplay && endorsements.length > maxDisplay && (
        <div className="text-center py-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {maxDisplay} of {endorsements.length} endorsements
          </span>
        </div>
      )}
    </div>
  )
}

interface EndorsementStatsProps {
  endorsements: Endorsement[]
  className?: string
}

export function EndorsementStats({ endorsements, className }: EndorsementStatsProps) {
  const categoryCounts = endorsements.reduce((acc, endorsement) => {
    acc[endorsement.category] = (acc[endorsement.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const averageRating = endorsements.length > 0 
    ? endorsements.reduce((sum, e) => sum + e.rating, 0) / endorsements.length 
    : 0

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {endorsements.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Endorsements
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {averageRating.toFixed(1)}/5
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Average Rating
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {topCategories.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Categories Rated
        </div>
      </div>
    </div>
  )
}

interface CategoryBreakdownProps {
  endorsements: Endorsement[]
  className?: string
}

export function CategoryBreakdown({ endorsements, className }: CategoryBreakdownProps) {
  const categoryStats = endorsements.reduce((acc, endorsement) => {
    if (!acc[endorsement.category]) {
      acc[endorsement.category] = {
        count: 0,
        totalRating: 0,
        ratings: []
      }
    }
    acc[endorsement.category].count++
    acc[endorsement.category].totalRating += endorsement.rating
    acc[endorsement.category].ratings.push(endorsement.rating)
    return acc
  }, {} as Record<string, { count: number; totalRating: number; ratings: number[] }>)

  const categories = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    count: stats.count,
    averageRating: stats.totalRating / stats.count,
    categoryInfo: ENDORSEMENT_CATEGORIES[category as keyof typeof ENDORSEMENT_CATEGORIES]
  })).sort((a, b) => b.averageRating - a.averageRating)

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
        Category Breakdown
      </h4>
      
      <div className="space-y-2">
        {categories.map(({ category, count, averageRating, categoryInfo }) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const ratingColor = ratingColors[Math.round(averageRating) as keyof typeof ratingColors]
          
          return (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryInfo.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {count} endorsement{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs px-2 py-0.5 border', ratingColor)}
                >
                  {averageRating.toFixed(1)}/5
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
