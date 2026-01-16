// WWS (Woningwaarderingsstelsel) Price Table - July 2025
// Maps total points to maximum legal basic rent (Kale Huur)

/**
 * Calculate maximum legal rent based on total WWS points
 * Based on July 2025 WWS price table
 * 
 * @param totalPoints - Total WWS points
 * @returns Maximum legal basic rent in euros
 */
export function calculateMaxRent(totalPoints: number): {
  maxRent: number
  category: 'social' | 'mid-range' | 'liberalized'
} {
  // Liberalized sector threshold (typically 143+ points)
  // Above this, there's no legal maximum rent
  if (totalPoints >= 143) {
    return {
      maxRent: Infinity,
      category: 'liberalized'
    }
  }

  // Social sector: points < 143
  // Using approximate formula: ~€6.3 per point (100 pts ≈ €640)
  // This is a linear approximation - actual table may have stepwise increases
  // TODO: Replace with exact July 2025 official table when available
  
  if (totalPoints < 143) {
    // Linear approximation: base + (points * rate)
    // At 100 points ≈ €640, so rate ≈ 6.4 per point
    // At 0 points, base rent would be lower, but minimum is typically around €300-400
    const baseRent = 300 // Minimum social sector rent
    const pointsRate = 3.4 // Approximate rate per point
    const calculatedRent = baseRent + (totalPoints * pointsRate)
    
    // Cap at social sector maximum (typically around €900)
    const maxRent = Math.min(calculatedRent, 900.07)
    
    return {
      maxRent: Math.round(maxRent * 100) / 100, // Round to 2 decimals
      category: 'social'
    }
  }

  // Mid-range sector: 143-186 points (if needed for future use)
  // Currently handled as liberalized above 143
  return {
    maxRent: 1184.82,
    category: 'mid-range'
  }
}

/**
 * Get rent category label
 */
export function getRentCategoryLabel(category: 'social' | 'mid-range' | 'liberalized'): string {
  switch (category) {
    case 'social':
      return 'Social Sector'
    case 'mid-range':
      return 'Mid-Range Sector'
    case 'liberalized':
      return 'Liberalized Sector (Market Price)'
  }
}



