import { z } from 'zod'

const likert = z.number().int().min(1).max(5)

/** Soft ranking prefs. Mirrors student onboarding lifestyle signals. */
export const listingLifestylePrefsSchema = z
  .object({
    cleanliness: likert.optional(),
    quiet_hours_importance: likert.optional(),
    guests_frequency: likert.optional(),
    overnight_guests: likert.optional(),
    parties_frequency: likert.optional(),
    social_level: likert.optional(),
    chores_expectation: likert.optional(),
    preferred_schedule: z.enum(['early', 'flexible', 'late']).optional(),
    study_friendly: z.boolean().optional(),
  })
  .strict()

/** Hard gates used by scoreGroupAgainstListing. */
export const listingDealbreakersSchema = z
  .object({
    no_smoking: z.boolean().optional(),
    no_pets: z.boolean().optional(),
    no_airbnb: z.boolean().optional(),
    brp_required: z.boolean().optional(),
    min_stay_months: z.number().int().min(1).optional(),
    max_group_size: z.number().int().min(1).max(20).optional(),
  })
  .strict()
