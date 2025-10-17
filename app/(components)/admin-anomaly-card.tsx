// Admin Anomaly Detection Card Component for displaying analytics anomalies and alerts

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Calendar, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  Brain,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import type { AnalyticsAnomaly } from '@/lib/admin/types'
import { ANOMALY_TYPE_CONFIG } from '@/lib/admin/types'
import { getAnomalyTypeConfig, formatTimePeriod } from '@/lib/admin/utils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AdminAnomalyCardProps {
  anomaly: AnalyticsAnomaly
  onAcknowledge?: (id: string) => void
  onResolve?: (id: string) => void
  onInvestigate?: (id: string) => void
  className?: string
}

const anomalyIcons = {
  spike: TrendingUp,
  drop: TrendingDown,
  trend_change: RefreshCw,
  seasonal_deviation: Calendar,
  outlier: AlertTriangle,
  pattern_break: Zap
}

const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

const statusColors = {
  detected: 'bg-blue-100 text-blue-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  acknowledged: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  false_positive: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  detected: AlertTriangle,
  investigating: Clock,
  acknowledged: Eye,
  resolved: CheckCircle,
  false_positive: Minus
}

export function AdminAnomalyCard({
  anomaly,
  onAcknowledge,
  onResolve,
  onInvestigate,
  className
}: AdminAnomalyCardProps) {
  const typeConfig = getAnomalyTypeConfig(anomaly.anomaly_type)
  const AnomalyIcon = anomalyIcons[anomaly.anomaly_type]
  const StatusIcon = statusIcons[anomaly.status]
  
  const severityColor = severityColors[anomaly.severity]
  const statusColor = statusColors[anomaly.status]
  
  const deviationIcon = anomaly.deviation_percentage && anomaly.deviation_percentage > 0
    ? ArrowUp 
    : ArrowDown

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      anomaly.severity === 'critical' && 'border-red-200 bg-red-50/50',
      anomaly.severity === 'high' && 'border-orange-200 bg-orange-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', typeConfig.color)}>
              <AnomalyIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{typeConfig.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {typeConfig.description}
              </p>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', severityColor)}>
                  {anomaly.severity.toUpperCase()}
                </Badge>
                
                <Badge variant="outline" className={cn('text-xs border', statusColor)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {anomaly.status.replace('_', ' ')}
                </Badge>
                
                {anomaly.confidence_score && (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    {Math.round(anomaly.confidence_score * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(anomaly.detected_at), { addSuffix: true })}
            </div>
            {anomaly.assigned_to && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <User className="h-3 w-3 inline mr-1" />
                Assigned
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Value comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Expected Value
            </h4>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {anomaly.expected_value?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Actual Value
            </h4>
            <div className="flex items-center gap-2">
              {deviationIcon && (
                <deviationIcon className={cn(
                  'h-4 w-4',
                  anomaly.deviation_percentage && anomaly.deviation_percentage > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                )} />
              )}
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {anomaly.actual_value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Deviation details */}
        {anomaly.deviation_percentage && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Deviation from expected
              </span>
              <span className={cn(
                'text-sm font-medium',
                Math.abs(anomaly.deviation_percentage) > 20 
                  ? 'text-red-600' 
                  : Math.abs(anomaly.deviation_percentage) > 10 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              )}>
                {Math.abs(anomaly.deviation_percentage).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Possible causes */}
        {anomaly.possible_causes && anomaly.possible_causes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Possible Causes
            </h4>
            <div className="space-y-1">
              {anomaly.possible_causes.map((cause, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  {cause}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Impact assessment */}
        {anomaly.impact_assessment && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Impact Assessment
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {anomaly.impact_assessment}
            </p>
          </div>
        )}
        
        {/* Recommended actions */}
        {anomaly.recommended_actions && anomaly.recommended_actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recommended Actions
            </h4>
            <div className="space-y-1">
              {anomaly.recommended_actions.map((action, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Investigation notes */}
        {anomaly.investigation_notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Investigation Notes
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              {anomaly.investigation_notes}
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {anomaly.status === 'detected' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge?.(anomaly.id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Acknowledge
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvestigate?.(anomaly.id)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Investigate
              </Button>
            </>
          )}
          
          {anomaly.status === 'investigating' && (
            <Button
              size="sm"
              onClick={() => onResolve?.(anomaly.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AdminAnomalyListProps {
  anomalies: AnalyticsAnomaly[]
  onAcknowledge?: (id: string) => void
  onResolve?: (id: string) => void
  onInvestigate?: (id: string) => void
  className?: string
}

export function AdminAnomalyList({
  anomalies,
  onAcknowledge,
  onResolve,
  onInvestigate,
  className
}: AdminAnomalyListProps) {
  if (anomalies.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Anomalies Detected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          All systems are operating normally.
        </p>
      </div>
    )
  }

  // Sort anomalies by severity and detection time
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    // First by severity (critical > high > medium > low)
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    if (severityDiff !== 0) return severityDiff
    
    // Then by detection time (most recent first)
    return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
  })

  return (
    <div className={cn('space-y-4', className)}>
      {sortedAnomalies.map((anomaly) => (
        <AdminAnomalyCard
          key={anomaly.id}
          anomaly={anomaly}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          onInvestigate={onInvestigate}
        />
      ))}
    </div>
  )
}

interface AdminAnomalyStatsProps {
  anomalies: AnalyticsAnomaly[]
  className?: string
}

export function AdminAnomalyStats({ anomalies, className }: AdminAnomalyStatsProps) {
  const totalAnomalies = anomalies.length
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length
  const unresolvedAnomalies = anomalies.filter(a => a.status === 'detected').length
  const investigatingAnomalies = anomalies.filter(a => a.status === 'investigating').length

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalAnomalies}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Anomalies
        </div>
      </div>
      
      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-2xl font-bold text-red-600">
          {criticalAnomalies}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Critical
        </div>
      </div>
      
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-2xl font-bold text-yellow-600">
          {unresolvedAnomalies}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Unresolved
        </div>
      </div>
      
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {investigatingAnomalies}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Investigating
        </div>
      </div>
    </div>
  )
}
