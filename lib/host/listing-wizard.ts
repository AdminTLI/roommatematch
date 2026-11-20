import type { ListingDealbreakers, ListingLifestylePrefs } from '@/lib/host/types'
import { COMMON_AMENITIES } from '@/lib/housing/types'

export const LISTING_WIZARD_SECTIONS = [
  'basics',
  'location',
  'property',
  'pricing',
  'rules',
  'lifestyle',
  'review',
] as const

export type ListingWizardSection = (typeof LISTING_WIZARD_SECTIONS)[number]

export const LISTING_SECTION_META: Record<
  ListingWizardSection,
  { label: string; description: string }
> = {
  basics: {
    label: 'Basics',
    description: 'Title, story, and photos students see first.',
  },
  location: {
    label: 'Location',
    description: 'Where the home is. Exact address stays private until offer.',
  },
  property: {
    label: 'Property',
    description: 'Rooms, entrance details, size, and amenities.',
  },
  pricing: {
    label: 'Pricing & dates',
    description: 'Rent, deposit, utilities, availability, and WWS proof.',
  },
  rules: {
    label: 'House rules',
    description: 'Hard filters that decide who can apply.',
  },
  lifestyle: {
    label: 'Lifestyle fit',
    description: 'Same living prefs we ask students, used for ranking.',
  },
  review: {
    label: 'Review',
    description: 'Check everything, then submit for review.',
  },
}

export const AMENITY_LABELS: Record<(typeof COMMON_AMENITIES)[number], string> = {
  wifi: 'Wi-Fi',
  heating: 'Heating',
  air_conditioning: 'Air conditioning',
  washing_machine: 'Washing machine',
  dishwasher: 'Dishwasher',
  garden: 'Garden',
  balcony: 'Balcony',
  terrace: 'Terrace',
  elevator: 'Elevator',
  security: 'Security',
  storage: 'Storage',
  bike_storage: 'Bike storage',
  gym: 'Gym',
  common_area: 'Common area',
  rooftop: 'Rooftop',
  near_public_transport: 'Near public transport',
  near_supermarket: 'Near supermarket',
  near_university: 'Near university',
}

export type ListingWizardDraft = {
  title: string
  description: string
  photos: string[]
  address: string
  city: string
  postal_code: string
  /** Filled from address lookup; not shown in the UI. */
  latitude: string
  longitude: string
  house_number: string
  house_letter: string
  house_number_addition: string
  floor_level: string
  unit_label: string
  property_type: '' | 'apartment' | 'house' | 'studio' | 'shared_room' | 'private_room'
  room_type: '' | 'private' | 'shared' | 'studio' | 'entire_place'
  total_rooms: string
  available_rooms: string
  seeking_people: string
  total_bathrooms: string
  square_meters: string
  amenities: string[]
  furnished: boolean
  parking_available: boolean
  rent_monthly: string
  deposit_amount: string
  utilities_included: boolean
  utilities_cost: string
  agency_fee: string
  available_from: string
  available_until: string
  min_stay_months: string
  max_stay_months: string
  pet_friendly: boolean
  smoking_allowed: boolean
  no_airbnb: boolean
  brp_required: boolean
  study_friendly: boolean
  cleanliness: number | null
  quiet_hours_importance: number | null
  guests_frequency: number | null
  overnight_guests: number | null
  parties_frequency: number | null
  social_level: number | null
  chores_expectation: number | null
  preferred_schedule: '' | 'early' | 'flexible' | 'late'
  /** Signed URLs for WWS rent-points proof (images / PDF) */
  wws_documents: string[]
}

export const EMPTY_LISTING_DRAFT: ListingWizardDraft = {
  title: '',
  description: '',
  photos: [],
  address: '',
  city: '',
  postal_code: '',
  latitude: '',
  longitude: '',
  house_number: '',
  house_letter: '',
  house_number_addition: '',
  floor_level: '',
  unit_label: '',
  property_type: '',
  room_type: '',
  total_rooms: '',
  available_rooms: '',
  seeking_people: '',
  total_bathrooms: '',
  square_meters: '',
  amenities: [],
  furnished: false,
  parking_available: false,
  rent_monthly: '',
  deposit_amount: '',
  utilities_included: false,
  utilities_cost: '',
  agency_fee: '',
  available_from: '',
  available_until: '',
  min_stay_months: '',
  max_stay_months: '',
  pet_friendly: false,
  smoking_allowed: false,
  no_airbnb: false,
  brp_required: false,
  study_friendly: false,
  cleanliness: null,
  quiet_hours_importance: null,
  guests_frequency: null,
  overnight_guests: null,
  parties_frequency: null,
  social_level: null,
  chores_expectation: null,
  preferred_schedule: '',
  wws_documents: [],
}

export function validateListingSection(
  section: ListingWizardSection,
  draft: ListingWizardDraft
): string | null {
  switch (section) {
    case 'basics':
      if (draft.title.trim().length < 3) return 'Add a title (at least 3 characters).'
      if (draft.description.trim().length < 20) {
        return 'Write a bit more about the home (at least 20 characters).'
      }
      return null
    case 'location': {
      if (draft.address.trim().length < 3) return 'Address is required.'
      if (draft.city.trim().length < 2) return 'City is required.'
      if (draft.postal_code.trim().length < 4) return 'Postal code is required.'
      const cityOnly =
        draft.address.trim().toLowerCase() === draft.city.trim().toLowerCase()
      if (cityOnly) {
        return 'Pick a full street address from the suggestions (not just the city).'
      }
      const lat = Number(draft.latitude)
      const lng = Number(draft.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return 'Pick an address from the suggestions so we can place the home on the map.'
      }
      return null
    }
    case 'property': {
      if (!draft.property_type) return 'Select a property type.'
      if (!draft.room_type) return 'Select the room type offered.'
      const rooms = Number(draft.total_rooms)
      const available = Number(draft.available_rooms)
      const seeking = Number(draft.seeking_people)
      const baths = Number(draft.total_bathrooms)
      if (!Number.isFinite(rooms) || rooms < 1) return 'Total rooms must be at least 1.'
      if (!Number.isFinite(available) || available < 1) return 'Available rooms must be at least 1.'
      if (available > rooms) return 'Available rooms cannot exceed total rooms.'
      if (!Number.isFinite(seeking) || seeking < 1) return 'Seeking people must be at least 1.'
      if (!Number.isFinite(baths) || baths < 0.5) return 'Bathrooms must be at least 0.5.'
      const needsFloor = ['apartment', 'studio', 'private_room', 'shared_room'].includes(
        draft.property_type
      )
      if (needsFloor && !draft.floor_level.trim()) {
        return 'Add which floor the home is on (students use this to decide).'
      }
      return null
    }
    case 'pricing': {
      const rent = Number(draft.rent_monthly)
      if (!Number.isFinite(rent) || rent <= 0) return 'Monthly rent is required.'
      if (!draft.available_from) return 'Available-from date is required.'
      const minStay = Number(draft.min_stay_months)
      if (!Number.isFinite(minStay) || minStay < 1) return 'Minimum stay must be at least 1 month.'
      return null
    }
    case 'rules':
      return null
    case 'lifestyle': {
      if (!draft.preferred_schedule) return 'Choose an ideal daily rhythm.'
      const scales: Array<[keyof ListingWizardDraft, string]> = [
        ['cleanliness', 'cleanliness'],
        ['quiet_hours_importance', 'quiet hours'],
        ['guests_frequency', 'day guests'],
        ['overnight_guests', 'overnight guests'],
        ['parties_frequency', 'parties'],
        ['social_level', 'social energy'],
        ['chores_expectation', 'chore expectation'],
      ]
      for (const [key, label] of scales) {
        if (draft[key] == null) return `Select a rating for ${label}.`
      }
      return null
    }
    case 'review':
      return null
    default:
      return null
  }
}

export function draftToLifestylePrefs(draft: ListingWizardDraft): ListingLifestylePrefs {
  return {
    cleanliness: draft.cleanliness ?? undefined,
    quiet_hours_importance: draft.quiet_hours_importance ?? undefined,
    guests_frequency: draft.guests_frequency ?? undefined,
    overnight_guests: draft.overnight_guests ?? undefined,
    parties_frequency: draft.parties_frequency ?? undefined,
    social_level: draft.social_level ?? undefined,
    chores_expectation: draft.chores_expectation ?? undefined,
    preferred_schedule: draft.preferred_schedule || undefined,
    study_friendly: draft.study_friendly,
  }
}

export function draftToDealbreakers(draft: ListingWizardDraft): ListingDealbreakers {
  return {
    no_smoking: !draft.smoking_allowed,
    no_pets: !draft.pet_friendly,
    no_airbnb: draft.no_airbnb,
    brp_required: draft.brp_required,
    min_stay_months: Number(draft.min_stay_months) || 1,
    max_group_size: Number(draft.seeking_people) || 1,
  }
}

/** Fill DB-required fields so incomplete drafts can still be persisted. */
export function withDraftPlaceholders(draft: ListingWizardDraft): ListingWizardDraft {
  const description =
    draft.description.trim().length >= 20
      ? draft.description
      : draft.description.trim()
        ? `${draft.description.trim()}\n\n(Draft — finish editing before submitting.)`
        : 'Draft in progress. Finish editing before submitting for review.'

  return {
    ...draft,
    title: draft.title.trim() || 'Untitled draft',
    description,
    address: draft.address.trim() || 'Address TBD',
    city: draft.city.trim() || 'City TBD',
    postal_code: draft.postal_code.trim() || '0000AA',
    property_type: draft.property_type || 'apartment',
    room_type: draft.room_type || 'private',
    total_rooms: draft.total_rooms || '1',
    available_rooms: draft.available_rooms || '1',
    seeking_people: draft.seeking_people || '1',
    total_bathrooms: draft.total_bathrooms || '1',
    rent_monthly: draft.rent_monthly || '0',
    available_from: draft.available_from || new Date().toISOString().slice(0, 10),
    min_stay_months: draft.min_stay_months || '1',
    preferred_schedule: draft.preferred_schedule || 'flexible',
    cleanliness: draft.cleanliness ?? 3,
    quiet_hours_importance: draft.quiet_hours_importance ?? 3,
    guests_frequency: draft.guests_frequency ?? 3,
    overnight_guests: draft.overnight_guests ?? 3,
    parties_frequency: draft.parties_frequency ?? 3,
    social_level: draft.social_level ?? 3,
    chores_expectation: draft.chores_expectation ?? 3,
  }
}

export function draftToApiBody(draft: ListingWizardDraft, submitForReview: boolean) {
  const lat = draft.latitude ? Number(draft.latitude) : null
  const lng = draft.longitude ? Number(draft.longitude) : null
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    address: draft.address.trim(),
    city: draft.city.trim(),
    postal_code: draft.postal_code.trim(),
    latitude: Number.isFinite(lat as number) ? lat : null,
    longitude: Number.isFinite(lng as number) ? lng : null,
    house_number: draft.house_number.trim() || null,
    house_letter: draft.house_letter.trim() || null,
    house_number_addition: draft.house_number_addition.trim() || null,
    floor_level: draft.floor_level.trim() || null,
    unit_label: draft.unit_label.trim() || null,
    property_type: draft.property_type as Exclude<ListingWizardDraft['property_type'], ''>,
    room_type: draft.room_type as Exclude<ListingWizardDraft['room_type'], ''>,
    total_rooms: Number(draft.total_rooms),
    available_rooms: Number(draft.available_rooms),
    seeking_people: Number(draft.seeking_people),
    total_bathrooms: Number(draft.total_bathrooms),
    square_meters: draft.square_meters ? Number(draft.square_meters) : null,
    rent_monthly: Number(draft.rent_monthly),
    deposit_amount: draft.deposit_amount === '' ? 0 : Number(draft.deposit_amount),
    utilities_included: draft.utilities_included,
    utilities_cost: draft.utilities_cost ? Number(draft.utilities_cost) : undefined,
    agency_fee: draft.agency_fee ? Number(draft.agency_fee) : undefined,
    available_from: draft.available_from,
    available_until: draft.available_until || null,
    min_stay_months: Number(draft.min_stay_months),
    max_stay_months: draft.max_stay_months ? Number(draft.max_stay_months) : null,
    amenities: draft.amenities.map((a) =>
      a.trim().toLowerCase().replace(/[\s-]+/g, '_')
    ),
    pet_friendly: draft.pet_friendly,
    smoking_allowed: draft.smoking_allowed,
    furnished: draft.furnished,
    parking_available: draft.parking_available,
    photos: draft.photos,
    wws_documents: draft.wws_documents,
    lifestyle_prefs: draftToLifestylePrefs(draft),
    dealbreakers: draftToDealbreakers(draft),
    submit_for_review: submitForReview,
  }
}

/** API body for autosaving incomplete progress (status=draft). */
export function draftToDraftApiBody(
  draft: ListingWizardDraft,
  wizardStep: ListingWizardSection
) {
  return {
    ...draftToApiBody(withDraftPlaceholders(draft), false),
    save_as_draft: true as const,
    wizard_draft: draft,
    wizard_step: wizardStep,
  }
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function optionalNumStr(value: unknown): string {
  if (value == null || value === '') return ''
  return String(value)
}

/** Hydrate wizard state from a housing_listings row (prefers wizard_draft). */
export function listingToDraft(listing: Record<string, unknown>): ListingWizardDraft {
  const stored = listing.wizard_draft
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    return {
      ...EMPTY_LISTING_DRAFT,
      ...(stored as Partial<ListingWizardDraft>),
    }
  }

  const lifestyle = (listing.lifestyle_prefs || {}) as ListingLifestylePrefs
  const dealbreakers = (listing.dealbreakers || {}) as ListingDealbreakers
  const propertyType = str(listing.property_type) as ListingWizardDraft['property_type']
  const roomType = str(listing.room_type) as ListingWizardDraft['room_type']
  const schedule = str(lifestyle.preferred_schedule) as ListingWizardDraft['preferred_schedule']

  return {
    ...EMPTY_LISTING_DRAFT,
    title: str(listing.title),
    description: str(listing.description),
    photos: Array.isArray(listing.photos) ? (listing.photos as string[]) : [],
    address: str(listing.address),
    city: str(listing.city),
    postal_code: str(listing.postal_code),
    latitude: optionalNumStr(listing.latitude),
    longitude: optionalNumStr(listing.longitude),
    house_number: str(listing.house_number),
    house_letter: str(listing.house_letter),
    house_number_addition: str(listing.house_number_addition),
    floor_level: str(listing.floor_level),
    unit_label: str(listing.unit_label),
    property_type:
      propertyType === 'apartment' ||
      propertyType === 'house' ||
      propertyType === 'studio' ||
      propertyType === 'shared_room' ||
      propertyType === 'private_room'
        ? propertyType
        : '',
    room_type:
      roomType === 'private' ||
      roomType === 'shared' ||
      roomType === 'studio' ||
      roomType === 'entire_place'
        ? roomType
        : '',
    total_rooms: optionalNumStr(listing.total_rooms),
    available_rooms: optionalNumStr(listing.available_rooms),
    seeking_people: optionalNumStr(listing.seeking_people) || '1',
    total_bathrooms: optionalNumStr(listing.total_bathrooms),
    square_meters: optionalNumStr(listing.square_meters),
    amenities: Array.isArray(listing.amenities) ? (listing.amenities as string[]) : [],
    furnished: Boolean(listing.furnished),
    parking_available: Boolean(listing.parking_available),
    rent_monthly: optionalNumStr(listing.rent_monthly),
    deposit_amount: optionalNumStr(listing.deposit_amount),
    utilities_included: Boolean(listing.utilities_included),
    utilities_cost: optionalNumStr(listing.utilities_cost),
    agency_fee: optionalNumStr(listing.agency_fee),
    available_from: str(listing.available_from).slice(0, 10),
    available_until: str(listing.available_until).slice(0, 10),
    min_stay_months: optionalNumStr(listing.min_stay_months) || String(dealbreakers.min_stay_months || ''),
    max_stay_months: optionalNumStr(listing.max_stay_months),
    pet_friendly: listing.pet_friendly != null ? Boolean(listing.pet_friendly) : !dealbreakers.no_pets,
    smoking_allowed:
      listing.smoking_allowed != null ? Boolean(listing.smoking_allowed) : !dealbreakers.no_smoking,
    no_airbnb: Boolean(dealbreakers.no_airbnb),
    brp_required: Boolean(dealbreakers.brp_required),
    study_friendly: Boolean(lifestyle.study_friendly),
    cleanliness: lifestyle.cleanliness ?? null,
    quiet_hours_importance: lifestyle.quiet_hours_importance ?? null,
    guests_frequency: lifestyle.guests_frequency ?? null,
    overnight_guests: lifestyle.overnight_guests ?? null,
    parties_frequency: lifestyle.parties_frequency ?? null,
    social_level: lifestyle.social_level ?? null,
    chores_expectation: lifestyle.chores_expectation ?? null,
    preferred_schedule:
      schedule === 'early' || schedule === 'flexible' || schedule === 'late' ? schedule : '',
    wws_documents: Array.isArray(listing.wws_documents)
      ? (listing.wws_documents as string[])
      : [],
  }
}

export function resumeWizardSection(listing: Record<string, unknown>): ListingWizardSection {
  const step = listing.wizard_step
  if (typeof step === 'string' && (LISTING_WIZARD_SECTIONS as readonly string[]).includes(step)) {
    return step as ListingWizardSection
  }
  const draft = listingToDraft(listing)
  for (const section of LISTING_WIZARD_SECTIONS) {
    if (section === 'review') continue
    if (validateListingSection(section, draft)) return section
  }
  return 'review'
}

export function draftHasMeaningfulProgress(draft: ListingWizardDraft): boolean {
  return (
    draft.title.trim().length > 0 ||
    draft.description.trim().length > 0 ||
    draft.photos.length > 0 ||
    draft.address.trim().length > 0 ||
    Boolean(draft.property_type) ||
    Boolean(draft.rent_monthly)
  )
}
