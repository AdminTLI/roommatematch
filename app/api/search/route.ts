import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        matches: [], 
        messages: [], 
        users: [],
        housing: [],
        pages: []
      })
    }

    const queryLower = query.toLowerCase()
    const searchPattern = `%${queryLower}%`

    // Get user's chats for context
    const { data: chatMembers } = await supabase
      .from('chat_members')
      .select('chat_id, user_id')
      .eq('user_id', user.id)

    const chatIds = chatMembers?.map(cm => cm.chat_id) || []

    // First, get all users the current user has matched with from the matches table
    let matchedUserIds: string[] = []
    try {
      // Try matches table first (legacy)
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('a_user, b_user, status')
        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`)

      if (matchesError) {
        console.error('Error fetching matches from matches table:', matchesError)
      } else if (matches && matches.length > 0) {
        matchedUserIds = (matches || [])
          .filter((m: any) => {
            // Include all statuses, or filter by accepted/confirmed/locked if needed
            const status = m.status?.toLowerCase()
            return !status || ['accepted', 'confirmed', 'locked', 'pending'].includes(status)
          })
          .map((m: any) => m.a_user === user.id ? m.b_user : m.a_user)
          .filter((id: string) => id && id !== user.id)
      }

      // Also check match_suggestions table (newer system)
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('match_suggestions')
        .select('member_ids, status')
        .contains('member_ids', [user.id])
        .in('status', ['accepted', 'confirmed'])

      if (suggestionsError) {
        console.error('Error fetching match suggestions:', suggestionsError)
      } else if (suggestions && suggestions.length > 0) {
        const suggestionUserIds = (suggestions || [])
          .flatMap((s: any) => s.member_ids || [])
          .filter((id: string) => id && id !== user.id)
        matchedUserIds = [...new Set([...matchedUserIds, ...suggestionUserIds])]
      }

      console.log('[Search] Found matched user IDs:', matchedUserIds.length, matchedUserIds)
    } catch (err) {
      console.error('Exception fetching matches:', err)
    }

    // Also get matched users from chats (users you're chatting with)
    let chatMatchedUserIds: string[] = []
    try {
      if (chatIds.length > 0) {
        const { data: otherMembers, error: otherMembersError } = await supabase
          .from('chat_members')
          .select('user_id, chat_id')
          .in('chat_id', chatIds)
          .neq('user_id', user.id)

        if (!otherMembersError && otherMembers) {
          chatMatchedUserIds = [...new Set(otherMembers.map(m => m.user_id))]
        }
      }
    } catch (err) {
      console.error('Exception fetching chat members:', err)
    }

    // Combine both sources and remove duplicates
    const allMatchedUserIds = [...new Set([...matchedUserIds, ...chatMatchedUserIds])]

    // Search matches (users you've matched with)
    let matchedUsers: any[] = []
    try {
      if (allMatchedUserIds.length > 0) {
        console.log('[Search] Searching profiles for matched users:', allMatchedUserIds.length, 'user IDs')
        
        // First, get all profiles of matched users (without relation to avoid 500 errors)
        const { data: allMatchedProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, program, university_id')
          .in('user_id', allMatchedUserIds)

        if (allProfilesError) {
          console.error('[Search] Error fetching all matched user profiles:', allProfilesError)
        } else {
          console.log('[Search] Found', allMatchedProfiles?.length || 0, 'matched user profiles')
          
          // Filter profiles that match the search query
          const queryLower = query.toLowerCase()
          const matchingProfiles = (allMatchedProfiles || []).filter((profile: any) => {
            const firstName = (profile.first_name || '').toLowerCase()
            const lastName = (profile.last_name || '').toLowerCase()
            const fullName = `${firstName} ${lastName}`.trim()
            const program = (profile.program || '').toLowerCase()
            
            return firstName.includes(queryLower) || 
                   lastName.includes(queryLower) || 
                   fullName.includes(queryLower) ||
                   program.includes(queryLower)
          })

          console.log('[Search] Filtered to', matchingProfiles.length, 'profiles matching query:', query)

          if (matchingProfiles.length > 0) {
            // Fetch university names separately if needed
            const universityIds = [...new Set(matchingProfiles.map((p: any) => p.university_id).filter(Boolean))]
            const universityMap = new Map<string, string>()
            
            if (universityIds.length > 0) {
              const { data: universities } = await supabase
                .from('universities')
                .select('id, name')
                .in('id', universityIds)
              
              if (universities) {
                universities.forEach((u: any) => {
                  universityMap.set(u.id, u.name)
                })
              }
            }

            // Create a map of chat IDs for quick lookup
            const chatIdMap = new Map<string, string>()
            if (chatIds.length > 0) {
              const { data: chatMembersData } = await supabase
                .from('chat_members')
                .select('user_id, chat_id')
                .in('chat_id', chatIds)
                .neq('user_id', user.id)
              
              if (chatMembersData) {
                chatMembersData.forEach((m: any) => {
                  chatIdMap.set(m.user_id, m.chat_id)
                })
              }
            }

            matchedUsers = matchingProfiles.slice(0, 10).map((profile: any) => ({
              id: profile.user_id,
              type: 'match',
              name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
              program: profile.program || '',
              university: profile.university_id ? universityMap.get(profile.university_id) || '' : '',
              chatId: chatIdMap.get(profile.user_id)
            }))
            
            console.log('[Search] Returning', matchedUsers.length, 'matched users')
          } else {
            console.log('[Search] No profiles matched the search query')
          }
        }
      } else {
        console.log('[Search] No matched user IDs found')
      }
    } catch (err) {
      console.error('Exception searching matches:', err)
    }

    // Search all users (not just matches) - for finding new people
    let allUsers: any[] = []
    try {
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, program, university_id')
        .neq('user_id', user.id)
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},program.ilike.${searchPattern}`)
        .limit(5)

      if (allProfilesError) {
        console.error('[Search] Error searching all users:', allProfilesError)
      } else {
        // Fetch university names if needed
        const universityIds = [...new Set((allProfiles || []).map((p: any) => p.university_id).filter(Boolean))]
        const universityMap = new Map<string, string>()
        
        if (universityIds.length > 0) {
          const { data: universities } = await supabase
            .from('universities')
            .select('id, name')
            .in('id', universityIds)
          
          if (universities) {
            universities.forEach((u: any) => {
              universityMap.set(u.id, u.name)
            })
          }
        }

        allUsers = (allProfiles || []).map((profile: any) => ({
          id: profile.user_id,
          type: 'user',
          name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
          program: profile.program || '',
          university: profile.university_id ? universityMap.get(profile.university_id) || '' : ''
        }))
      }
    } catch (err) {
      console.error('Exception searching all users:', err)
    }

    // Search messages - search for words in conversations
    let matchedMessages: any[] = []
    try {
      if (chatIds.length > 0) {
        // Search for messages containing the query (case-insensitive)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, chat_id, created_at, user_id')
          .in('chat_id', chatIds)
          .ilike('content', searchPattern)
          .order('created_at', { ascending: false })
          .limit(10)

        if (messagesError) {
          console.error('Error searching messages:', messagesError)
        } else if (messages && messages.length > 0) {
          // Get sender profiles and chat participant info
          const senderIds = [...new Set(messages.map(m => m.user_id))]
          const { data: senderProfiles, error: senderProfilesError } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', senderIds)

          // Get chat participants to show conversation context
          const uniqueChatIds = [...new Set(messages.map(m => m.chat_id))]
          const { data: chatParticipants } = await supabase
            .from('chat_members')
            .select('chat_id, user_id')
            .in('chat_id', uniqueChatIds)

          if (senderProfilesError) {
            console.error('Error fetching sender profiles:', senderProfilesError)
          } else {
            const profilesMap = new Map(senderProfiles?.map(p => [p.user_id, p]) || [])
            
            // Create a map of chat participants for each chat
            const chatParticipantsMap = new Map<string, string[]>()
            if (chatParticipants) {
              chatParticipants.forEach((cp: any) => {
                if (!chatParticipantsMap.has(cp.chat_id)) {
                  chatParticipantsMap.set(cp.chat_id, [])
                }
                chatParticipantsMap.get(cp.chat_id)?.push(cp.user_id)
              })
            }

            matchedMessages = messages.map((msg: any) => {
              const profile = profilesMap.get(msg.user_id)
              const senderName = profile
                ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
                : 'User'

              // Get other participants in this chat (excluding current user and sender)
              const participants = chatParticipantsMap.get(msg.chat_id) || []
              const otherParticipants = participants.filter(id => id !== user.id && id !== msg.user_id)
              const isGroupChat = participants.length > 2

              // Highlight the search term in the message content (for display)
              const highlightedContent = msg.content.replace(
                new RegExp(`(${queryLower})`, 'gi'),
                '**$1**'
              )

              return {
                id: msg.id,
                type: 'message',
                content: msg.content,
                highlightedContent,
                chatId: msg.chat_id,
                senderName,
                createdAt: msg.created_at,
                isGroupChat,
                otherParticipantsCount: otherParticipants.length
              }
            })
          }
        }
      }
    } catch (err) {
      console.error('Exception searching messages:', err)
    }

    // Search housing listings
    let housingListings: any[] = []
    try {
      const { data: listings, error: listingsError } = await supabase
        .from('housing_listings')
        .select('id, title, address, city, rent_monthly')
        .or(`title.ilike.${searchPattern},address.ilike.${searchPattern},city.ilike.${searchPattern}`)
        .eq('status', 'active')
        .limit(5)

      if (listingsError) {
        console.error('Error searching housing listings:', listingsError)
      } else {
        housingListings = (listings || []).map((listing: any) => ({
          id: listing.id,
          type: 'housing',
          title: listing.title,
          address: listing.address,
          city: listing.city,
          rent: listing.rent_monthly
        }))
      }
    } catch (err) {
      console.error('Exception searching housing:', err)
    }

    // Search pages/navigation (static results based on query)
    const pages: any[] = []
    const pageKeywords: Record<string, { name: string; href: string; icon: string }> = {
      'match': { name: 'Matches', href: '/matches', icon: 'Users' },
      'matches': { name: 'Matches', href: '/matches', icon: 'Users' },
      'chat': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'chats': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'message': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'messages': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'housing': { name: 'Housing', href: '/housing', icon: 'Home' },
      'house': { name: 'Housing', href: '/housing', icon: 'Home' },
      'home': { name: 'Housing', href: '/housing', icon: 'Home' },
      'dashboard': { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      'profile': { name: 'Profile', href: '/settings', icon: 'User' },
      'settings': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'setting': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'notification': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'notifications': { name: 'Notifications', href: '/notifications', icon: 'Bell' }
    }

    // Check if query matches any page keywords
    for (const [keyword, pageInfo] of Object.entries(pageKeywords)) {
      if (queryLower.includes(keyword) || keyword.includes(queryLower)) {
        pages.push({
          id: `page-${pageInfo.href}`,
          type: 'page',
          name: pageInfo.name,
          href: pageInfo.href,
          icon: pageInfo.icon
        })
        break // Only add one page match
      }
    }

    const response = {
      matches: matchedUsers || [],
      messages: matchedMessages || [],
      users: allUsers || [],
      housing: housingListings || [],
      pages: pages || []
    }

    console.log('[Search API] Query:', query, 'Results:', {
      matches: response.matches.length,
      messages: response.messages.length,
      users: response.users.length,
      housing: response.housing.length,
      pages: response.pages.length
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        details: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
        messages: [],
        users: [],
        housing: [],
        pages: []
      },
      { status: 500 }
    )
  }
}


