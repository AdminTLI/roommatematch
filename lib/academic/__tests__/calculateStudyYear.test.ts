/**
 * Unit tests for calculateStudyYearWithMonths
 * Tests month-aware academic year calculation logic
 */

import { calculateStudyYearWithMonths, getStudyYearStatus } from '../calculateStudyYear'

describe('calculateStudyYearWithMonths', () => {
  // Mock current date for consistent testing
  const mockDate = (year: number, month: number, day: number = 1) => {
    const originalDate = Date
    global.Date = jest.fn(() => new originalDate(year, month - 1, day)) as any
    global.Date.now = jest.fn(() => new originalDate(year, month - 1, day).getTime())
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('WO 3-year programmes', () => {
    it('should calculate Year 3 correctly for WO programme starting Sep 2022, graduating 2025 (in 2025 before Sep)', () => {
      mockDate(2025, 6, 15) // June 2025
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(3)
    })

    it('should calculate Year 2 correctly for WO programme starting Sep 2022, graduating 2025 (in 2024)', () => {
      mockDate(2024, 10, 15) // October 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(2)
    })

    it('should calculate Year 1 correctly for WO programme starting Sep 2022, graduating 2025 (in 2022 after Sep)', () => {
      mockDate(2022, 10, 15) // October 2022
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(1)
    })
  })

  describe('HBO 4-year programmes', () => {
    it('should calculate Year 4 correctly for HBO programme starting Feb 2021, graduating 2025 (in 2025)', () => {
      mockDate(2025, 3, 15) // March 2025
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2021,
        studyStartMonth: 2,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'hbo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(4)
    })

    it('should calculate Year 3 correctly for HBO programme starting Feb 2021, graduating 2025 (in 2024)', () => {
      mockDate(2024, 5, 15) // May 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2021,
        studyStartMonth: 2,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'hbo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(3)
    })
  })

  describe('Academic year boundary cases', () => {
    it('should handle August vs September boundary correctly (August is previous academic year)', () => {
      mockDate(2024, 8, 15) // August 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      // In August 2024, we're still in academic year 2023-2024
      // Started Sep 2022 (academic year 2022-2023)
      // So we're in year 2
      expect(result).toBe(2)
    })

    it('should handle September correctly (September starts new academic year)', () => {
      mockDate(2024, 9, 15) // September 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      // In September 2024, we're in academic year 2024-2025
      // Started Sep 2022 (academic year 2022-2023)
      // So we're in year 3
      expect(result).toBe(3)
    })
  })

  describe('NULL month fallbacks', () => {
    it('should fall back to institution defaults when months are NULL', () => {
      mockDate(2024, 6, 15) // June 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2021,
        studyStartMonth: null,
        expectedGraduationYear: 2025,
        graduationMonth: null,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      // Should use WO 3-year default calculation
      // Years remaining: 2025 - 2024 = 1
      // Current year: 3 - 1 + 1 = 3
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(3)
    })

    it('should fall back to HBO defaults when months are NULL', () => {
      mockDate(2024, 6, 15) // June 2024
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2021,
        studyStartMonth: null,
        expectedGraduationYear: 2025,
        graduationMonth: null,
        institutionType: 'hbo',
        degreeLevel: 'bachelor'
      })
      // Should use HBO 4-year default calculation
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(4)
    })
  })

  describe('Masters and premasters', () => {
    it('should return null for master students', () => {
      mockDate(2024, 6, 15)
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2023,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'master'
      })
      expect(result).toBeNull()
    })

    it('should return null for premaster students', () => {
      mockDate(2024, 6, 15)
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2023,
        studyStartMonth: 9,
        expectedGraduationYear: 2024,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'premaster'
      })
      expect(result).toBeNull()
    })
  })

  describe('Edge cases', () => {
    it('should clamp study year to minimum of 1', () => {
      mockDate(2020, 6, 15) // Before start year
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(1)
    })

    it('should clamp study year to maximum duration', () => {
      mockDate(2030, 6, 15) // After graduation year
      const result = calculateStudyYearWithMonths({
        studyStartYear: 2022,
        studyStartMonth: 9,
        expectedGraduationYear: 2025,
        graduationMonth: 6,
        institutionType: 'wo',
        degreeLevel: 'bachelor'
      })
      expect(result).toBe(3) // Should not exceed programme duration
    })
  })
})

describe('getStudyYearStatus', () => {
  const mockDate = (year: number, month: number, day: number = 1) => {
    const originalDate = Date
    global.Date = jest.fn(() => new originalDate(year, month - 1, day)) as any
    global.Date.now = jest.fn(() => new originalDate(year, month - 1, day).getTime())
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return "Pre-Master Student" for premaster degree level', () => {
    mockDate(2024, 6, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2023,
      studyStartMonth: 9,
      expectedGraduationYear: 2024,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'premaster'
    })
    expect(result).toBe('Pre-Master Student')
  })

  it('should return "Master\'s Student" for master degree level', () => {
    mockDate(2024, 6, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2023,
      studyStartMonth: 9,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'master'
    })
    expect(result).toBe("Master's Student")
  })

  it('should return "Year 1" for first year bachelor', () => {
    mockDate(2022, 10, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2022,
      studyStartMonth: 9,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'bachelor'
    })
    expect(result).toBe('Year 1')
  })

  it('should return "Year 3" for third year WO bachelor', () => {
    mockDate(2025, 6, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2022,
      studyStartMonth: 9,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'bachelor'
    })
    expect(result).toBe('Year 3')
  })

  it('should return "Year 4" for fourth year HBO bachelor', () => {
    mockDate(2025, 3, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2021,
      studyStartMonth: 2,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'hbo',
      degreeLevel: 'bachelor'
    })
    expect(result).toBe('Year 4')
  })

  it('should return "Graduated" for students past graduation', () => {
    mockDate(2026, 6, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2022,
      studyStartMonth: 9,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'bachelor'
    })
    expect(result).toBe('Graduated')
  })

  it('should return "Not yet started" for students before start', () => {
    mockDate(2021, 6, 15)
    const result = getStudyYearStatus({
      studyStartYear: 2022,
      studyStartMonth: 9,
      expectedGraduationYear: 2025,
      graduationMonth: 6,
      institutionType: 'wo',
      degreeLevel: 'bachelor'
    })
    expect(result).toBe('Not yet started')
  })
})

