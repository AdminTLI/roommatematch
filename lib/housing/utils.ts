// Housing Feed & Tours Utilities
// This module provides utility functions for the housing marketplace

import { HousingListing, HousingCompatibilityScore, UserHousingPreferences, COMMON_AMENITIES } from './types'

export class HousingUtils {
  /**
   * Calculate compatibility score between a listing and user preferences
   */
  static calculateCompatibility(
    listing: HousingListing,
    preferences: UserHousingPreferences,
    existingScore?: HousingCompatibilityScore
  ): HousingCompatibilityScore {
    const budgetScore = this.calculateBudgetCompatibility(listing, preferences)
    const locationScore = this.calculateLocationCompatibility(listing, preferences)
    const amenityScore = this.calculateAmenityCompatibility(listing, preferences)
    const timelineScore = this.calculateTimelineCompatibility(listing, preferences)

    const overallScore = (
      budgetScore * 0.4 +
      locationScore * 0.3 +
      amenityScore * 0.2 +
      timelineScore * 0.1
    )

    const positiveFactors = this.getPositiveFactors(listing, preferences, {
      budget: budgetScore,
      location: locationScore,
      amenities: amenityScore,
      timeline: timelineScore
    })

    const negativeFactors = this.getNegativeFactors(listing, preferences, {
      budget: budgetScore,
      location: locationScore,
      amenities: amenityScore,
      timeline: timelineScore
    })

    return {
      id: existingScore?.id || '',
      listing_id: listing.id,
      user_id: preferences.user_id,
      budget_compatibility: budgetScore,
      location_compatibility: locationScore,
      amenity_compatibility: amenityScore,
      timeline_compatibility: timelineScore,
      overall_compatibility: overallScore,
      positive_factors: positiveFactors,
      negative_factors: negativeFactors,
      created_at: existingScore?.created_at || new Date().toISOString()
    }
  }

  /**
   * Calculate budget compatibility (0-1)
   */
  private static calculateBudgetCompatibility(
    listing: HousingListing,
    preferences: UserHousingPreferences
  ): number {
    const totalCost = listing.rent_monthly + (listing.utilities_included ? 0 : listing.utilities_cost)
    
    if (totalCost <= preferences.max_rent_monthly) {
      // Bonus for being under budget
      const savings = preferences.max_rent_monthly - totalCost
      return Math.min(1.0, 0.7 + (savings / preferences.max_rent_monthly * 0.3))
    } else {
      // Penalty for being over budget
      const overage = totalCost - preferences.max_rent_monthly
      return Math.max(0.0, 1.0 - (overage / preferences.max_rent_monthly))
    }
  }

  /**
   * Calculate location compatibility (0-1)
   */
  private static calculateLocationCompatibility(
    listing: HousingListing,
    preferences: UserHousingPreferences
  ): number {
    let score = 0.5 // Base score

    // University proximity bonus
    if (preferences.near_university && listing.university_id) {
      score += 0.3
    }

    // Preferred city bonus
    if (preferences.preferred_cities.includes(listing.city)) {
      score += 0.2
    }

    // Commute time consideration (would need actual distance calculation)
    if (preferences.max_commute_minutes) {
      // This would be enhanced with actual distance/duration calculation
      score += 0.1 // Placeholder
    }

    return Math.min(1.0, score)
  }

  /**
   * Calculate amenity compatibility (0-1)
   */
  private static calculateAmenityCompatibility(
    listing: HousingListing,
    preferences: UserHousingPreferences
  ): number {
    if (preferences.required_amenities.length === 0) {
      return 0.5 // No requirements = neutral score
    }

    const matchedRequired = preferences.required_amenities.filter(amenity =>
      listing.amenities.includes(amenity)
    ).length

    const requiredScore = matchedRequired / preferences.required_amenities.length

    // Bonus for preferred amenities
    const matchedPreferred = preferences.preferred_amenities.filter(amenity =>
      listing.amenities.includes(amenity)
    ).length

    const preferredBonus = preferences.preferred_amenities.length > 0
      ? (matchedPreferred / preferences.preferred_amenities.length) * 0.2
      : 0

    return Math.min(1.0, requiredScore + preferredBonus)
  }

  /**
   * Calculate timeline compatibility (0-1)
   */
  private static calculateTimelineCompatibility(
    listing: HousingListing,
    preferences: UserHousingPreferences
  ): number {
    let score = 0.5 // Base score

    // Check if listing availability aligns with user preferences
    const availableFrom = new Date(listing.available_from)
    const now = new Date()
    const flexibilityDays = preferences.move_in_flexibility_days || 30

    // If listing is available soon or within flexibility window
    const daysUntilAvailable = Math.ceil((availableFrom.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilAvailable <= flexibilityDays && daysUntilAvailable >= -7) {
      score += 0.3 // Available soon
    } else if (daysUntilAvailable > flexibilityDays) {
      score += 0.1 // Available later but still reasonable
    }

    // Check stay duration compatibility
    if (listing.min_stay_months <= preferences.min_stay_months) {
      score += 0.1
    }

    if (listing.max_stay_months && preferences.max_stay_months && 
        listing.max_stay_months >= preferences.max_stay_months) {
      score += 0.1
    }

    return Math.min(1.0, score)
  }

  /**
   * Get positive factors for compatibility explanation
   */
  private static getPositiveFactors(
    listing: HousingListing,
    preferences: UserHousingPreferences,
    scores: { budget: number; location: number; amenities: number; timeline: number }
  ): string[] {
    const factors: string[] = []

    if (scores.budget >= 0.8) {
      const totalCost = listing.rent_monthly + (listing.utilities_included ? 0 : listing.utilities_cost)
      if (totalCost < preferences.max_rent_monthly) {
        factors.push(`Great value - €${Math.round(preferences.max_rent_monthly - totalCost)} under budget`)
      } else {
        factors.push('Within your budget range')
      }
    }

    if (scores.location >= 0.8) {
      if (preferences.preferred_cities.includes(listing.city)) {
        factors.push(`Located in your preferred city: ${listing.city}`)
      }
      if (preferences.near_university && listing.university_id) {
        factors.push('Close to university')
      }
    }

    if (scores.amenities >= 0.8) {
      const matchedRequired = preferences.required_amenities.filter(amenity =>
        listing.amenities.includes(amenity)
      )
      if (matchedRequired.length > 0) {
        factors.push(`Has ${matchedRequired.length} required amenities`)
      }
    }

    if (scores.timeline >= 0.8) {
      factors.push('Perfect availability timing')
    }

    // Special features
    if (listing.verified_by_university) {
      factors.push('University-verified listing')
    }

    if (listing.virtual_tour_url) {
      factors.push('Virtual tour available')
    }

    return factors
  }

  /**
   * Get negative factors for compatibility explanation
   */
  private static getNegativeFactors(
    listing: HousingListing,
    preferences: UserHousingPreferences,
    scores: { budget: number; location: number; amenities: number; timeline: number }
  ): string[] {
    const factors: string[] = []

    if (scores.budget < 0.5) {
      const totalCost = listing.rent_monthly + (listing.utilities_included ? 0 : listing.utilities_cost)
      const overage = totalCost - preferences.max_rent_monthly
      factors.push(`€${Math.round(overage)} over your budget`)
    }

    if (scores.location < 0.5) {
      if (!preferences.preferred_cities.includes(listing.city)) {
        factors.push(`Not in preferred city (${listing.city})`)
      }
    }

    if (scores.amenities < 0.5) {
      const missingRequired = preferences.required_amenities.filter(amenity =>
        !listing.amenities.includes(amenity)
      )
      if (missingRequired.length > 0) {
        factors.push(`Missing ${missingRequired.length} required amenities`)
      }
    }

    if (scores.timeline < 0.5) {
      factors.push('Availability timing may not match your needs')
    }

    // Deal breakers
    if (preferences.pet_friendly_required && !listing.pet_friendly) {
      factors.push('Not pet-friendly')
    }

    if (preferences.smoking_preference === 'no_smoking' && listing.smoking_allowed) {
      factors.push('Smoking allowed (you prefer no smoking)')
    }

    return factors
  }

  /**
   * Format rent display
   */
  static formatRent(rent: number, utilitiesIncluded: boolean, utilitiesCost: number = 0): string {
    if (utilitiesIncluded) {
      return `€${rent.toLocaleString()}/month (utilities included)`
    } else if (utilitiesCost > 0) {
      const total = rent + utilitiesCost
      return `€${rent.toLocaleString()} + €${utilitiesCost} utilities = €${total.toLocaleString()}/month`
    } else {
      return `€${rent.toLocaleString()}/month + utilities`
    }
  }

  /**
   * Format availability date
   */
  static formatAvailability(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Available now (${date.toLocaleDateString()})`
    } else if (diffDays === 0) {
      return 'Available today'
    } else if (diffDays === 1) {
      return 'Available tomorrow'
    } else if (diffDays <= 7) {
      return `Available in ${diffDays} days`
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7)
      return `Available in ${weeks} week${weeks > 1 ? 's' : ''}`
    } else {
      return `Available ${date.toLocaleDateString()}`
    }
  }

  /**
   * Get amenity icon
   */
  static getAmenityIcon(amenity: string): string {
    const iconMap: Record<string, string> = {
      wifi: '📶',
      heating: '🔥',
      air_conditioning: '❄️',
      washing_machine: '🧺',
      dishwasher: '🍽️',
      garden: '🌳',
      balcony: '🌅',
      terrace: '🏞️',
      elevator: '🛗',
      security: '🔒',
      storage: '📦',
      bike_storage: '🚲',
      gym: '💪',
      common_area: '🏠',
      rooftop: '🏙️',
      near_public_transport: '🚌',
      near_supermarket: '🛒',
      near_university: '🎓'
    }
    return iconMap[amenity] || '✅'
  }

  /**
   * Get amenity display name
   */
  static getAmenityDisplayName(amenity: string): string {
    const nameMap: Record<string, string> = {
      wifi: 'WiFi',
      heating: 'Heating',
      air_conditioning: 'Air Conditioning',
      washing_machine: 'Washing Machine',
      dishwasher: 'Dishwasher',
      garden: 'Garden',
      balcony: 'Balcony',
      terrace: 'Terrace',
      elevator: 'Elevator',
      security: 'Security',
      storage: 'Storage Space',
      bike_storage: 'Bike Storage',
      gym: 'Gym',
      common_area: 'Common Area',
      rooftop: 'Rooftop Access',
      near_public_transport: 'Near Public Transport',
      near_supermarket: 'Near Supermarket',
      near_university: 'Near University'
    }
    return nameMap[amenity] || amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number, lon1: number, lat2: number, lon2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
   * Validate tour booking request
   */
  static validateTourBooking(request: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.listing_id) {
      errors.push('Listing ID is required')
    }

    if (!request.tour_type || !['in_person', 'virtual', 'video_call'].includes(request.tour_type)) {
      errors.push('Valid tour type is required')
    }

    if (!request.preferred_date) {
      errors.push('Preferred date is required')
    } else {
      const date = new Date(request.preferred_date)
      const now = new Date()
      if (date < now) {
        errors.push('Preferred date cannot be in the past')
      }
    }

    if (!request.contact_name || request.contact_name.trim().length < 2) {
      errors.push('Contact name is required (minimum 2 characters)')
    }

    if (!request.contact_email || !this.isValidEmail(request.contact_email)) {
      errors.push('Valid contact email is required')
    }

    if (!request.contact_phone || request.contact_phone.trim().length < 10) {
      errors.push('Valid contact phone is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Generate tour confirmation message
   */
  static generateTourConfirmation(booking: any, listing: HousingListing): string {
    const date = new Date(booking.scheduled_for)
    const tourTypeMap = {
      in_person: 'In-person tour',
      virtual: 'Virtual tour',
      video_call: 'Video call tour'
    }

    return `
Your tour has been confirmed!

📅 Date: ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
🕐 Time: ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}
🏠 Property: ${listing.title}
📍 Address: ${listing.address}, ${listing.city}
📞 Tour Type: ${tourTypeMap[booking.tour_type as keyof typeof tourTypeMap]}
⏱️ Duration: ${booking.duration_minutes} minutes

We'll send you a reminder 24 hours before your tour. If you need to reschedule or cancel, please contact us as soon as possible.

Looking forward to showing you the property!
    `.trim()
  }
}
