/**
 * Zod schemas for webhook payload validation
 * Ensures webhook payloads match expected formats before processing
 */

import { z } from 'zod'

// Persona webhook schema
export const PersonaWebhookSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
      status: z.enum(['completed', 'failed', 'expired', 'pending']),
      reason: z.string().optional(),
    }).optional(),
  }),
  type: z.string().optional(),
})

// Veriff webhook schema
export const VeriffWebhookSchema = z.object({
  verification: z.object({
    id: z.string(),
    status: z.enum(['success', 'failed', 'abandoned', 'declined']),
    reason: z.string().optional(),
    code: z.string().optional(),
  }),
  type: z.string().optional(),
})

// Onfido webhook schema
export const OnfidoWebhookSchema = z.object({
  payload: z.object({
    resource_id: z.string(),
    action: z.enum(['clear', 'consider', 'unidentified']),
    reason: z.string().optional(),
  }),
  type: z.string().optional(),
})

export type PersonaWebhookPayload = z.infer<typeof PersonaWebhookSchema>
export type VeriffWebhookPayload = z.infer<typeof VeriffWebhookSchema>
export type OnfidoWebhookPayload = z.infer<typeof OnfidoWebhookSchema>

