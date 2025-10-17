// Trust Badge Component for displaying user reputation badges

import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Home, 
  MessageCircle, 
  Sparkles, 
  CreditCard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Building,
  Star
} from 'lucide-react'
import type { TrustBadge as TrustBadgeType } from '@/lib/reputation/types'
import { getBadgeConfig, getBadgeLevelColor } from '@/lib/reputation/utils'
import { cn } from '@/lib/utils'

interface TrustBadgeProps {
  badge: TrustBadgeType
  showLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconMap = {
  Shield,
  Home,
  MessageCircle,
  Sparkles,
  CreditCard,
  BookOpen,
  Users,
  GraduationCap,
  Building,
  Star
}

export function TrustBadge({ 
  badge, 
  showLevel = true, 
  size = 'md',
  className 
}: TrustBadgeProps) {
  const config = getBadgeConfig(badge.badge_type)
  const Icon = iconMap[config.icon as keyof typeof iconMap] || Star
  const levelColor = getBadgeLevelColor(badge.badge_level)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium',
        levelColor,
        sizeClasses[size],
        className
      )}
      title={`${config.name} - ${config.description}`}
    >
      <Icon className={iconSizes[size]} />
      <span className="truncate">{config.name}</span>
      {showLevel && (
        <span className="text-xs opacity-75 capitalize">
          {badge.badge_level}
        </span>
      )}
    </Badge>
  )
}

interface TrustBadgeListProps {
  badges: TrustBadgeType[]
  maxDisplay?: number
  showLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TrustBadgeList({ 
  badges, 
  maxDisplay = 3,
  showLevel = true,
  size = 'md',
  className 
}: TrustBadgeListProps) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayBadges.map((badge) => (
        <TrustBadge
          key={badge.id}
          badge={badge}
          showLevel={showLevel}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            'text-xs px-2 py-1',
            size === 'sm' && 'text-xs px-2 py-1',
            size === 'md' && 'text-sm px-3 py-1.5',
            size === 'lg' && 'text-base px-4 py-2'
          )}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

interface ReputationScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ReputationScore({ 
  score, 
  size = 'md',
  showLabel = true,
  className 
}: ReputationScoreProps) {
  const tier = score >= 90 ? 'excellent' : 
               score >= 80 ? 'very_good' : 
               score >= 70 ? 'good' : 
               score >= 60 ? 'fair' : 'poor'
  
  const tierColors = {
    excellent: 'text-green-600 bg-green-50 border-green-200',
    very_good: 'text-blue-600 bg-blue-50 border-blue-200',
    good: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200'
  }
  
  const tierLabels = {
    excellent: 'Excellent',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor'
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          'border font-semibold',
          tierColors[tier as keyof typeof tierColors],
          sizeClasses[size]
        )}
      >
        {Math.round(score)}%
      </Badge>
      {showLabel && (
        <span className={cn(
          'font-medium',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {tierLabels[tier as keyof typeof tierLabels]}
        </span>
      )}
    </div>
  )
}

interface ReputationSummaryProps {
  score: number
  totalEndorsements: number
  totalReferences: number
  averageRating: number
  className?: string
}

export function ReputationSummary({
  score,
  totalEndorsements,
  totalReferences,
  averageRating,
  className
}: ReputationSummaryProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reputation Summary
        </h3>
        <ReputationScore score={score} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalEndorsements}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Endorsements
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalReferences}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            References
          </div>
        </div>
      </div>
      
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {averageRating.toFixed(1)}/5.0
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Average Rating
        </div>
      </div>
    </div>
  )
}
