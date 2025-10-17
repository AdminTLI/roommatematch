// Move-in Plan Card Component for displaying move-in planning sessions

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Home,
  Package,
  DollarSign,
  Settings,
  Eye,
  Edit,
  Trash2,
  Share2,
  TrendingUp
} from 'lucide-react'
import type { MoveInPlan, MoveInPlanSummary } from '@/lib/move-in/types'
import { PLAN_STATUS_CONFIG } from '@/lib/move-in/types'
import { formatMoveInDate, getDaysUntilMoveIn } from '@/lib/move-in/utils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface MoveInPlanCardProps {
  plan: MoveInPlan
  summary?: MoveInPlanSummary
  currentUserId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

const propertyTypeIcons = {
  apartment: Home,
  house: Home,
  studio: Home,
  shared_room: Users,
  dormitory: Users
}

export function MoveInPlanCard({
  plan,
  summary,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onShare,
  className
}: MoveInPlanCardProps) {
  const statusConfig = PLAN_STATUS_CONFIG[plan.status]
  const PropertyIcon = propertyTypeIcons[plan.property_type]
  const daysUntilMoveIn = getDaysUntilMoveIn(plan.move_in_date)
  const isExpiringSoon = daysUntilMoveIn <= 7 && daysUntilMoveIn > 0
  const isOverdue = daysUntilMoveIn < 0
  
  const isCreator = currentUserId === plan.created_by

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isExpiringSoon && 'border-orange-200 bg-orange-50/50',
      isOverdue && 'border-red-200 bg-red-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <PropertyIcon className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{plan.title}</CardTitle>
              {plan.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                
                <Badge variant="secondary" className="text-xs">
                  <PropertyIcon className="h-3 w-3 mr-1" />
                  {plan.property_type}
                </Badge>
                
                {isExpiringSoon && (
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysUntilMoveIn} days left
                  </Badge>
                )}
                
                {isOverdue && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Move-in: {formatMoveInDate(plan.move_in_date)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {plan.property_address}
            </span>
          </div>
        </div>
        
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {summary.completed_tasks}/{summary.total_tasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Tasks
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {summary.total_participants}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                People
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                €{summary.total_expenses.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {Math.round(summary.completion_percentage)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Complete
              </div>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        {summary && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {Math.round(summary.completion_percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summary.completion_percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Budget Information */}
        {plan.budget_limit && (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Budget Limit
              </span>
            </div>
            <span className="text-sm font-bold text-green-900 dark:text-green-100">
              €{plan.budget_limit.toLocaleString()}
            </span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(plan.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Plan
          </Button>
          
          {isCreator && plan.status === 'planning' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(plan.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(plan.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {isCreator && plan.status === 'planning' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(plan.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface MoveInPlanListProps {
  plans: MoveInPlan[]
  summaries?: MoveInPlanSummary[]
  currentUserId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

export function MoveInPlanList({
  plans,
  summaries = [],
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onShare,
  className
}: MoveInPlanListProps) {
  if (plans.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Move-in Plans Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first move-in plan to get started with organizing your move.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {plans.map((plan) => {
        const summary = summaries.find(s => s.plan_id === plan.id)
        return (
          <MoveInPlanCard
            key={plan.id}
            plan={plan}
            summary={summary}
            currentUserId={currentUserId}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
          />
        )
      })}
    </div>
  )
}

interface MoveInPlanStatsProps {
  plans: MoveInPlan[]
  summaries?: MoveInPlanSummary[]
  className?: string
}

export function MoveInPlanStats({
  plans,
  summaries = [],
  className
}: MoveInPlanStatsProps) {
  const activePlans = plans.filter(p => p.status === 'in_progress').length
  const planningPlans = plans.filter(p => p.status === 'planning').length
  const completedPlans = plans.filter(p => p.status === 'completed').length
  
  const totalTasks = summaries.reduce((sum, s) => sum + s.total_tasks, 0)
  const completedTasks = summaries.reduce((sum, s) => sum + s.completed_tasks, 0)
  const totalExpenses = summaries.reduce((sum, s) => sum + s.total_expenses, 0)

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {plans.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Plans
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {activePlans}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Active
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {completedTasks}/{totalTasks}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tasks Done
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          €{totalExpenses.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Budget
        </div>
      </div>
    </div>
  )
}
