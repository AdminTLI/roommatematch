import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Parse filter parameters
    const typesParam = searchParams.get('types')
    const createdMonthsParam = searchParams.get('createdMonths')
    const searchQuery = searchParams.get('search') || ''
    const types = typesParam ? typesParam.split(',') : []
    const createdMonths = createdMonthsParam ? createdMonthsParam.split(',') : []

    const admin = await createAdminClient()

    // First, fetch ALL chats to generate filter metadata (before filtering)
    const { data: allChatsForMetadata } = await admin
      .from('chats')
      .select('id, is_group, created_at')
      .order('created_at', { ascending: false })

    // Generate filter metadata from all chats
    // We'll determine types after fetching participants, so for now just get dates
    const createdMonthsSet = new Set<string>()
    
    if (allChatsForMetadata) {
      for (const chat of allChatsForMetadata) {
        // Extract created month in MM/YY format
        if (chat.created_at) {
          const date = new Date(chat.created_at)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = String(date.getFullYear()).slice(-2)
          createdMonthsSet.add(`${month}/${year}`)
        }
      }
    }

    // Build query with filters
    let query = admin
      .from('chats')
      .select(`
        id,
        is_group,
        group_id,
        created_by,
        created_at
      `)
    
    // Apply created date filter - we'll filter in memory after fetching
    // since Supabase doesn't support OR queries easily
    
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: chats, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to fetch chats', error)
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      )
    }

    // Get detailed participant info for each chat
    let enrichedChats = await Promise.all(
      (chats || []).map(async (chat) => {
        // Get participants - fetch without join first
        // Try to filter by status='active' first (exclude 'left' members)
        // If that fails (column might not exist), fall back to all members
        let participants: any[] | null = null
        let participantsError: any = null
        
        // First try with status filter
        const { data: participantsWithStatus, error: statusError } = await admin
          .from('chat_members')
          .select('user_id, last_read_at')
          .eq('chat_id', chat.id)
          .eq('status', 'active')
        
        if (!statusError && participantsWithStatus) {
          participants = participantsWithStatus
        } else {
          // If status filter fails (column might not exist), try without it
          safeLogger.warn('[Admin] Status filter failed, trying without status filter', {
            chatId: chat.id,
            error: statusError
          })
          const { data: allParticipants, error: allError } = await admin
            .from('chat_members')
            .select('user_id, last_read_at')
            .eq('chat_id', chat.id)
          
          if (allError) {
            participantsError = allError
            safeLogger.error('[Admin] Failed to fetch participants', {
              chatId: chat.id,
              error: allError
            })
          } else {
            participants = allParticipants
          }
        }

        // Fetch profiles and users separately for participants
        const participantUserIds = participants?.map(p => p.user_id) || []
        const profilesMap = new Map()
        const usersMap = new Map()
        
        if (participantUserIds.length > 0) {
          // Fetch profiles
          const { data: profiles } = await admin
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', participantUserIds)
          
          profiles?.forEach((profile: any) => {
            profilesMap.set(profile.user_id, profile)
          })

          // Fetch users for emails
          const { data: users } = await admin
            .from('users')
            .select('id, email')
            .in('id', participantUserIds)
          
          users?.forEach((user: any) => {
            usersMap.set(user.id, user)
          })
        }

        // Get message count
        const { count: messageCount } = await admin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('chat_id', chat.id)

        // Calculate unread counts per user (messages after last_read_at)
        const unreadCounts = await Promise.all(
          (participants || []).map(async (p) => {
            const lastRead = p.last_read_at ? new Date(p.last_read_at).toISOString() : null
            let query = admin
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('chat_id', chat.id)
              .neq('user_id', p.user_id) // Don't count own messages
            
            if (lastRead) {
              query = query.gt('created_at', lastRead)
            }
            
            const { count } = await query
            return {
              user_id: p.user_id,
              count: count || 0
            }
          })
        )

        return {
          id: chat.id,
          is_group: chat.is_group,
          group_id: chat.group_id,
          created_by: chat.created_by,
          created_at: chat.created_at,
          member_count: participants?.length || 0,
          members: participants?.map(p => {
            const profile = profilesMap.get(p.user_id)
            const user = usersMap.get(p.user_id)
            const name = profile?.first_name
              ? `${profile.first_name} ${profile.last_name || ''}`.trim()
              : user?.email?.split('@')[0] || 'Unknown'
            const email = user?.email || ''
            return {
              id: p.user_id,
              name,
              email
            }
          }) || [],
          message_count: messageCount || 0,
          unread_counts: unreadCounts
        }
      })
    )

    // Apply search filter (by chat ID or participant name/email)
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim()
      enrichedChats = enrichedChats.filter(chat => {
        // Search by chat ID
        if (chat.id.toLowerCase().includes(searchLower)) {
          return true
        }
        
        // Search by participant names and emails
        if (chat.members && chat.members.length > 0) {
          return chat.members.some(member => {
            const nameMatch = member.name?.toLowerCase().includes(searchLower)
            const emailMatch = member.email?.toLowerCase().includes(searchLower)
            return nameMatch || emailMatch
          })
        }
        
        return false
      })
    }

    // Apply type filter (Individual = 2 participants, Group = 3+)
    if (types.length > 0) {
      enrichedChats = enrichedChats.filter(chat => {
        const participantCount = chat.member_count || chat.members.length
        const chatType = participantCount >= 3 ? 'Group' : 'Individual'
        return types.includes(chatType)
      })
    }

    // Apply created date filter
    if (createdMonths.length > 0) {
      enrichedChats = enrichedChats.filter(chat => {
        if (!chat.created_at) return false
        const date = new Date(chat.created_at)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(-2)
        const monthYear = `${month}/${year}`
        return createdMonths.includes(monthYear)
      })
    }

    // Generate types for filter metadata
    // Always include both Individual and Group as filter options
    const typesSet = new Set<string>(['Individual', 'Group'])

    // Get total count (after filtering)
    const totalCount = enrichedChats.length

    return NextResponse.json({
      chats: enrichedChats,
      total: totalCount,
      limit,
      offset,
      filterMetadata: {
        types: Array.from(typesSet).sort(),
        createdMonths: Array.from(createdMonthsSet).sort().reverse()
      }
    })
  } catch (error) {
    safeLogger.error('[Admin] Chats list error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json()
    const { action, chatId } = body

    if (action === 'close') {
      await logAdminAction(user!.id, 'close_chat', 'chat_room', chatId, {
        action: 'Admin closed chat',
        chat_id: chatId,
        role: adminRecord!.role
      })

      const admin = await createAdminClient()
      
      // First, try to add closed_at column if it doesn't exist (graceful handling)
      // Then mark chat as closed and remove all participants
      try {
        // Try to update with closed_at (will fail gracefully if column doesn't exist)
        await admin
          .from('chats')
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId)
      } catch (updateError) {
        // Column might not exist, continue with member deletion
        safeLogger.warn('[Admin] Could not update chat closed_at', updateError)
      }
      
      // Remove all participants (effectively closing the chat - RLS will prevent new messages)
      const { error: deleteError } = await admin
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)

      if (deleteError) {
        safeLogger.error('[Admin] Failed to close chat', deleteError)
        return NextResponse.json(
          { error: 'Failed to close chat' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Chat closed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    safeLogger.error('[Admin] Chats action error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

