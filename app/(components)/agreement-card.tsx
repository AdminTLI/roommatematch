// Agreement Card Component for displaying household agreements

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Home,
  RotateCcw,
  VolumeX,
  DollarSign,
  Car,
  Zap,
  Sparkles,
  User,
  Eye,
  Edit,
  Trash2,
  Share2
} from 'lucide-react'
import type { HouseholdAgreement, AgreementParticipant } from '@/lib/agreements/types'
import { AGREEMENT_STATUS_CONFIG, PARTICIPANT_STATUS_CONFIG } from '@/lib/agreements/types'
import { formatAgreementDate, getDaysUntilExpiration } from '@/lib/agreements/utils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface AgreementCardProps {
  agreement: HouseholdAgreement
  participants?: AgreementParticipant[]
  currentUserId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

const categoryIcons = {
  house_rules: Home,
  chore_rotation: RotateCcw,
  quiet_hours: VolumeX,
  rent_split: DollarSign,
  guest_policy: Users,
  cleaning_schedule: Sparkles,
  utilities: Zap,
  parking: Car,
  general: FileText
}

const categoryColors = {
  house_rules: 'bg-blue-100 text-blue-800',
  chore_rotation: 'bg-green-100 text-green-800',
  quiet_hours: 'bg-purple-100 text-purple-800',
  rent_split: 'bg-yellow-100 text-yellow-800',
  guest_policy: 'bg-indigo-100 text-indigo-800',
  cleaning_schedule: 'bg-pink-100 text-pink-800',
  utilities: 'bg-orange-100 text-orange-800',
  parking: 'bg-gray-100 text-gray-800',
  general: 'bg-slate-100 text-slate-800'
}

export function AgreementCard({
  agreement,
  participants = [],
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onShare,
  className
}: AgreementCardProps) {
  const statusConfig = AGREEMENT_STATUS_CONFIG[agreement.status]
  const signedCount = participants.filter(p => p.status === 'signed').length
  const totalCount = participants.length
  const pendingCount = participants.filter(p => p.status === 'pending').length
  
  // Get template category from agreement data or default to general
  const category = agreement.agreement_data?.metadata?.category || 'general'
  const Icon = categoryIcons[category as keyof typeof categoryIcons] || FileText
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-slate-100 text-slate-800'
  
  const isExpiringSoon = agreement.expiration_date && getDaysUntilExpiration(agreement.expiration_date) <= 30
  const isCreator = currentUserId === agreement.created_by
  const userParticipant = participants.find(p => p.user_id === currentUserId)
  const needsSignature = userParticipant?.status === 'pending'

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      needsSignature && 'border-yellow-200 bg-yellow-50/50',
      isExpiringSoon && 'border-orange-200 bg-orange-50/50',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', categoryColor)}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg">{agreement.title}</CardTitle>
              {agreement.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {agreement.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs border', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                
                {agreement.household_name && (
                  <Badge variant="secondary" className="text-xs">
                    {agreement.household_name}
                  </Badge>
                )}
                
                {isExpiringSoon && (
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires soon
                  </Badge>
                )}
                
                {needsSignature && (
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs signature
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(agreement.created_at), { addSuffix: true })}
            </div>
            {agreement.effective_date && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Effective: {formatAgreementDate(agreement.effective_date)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Agreement Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {signedCount}/{totalCount} signed
            </span>
          </div>
          
          {agreement.expiration_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Expires: {formatAgreementDate(agreement.expiration_date)}
              </span>
            </div>
          )}
        </div>
        
        {/* Participants Status */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Participants
            </h4>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => {
                const participantStatusConfig = PARTICIPANT_STATUS_CONFIG[participant.status]
                return (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {participant.status === 'signed' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      )}
                      <User className="h-3 w-3 text-gray-400" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', participantStatusConfig.color)}
                    >
                      {participant.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(agreement.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          {isCreator && agreement.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(agreement.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {needsSignature && (
            <Button
              size="sm"
              onClick={() => onView?.(agreement.id)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sign
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(agreement.id)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {isCreator && agreement.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(agreement.id)}
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

interface AgreementListProps {
  agreements: HouseholdAgreement[]
  participants?: AgreementParticipant[]
  currentUserId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
  className?: string
}

export function AgreementList({
  agreements,
  participants = [],
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onShare,
  className
}: AgreementListProps) {
  if (agreements.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Agreements Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first household agreement to get started.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {agreements.map((agreement) => (
        <AgreementCard
          key={agreement.id}
          agreement={agreement}
          participants={participants.filter(p => p.agreement_id === agreement.id)}
          currentUserId={currentUserId}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </div>
  )
}

interface AgreementStatsProps {
  agreements: HouseholdAgreement[]
  participants?: AgreementParticipant[]
  className?: string
}

export function AgreementStats({
  agreements,
  participants = [],
  className
}: AgreementStatsProps) {
  const activeAgreements = agreements.filter(a => a.status === 'active').length
  const pendingAgreements = agreements.filter(a => a.status === 'pending_signatures').length
  const totalSigned = participants.filter(p => p.status === 'signed').length
  const totalPending = participants.filter(p => p.status === 'pending').length

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {agreements.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Agreements
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {activeAgreements}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Active
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {pendingAgreements}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Pending
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {totalSigned}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Signatures
        </div>
      </div>
    </div>
  )
}
