/**
 * Script to create chats for confirmed matches that don't have chats
 * 
 * This script:
 * 1. Finds all confirmed match_suggestions (status = 'confirmed', kind = 'pair')
 * 2. Checks if a chat exists for each pair
 * 3. Creates chats and chat_members for pairs that don't have chats
 * 
 * Usage: npx tsx scripts/fix-missing-chats-for-matches.ts
 */

import * as dotenv from 'dotenv'
import { existsSync } from 'fs'
import { createAdminClient } from '@/lib/supabase/server'
import { ensureDirectChat } from '@/lib/chat/ensure-direct-chat'
import { safeLogger } from '@/lib/utils/logger'

// Load environment variables if .env.local exists
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else if (existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

async function fixMissingChats() {
  console.log('[Fix Missing Chats] Starting script to create chats for confirmed matches')
  
  const admin = await createAdminClient()
  
  safeLogger.info('[Fix Missing Chats] Starting script to create chats for confirmed matches')
  
  // Find all confirmed pair suggestions
  const { data: confirmedSuggestions, error: suggestionsError } = await admin
    .from('match_suggestions')
    .select('id, member_ids, status, created_at')
    .eq('status', 'confirmed')
    .eq('kind', 'pair')
    .order('created_at', { ascending: false })
  
  if (suggestionsError) {
    console.error('[Fix Missing Chats] Failed to fetch confirmed suggestions', suggestionsError)
    safeLogger.error('[Fix Missing Chats] Failed to fetch confirmed suggestions', suggestionsError)
    process.exit(1)
  }
  
  if (!confirmedSuggestions || confirmedSuggestions.length === 0) {
    console.log('[Fix Missing Chats] No confirmed matches found')
    safeLogger.info('[Fix Missing Chats] No confirmed matches found')
    return
  }
  
  console.log(`[Fix Missing Chats] Found ${confirmedSuggestions.length} confirmed matches`)
  safeLogger.info(`[Fix Missing Chats] Found ${confirmedSuggestions.length} confirmed matches`)
  
  let createdCount = 0
  let existingCount = 0
  let errorCount = 0
  
  for (const suggestion of confirmedSuggestions) {
    const memberIds = suggestion.member_ids as string[]
    
    if (!memberIds || memberIds.length !== 2) {
      safeLogger.warn(`[Fix Missing Chats] Invalid member_ids for suggestion ${suggestion.id}`, {
        memberIds,
        suggestionId: suggestion.id
      })
      continue
    }
    
    const [userA, userB] = memberIds
    
    if (userA === userB) {
      safeLogger.warn(`[Fix Missing Chats] Self-match detected for suggestion ${suggestion.id}`, {
        userA,
        userB,
        suggestionId: suggestion.id
      })
      continue
    }
    
    try {
      const ensured = await ensureDirectChat(admin, userA, userB, { createdBy: userA })
      if (ensured.created) {
        createdCount++
        safeLogger.info(`[Fix Missing Chats] Created chat for confirmed match`, {
          chatId: ensured.chatId,
          userA,
          userB,
          suggestionId: suggestion.id
        })
      } else {
        existingCount++
        safeLogger.debug(`[Fix Missing Chats] Chat already exists for suggestion ${suggestion.id}`, {
          chatId: ensured.chatId,
          userA,
          userB
        })
      }
    } catch (error) {
      safeLogger.error(`[Fix Missing Chats] Error processing suggestion ${suggestion.id}`, {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        userA,
        userB,
        suggestionId: suggestion.id
      })
      errorCount++
    }
  }
  
  console.log(`[Fix Missing Chats] Script completed:`, {
    total: confirmedSuggestions.length,
    created: createdCount,
    existing: existingCount,
    errors: errorCount
  })
  
  safeLogger.info(`[Fix Missing Chats] Script completed`, {
    total: confirmedSuggestions.length,
    created: createdCount,
    existing: existingCount,
    errors: errorCount
  })
}

// Run the script
fixMissingChats()
  .then(() => {
    safeLogger.info('[Fix Missing Chats] Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    safeLogger.error('[Fix Missing Chats] Script failed', error)
    process.exit(1)
  })
