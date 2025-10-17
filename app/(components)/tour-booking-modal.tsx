'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Phone, Mail, MapPin, Video, Camera, Users } from 'lucide-react'
import { HousingListing, TourBookingRequest } from '@/lib/housing/types'
import { HousingUtils } from '@/lib/housing/utils'

interface TourBookingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: HousingListing | null
  onBookTour: (request: TourBookingRequest) => Promise<void>
}

export function TourBookingModal({
  isOpen,
  onClose,
  listing,
  onBookTour
}: TourBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    tour_type: 'in_person' as 'in_person' | 'virtual' | 'video_call',
    preferred_date: '',
    preferred_time: '',
    duration_minutes: 30,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
    special_requests: '',
    attendees_count: 1
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    try {
      const validation = HousingUtils.validateTourBooking({
        ...formData,
        listing_id: listing?.id
      })

      if (!validation.valid) {
        setErrors(validation.errors)
        return
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${formData.preferred_date}T${formData.preferred_time}`)
      
      const bookingRequest: TourBookingRequest = {
        listing_id: listing!.id,
        tour_type: formData.tour_type,
        preferred_date: scheduledDateTime.toISOString(),
        preferred_time: scheduledDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        notes: formData.notes,
        special_requests: formData.special_requests,
        attendees_count: formData.attendees_count
      }

      await onBookTour(bookingRequest)
      onClose()
      
      // Reset form
      setFormData({
        tour_type: 'in_person',
        preferred_date: '',
        preferred_time: '',
        duration_minutes: 30,
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        notes: '',
        special_requests: '',
        attendees_count: 1
      })
    } catch (error) {
      console.error('Failed to book tour:', error)
      setErrors(['Failed to book tour. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const getTourTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person':
        return <MapPin className="h-4 w-4" />
      case 'virtual':
        return <Video className="h-4 w-4" />
      case 'video_call':
        return <Camera className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTourTypeDescription = (type: string) => {
    switch (type) {
      case 'in_person':
        return 'Visit the property in person with the landlord or agent'
      case 'virtual':
        return 'Take a virtual tour using our 360° technology'
      case 'video_call':
        return 'Video call with landlord to see the property live'
      default:
        return ''
    }
  }

  if (!listing) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book a Tour
          </DialogTitle>
          <DialogDescription>
            Schedule a tour for {listing.title} in {listing.city}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tour Type */}
          <div className="space-y-3">
            <Label htmlFor="tour_type">Tour Type</Label>
            <Select
              value={formData.tour_type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, tour_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    In-Person Tour
                  </div>
                </SelectItem>
                <SelectItem value="virtual">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Virtual Tour
                  </div>
                </SelectItem>
                <SelectItem value="video_call">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Video Call Tour
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getTourTypeDescription(formData.tour_type)}
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_date">Preferred Date</Label>
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_time">Preferred Time</Label>
              <Input
                id="preferred_time"
                type="time"
                value={formData.preferred_time}
                onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Duration and Attendees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendees_count">Number of Attendees</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Input
                  id="attendees_count"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.attendees_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees_count: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <Input
                    id="contact_name"
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email Address</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific areas you'd like to focus on during the tour..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_requests">Special Requests (optional)</Label>
              <Textarea
                id="special_requests"
                placeholder="Any special accommodations or requests..."
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Booking Tour...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Tour
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
