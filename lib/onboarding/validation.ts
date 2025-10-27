import { z } from 'zod'

// Define schemas for each question_key based on the database schema
export const questionSchemas = {
  // Basics section
  degree_level: z.enum(['bachelor', 'master', 'phd', 'exchange', 'other']),
  program: z.string().min(1, 'Program is required'),
  campus: z.string().min(1, 'Campus is required'),
  move_in_window: z.enum(['immediate', 'within_month', 'within_3_months', 'flexible']),
  
  // Logistics section
  budget_min: z.number().min(0, 'Budget must be positive'),
  budget_max: z.number().min(0, 'Budget must be positive'),
  commute_max: z.enum(['15', '30', '45', '60', '90']),
  lease_length: z.enum(['3_months', '6_months', '12_months', 'flexible']),
  room_type: z.array(z.enum(['single', 'shared', 'studio', 'flexible'])).min(1, 'At least one room type must be selected'),
  
  // Lifestyle section
  sleep_start: z.number().min(20).max(32, 'Sleep start must be between 20 and 32'),
  sleep_end: z.number().min(6).max(12, 'Sleep end must be between 6 and 12'),
  study_intensity: z.number().min(1).max(10, 'Study intensity must be between 1 and 10'),
  cleanliness_room: z.number().min(1).max(10, 'Cleanliness must be between 1 and 10'),
  cleanliness_kitchen: z.number().min(1).max(10, 'Cleanliness must be between 1 and 10'),
  noise_tolerance: z.number().min(1).max(10, 'Noise tolerance must be between 1 and 10'),
  guests_frequency: z.number().min(1).max(10, 'Guest frequency must be between 1 and 10'),
  parties_frequency: z.number().min(1).max(10, 'Party frequency must be between 1 and 10'),
  chores_preference: z.number().min(1).max(10, 'Chores preference must be between 1 and 10'),
  alcohol_at_home: z.number().min(1).max(10, 'Alcohol preference must be between 1 and 10'),
  pets_tolerance: z.number().min(1).max(10, 'Pets tolerance must be between 1 and 10'),
  
  // Social section
  social_level: z.number().min(1).max(10, 'Social level must be between 1 and 10'),
  food_sharing: z.number().min(1).max(10, 'Food sharing must be between 1 and 10'),
  utensils_sharing: z.number().min(1).max(10, 'Utensils sharing must be between 1 and 10'),
  
  // Personality section (Big Five)
  extraversion: z.number().min(1).max(10, 'Extraversion must be between 1 and 10'),
  agreeableness: z.number().min(1).max(10, 'Agreeableness must be between 1 and 10'),
  conscientiousness: z.number().min(1).max(10, 'Conscientiousness must be between 1 and 10'),
  neuroticism: z.number().min(1).max(10, 'Neuroticism must be between 1 and 10'),
  openness: z.number().min(1).max(10, 'Openness must be between 1 and 10'),
  
  // Communication section
  conflict_style: z.number().min(1).max(10, 'Conflict style must be between 1 and 10'),
  communication_preference: z.number().min(1).max(10, 'Communication preference must be between 1 and 10'),
  
  // Languages
  languages_daily: z.array(z.enum(['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'pl', 'other'])).min(1, 'At least one language must be selected'),
  
  // Deal breakers
  smoking: z.boolean(),
  pets_allowed: z.boolean(),
  parties_max: z.number().min(0).max(10, 'Parties max must be between 0 and 10'),
  guests_max: z.number().min(0).max(10, 'Guests max must be between 0 and 10'),
} as const

// Required fields for complete onboarding
export const requiredFields = [
  // Basics
  'degree_level',
  'program',
  'campus',
  'move_in_window',
  
  // Logistics
  'budget_min',
  'budget_max',
  'commute_max',
  'lease_length',
  'room_type',
  
  // Lifestyle
  'sleep_start',
  'sleep_end',
  'study_intensity',
  'cleanliness_room',
  'cleanliness_kitchen',
  'noise_tolerance',
  'guests_frequency',
  'parties_frequency',
  'chores_preference',
  'alcohol_at_home',
  'pets_tolerance',
  
  // Social
  'social_level',
  'food_sharing',
  'utensils_sharing',
  
  // Personality
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'neuroticism',
  'openness',
  
  // Communication
  'conflict_style',
  'communication_preference',
  
  // Languages
  'languages_daily',
  
  // Deal breakers
  'smoking',
  'pets_allowed',
  'parties_max',
  'guests_max',
] as const

// Validation function for individual fields
export function validateField(key: string, value: any): { valid: boolean; error?: string } {
  const schema = questionSchemas[key as keyof typeof questionSchemas]
  
  if (!schema) {
    return { valid: false, error: `Unknown field: ${key}` }
  }
  
  try {
    schema.parse(value)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { valid: false, error: 'Validation failed' }
  }
}

// Validation function for complete form data
export function validateFormData(data: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  
  // Check all required fields are present
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = `${field} is required`
    }
  }
  
  // Validate each field
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      const validation = validateField(key, value)
      if (!validation.valid && validation.error) {
        errors[key] = validation.error
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Check if user has complete responses
export function hasCompleteResponses(data: Record<string, any>): boolean {
  return requiredFields.every(field => {
    const value = data[field]
    return value !== undefined && value !== null && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true)
  })
}

// Transform form data to match database expectations
export function transformFormData(data: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      // Most fields can be passed through as-is since UI now matches schema
      transformed[key] = value
    }
  }
  
  return transformed
}

export async function checkQuestionnaireCompletion(userId: string): Promise<{
  isComplete: boolean;
  missingKeys: string[];
  responseCount: number;
  hasSubmission: boolean;
}> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Check if submission exists - this is the primary source of truth
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const hasSubmission = !!submission;

  // Get all responses for this user (for progress tracking)
  const { data: responses } = await supabase
    .from('responses')
    .select('question_key')
    .eq('user_id', userId);

  const responseCount = responses?.length || 0;
  const responseKeys = new Set(responses?.map(r => r.question_key) || []);

  // Check which required keys are missing (for debugging/analytics)
  const requiredKeys = Object.keys(questionSchemas);
  const missingKeys = requiredKeys.filter(key => !responseKeys.has(key));

  // Completion is primarily based on submission existence
  // If user has submission, they are considered complete regardless of response count
  // This handles legacy users who may have fewer responses due to schema changes
  const isComplete = hasSubmission;

  return {
    isComplete,
    missingKeys,
    responseCount,
    hasSubmission
  };
}

// Type for validated form data
export type ValidatedFormData = {
  [K in keyof typeof questionSchemas]: z.infer<typeof questionSchemas[K]>
}
