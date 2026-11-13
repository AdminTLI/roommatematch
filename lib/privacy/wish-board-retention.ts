import type { SupabaseClient } from '@supabase/supabase-js'
import { getRetentionPolicy } from '@/lib/privacy/retention-policies'
import { safeLogger } from '@/lib/utils/logger'

export type WishBoardPurgeResult = {
  deleted: number
  retentionDays: number
}

/**
 * Purge lab_wishes older than the wish_board retention policy.
 * lab_wish_votes / lab_wish_reports cascade-delete via FK.
 * lab_co_creator_badges.wish_id is SET NULL (badge row retained).
 */
export async function purgeExpiredWishBoard(
  supabase: SupabaseClient
): Promise<WishBoardPurgeResult> {
  const retentionDays = getRetentionPolicy('wish_board')?.retentionDays ?? 365
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - retentionDays)

  const { count, error } = await supabase
    .from('lab_wishes')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff.toISOString())

  if (error) throw error

  const deleted = count ?? 0
  safeLogger.info('[Cron] Purged expired lab_wishes', { count: deleted, retentionDays })
  return { deleted, retentionDays }
}
