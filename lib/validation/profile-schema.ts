import { z } from 'zod'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'
import { INTERESTS_LIST } from '@/lib/constants/interests'
import { getHousingStatusKeys } from '@/lib/constants/housing-status'
import { USER_TYPES } from '@/types/profile'

/**
 * Schema for onboarding path selection (required before main flow).
 * user_type must be one of 'student' | 'professional'.
 */
export const pathSelectionSchema = z.object({
  user_type: z.enum([USER_TYPES[0], USER_TYPES[1]], {
    required_error: 'Please select whether you are a student or a young professional.',
    invalid_type_error: 'Invalid selection.',
  }),
})

export type PathSelectionInput = z.infer<typeof pathSelectionSchema>

/**
 * Validation schema for profile updates from Settings.
 * Personal identifiers (name, phone, email) are not accepted here; they are updated only via support.
 */
export const profileUpdateSchema = z.object({
  user_type: z.enum([USER_TYPES[0], USER_TYPES[1]]).optional().nullable(),

  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  interests: z.array(z.string())
    .min(3, 'Please select at least 3 interests')
    .max(10, 'Maximum 10 interests allowed')
    .refine(
      (interests) => {
        // Ensure all interests are from the predefined list
        return interests.every(interest => INTERESTS_LIST.includes(interest as any))
      },
      { message: 'All interests must be from the predefined list' }
    )
    .optional()
    .default([]),
  
  housingStatus: z.array(z.enum(['seeking_room', 'offering_room', 'team_up', 'exploring']))
    .max(4, 'Maximum 4 housing statuses allowed (one of each)')
    .refine(
      (statuses) => {
        // Ensure no duplicates
        return new Set(statuses).size === statuses.length
      },
      { message: 'Duplicate housing statuses are not allowed' }
    )
    .optional()
    .default([]),

  // Optional preferred cities (also used as a soft preference in matching)
  preferredCities: z.array(z.string().min(1, 'City name cannot be empty'))
    .max(5, 'You can select up to 5 preferred cities')
    .optional()
    .default([]),
})


export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// Re-export for convenience
export { getUserFriendlyError }

