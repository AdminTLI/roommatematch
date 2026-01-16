// WWS (Woningwaarderingsstelsel) Point Calculation
// Based on 2025 Dutch rental law standards (Bijlage I)

import { WWSFormData, WWSPointBreakdown, WWSResult } from './types'
import { calculateMaxRent } from './price-table'

/**
 * Calculate WWS points based on form data
 * Separate logic for Independent vs Non-Independent housing
 */
export function calculateWWSPoints(formData: WWSFormData): WWSPointBreakdown {
  if (!formData.housingType) {
    throw new Error('Housing type must be specified')
  }

  // Section A: Kitchen (Keuken)
  const kitchenPoints = calculateKitchenPoints(formData)
  
  // Section B: Sanitary (Sanitair)
  const sanitaryPoints = calculateSanitaryPoints(formData)
  
  // Section C: Surface Area (Oppervlakte)
  const surfacePoints = calculateSurfacePoints(formData)
  
  // Section D: Energy Label (Energieprestatie)
  const energyPoints = calculateEnergyPoints(formData)
  
  // Section E: Outdoor Space (Buitenruimte)
  const outdoorPoints = calculateOutdoorPoints(formData)
  
  // Section F: WOZ Calculation
  const wozPoints = calculateWOZPoints(formData, {
    kitchen: kitchenPoints.finalPoints,
    sanitary: sanitaryPoints.finalPoints,
    surface: surfacePoints.total,
    energy: energyPoints,
    outdoor: outdoorPoints.total
  })

  // Calculate total points
  const totalPoints = 
    kitchenPoints.finalPoints +
    sanitaryPoints.finalPoints +
    surfacePoints.total +
    energyPoints +
    outdoorPoints.total +
    wozPoints.cappedPoints

  return {
    kitchen: kitchenPoints,
    sanitary: sanitaryPoints,
    surface: surfacePoints,
    energy: energyPoints,
    outdoor: outdoorPoints,
    woz: wozPoints,
    totalPoints: Math.max(0, totalPoints) // Ensure non-negative
  }
}

/**
 * Section A: Calculate Kitchen Points
 */
function calculateKitchenPoints(formData: WWSFormData): {
  counterLength: number
  appliances: number
  total: number
  shared: boolean
  numSharers: number | null
  finalPoints: number
} {
  // Counter Length (Aanrechtblad) - including sink and hob
  let counterPoints = 0
  if (formData.kitchenCounterLength === '1-2m') {
    counterPoints = 4
  } else if (formData.kitchenCounterLength === '≥2m') {
    counterPoints = 7
  }
  // < 1m = 0 pts (default)

  // Built-in Appliances (Inbouwapparatuur)
  let appliancePoints = 0
  for (const appliance of formData.kitchenAppliances) {
    appliancePoints += appliance.points
  }

  const totalPoints = counterPoints + appliancePoints
  const isShared = formData.housingType === 'non-independent' && formData.kitchenShared === true
  const numSharers = isShared ? (formData.kitchenNumSharers || 1) : null

  // If shared, divide by number of sharers (including user)
  const finalPoints = isShared && numSharers ? totalPoints / numSharers : totalPoints

  return {
    counterLength: counterPoints,
    appliances: appliancePoints,
    total: totalPoints,
    shared: isShared,
    numSharers,
    finalPoints: Math.round(finalPoints * 100) / 100 // Round to 2 decimals
  }
}

/**
 * Section B: Calculate Sanitary Points
 */
function calculateSanitaryPoints(formData: WWSFormData): {
  toilet: number
  washing: number
  heating: number
  thermostatBonus: number
  total: number
  shared: boolean
  numSharers: number | null
  finalPoints: number
} {
  // Toilet points
  let toiletPoints = 0
  if (formData.toiletType === 'standard') {
    toiletPoints = 3.0
  } else if (formData.toiletType === 'hanging') {
    toiletPoints = 3.75
  } else if (formData.toiletType === 'sanibroyeur') {
    toiletPoints = 1.0
  }

  // If toilet inside bathroom: -1 pt penalty
  if (formData.toiletInBathroom && toiletPoints > 0) {
    toiletPoints -= 1.0
  }

  // Washing facilities
  let washingPoints = 0
  for (const facility of formData.sanitaryFacilities) {
    washingPoints += facility.points
  }

  // Heating (Verwarming)
  let heatingPoints = 0
  if (formData.heatingType === 'central' && formData.numHeatedRooms) {
    heatingPoints = 2.0 * formData.numHeatedRooms
  } else if (formData.heatingType === 'gas' && formData.numHeatedRooms) {
    heatingPoints = 1.0 * formData.numHeatedRooms
  }

  // Thermostat valves bonus
  const thermostatBonus = formData.thermostatValves && formData.numThermostatValves
    ? 0.25 * formData.numThermostatValves
    : 0

  const totalPoints = toiletPoints + washingPoints + heatingPoints + thermostatBonus
  const isShared = formData.housingType === 'non-independent' && formData.sanitaryShared === true
  const numSharers = isShared ? (formData.sanitaryNumSharers || 1) : null

  // If shared, divide by number of sharers (including user)
  const finalPoints = isShared && numSharers ? totalPoints / numSharers : totalPoints

  return {
    toilet: toiletPoints,
    washing: washingPoints,
    heating: heatingPoints,
    thermostatBonus,
    total: totalPoints,
    shared: isShared,
    numSharers,
    finalPoints: Math.round(finalPoints * 100) / 100 // Round to 2 decimals
  }
}

/**
 * Section C: Calculate Surface Area Points
 */
function calculateSurfacePoints(formData: WWSFormData): {
  private: number
  shared: number
  total: number
} {
  // Private Space: 1 pt per m²
  const privatePoints = (formData.privateSurfaceArea || 0) * 1

  // Shared Space (Type B only): (Shared m² / Number of Sharers) × 1 pt
  let sharedPoints = 0
  if (formData.housingType === 'non-independent' && formData.sharedSurfaceArea) {
    // For shared space, we need to know how many sharers
    // This should be captured in a separate field, but for now use kitchen/sanitary sharers as proxy
    // In practice, this would be the same number of households
    const numSharers = formData.kitchenNumSharers || formData.sanitaryNumSharers || 1
    sharedPoints = (formData.sharedSurfaceArea / numSharers) * 1
  }

  return {
    private: privatePoints,
    shared: sharedPoints,
    total: privatePoints + sharedPoints
  }
}

/**
 * Section D: Calculate Energy Label Points
 */
function calculateEnergyPoints(formData: WWSFormData): number {
  if (!formData.energyLabel || formData.energyLabel === 'unknown') {
    // Default to G (lowest) if unknown
    return 0
  }

  // Type B (Non-Independent): Usually simplified or based on Index. If unknown, assume 0.
  if (formData.housingType === 'non-independent') {
    // Simplified handling for shared housing
    // In practice, this may be 0 or a simplified calculation
    return 0
  }

  // Type A (Independent): Use 2025 energy label table
  const energyLabelPoints: Record<string, number> = {
    'A++++': 58, // Verify exact table
    'A+++': 52,
    'A++': 46,
    'A+': 40,
    'A': 34,
    'B': 28,
    'C': 22,
    'D': 12,
    'E': 0,
    'F': 0,
    'G': 0
  }

  return energyLabelPoints[formData.energyLabel] || 0
}

/**
 * Section E: Calculate Outdoor Space Points
 */
function calculateOutdoorPoints(formData: WWSFormData): {
  private: number
  shared: number
  total: number
} {
  // Private: 2 pts + (0.35 × m²)
  const privatePoints = formData.privateOutdoorSpace
    ? 2 + (0.35 * formData.privateOutdoorSpace)
    : 0

  // Shared: (2 pts + (0.35 × m²)) / Number of Sharers
  let sharedPoints = 0
  if (formData.housingType === 'non-independent' && formData.sharedOutdoorSpace && formData.outdoorNumSharers) {
    const basePoints = 2 + (0.35 * formData.sharedOutdoorSpace)
    sharedPoints = basePoints / formData.outdoorNumSharers
  }

  return {
    private: privatePoints,
    shared: sharedPoints,
    total: privatePoints + sharedPoints
  }
}

/**
 * Section F: Calculate WOZ Points
 */
function calculateWOZPoints(
  formData: WWSFormData,
  pointsWithoutWOZ: {
    kitchen: number
    sanitary: number
    surface: number
    energy: number
    outdoor: number
  }
): {
  rawPoints: number
  cappedPoints: number
  applied: boolean
} {
  // Type B (Non-Independent): Do NOT use independent WOZ formula
  if (formData.housingType === 'non-independent') {
    return {
      rawPoints: 0,
      cappedPoints: 0,
      applied: false
    }
  }

  // Type A (Independent): Calculate WOZ points
  if (!formData.wozValue || formData.wozValue <= 0) {
    return {
      rawPoints: 0,
      cappedPoints: 0,
      applied: true
    }
  }

  // Formula: 1 pt per €14,146 of WOZ value (approximate, verify 2025 exact rate)
  const WOZ_RATE = 14146 // € per point
  const rawPoints = formData.wozValue / WOZ_RATE

  // CAP: WOZ points cannot exceed 33% of total points (unless rent > €879.66)
  const totalWithoutWOZ = 
    pointsWithoutWOZ.kitchen +
    pointsWithoutWOZ.sanitary +
    pointsWithoutWOZ.surface +
    pointsWithoutWOZ.energy +
    pointsWithoutWOZ.outdoor

  const maxWOZPoints = totalWithoutWOZ * 0.33
  const cappedPoints = Math.min(rawPoints, maxWOZPoints)

  // Exception: If rent > €879.66, cap may not apply (verify exact rule)
  // For now, we apply the cap regardless

  return {
    rawPoints,
    cappedPoints: Math.round(cappedPoints * 100) / 100,
    applied: true
  }
}

/**
 * Calculate complete WWS result including rent status
 */
export function calculateWWSResult(formData: WWSFormData): WWSResult {
  const points = calculateWWSPoints(formData)
  const { maxRent, category } = calculateMaxRent(points.totalPoints)

  const currentRent = formData.currentRent || null
  let isOverpaying = false
  let overpaymentAmount: number | null = null

  if (currentRent !== null && maxRent !== Infinity && currentRent > maxRent) {
    isOverpaying = true
    overpaymentAmount = currentRent - maxRent
  }

  return {
    points,
    maxRent: maxRent === Infinity ? 0 : maxRent,
    category,
    currentRent,
    isOverpaying,
    overpaymentAmount
  }
}



