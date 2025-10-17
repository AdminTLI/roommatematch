// Safety Incident Card Component for displaying safety incidents and help requests

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Heart, 
  Users, 
  Shield, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  Eye,
  MessageCircle,
  Phone,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react'
import type { SafetyIncident } from '@/lib/safety/types'
import { INCIDENT_TYPE_CONFIGS, INCIDENT_STATUS_CONFIG } from '@/lib/safety/types'
import { formatIncidentDate, getTimeSinceIncident, shouldEscalateIncident } from '@/lib/safety/utils'
import { cn } from '@/lib/utils'

interface SafetyIncidentCardProps {
  incident: SafetyIncident
  currentUserId?: string
  onView?: (id: string) => void
  onUpdate?: (id: string) => void
  onContact?: (id: string) => void
  className?: string
}

const incidentTypeIcons = {
  help_request: HelpCircle,
  safety_concern: AlertTriangle,
  emergency: AlertCircle,
  wellness_check: Heart,
  conflict_report: Users,
  harassment: Shield,
  other: MoreHorizontal
}

export function SafetyIncidentCard({
  incident,
  currentUserId,
  onView,
  onUpdate,
  onContact,
  className
}: SafetyIncidentCardProps) {
  const typeConfig = INCIDENT_TYPE_CONFIGS[incident.incident_type]
  const statusConfig = INCIDENT_STATUS_CONFIG[incident.status]
  const severityConfig = incident.severity_level === 'critical' ? 'bg-red-100 text-red-800' :
                        incident.severity_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        incident.severity_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
  
  const Icon = incidentTypeIcons[incident.incident_type]
  const isReporter = currentUserId === incident.reported_by
  const isEscalated = shouldEscalateIncident(incident)
  const timeSinceIncident = getTimeSinceIncident(incident.reported_at)

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      incident.severity_level === 'critical' && 'border-red-200 bg-red-50/50',
      incident.severity_level === 'high' && 'border-orange-200 bg-orange-50/50',
      isEscalated && 'ring-2 ring-yellow-300',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', typeConfig.color)}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {incident.description}
              </p>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', severityConfig)}>
                  {incident.severity_level.toUpperCase()}
                </Badge>
                
                <Badge variant="outline" className={cn('text-xs border', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                
                <Badge variant="secondary" className="text-xs">
                  <Icon className="h-3 w-3 mr-1" />
                  {typeConfig.name}
                </Badge>
                
                {isEscalated && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Escalated
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {timeSinceIncident}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Priority: {incident.priority_score}/10
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Incident Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incident.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {incident.location}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Reported: {formatIncidentDate(incident.reported_at)}
            </span>
          </div>
        </div>
        
        {/* Evidence and Context */}
        {incident.evidence_urls && incident.evidence_urls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Evidence
            </h4>
            <div className="flex flex-wrap gap-2">
              {incident.evidence_urls.map((url, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Evidence {index + 1}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Response Timeline */}
        {(incident.first_response_at || incident.resolved_at) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Response Timeline
            </h4>
            <div className="space-y-1">
              {incident.first_response_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MessageCircle className="h-3 w-3" />
                  First response: {formatIncidentDate(incident.first_response_at)}
                </div>
              )}
              {incident.resolved_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3 w-3" />
                  Resolved: {formatIncidentDate(incident.resolved_at)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Actions Taken */}
        {incident.actions_taken && incident.actions_taken.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Actions Taken
            </h4>
            <div className="space-y-1">
              {incident.actions_taken.map((action, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(incident.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {isReporter && incident.status !== 'resolved' && incident.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate?.(incident.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Update
            </Button>
          )}
          
          {incident.status === 'open' && (
            <Button
              size="sm"
              onClick={() => onContact?.(incident.id)}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SafetyIncidentListProps {
  incidents: SafetyIncident[]
  currentUserId?: string
  onView?: (id: string) => void
  onUpdate?: (id: string) => void
  onContact?: (id: string) => void
  className?: string
}

export function SafetyIncidentList({
  incidents,
  currentUserId,
  onView,
  onUpdate,
  onContact,
  className
}: SafetyIncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Safety Incidents
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No safety incidents or help requests found.
        </p>
      </div>
    )
  }

  // Sort incidents by priority and recency
  const sortedIncidents = [...incidents].sort((a, b) => {
    // First by severity (critical > high > medium > low)
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const severityDiff = severityOrder[b.severity_level] - severityOrder[a.severity_level]
    if (severityDiff !== 0) return severityDiff
    
    // Then by priority score
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score
    
    // Finally by recency
    return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
  })

  return (
    <div className={cn('space-y-4', className)}>
      {sortedIncidents.map((incident) => (
        <SafetyIncidentCard
          key={incident.id}
          incident={incident}
          currentUserId={currentUserId}
          onView={onView}
          onUpdate={onUpdate}
          onContact={onContact}
        />
      ))}
    </div>
  )
}

interface SafetyStatsProps {
  incidents: SafetyIncident[]
  className?: string
}

export function SafetyStats({ incidents, className }: SafetyStatsProps) {
  const totalIncidents = incidents.length
  const openIncidents = incidents.filter(i => i.status === 'open').length
  const criticalIncidents = incidents.filter(i => i.severity_level === 'critical').length
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalIncidents}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Incidents
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {openIncidents}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Open
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {criticalIncidents}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Critical
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {resolvedIncidents}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Resolved
        </div>
      </div>
    </div>
  )
}
