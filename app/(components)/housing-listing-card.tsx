'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Euro, 
  Users, 
  Bed, 
  Bath, 
  Square, 
  Camera,
  Play,
  Star,
  Shield,
  Clock,
  Heart,
  Share2,
  MessageCircle,
  Phone
} from 'lucide-react'
import { HousingListingWithCompatibility } from '@/lib/housing/types'
import { HousingUtils } from '@/lib/housing/utils'
import { formatCompatibilityScore, getCompatibilityLabel } from '@/lib/utils'
import Image from 'next/image'

interface HousingListingCardProps {
  listing: HousingListingWithCompatibility
  onBookTour: (listingId: string) => void
  onViewDetails: (listingId: string) => void
  onSaveListing: (listingId: string) => void
  onShareListing: (listingId: string) => void
  onContactLandlord: (listingId: string) => void
}

export function HousingListingCard({
  listing,
  onBookTour,
  onViewDetails,
  onSaveListing,
  onShareListing,
  onContactLandlord
}: HousingListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveListing = () => {
    setIsSaved(!isSaved)
    onSaveListing(listing.id)
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

  const formatRent = () => {
    return HousingUtils.formatRent(
      listing.rent_monthly,
      listing.utilities_included,
      listing.utilities_cost
    )
  }

  const formatAvailability = () => {
    return HousingUtils.formatAvailability(listing.available_from)
  }

  const getCompatibilityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 0.8) return 'bg-green-100 text-green-800'
    if (score >= 0.6) return 'bg-blue-100 text-blue-800'
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Card className="border-2 border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-lg overflow-hidden">
      {/* Image Gallery */}
      <div className="relative h-48 bg-gray-100">
        {listing.photos.length > 0 ? (
          <>
            <Image
              src={listing.photos[imageIndex]}
              alt={`${listing.title} - Image ${imageIndex + 1}`}
              fill
              className="object-cover"
            />
            
            {/* Image Navigation */}
            {listing.photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
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

            {/* Virtual Tour Badge */}
            {listing.virtual_tour_url && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-blue-600 text-white flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Virtual Tour
                </Badge>
              </div>
            )}

            {/* University Verified Badge */}
            {listing.verified_by_university && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-600 text-white flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Camera className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {listing.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <MapPin className="h-3 w-3" />
              {listing.address}, {listing.city}
            </CardDescription>
          </div>
          
          {/* Compatibility Score */}
          {listing.compatibility_score && (
            <div className="text-right">
              <Badge className={`${getCompatibilityColor(listing.compatibility_score)} text-sm font-semibold`}>
                {formatCompatibilityScore(listing.compatibility_score)}
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                {getCompatibilityLabel(listing.compatibility_score)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="font-medium">{formatRent()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{formatAvailability()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-purple-600" />
            <span>{listing.available_rooms}/{listing.total_rooms} rooms</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-blue-600" />
            <span>{listing.total_bathrooms} bathroom{listing.total_bathrooms !== 1 ? 's' : ''}</span>
          </div>
          
          {listing.square_meters && (
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-orange-600" />
              <span>{listing.square_meters}m²</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="capitalize">{listing.room_type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Amenities */}
        {listing.amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Amenities
            </h4>
            <div className="flex flex-wrap gap-1">
              {listing.amenities.slice(0, 6).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {HousingUtils.getAmenityIcon(amenity)} {HousingUtils.getAmenityDisplayName(amenity)}
                </Badge>
              ))}
              {listing.amenities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.amenities.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Factors */}
        {listing.positive_factors && listing.positive_factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Why this might work for you
            </h4>
            <ul className="space-y-1">
              {listing.positive_factors.slice(0, 3).map((factor, index) => (
                <li key={index} className="text-sm text-green-600 dark:text-green-400 flex items-start gap-1">
                  <span>✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onBookTour(listing.id)}
            className="flex-1"
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Tour
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onViewDetails(listing.id)}
            size="sm"
          >
            View Details
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveListing}
              className={`${isSaved ? 'text-red-600' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShareListing(listing.id)}
              className="text-gray-500"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onContactLandlord(listing.id)}
              className="text-gray-500"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            Listed {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
