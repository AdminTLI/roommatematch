// Admin Metrics Card Component for displaying analytics metrics and KPIs

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Users,
  Heart,
  Shield,
  Home,
  Star,
  Repeat,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { DashboardMetric } from '@/lib/admin/types'
import { METRIC_CATEGORY_CONFIG } from '@/lib/admin/types'
import { formatMetricValue, getMetricCategoryConfig } from '@/lib/admin/utils'
import { cn } from '@/lib/utils'

interface AdminMetricsCardProps {
  metric: DashboardMetric
  className?: string
}

const categoryIcons = {
  user_engagement: Users,
  matching_success: Heart,
  safety_incidents: Shield,
  housing_availability: Home,
  satisfaction_scores: Star,
  retention_rates: Repeat,
  revenue_metrics: DollarSign,
  performance_metrics: Activity
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus
}

const statusColors = {
  good: 'text-green-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600'
}

const statusBgColors = {
  good: 'bg-green-50 dark:bg-green-900/20',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20',
  critical: 'bg-red-50 dark:bg-red-900/20'
}

export function AdminMetricsCard({ metric, className }: AdminMetricsCardProps) {
  const categoryConfig = getMetricCategoryConfig(metric.category)
  const CategoryIcon = categoryIcons[metric.category]
  const TrendIcon = trendIcons[metric.trend]
  
  const statusColor = statusColors[metric.status]
  const statusBgColor = statusBgColors[metric.status]
  
  const progressValue = metric.target_value 
    ? Math.min((metric.value / metric.target_value) * 100, 100)
    : 0

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      statusBgColor,
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', categoryConfig.color)}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            
            <div>
              <CardTitle className="text-lg">{metric.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {categoryConfig.name}
                </Badge>
                {metric.status === 'critical' && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Critical
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMetricValue(metric.value, metric.unit)}
            </div>
            {metric.change_percentage !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm',
                metric.trend === 'up' ? 'text-green-600' :
                metric.trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              )}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(metric.change_percentage).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress towards target */}
        {metric.target_value && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress to target
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {formatMetricValue(metric.value, metric.unit)} / {formatMetricValue(metric.target_value, metric.unit)}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="text-xs text-gray-500">
              {progressValue.toFixed(1)}% of target
            </div>
          </div>
        )}
        
        {/* Previous value comparison */}
        {metric.previous_value !== undefined && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Previous period
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatMetricValue(metric.previous_value, metric.unit)}
            </div>
          </div>
        )}
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-2 text-sm', statusColor)}>
            {metric.status === 'good' && <CheckCircle className="h-4 w-4" />}
            {metric.status === 'warning' && <Clock className="h-4 w-4" />}
            {metric.status === 'critical' && <AlertTriangle className="h-4 w-4" />}
            <span className="capitalize">
              {metric.status} performance
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AdminMetricsGridProps {
  metrics: DashboardMetric[]
  className?: string
}

export function AdminMetricsGrid({ metrics, className }: AdminMetricsGridProps) {
  if (metrics.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Metrics Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No analytics metrics found for the selected period.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {metrics.map((metric) => (
        <AdminMetricsCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}

interface AdminMetricsSummaryProps {
  metrics: DashboardMetric[]
  className?: string
}

export function AdminMetricsSummary({ metrics, className }: AdminMetricsSummaryProps) {
  const totalMetrics = metrics.length
  const goodMetrics = metrics.filter(m => m.status === 'good').length
  const warningMetrics = metrics.filter(m => m.status === 'warning').length
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length
  
  const avgChange = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.change_percentage || 0), 0) / metrics.length
    : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metrics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalMetrics}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Metrics
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {goodMetrics}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Good
            </div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {warningMetrics}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Warning
            </div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {criticalMetrics}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Critical
            </div>
          </div>
        </div>
        
        {avgChange !== 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              {avgChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average change: {Math.abs(avgChange).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AdminMetricFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export function AdminMetricFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className 
}: AdminMetricFilterProps) {
  const categories = Object.keys(METRIC_CATEGORY_CONFIG)

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
          selectedCategory === 'all'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        All Categories
      </button>
      
      {categories.map((category) => {
        const config = getMetricCategoryConfig(category)
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {config.name}
          </button>
        )
      })}
    </div>
  )
}
