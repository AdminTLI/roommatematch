import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

type AnswerLike = { itemId?: string; marksImportant?: boolean }

function priorImportanceMap(priorAnswers: unknown): Map<string, boolean> {
  const map = new Map<string, boolean>()
  if (!Array.isArray(priorAnswers)) return map
  for (const raw of priorAnswers) {
    const a = raw as AnswerLike
    if (a?.itemId && typeof a.itemId === 'string') {
      map.set(a.itemId, a.marksImportant === true)
    }
  }
  return map
}

/**
 * Updates question_importance_ticks when marksImportant changes between the prior saved section
 * and the incoming payload. Aggregate question_importance_counts is maintained by DB triggers.
 */
export async function syncQuestionImportanceTicks(
  supabase: SupabaseClient,
  userId: string,
  priorAnswers: unknown,
  nextAnswers: AnswerLike[]
): Promise<void> {
  const priorMap = priorImportanceMap(priorAnswers)

  for (const a of nextAnswers) {
    const itemId = a.itemId
    if (!itemId || typeof itemId !== 'string') continue

    const now = a.marksImportant === true
    const was = priorMap.get(itemId) ?? false
    if (was === now) continue

    if (now) {
      const { error } = await supabase.from('question_importance_ticks').upsert(
        {
          user_id: userId,
          item_id: itemId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,item_id' }
      )
      if (error) {
        safeLogger.error('[syncQuestionImportanceTicks] upsert failed', error, { itemId })
      }
    } else {
      const { error } = await supabase
        .from('question_importance_ticks')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)
      if (error) {
        safeLogger.error('[syncQuestionImportanceTicks] delete failed', error, { itemId })
      }
    }
  }
}
