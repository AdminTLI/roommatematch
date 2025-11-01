// University Verified Badge Component
// Badge with info tooltip for university-verified listings

'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Shield, Info } from 'lucide-react'
import { VerificationInfoModal } from './VerificationInfoModal'
import { useState } from 'react'

interface UniversityVerifiedBadgeProps {
  verification?: {
    universityVerified?: boolean
    lastAuditISO?: string
  }
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function UniversityVerifiedBadge({
  verification,
  size = 'md',
  showTooltip = true
}: UniversityVerifiedBadgeProps) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  if (!verification?.universityVerified) {
    return null
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const badge = (
    <Badge 
      className={`bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1 ${sizeClasses[size]}`}
      onClick={() => setShowInfoModal(true)}
    >
      <Shield className={iconSizes[size]} />
      <span>University-Verified</span>
      <Info className={`${iconSizes[size]} opacity-70`} />
    </Badge>
  )

  if (!showTooltip) {
    return (
      <>
        {badge}
        <VerificationInfoModal
          open={showInfoModal}
          onOpenChange={setShowInfoModal}
          lastAuditDate={verification.lastAuditISO}
        />
      </>
    )
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <div className="font-medium mb-1">University-Verified</div>
              <div className="text-sm text-gray-300">
                This listing has been verified by the university housing office for safety and accuracy.
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Click for more details
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <VerificationInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        lastAuditDate={verification.lastAuditISO}
      />
    </>
  )
}
