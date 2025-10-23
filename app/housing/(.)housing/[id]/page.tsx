// Intercepting Route for Modal Presentation
// Renders listing detail as modal when navigated from /housing

'use client'

import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { ListingDetail } from '@/components/housing/ListingDetail'
import { Listing } from '@/types/housing'
import { ArrowLeft } from 'lucide-react'

interface ListingDetailModalProps {
  params: {
    id: string
  }
}

// Mock listing data - in real implementation, this would be fetched
const mockListing: Listing = {
  id: 'listing-1',
  title: 'Modern Studio Apartment near UvA',
  address: 'Spuistraat 123',
  city: 'Amsterdam',
  coords: { lat: 52.3676, lng: 4.9041 },
  coverImageUrl: '/housing/studio-1.jpg',
  priceMonthly: 1200,
  moveInISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  leaseMonths: 6,
  roomType: 'studio',
  beds: 1,
  baths: 1,
  furnished: true,
  utilitiesIncluded: true,
  petsAllowed: false,
  smokingPolicy: 'none',
  accessibility: { elevator: true, stepFree: false, groundFloor: false },
  distanceKmToCampus: 0.8,
  compatibilityScore: 87,
  compatibilityReasons: [
    'Great value - €300 under budget',
    'Located in your preferred city: Amsterdam',
    'Close to university'
  ],
  roommatesCount: 0,
  isNew: true,
  isPopular: false,
  verification: {
    universityVerified: true,
    hostIdVerified: false,
    agencyKvKVerified: false,
    lastAuditISO: new Date().toISOString()
  },
  agencyOrHost: {
    name: 'Amsterdam Housing Co.',
    responseTimeHrs: 24,
    rating: 4.5
  },
  // Additional required fields
  description: 'Beautiful modern studio apartment perfect for students. Located just 5 minutes walk from the University of Amsterdam.',
  postalCode: '1012 VG',
  propertyType: 'studio',
  totalRooms: 1,
  availableRooms: 1,
  totalBathrooms: 1,
  squareMeters: 35,
  utilitiesCost: 0,
  depositAmount: 2400,
  agencyFee: 0,
  availableUntil: undefined,
  minStayMonths: 6,
  maxStayMonths: 12,
  amenities: ['wifi', 'heating', 'washing_machine', 'near_university'],
  parkingAvailable: false,
  parkingCost: 0,
  universityId: 'university-1',
  landlordName: 'Amsterdam Housing Co.',
  landlordEmail: 'contact@amsterdamhousing.nl',
  landlordPhone: '+31 20 123 4567',
  agencyName: 'Amsterdam Housing Co.',
  agencyLicense: 'NL123456789',
  photos: ['/housing/studio-1.jpg', '/housing/studio-2.jpg'],
  virtualTourUrl: 'https://example.com/virtual-tour/1',
  floorPlanUrl: undefined,
  status: 'active',
  moderationStatus: 'approved',
  moderationNotes: undefined,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: undefined
}

export default function ListingDetailModal({ params }: ListingDetailModalProps) {
  const router = useRouter()

  const handleClose = () => {
    router.back()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <DialogTitle className="text-xl font-semibold">
              {mockListing.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <ListingDetail
            listing={mockListing}
            onSave={(id) => console.log('Save listing:', id)}
            onShare={(id) => console.log('Share listing:', id)}
            onReport={(id) => console.log('Report listing:', id)}
            showBackButton={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
