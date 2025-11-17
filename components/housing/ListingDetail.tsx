// Listing Detail Component
// Comprehensive detail view for individual listings

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Euro, 
  Calendar, 
  Bed, 
  Bath, 
  Square, 
  Users, 
  Car,
  Wifi,
  Shield,
  Star,
  Clock,
  Phone,
  Mail,
  Flag,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  CheckCircle
} from 'lucide-react'
import { Listing } from '@/types/housing'
import { UniversityVerifiedBadge } from '@/components/trust/UniversityVerifiedBadge'
import { ReportListingDialog } from './ReportListingDialog'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface ListingDetailProps {
  listing: Listing
  onSave: (id: string) => void
  onShare: (id: string) => void
  onReport: (id: string) => void
  isSaved?: boolean
  showBackButton?: boolean
}

export function ListingDetail({
  listing,
  onSave,
  onShare,
  onReport,
  isSaved = false,
  showBackButton = false
}: ListingDetailProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const nextImage = () => {
    if (listing.photos.length > 1) {
      setImageIndex((prev) => (prev + 1) % listing.photos.length)
    }
  }

  const prevImage = () => {
    if (listing.photos.length > 1) {
      setImageIndex((prev) => (prev - 1 + listing.photos.length) % listing.photos.length)
    }
  }

  const formatPrice = () => {
    const basePrice = listing.priceMonthly
    const utilities = listing.utilitiesIncluded ? 0 : listing.utilitiesCost
    const total = basePrice + utilities
    
    if (listing.utilitiesIncluded) {
      return `€${basePrice.toLocaleString()}/month (utilities included)`
    } else if (utilities > 0) {
      return `€${basePrice.toLocaleString()} + €${utilities} utilities = €${total.toLocaleString()}/month`
    } else {
      return `€${basePrice.toLocaleString()}/month + utilities`
    }
  }

  const formatDistance = () => {
    if (!listing.distanceKmToCampus) return null
    return `${listing.distanceKmToCampus.toFixed(1)}km to campus`
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      wifi: Wifi,
      heating: Home,
      washing_machine: Home,
      dishwasher: Home,
      garden: Home,
      balcony: Home,
      elevator: Building,
      parking: Car,
      security: Shield,
      storage: Home,
      gym: Home,
      common_area: Home
    }
    return iconMap[amenity] || Home
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        {showBackButton && (
          <div className="mb-4">
            <Button variant="ghost" asChild>
              <Link href="/housing">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to listings
              </Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{listing.address}, {listing.city}</span>
                {formatDistance() && (
                  <span className="text-sm text-gray-500">• {formatDistance()}</span>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <UniversityVerifiedBadge verification={listing.verification} />
                {listing.isNew && (
                  <Badge className="bg-green-600 text-white">New</Badge>
                )}
                {listing.isPopular && (
                  <Badge className="bg-orange-600 text-white">Popular</Badge>
                )}
                {listing.furnished && (
                  <Badge variant="outline">Furnished</Badge>
                )}
                {listing.utilitiesIncluded && (
                  <Badge variant="outline">Utilities included</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                €{listing.priceMonthly.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {listing.utilitiesIncluded ? 'utilities included' : '+ utilities'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Landlord
            </Button>
            <Button variant="outline" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Book Tour
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSave(listing.id)}
              className={cn(
                isSaved && "text-red-600 border-red-200 hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => onShare(listing.id)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <Card className="mb-4 sm:mb-6">
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-t-lg overflow-hidden">
            {listing.photos.length > 0 ? (
              <>
                <Image
                  src={listing.photos[imageIndex]}
                  alt={`${listing.title} - Image ${imageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Navigation */}
                {listing.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/70 transition-colors touch-manipulation"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/70 transition-colors touch-manipulation"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    {/* Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {imageIndex + 1} / {listing.photos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Home className="h-16 w-16" />
              </div>
            )}
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Card>
              <Tabs defaultValue="amenities" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rules">House Rules</TabsTrigger>
                </TabsList>
                
                <TabsContent value="amenities" className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity)
                      return (
                        <div key={amenity} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm capitalize">
                            {amenity.replace('_', ' ')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Room type: {listing.roomType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{listing.baths} bathroom{listing.baths !== 1 ? 's' : ''}</span>
                    </div>
                    {listing.squareMeters && (
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{listing.squareMeters}m²</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{listing.roommatesCount || 0} roommates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Available: {(() => {
                        const dateStr = listing.moveInISO || listing.createdAt
                        if (!dateStr) return '-'
                        const date = new Date(dateStr)
                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
                      })()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Lease: {listing.leaseMonths} months</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rules" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">No smoking {listing.smokingPolicy === 'none' ? 'allowed' : 'policy varies'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Pets {listing.petsAllowed ? 'allowed' : 'not allowed'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Minimum stay: {listing.minStayMonths} months</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Host/Agency Info */}
            <Card>
              <CardHeader>
                <CardTitle>Host Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{listing.agencyOrHost?.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {listing.agencyOrHost?.responseTimeHrs ? 
                        `Responds within ${listing.agencyOrHost.responseTimeHrs} hours` : 
                        'Response time not specified'
                      }
                    </div>
                    {listing.agencyOrHost?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{listing.agencyOrHost.rating}</span>
                        <span className="text-sm text-gray-500">(based on reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Landlord
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Tour
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Save Listing
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Report */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  variant="ghost" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportListingDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        listingId={listing.id}
        listingTitle={listing.title}
      />
    </>
  )
}
