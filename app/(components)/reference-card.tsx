// Reference Card Component for displaying detailed references

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Shield, 
  MessageCircle, 
  Sparkles, 
  CheckCircle, 
  Heart, 
  CreditCard,
  User,
  Home,
  GraduationCap,
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import type { Reference } from '@/lib/reputation/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ReferenceCardProps {
  reference: Reference
  showReferrer?: boolean
  className?: string
}

const referenceTypeIcons = {
  roommate: User,
  landlord: Home,
  university_staff: GraduationCap,
  peer: Users,
  employer: Briefcase
}

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  approved: 'text-green-600 bg-green-50 border-green-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  needs_review: 'text-orange-600 bg-orange-50 border-orange-200'
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  needs_review: AlertCircle
}

export function ReferenceCard({ 
  reference, 
  showReferrer = true,
  className 
}: ReferenceCardProps) {
  const [showFullTestimonial, setShowFullTestimonial] = useState(false)
  const StatusIcon = statusIcons[reference.status]
  const ReferrerIcon = referenceTypeIcons[reference.reference_type] || User
  
  const testimonialPreview = reference.testimonial.length > 200 
    ? reference.testimonial.substring(0, 200) + '...'
    : reference.testimonial

  const ratingCategories = [
    { key: 'cleanliness_rating', label: 'Cleanliness', icon: Sparkles },
    { key: 'communication_rating', label: 'Communication', icon: MessageCircle },
    { key: 'responsibility_rating', label: 'Responsibility', icon: CheckCircle },
    { key: 'respect_rating', label: 'Respect', icon: Heart },
    { key: 'reliability_rating', label: 'Reliability', icon: Shield },
    { key: 'financial_trust_rating', label: 'Financial Trust', icon: CreditCard }
  ].filter(cat => reference[cat.key as keyof Reference] !== undefined)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showReferrer && !reference.is_anonymous ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/api/avatar/${reference.referrer_id}`} />
                <AvatarFallback>
                  <ReferrerIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ReferrerIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {reference.is_anonymous ? 'Anonymous Reference' : 'Reference'}
                </span>
                <Badge
                  variant="outline"
                  className={cn('text-xs px-2 py-0.5 border', statusColors[reference.status])}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {reference.status}
                </Badge>
                {reference.contact_verified && (
                  <Shield className="h-4 w-4 text-green-600" />
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < reference.overall_rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {reference.overall_rating}/5
                  </span>
                </div>
                
                {reference.relationship_duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {reference.relationship_duration}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(reference.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {reference.relationship_context && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Relationship Context:</strong> {reference.relationship_context}
            </p>
          </div>
        )}
        
        {/* Detailed Ratings */}
        {ratingCategories.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {ratingCategories.map(({ key, label, icon: Icon }) => {
              const rating = reference[key as keyof Reference] as number
              return (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Testimonial */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Testimonial
          </h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              &quot;{showFullTestimonial ? reference.testimonial : testimonialPreview}&quot;
            </p>
            {reference.testimonial.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullTestimonial(!showFullTestimonial)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                {showFullTestimonial ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Strengths */}
        {reference.strengths && reference.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {reference.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Areas for Improvement */}
        {reference.areas_for_improvement && reference.areas_for_improvement.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Areas for Improvement
            </h4>
            <div className="flex flex-wrap gap-2">
              {reference.areas_for_improvement.map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Contact Verification */}
        {reference.contact_verified && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Contact information verified
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ReferenceListProps {
  references: Reference[]
  showReferrer?: boolean
  maxDisplay?: number
  className?: string
}

export function ReferenceList({ 
  references, 
  showReferrer = true,
  maxDisplay,
  className 
}: ReferenceListProps) {
  const displayReferences = maxDisplay ? references.slice(0, maxDisplay) : references

  return (
    <div className={cn('space-y-4', className)}>
      {displayReferences.map((reference) => (
        <ReferenceCard
          key={reference.id}
          reference={reference}
          showReferrer={showReferrer}
        />
      ))}
      
      {maxDisplay && references.length > maxDisplay && (
        <div className="text-center py-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {maxDisplay} of {references.length} references
          </span>
        </div>
      )}
    </div>
  )
}

interface ReferenceStatsProps {
  references: Reference[]
  className?: string
}

export function ReferenceStats({ references, className }: ReferenceStatsProps) {
  const approvedReferences = references.filter(r => r.status === 'approved')
  const averageRating = approvedReferences.length > 0 
    ? approvedReferences.reduce((sum, r) => sum + r.overall_rating, 0) / approvedReferences.length 
    : 0

  const verifiedCount = references.filter(r => r.contact_verified).length

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {references.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total References
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
          {verifiedCount}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Verified References
        </div>
      </div>
    </div>
  )
}
