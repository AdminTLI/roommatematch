import type { SupabaseClient } from '@supabase/supabase-js'
import { DUTCH_LAW_RETENTION } from '@/lib/privacy/retention-policies'
import { safeLogger } from '@/lib/utils/logger'

/** Successful KYC rows use this value. Do not confuse with profiles.verification_status='verified'. */
export const KYC_APPROVED_STATUS = 'approved' as const

export type VerificationRetentionRow = {
  user_id: string
  retention_expires_at: string | null
  updated_at?: string | null
  provider_data?: unknown
}

export type VerificationRetentionHold = {
  userId: string
  retentionUntil: string
}

function isScrubbedProviderData(providerData: unknown): boolean {
  return Boolean(
    providerData &&
      typeof providerData === 'object' &&
      !Array.isArray(providerData) &&
      (providerData as { scrubbed?: unknown }).scrubbed === true
  )
}

function retentionExpiryForRow(row: VerificationRetentionRow): Date | null {
  if (row.retention_expires_at) {
    const expiry = new Date(row.retention_expires_at)
    return Number.isNaN(expiry.getTime()) ? null : expiry
  }

  // After UAVG purge, retention_expires_at is cleared and the payload is marked scrubbed.
  // Those stubs must not block deletion.
  if (isScrubbedProviderData(row.provider_data)) {
    return null
  }

  if (!row.updated_at) {
    return null
  }

  const updated = new Date(row.updated_at)
  if (Number.isNaN(updated.getTime())) {
    return null
  }

  return new Date(
    updated.getTime() + DUTCH_LAW_RETENTION.VERIFICATION_DOCUMENTS_DAYS * 24 * 60 * 60 * 1000
  )
}

/**
 * Find users whose identity-verification documents are still inside the UAVG 4-week hold.
 * `verifications.status` is kyc_status (pending/approved/rejected/expired), not profile "verified".
 */
export function collectVerificationRetentionHolds(
  rows: VerificationRetentionRow[],
  now = new Date()
): VerificationRetentionHold[] {
  const latestByUser = new Map<string, Date>()

  for (const row of rows) {
    const expiry = retentionExpiryForRow(row)
    if (!expiry || expiry <= now) continue

    const existing = latestByUser.get(row.user_id)
    if (!existing || expiry > existing) {
      latestByUser.set(row.user_id, expiry)
    }
  }

  return [...latestByUser.entries()].map(([userId, retentionUntil]) => ({
    userId,
    retentionUntil: retentionUntil.toISOString(),
  }))
}

export async function findVerificationRetentionHolds(
  supabase: SupabaseClient,
  userIds: string[],
  now = new Date()
): Promise<{ holds: VerificationRetentionHold[]; error: { message: string } | null }> {
  if (userIds.length === 0) {
    return { holds: [], error: null }
  }

  const { data, error } = await supabase
    .from('verifications')
    .select('user_id, retention_expires_at, updated_at, provider_data')
    .in('user_id', userIds)
    .eq('status', KYC_APPROVED_STATUS)

  if (error) {
    return { holds: [], error }
  }

  return {
    holds: collectVerificationRetentionHolds((data || []) as VerificationRetentionRow[], now),
    error: null,
  }
}

const VERIFICATION_BUCKET = 'verification-documents'

/**
 * Delete all objects under verification-documents/{userId}/ for given users.
 */
export async function deleteVerificationStorageForUsers(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<{ deletedFiles: number; errors: string[] }> {
  let deletedFiles = 0
  const errors: string[] = []

  for (const userId of userIds) {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(VERIFICATION_BUCKET)
        .list(userId, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })

      if (listError) {
        if (listError.message?.includes('not found') || listError.message?.includes('Bucket')) {
          continue
        }
        errors.push(`${userId}: list failed: ${listError.message}`)
        continue
      }

      if (!files?.length) continue

      const filePaths = files.map((f) => `${userId}/${f.name}`)
      const { error: removeError } = await supabase.storage.from(VERIFICATION_BUCKET).remove(filePaths)
      if (removeError) {
        errors.push(`${userId}: remove failed: ${removeError.message}`)
      } else {
        deletedFiles += filePaths.length
      }
    } catch (e) {
      errors.push(`${userId}: ${e instanceof Error ? e.message : 'unknown'}`)
    }
  }

  return { deletedFiles, errors }
}

/**
 * Purge expired verification DB rows and legacy storage objects for those users.
 */
export async function purgeExpiredVerificationsWithStorage(
  supabase: SupabaseClient
): Promise<{ dbDeleted: number; storageFilesDeleted: number; storageErrors: string[] }> {
  const now = new Date().toISOString()

  const { data: expiring, error: fetchError } = await supabase
    .from('verifications')
    .select('user_id')
    .not('retention_expires_at', 'is', null)
    .lt('retention_expires_at', now)

  if (fetchError) {
    throw new Error(`Failed to list expired verifications: ${fetchError.message}`)
  }

  const userIds = [...new Set((expiring || []).map((r) => r.user_id).filter(Boolean))] as string[]

  let storageFilesDeleted = 0
  let storageErrors: string[] = []
  if (userIds.length > 0) {
    const storageResult = await deleteVerificationStorageForUsers(supabase, userIds)
    storageFilesDeleted = storageResult.deletedFiles
    storageErrors = storageResult.errors
    if (storageErrors.length > 0) {
      safeLogger.warn('[Retention] Verification storage cleanup had errors', {
        count: storageErrors.length,
      })
    }
  }

  const { data: dbDeleted, error: purgeError } = await supabase.rpc('purge_expired_verifications')
  if (purgeError) {
    throw new Error(`purge_expired_verifications failed: ${purgeError.message}`)
  }

  return {
    dbDeleted: dbDeleted ?? 0,
    storageFilesDeleted,
    storageErrors,
  }
}
