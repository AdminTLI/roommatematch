import { z } from 'zod'
import { LINKEDIN_INDUSTRY_SET } from '@/lib/constants/linkedin-industries'

/** Stored on app_events.props for professional welcome demographics */
export const PROFESSIONAL_EMPLOYMENT_STATUSES = [
  'full_time',
  'part_time',
  'freelance_contractor',
  'looking_for_work',
] as const

export type ProfessionalEmploymentStatus = (typeof PROFESSIONAL_EMPLOYMENT_STATUSES)[number]

/** Aligns with professional-context `wfh_status` values */
export const PROFESSIONAL_WORK_MODELS = ['fully_remote', 'hybrid', 'fully_office'] as const

export type ProfessionalWorkModel = (typeof PROFESSIONAL_WORK_MODELS)[number]

export const professionalWelcomeDemographicsSchema = z.object({
  employment_status: z.enum(PROFESSIONAL_EMPLOYMENT_STATUSES),
  work_model: z.enum(PROFESSIONAL_WORK_MODELS),
  industry: z
    .string()
    .optional()
    .refine((val) => val === undefined || LINKEDIN_INDUSTRY_SET.has(val), {
      message: 'Please select a valid industry from the list.',
    }),
})

export type ProfessionalWelcomeDemographics = z.infer<typeof professionalWelcomeDemographicsSchema>
