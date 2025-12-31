// WWSO (Woonruimte Wet) Point Calculation Algorithm
// Based on 2025 Dutch rental law standards

import {
  RentCalculatorFormData,
  WWSOPointBreakdown,
  RentThreshold,
  CalculationResult,
  EnergyLabel,
} from './types'

/**
 * Calculate WWSO points based on form data
 */
export function calculateWWSOPoints(
  formData: RentCalculatorFormData
): WWSOPointBreakdown {
  // Base points: 5 points per m²
  const basePoints = (formData.roomSize || 0) * 5

  // Energy label points
  const energyLabelPoints = getEnergyLabelPoints(formData.energyLabel)

  // Facilities points
  let facilitiesPoints = 0
  if (formData.privateKitchen) facilitiesPoints += 15
  if (formData.privateBathroom) facilitiesPoints += 12
  if (formData.outdoorSpace) facilitiesPoints += 5

  // Shared penalty: -10 points if shared with more than 4 people
  const sharedPenalty = (formData.housemates || 0) > 4 ? -10 : 0

  const totalPoints = basePoints + energyLabelPoints + facilitiesPoints + sharedPenalty

  return {
    basePoints,
    energyLabelPoints,
    facilitiesPoints,
    sharedPenalty,
    totalPoints: Math.max(0, totalPoints), // Ensure points don't go negative
  }
}

/**
 * Get points for energy label
 */
function getEnergyLabelPoints(label: EnergyLabel | null): number {
  switch (label) {
    case 'A++':
      return 50
    case 'A':
      return 40
    case 'B':
      return 32
    case 'C':
      return 22
    case 'D':
      return 12
    case 'E':
    case 'F':
    case 'G':
      return 0
    case 'unknown':
    case null:
      return 0
    default:
      return 0
  }
}

/**
 * Get rent threshold based on total points
 */
export function getRentThreshold(totalPoints: number): RentThreshold {
  if (totalPoints < 143) {
    return {
      maxRent: 900.07,
      category: 'social',
      label: 'Social Sector',
    }
  } else if (totalPoints >= 143 && totalPoints <= 186) {
    return {
      maxRent: 1184.82,
      category: 'mid-range',
      label: 'Mid-range',
    }
  } else {
    return {
      maxRent: Infinity, // No limit for liberalized sector
      category: 'liberalized',
      label: 'Liberalized Sector (Market Price)',
    }
  }
}

/**
 * Calculate complete result including rent status
 */
export function calculateRentResult(
  formData: RentCalculatorFormData
): CalculationResult {
  const points = calculateWWSOPoints(formData)
  const threshold = getRentThreshold(points.totalPoints)
  const estimatedMaxRent = threshold.maxRent === Infinity ? 0 : threshold.maxRent

  // Determine rent status
  let rentStatus: 'overpaying' | 'fair-price' | 'market-rate'
  let isOverpaying = false

  if (threshold.category === 'liberalized') {
    rentStatus = 'market-rate'
    isOverpaying = false // Can't overpay in liberalized sector
  } else {
    const currentRent = formData.currentRent || 0
    if (currentRent > 0) {
      if (currentRent > estimatedMaxRent) {
        rentStatus = 'overpaying'
        isOverpaying = true
      } else {
        rentStatus = 'fair-price'
        isOverpaying = false
      }
    } else {
      rentStatus = 'fair-price' // Default if no current rent provided
      isOverpaying = false
    }
  }

  return {
    points,
    threshold,
    rentStatus,
    isOverpaying,
    estimatedMaxRent,
  }
}

/**
 * Get question configurations
 */
export const QUESTION_CONFIGS = [
  {
    id: 1,
    key: 'roomSize' as const,
    label: 'What is the total area of your private room in m²?',
    type: 'numeric' as const,
    tooltip:
      'Room size is a key factor in WWSO calculations. Larger rooms receive more base points (5 points per m²), which can affect your maximum legal rent threshold.',
    placeholder: 'Enter room size',
    min: 1,
    max: 200,
    required: true,
  },
  {
    id: 2,
    key: 'housemates' as const,
    label: 'How many people do you share the house with?',
    type: 'numeric' as const,
    tooltip:
      'Sharing with more than 4 housemates results in a 10-point penalty, which can lower your WWSO score and reduce your maximum legal rent threshold.',
    placeholder: 'Enter number of housemates',
    min: 0,
    max: 20,
    required: true,
  },
  {
    id: 3,
    key: 'energyLabel' as const,
    label: 'What is the energy label of the building?',
    type: 'dropdown' as const,
    tooltip:
      'Energy efficiency directly impacts your WWSO score. Better energy labels (A++ through D) add significant points, while lower ratings (E, F, G) add none. This reflects the property quality in Dutch rental law.',
    options: [
      { label: 'A++', value: 'A++' },
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' },
      { label: 'D', value: 'D' },
      { label: 'E', value: 'E' },
      { label: 'F', value: 'F' },
      { label: 'G', value: 'G' },
      { label: "I don't know", value: 'unknown' },
    ],
    required: true,
  },
  {
    id: 4,
    key: 'privateKitchen' as const,
    label: 'Do you have a private kitchen?',
    type: 'toggle' as const,
    tooltip:
      'Having a private kitchen adds 15 points to your WWSO score. This is considered a significant facility upgrade in Dutch rental law.',
    required: true,
  },
  {
    id: 5,
    key: 'privateBathroom' as const,
    label: 'Do you have a private bathroom/shower?',
    type: 'toggle' as const,
    tooltip:
      'A private bathroom or shower adds 12 points to your WWSO score. Shared facilities are common in student housing, so private facilities increase your legal rent threshold.',
    required: true,
  },
  {
    id: 6,
    key: 'outdoorSpace' as const,
    label: 'Does your room have access to a private balcony or garden?',
    type: 'toggle' as const,
    tooltip:
      'Outdoor space (private balcony or garden) adds 5 points to your WWSO score. This amenity is factored into the quality assessment of rental properties.',
    required: true,
  },
  {
    id: 7,
    key: 'buildingEra' as const,
    label: 'Was your building constructed before or after 1970?',
    type: 'toggle-era' as const,
    tooltip:
      'Building age can affect point weighting in WWSO calculations. Buildings constructed before 1970 may have different point allocations, though the exact impact depends on other factors.',
    options: [
      { label: 'Before 1970', value: 'before_1970' },
      { label: 'After 1970', value: 'after_1970' },
    ],
    required: true,
  },
] as const

