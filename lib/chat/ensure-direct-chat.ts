import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureProfileAccessRows, resolvePairMatchId } from '@/lib/privacy/profile-access-server'
import { safeLogger } from '@/lib/utils/logger'

export const DIRECT_CHAT_WELCOME = "You're matched! Start your conversation 👋"

type EnsureDirectChatResult = {
  chatId: string
  created: boolean
}

function parseEnsureResult(data: unknown): EnsureDirectChatResult | null {
  if (!data || typeof data !== 'object') return null
  const row = data as { chat_id?: unknown; created?: unknown }
  if (typeof row.chat_id !== 'string' || row.chat_id.length === 0) return null
  return { chatId: row.chat_id, created: row.created === true }
}

/**
 * Idempotent 1:1 chat get-or-create. Serializes on the user pair in Postgres
 * so match confirmation and /api/chat/get-or-create cannot insert two rooms.
 */
export async function ensureDirectChat(
  admin: SupabaseClient,
  userA: string,
  userB: string,
  options?: {
    createdBy?: string
    matchId?: string | null
    welcome?: boolean
  }
): Promise<EnsureDirectChatResult> {
  if (!userA || !userB || userA === userB) {
    throw new Error('ensureDirectChat requires two distinct users')
  }

  const matchId =
    options?.matchId === undefined
      ? await resolvePairMatchId(admin, userA, userB)
      : options.matchId

  const { data, error } = await admin.rpc('ensure_direct_chat', {
    p_user_a: userA,
    p_user_b: userB,
    p_created_by: options?.createdBy ?? userA,
    p_match_id: matchId,
    p_add_welcome: options?.welcome ?? true,
  })

  if (error) {
    safeLogger.error('[ensureDirectChat] RPC failed', { error, userA, userB })
    throw error
  }

  const parsed = parseEnsureResult(data)
  if (!parsed) {
    throw new Error('ensureDirectChat returned no chat id')
  }

  await ensureProfileAccessRows(admin, parsed.chatId)
  return parsed
}
