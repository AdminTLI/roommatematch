'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApp } from '@/app/providers'
import { Users, MessageCircle, Heart, X, AlertTriangle, CheckCircle, Award, MoreVertical, UserX, Shield, Flag, User } from 'lucide-react'
import { ReputationPreview } from './reputation-profile'
import { getDemoReputationSummary } from '@/lib/reputation/utils'

interface CompatibilityScore {
  personality: number
  schedule: number
  lifestyle: number
  social: number
  academic?: number
}

interface MatchCardProps {
  id: string
  name: string
  university: string
  program: string
  degreeLevel: string
  budgetBand: string
  compatibility: number
  compatibilityBreakdown: CompatibilityScore
  topAlignment: 'personality' | 'schedule' | 'lifestyle' | 'social' | 'academic'
  watchOut?: string
  houseRulesSuggestion?: string
  isGroup?: boolean
  groupMembers?: Array<{
    name: string
    avatar?: string
  }>
  academicBonuses?: {
    university_affinity: boolean
    program_affinity: boolean
    faculty_affinity: boolean
    study_year_gap?: number
  }
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewProfile: (id: string) => void
  onStartChat: (id: string) => void
}

export function MatchCard({
  id,
  name,
  university,
  program,
  degreeLevel,
  budgetBand,
  compatibility,
  compatibilityBreakdown,
  topAlignment,
  watchOut,
  houseRulesSuggestion,
  isGroup = false,
  groupMembers = [],
  academicBonuses,
  onAccept,
  onReject,
  onViewProfile,
  onStartChat
}: MatchCardProps) {
  const { t } = useApp()
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUnmatch = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement unmatch API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/unmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id })
      })
      setShowUnmatchDialog(false)
      // Refresh or remove from list
    } catch (error) {
      console.error('Failed to unmatch:', error)
      alert('Failed to unmatch. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBlock = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement block API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      })
      setShowBlockDialog(false)
      // Refresh or remove from list
    } catch (error) {
      console.error('Failed to block:', error)
      alert('Failed to block user. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please select a reason for reporting.')
      return
    }
    setIsProcessing(true)
    try {
      // TODO: Implement report API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, reason: reportReason })
      })
      setShowReportDialog(false)
      setReportReason('')
      alert('Thank you for your report. We will review it shortly.')
    } catch (error) {
      console.error('Failed to report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-blue-500'
    if (score >= 0.4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getCompatibilityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Fair'
    return 'Poor'
  }

  const formatCompatibilityScore = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  return (
    <Card className="border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg p-3 md:p-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {isGroup ? (
              <div className="flex -space-x-2">
                {groupMembers.slice(0, 3).map((member, index) => (
                  <Avatar key={index} className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {groupMembers.length > 3 && (
                  <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      +{groupMembers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <Avatar className="w-16 h-16">
                <AvatarImage src={`/avatars/${name.toLowerCase()}.jpg`} />
                <AvatarFallback className="text-lg">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <CardTitle className="text-xl">
                {isGroup ? `${groupMembers.length} compatible roommates` : name}
              </CardTitle>
              <CardDescription className="text-base">
                {university} • {program} • {degreeLevel}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {budgetBand}/month
                </Badge>
                {isGroup && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    Group match
                  </Badge>
                )}
                
                {/* Reputation Badge */}
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Award className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                
                {/* Academic Affinity Badges */}
                {academicBonuses && (
                  <>
                    {academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                        Same Programme
                      </Badge>
                    )}
                    {academicBonuses.university_affinity && !academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                        Same University
                      </Badge>
                    )}
                    {academicBonuses.faculty_affinity && !academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700">
                        Same Faculty
                      </Badge>
                    )}
                    {academicBonuses.study_year_gap && academicBonuses.study_year_gap > 4 && (
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        Different study stages ({academicBonuses.study_year_gap} year gap)
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCompatibilityScore(compatibility)}
            </div>
            <div className="text-sm text-gray-500">
              {getCompatibilityLabel(compatibility)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Compatibility Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Compatibility Breakdown
          </h4>
          
          {(() => {
            // Standard order: Academic, Personality, Social, Lifestyle, Schedule
            const orderMap: Record<string, number> = {
              academic: 1,
              personality: 2,
              social: 3,
              lifestyle: 4,
              schedule: 5
            }

            // Sort entries by the standard order
            const sortedEntries = Object.entries(compatibilityBreakdown).sort((a, b) => {
              const orderA = orderMap[a[0].toLowerCase()] || 999
              const orderB = orderMap[b[0].toLowerCase()] || 999
              return orderA - orderB
            })

            return sortedEntries.map(([key, score]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {key}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatCompatibilityScore(score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getCompatibilityColor(score)}`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
              </div>
            ))
          })()}
        </div>

        {/* Top Alignment & Watch Out */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                Best match on
              </span>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 capitalize">
              {topAlignment}
            </div>
          </div>

          {watchOut && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Watch out for
                </span>
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {watchOut}
              </div>
            </div>
          )}
        </div>

        {/* House Rules Suggestion */}
        {houseRulesSuggestion && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Suggested house rules
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {houseRulesSuggestion}
            </p>
          </div>
        )}

        {/* Reputation Preview */}
        {!isGroup && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Reputation
            </h5>
            <ReputationPreview userReputation={getDemoReputationSummary()} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            size="sm" 
            onClick={() => onStartChat(id)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile(id)}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowUnmatchDialog(true)}>
                <UserX className="w-4 h-4 mr-2" />
                Unmatch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onReject(id)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Not a fit
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onAccept(id)}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            {isGroup ? 'Accept Group' : 'Accept Match'}
          </Button>
        </div>
      </CardContent>

      {/* Unmatch Confirmation Dialog */}
      <Dialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unmatch with {name}?</DialogTitle>
            <DialogDescription>
              This will remove this match from your list. You can still find them again through new suggestions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnmatchDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnmatch} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Unmatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {name}?</DialogTitle>
            <DialogDescription>
              This will block this user and prevent them from seeing your profile or matching with you in the future.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlock} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Confirmation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {name}?</DialogTitle>
            <DialogDescription>
              Please select the reason for reporting this user. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              'Inappropriate behavior',
              'Spam or fake profile',
              'Harassment',
              'Safety concerns',
              'Other'
            ].map((reason) => (
              <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReportDialog(false)
              setReportReason('')
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReport} disabled={isProcessing || !reportReason}>
              {isProcessing ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
