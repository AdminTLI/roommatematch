import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

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
