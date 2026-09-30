/**
 * Persona API client helpers for inquiry creation, fetch, and account tagging.
 */

import { safeLogger } from '@/lib/utils/logger'
import {
  extractPersonaDob,
  extractPersonaIssuingCountry,
  extractPersonaName,
  type PersonaIdentity,
} from '@/lib/verification/persona-decision'

export type PersonaInquiryCreateInput = {
  userId: string
  firstName: string
  lastName: string
  birthdate: string
  templateId?: string
}

export type PersonaInquirySession = {
  sessionId: string
  clientToken?: string
}

function getPersonaConfig() {
  const apiKey = process.env.PERSONA_API_KEY || ''
  const apiUrl = process.env.PERSONA_API_URL || 'https://withpersona.com/api/v1'
  const templateId =
    process.env.PERSONA_TEMPLATE_ID || process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID || ''
  return { apiKey, apiUrl, templateId }
}

export async function createPersonaInquiry(
  input: PersonaInquiryCreateInput
): Promise<PersonaInquirySession | null> {
  const { apiKey, apiUrl, templateId } = getPersonaConfig()
  if (!apiKey) {
    safeLogger.error('[Persona] API key missing; cannot create inquiry')
    return null
  }

  const resolvedTemplate = input.templateId || templateId
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const attributes: Record<string, unknown> = {
    'reference-id': input.userId,
    reference_id: input.userId,
    'callback-url': `${appUrl}/api/verification/provider-webhook?provider=persona`,
    fields: {
      'name-first': input.firstName,
      'name-last': input.lastName,
      birthdate: input.birthdate,
    },
  }

  if (resolvedTemplate) {
    attributes['inquiry-template-id'] = resolvedTemplate
  }

  try {
    const response = await fetch(`${apiUrl}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Persona-Version': '2023-01-05',
      },
      body: JSON.stringify({
        data: {
          type: 'inquiry',
          attributes,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      safeLogger.error('[Persona] Inquiry creation failed', {
        status: response.status,
        body,
      })
      return null
    }

    const data = await response.json()
    return {
      sessionId: data.data.id,
      clientToken: data.data.attributes?.['session-token'] || data.data.attributes?.session_token,
    }
  } catch (error) {
    safeLogger.error('[Persona] Inquiry creation error', error)
    return null
  }
}

export async function fetchPersonaInquiry(inquiryId: string): Promise<unknown | null> {
  const { apiKey, apiUrl } = getPersonaConfig()
  if (!apiKey) {
    safeLogger.warn('[Persona] API key missing; cannot fetch inquiry')
    return null
  }

  try {
    const response = await fetch(`${apiUrl}/inquiries/${inquiryId}?include=account`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Persona-Version': '2023-01-05',
      },
    })

    if (!response.ok) {
      const body = await response.text()
      safeLogger.warn('[Persona] Failed to fetch inquiry', {
        inquiryId,
        status: response.status,
        body,
      })
      return null
    }

    return await response.json()
  } catch (error) {
    safeLogger.error('[Persona] Inquiry fetch error', { inquiryId, error })
    return null
  }
}

export async function fetchPersonaIdentity(inquiryId: string): Promise<PersonaIdentity> {
  const data = await fetchPersonaInquiry(inquiryId)
  if (!data) return {}

  const name = extractPersonaName(data)
  return {
    firstName: name.firstName,
    lastName: name.lastName,
    dateOfBirth: extractPersonaDob(data),
    issuingCountry: extractPersonaIssuingCountry(data),
  }
}

/**
 * Tag a Persona Account as banned via reference ID lookup.
 * Best-effort — failures are logged, never thrown to the caller.
 */
export async function tagPersonaAccountBanned(referenceId: string): Promise<void> {
  const { apiKey, apiUrl } = getPersonaConfig()
  if (!apiKey || !referenceId) return

  try {
    // Find account by reference-id
    const search = await fetch(
      `${apiUrl}/accounts?filter[reference-id]=${encodeURIComponent(referenceId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Persona-Version': '2023-01-05',
        },
      }
    )

    if (!search.ok) {
      safeLogger.warn('[Persona] Account lookup for ban tag failed', {
        referenceId,
        status: search.status,
      })
      return
    }

    const searchData = await search.json()
    const accountId = searchData?.data?.[0]?.id
    if (!accountId) {
      safeLogger.info('[Persona] No account found to tag as banned', { referenceId })
      return
    }

    // Add tag via account update (tags field)
    const update = await fetch(`${apiUrl}/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Persona-Version': '2023-01-05',
      },
      body: JSON.stringify({
        data: {
          type: 'account',
          id: accountId,
          attributes: {
            tags: ['banned'],
          },
        },
      }),
    })

    if (!update.ok) {
      const body = await update.text()
      safeLogger.warn('[Persona] Failed to tag account banned', {
        accountId,
        status: update.status,
        body,
      })
      return
    }

    safeLogger.info('[Persona] Account tagged banned', { accountId, referenceId })
  } catch (error) {
    safeLogger.error('[Persona] tagPersonaAccountBanned error', { referenceId, error })
  }
}

/**
 * Remove banned tag from Persona Account (on unban). Best-effort.
 */
export async function untagPersonaAccountBanned(referenceId: string): Promise<void> {
  const { apiKey, apiUrl } = getPersonaConfig()
  if (!apiKey || !referenceId) return

  try {
    const search = await fetch(
      `${apiUrl}/accounts?filter[reference-id]=${encodeURIComponent(referenceId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Persona-Version': '2023-01-05',
        },
      }
    )
    if (!search.ok) return

    const searchData = await search.json()
    const accountId = searchData?.data?.[0]?.id
    if (!accountId) return

    const existingTags: string[] = searchData?.data?.[0]?.attributes?.tags || []
    const nextTags = existingTags.filter((t) => t !== 'banned')

    await fetch(`${apiUrl}/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Persona-Version': '2023-01-05',
      },
      body: JSON.stringify({
        data: {
          type: 'account',
          id: accountId,
          attributes: { tags: nextTags },
        },
      }),
    })
  } catch (error) {
    safeLogger.error('[Persona] untagPersonaAccountBanned error', { referenceId, error })
  }
}
