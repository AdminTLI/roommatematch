import { describe, it, expect } from 'vitest'
import { validateField, validateFormData, hasCompleteResponses } from '@/lib/onboarding/validation'

describe('Onboarding Validation', () => {
  describe('validateField', () => {
    it('should validate budget_min correctly', () => {
      expect(validateField('budget_min', 500)).toEqual({ valid: true })
      expect(validateField('budget_min', -100)).toEqual({ 
        valid: false, 
        error: 'Budget must be positive' 
      })
      expect(validateField('budget_min', 'invalid')).toEqual({ 
        valid: false, 
        error: 'Expected number, received string' 
      })
    })

    it('should validate sleep_start correctly', () => {
      expect(validateField('sleep_start', 22)).toEqual({ valid: true })
      expect(validateField('sleep_start', 15)).toEqual({ 
        valid: false, 
        error: 'Number must be greater than or equal to 20' 
      })
      expect(validateField('sleep_start', 35)).toEqual({ 
        valid: false, 
        error: 'Sleep start must be between 20 and 32' 
      })
    })

    it('should validate languages_daily correctly', () => {
      expect(validateField('languages_daily', ['en', 'nl'])).toEqual({ valid: true })
      expect(validateField('languages_daily', [])).toEqual({ 
        valid: false, 
        error: 'At least one language must be selected' 
      })
      expect(validateField('languages_daily', ['invalid'])).toEqual({ 
        valid: false, 
        error: "Invalid enum value. Expected 'en' | 'nl' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'tr' | 'pl' | 'other', received 'invalid'" 
      })
    })

    it('should validate boolean fields correctly', () => {
      expect(validateField('smoking', true)).toEqual({ valid: true })
      expect(validateField('smoking', false)).toEqual({ valid: true })
      expect(validateField('smoking', 'true')).toEqual({ 
        valid: false, 
        error: 'Expected boolean, received string' 
      })
    })

    it('should validate slider fields correctly', () => {
      expect(validateField('social_level', 5)).toEqual({ valid: true })
      expect(validateField('social_level', 0)).toEqual({ 
        valid: false, 
        error: 'Number must be greater than or equal to 1' 
      })
      expect(validateField('social_level', 11)).toEqual({ 
        valid: false, 
        error: 'Social level must be between 1 and 10' 
      })
    })

    it('should handle unknown fields', () => {
      expect(validateField('unknown_field', 'value')).toEqual({ 
        valid: false, 
        error: 'Unknown field: unknown_field' 
      })
    })
  })

  describe('validateFormData', () => {
    it('should validate complete form data', () => {
      const completeData = {
        degree_level: 'master',
        program: 'Computer Science',
        campus: 'Science Park',
        move_in_window: 'immediate',
        budget_min: 500,
        budget_max: 800,
        commute_max: '30',
        lease_length: '12_months',
        room_type: ['single'],
        sleep_start: 22,
        sleep_end: 8,
        study_intensity: 7,
        cleanliness_room: 8,
        cleanliness_kitchen: 7,
        noise_tolerance: 6,
        guests_frequency: 5,
        parties_frequency: 3,
        chores_preference: 6,
        alcohol_at_home: 4,
        pets_tolerance: 7,
        social_level: 6,
        food_sharing: 5,
        utensils_sharing: 6,
        extraversion: 7,
        agreeableness: 8,
        conscientiousness: 9,
        neuroticism: 3,
        openness: 8,
        conflict_style: 6,
        communication_preference: 7,
        languages_daily: ['en', 'nl'],
        smoking: false,
        pets_allowed: true,
        parties_max: 5,
        guests_max: 6,
      }

      const result = validateFormData(completeData)
      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should catch missing required fields', () => {
      const incompleteData = {
        degree_level: 'master',
        // Missing other required fields
      }

      const result = validateFormData(incompleteData)
      expect(result.valid).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })

    it('should catch invalid field values', () => {
      const invalidData = {
        degree_level: 'invalid_degree',
        budget_min: -100,
        sleep_start: 15,
        languages_daily: [],
        smoking: 'yes', // should be boolean
      }

      const result = validateFormData(invalidData)
      expect(result.valid).toBe(false)
      expect(result.errors.degree_level).toContain('Invalid enum value')
      expect(result.errors.budget_min).toContain('Budget must be positive')
      expect(result.errors.sleep_start).toContain('Number must be greater than or equal to 20')
      expect(result.errors.languages_daily).toContain('At least one language must be selected')
      expect(result.errors.smoking).toContain('Expected boolean')
    })
  })

  describe('hasCompleteResponses', () => {
    it('should return true for complete responses', () => {
      const completeData = {
        degree_level: 'master',
        program: 'Computer Science',
        campus: 'Science Park',
        move_in_window: 'immediate',
        budget_min: 500,
        budget_max: 800,
        commute_max: '30',
        lease_length: '12_months',
        room_type: ['single'],
        sleep_start: 22,
        sleep_end: 8,
        study_intensity: 7,
        cleanliness_room: 8,
        cleanliness_kitchen: 7,
        noise_tolerance: 6,
        guests_frequency: 5,
        parties_frequency: 3,
        chores_preference: 6,
        alcohol_at_home: 4,
        pets_tolerance: 7,
        social_level: 6,
        food_sharing: 5,
        utensils_sharing: 6,
        extraversion: 7,
        agreeableness: 8,
        conscientiousness: 9,
        neuroticism: 3,
        openness: 8,
        conflict_style: 6,
        communication_preference: 7,
        languages_daily: ['en', 'nl'],
        smoking: false,
        pets_allowed: true,
        parties_max: 5,
        guests_max: 6,
      }

      expect(hasCompleteResponses(completeData)).toBe(true)
    })

    it('should return false for incomplete responses', () => {
      const incompleteData = {
        degree_level: 'master',
        program: 'Computer Science',
        // Missing other required fields
      }

      expect(hasCompleteResponses(incompleteData)).toBe(false)
    })

    it('should return false for empty arrays', () => {
      const dataWithEmptyArray = {
        degree_level: 'master',
        program: 'Computer Science',
        campus: 'Science Park',
        move_in_window: 'immediate',
        budget_min: 500,
        budget_max: 800,
        commute_max: '30',
        lease_length: '12_months',
        room_type: [], // Empty array
        sleep_start: 22,
        sleep_end: 8,
        study_intensity: 7,
        cleanliness_room: 8,
        cleanliness_kitchen: 7,
        noise_tolerance: 6,
        guests_frequency: 5,
        parties_frequency: 3,
        chores_preference: 6,
        alcohol_at_home: 4,
        pets_tolerance: 7,
        social_level: 6,
        food_sharing: 5,
        utensils_sharing: 6,
        extraversion: 7,
        agreeableness: 8,
        conscientiousness: 9,
        neuroticism: 3,
        openness: 8,
        conflict_style: 6,
        communication_preference: 7,
        languages_daily: ['en', 'nl'],
        smoking: false,
        pets_allowed: true,
        parties_max: 5,
        guests_max: 6,
      }

      expect(hasCompleteResponses(dataWithEmptyArray)).toBe(false)
    })

    it('should return false for null/undefined values', () => {
      const dataWithNulls = {
        degree_level: 'master',
        program: 'Computer Science',
        campus: 'Science Park',
        move_in_window: 'immediate',
        budget_min: 500,
        budget_max: 800,
        commute_max: '30',
        lease_length: '12_months',
        room_type: ['single'],
        sleep_start: 22,
        sleep_end: 8,
        study_intensity: 7,
        cleanliness_room: 8,
        cleanliness_kitchen: 7,
        noise_tolerance: 6,
        guests_frequency: 5,
        parties_frequency: 3,
        chores_preference: 6,
        alcohol_at_home: 4,
        pets_tolerance: 7,
        social_level: 6,
        food_sharing: 5,
        utensils_sharing: 6,
        extraversion: 7,
        agreeableness: 8,
        conscientiousness: 9,
        neuroticism: 3,
        openness: 8,
        conflict_style: 6,
        communication_preference: 7,
        languages_daily: ['en', 'nl'],
        smoking: false,
        pets_allowed: true,
        parties_max: 5,
        guests_max: 6,
        // Missing some required fields (they will be undefined)
      }

      expect(hasCompleteResponses(dataWithNulls)).toBe(false)
    })
  })
})
