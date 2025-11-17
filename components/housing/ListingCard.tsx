// Listing Card Component
// Modern card design with badges, compatibility score, and actions

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  MapPin, 
  Euro, 
  Calendar, 
  Bed, 
  Bath, 
  Square, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Flag,
  Shield,
  Star,
  Clock,
  Car,
  Wifi,
  Home
} from 'lucide-react'
import { Listing } from '@/types/housing'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  listing: Listing
  onHover: (id: string | null) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  onReport: (id: string) => void
  isSaved?: boolean
  isHighlighted?: boolean
}

export function ListingCard({
  listing,
  onHover,
  onSave,
  onShare,
  onReport,
  isSaved = false,
  isHighlighted = false
}: ListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleMouseEnter = () => {
    onHover(listing.id)
  }

  const handleMouseLeave = () => {
    onHover(null)
  }

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
      return `€${basePrice.toLocaleString()}/month`
    } else if (utilities > 0) {
      return `€${basePrice.toLocaleString()} + €${utilities}`
    } else {
      return `€${basePrice.toLocaleString()}/month`
    }
  }

  const formatDistance = () => {
    if (!listing.distanceKmToCampus) return null
    return `${listing.distanceKmToCampus.toFixed(1)}km to campus`
  }

  const getCompatibilityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-blue-100 text-blue-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'room': return 'Private Room'
      case 'studio': return 'Studio'
      case 'apartment': return 'Entire Apartment'
      default: return type
    }
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
        isHighlighted ? "border-primary shadow-md" : "border-gray-100 hover:border-primary/20"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Gallery */}
      <div className="relative h-40 sm:h-48 bg-gray-100 rounded-t-lg overflow-hidden">
        {listing.photos.length > 0 ? (
          <>
            <Image
              src={listing.photos[imageIndex]}
              alt={`${listing.title} - Image ${imageIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
            
            {/* Image Navigation */}
            {listing.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/70 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 sm:p-2 hover:bg-black/70 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                  aria-label="Next image"
                >
                  →
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {imageIndex + 1} / {listing.photos.length}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {listing.isNew && (
                <Badge className="bg-green-600 text-white text-xs">
                  New
                </Badge>
              )}
              {listing.isPopular && (
                <Badge className="bg-orange-600 text-white text-xs">
                  Popular
                </Badge>
              )}
              {listing?.verification?.universityVerified && (
                <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {listing.furnished && (
                <Badge variant="secondary" className="text-xs">
                  Furnished
                </Badge>
              )}
              {listing.utilitiesIncluded && (
                <Badge variant="secondary" className="text-xs">
                  Utilities incl
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Home className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{listing.address}, {listing.city}</span>
            </div>
            {formatDistance() && (
              <div className="text-xs text-gray-500">
                {formatDistance()}
              </div>
            )}
          </div>
          
          {/* Compatibility Score */}
          {listing.compatibilityScore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right">
                    <Badge className={cn("text-sm font-semibold", getCompatibilityColor(listing.compatibilityScore))}>
                      {listing.compatibilityScore}% match
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <div className="font-medium mb-2">Why this works for you:</div>
                    <ul className="space-y-1 text-sm">
                      {listing.compatibilityReasons?.slice(0, 3).map((reason, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-600">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="font-medium">{formatPrice()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{(() => {
              const dateStr = listing.moveInISO || listing.createdAt
              if (!dateStr) return '-'
              const date = new Date(dateStr)
              return isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
            })()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-purple-600" />
            <span>{getRoomTypeLabel(listing.roomType)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-blue-600" />
            <span>{listing.baths} bathroom{listing.baths !== 1 ? 's' : ''}</span>
          </div>
          
          {listing.squareMeters && (
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-orange-600" />
              <span>{listing.squareMeters}m²</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span>{listing.roommatesCount || 0} roommates</span>
          </div>
        </div>

        {/* Amenities */}
        {listing.amenities.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1">
              {listing.amenities.slice(0, 4).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity.replace('_', ' ')}
                </Badge>
              ))}
              {listing.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            asChild
            className="flex-1 text-xs sm:text-sm"
            size="sm"
          >
            <Link href={`/housing/${listing.id}`}>
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onSave(listing.id)
            }}
            className={cn(
              "px-2 sm:px-3 min-w-[44px]",
              isSaved && "text-red-600 border-red-200 hover:bg-red-50"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-between pt-2 border-t text-xs sm:text-sm">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onShare(listing.id)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onReport(listing.id)
              }}
              className="text-gray-500 hover:text-red-600"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-[10px] sm:text-xs text-gray-500 truncate ml-2">
            Listed {listing.createdAt 
              ? (() => {
                  const date = new Date(listing.createdAt)
                  return isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString()
                })()
              : 'Unknown date'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
