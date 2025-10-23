// Verification Info Modal Component
// Detailed information about university verification process

'use client'

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  CheckCircle, 
  Building, 
  Calendar,
  ExternalLink,
  X
} from 'lucide-react'

interface VerificationInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lastAuditDate?: string
}

const VERIFICATION_CRITERIA = [
  {
    icon: Shield,
    title: 'Landlord Identity Verification',
    description: 'Verified government ID and contact information'
  },
  {
    icon: Building,
    title: 'Property Ownership',
    description: 'Confirmed legal ownership or authorized rental rights'
  },
  {
    icon: CheckCircle,
    title: 'Safety Standards',
    description: 'Inspected for basic safety requirements and compliance'
  }
]

export function VerificationInfoModal({
  open,
  onOpenChange,
  lastAuditDate
}: VerificationInfoModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            University Verification
          </DialogTitle>
          <DialogDescription>
            Learn about our verification process and what it means for your safety
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What we verify */}
          <div>
            <h3 className="font-semibold mb-3">What We Verify</h3>
            <div className="space-y-3">
              {VERIFICATION_CRITERIA.map((criterion, index) => {
                const Icon = criterion.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{criterion.title}</div>
                      <div className="text-sm text-gray-600">{criterion.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Who verifies */}
          <div>
            <h3 className="font-semibold mb-3">Who Verifies</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-sm">University Housing Office</span>
              </div>
              <p className="text-sm text-gray-600">
                Our partner university housing offices conduct thorough verification 
                of all listings to ensure student safety and housing quality.
              </p>
            </div>
          </div>

          {/* Last audit */}
          {lastAuditDate && (
            <div>
              <h3 className="font-semibold mb-3">Last Audit</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{formatDate(lastAuditDate)}</span>
                <Badge variant="outline" className="text-xs">
                  Recent
                </Badge>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-3">Why This Matters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Reduced scam risk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Verified safety standards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">University backing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Quality assurance</span>
              </div>
            </div>
          </div>

          {/* Learn more */}
          <div className="border-t pt-4">
            <Button variant="outline" className="w-full" asChild>
              <a href="/help/verification" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn more about verification
              </a>
            </Button>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
