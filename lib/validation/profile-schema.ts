import { z } from 'zod'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'
import { INTERESTS_LIST } from '@/lib/constants/interests'
import { getHousingStatusKeys } from '@/lib/constants/housing-status'

/**
 * Validation schema for profile updates
 */
export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .trim(),
  
  lastName: z.string()
    .max(100, 'Last name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number (international format)'
    )
    .optional()
    .or(z.literal('')),
  
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
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// Re-export for convenience
export { getUserFriendlyError }

