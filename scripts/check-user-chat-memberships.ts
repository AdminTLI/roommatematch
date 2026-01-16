/**
 * Diagnostic script to check if a user has chat memberships for confirmed matches
 * 
 * Usage: npx tsx scripts/check-user-chat-memberships.ts <user_id>
 */

import * as dotenv from 'dotenv'
import { existsSync } from 'fs'
import { createAdminClient } from '@/lib/supabase/server'

// Load environment variables
if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else if (existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

async function checkUserChatMemberships(userId?: string) {
  const admin = await createAdminClient()
  
  if (!userId) {
    console.log('Usage: npx tsx scripts/check-user-chat-memberships.ts <user_id>')
    console.log('\nTo find your user ID, check the browser console or your profile page.')
    process.exit(1)
  }
  
  console.log(`\n[Check Chat Memberships] Checking for user: ${userId}\n`)
  
  // 1. Check confirmed matches for this user
  const { data: confirmedMatches, error: matchesError } = await admin
    .from('match_suggestions')
    .select('id, member_ids, status, created_at')
    .eq('status', 'confirmed')
    .eq('kind', 'pair')
    .or(`member_ids.cs.{${userId}}`)
    .order('created_at', { ascending: false })
  
  if (matchesError) {
    console.error('[Check Chat Memberships] Error fetching confirmed matches:', matchesError)
    process.exit(1)
  }
  
  console.log(`Found ${confirmedMatches?.length || 0} confirmed matches for this user\n`)
  
  // 2. Check chat memberships
  const { data: memberships, error: membershipsError } = await admin
    .from('chat_members')
    .select('chat_id, user_id, created_at')
    .eq('user_id', userId)
  
  if (membershipsError) {
    console.error('[Check Chat Memberships] Error fetching chat memberships:', membershipsError)
    process.exit(1)
  }
  
  console.log(`Found ${memberships?.length || 0} chat memberships for this user\n`)
  
  // 3. For each confirmed match, check if chat exists and user is a member
  if (confirmedMatches && confirmedMatches.length > 0) {
    console.log('Checking each confirmed match:\n')
    
    for (const match of confirmedMatches) {
      const memberIds = match.member_ids as string[]
      const otherUserId = memberIds.find(id => id !== userId)
      
      if (!otherUserId) {
        console.log(`  ❌ Match ${match.id}: Invalid member_ids`)
        continue
      }
      
      // Check if chat exists for this pair
      const { data: userAChats } = await admin
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', userId)
      
      let chatExists = false
      let userIsMember = false
      
      if (userAChats && userAChats.length > 0) {
        const chatIds = userAChats.map((r: any) => r.chat_id)
        const { data: commonChats } = await admin
          .from('chat_members')
          .select('chat_id')
          .in('chat_id', chatIds)
          .eq('user_id', otherUserId)
        
        if (commonChats && commonChats.length > 0) {
          chatExists = true
          const chatId = commonChats[0].chat_id
          
          // Check if current user is a member
          const { data: userMembership } = await admin
            .from('chat_members')
            .select('chat_id, user_id')
            .eq('chat_id', chatId)
            .eq('user_id', userId)
          
          userIsMember = !!userMembership && userMembership.length > 0
        }
      }
      
      const status = chatExists && userIsMember ? '✅' : chatExists ? '⚠️' : '❌'
      console.log(`  ${status} Match ${match.id}:`, {
        otherUserId,
        chatExists,
        userIsMember,
        status: chatExists && userIsMember ? 'OK' : chatExists ? 'Chat exists but user not member' : 'No chat'
      })
    }
  }
  
  // 4. Show all chat memberships
  if (memberships && memberships.length > 0) {
    console.log('\nAll chat memberships for this user:')
    for (const membership of memberships) {
      const { data: chat } = await admin
        .from('chats')
        .select('id, is_group, created_at')
        .eq('id', membership.chat_id)
        .single()
      
      const { data: otherMembers } = await admin
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', membership.chat_id)
        .neq('user_id', userId)
      
      console.log(`  Chat ${membership.chat_id}:`, {
        isGroup: chat?.is_group || false,
        otherMembers: otherMembers?.map(m => m.user_id) || [],
        createdAt: chat?.created_at
      })
    }
  }
  
  console.log('\n[Check Chat Memberships] Done\n')
}

const userId = process.argv[2]
checkUserChatMemberships(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[Check Chat Memberships] Error:', error)
    process.exit(1)
  })



