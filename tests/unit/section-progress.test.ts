import { describe, it, expect } from 'vitest'
import { calculateSectionProgress } from '@/lib/onboarding/sections'

describe('Section Progress Calculation', () => {
  it('should calculate completed sections correctly', () => {
    const result = calculateSectionProgress([])
    expect(result.completedSections).toBeGreaterThan(0)
    expect(result.totalSections).toBeGreaterThan(0)
  })

  it('should handle partially completed sections', () => {
    const missingKeys = ['campus', 'budget_min']
    const result = calculateSectionProgress(missingKeys)
    
    // Basics section should be incomplete (missing campus)
    expect(result.sectionDetails.basics.completed).toBeLessThan(result.sectionDetails.basics.total)
  })
})
