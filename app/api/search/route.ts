import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sanitizeSearchInput, validateSearchInputLength } from '@/lib/utils/sanitize'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Use admin client for profile queries to bypass RLS that references non-existent user_academic table
    const adminSupabase = createAdminClient()

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

    // Sanitize and validate search input to prevent injection
    if (!validateSearchInputLength(query, 100)) {
      return NextResponse.json({ error: 'Search query too long' }, { status: 400 })
    }
    const sanitizedQuery = sanitizeSearchInput(query)
    const queryLower = sanitizedQuery.toLowerCase()
    const searchPattern = `%${queryLower}%` // Define searchPattern at top level so it's available everywhere

    // Get user's chats for context
    const { data: chatMembers } = await supabase
      .from('chat_members')
      .select('chat_id, user_id')
      .eq('user_id', user.id)

    const chatIds = chatMembers?.map(cm => cm.chat_id) || []

    // First, get all users the current user has matched with from the matches table
    let matchedUserIds: string[] = []
    try {
      safeLogger.debug('[Search] Getting matched user IDs for user:', user.id)
      // Try matches table first (legacy)
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('a_user, b_user, status')
        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`)

      if (matchesError) {
        safeLogger.error('[Search] Error fetching matches from matches table:', matchesError)
      } else if (matches && matches.length > 0) {
        safeLogger.debug('[Search] Found', matches.length, 'matches in matches table')
        matchedUserIds = (matches || [])
          .filter((m: any) => {
            // Include all statuses, or filter by accepted/confirmed/locked if needed
            const status = m.status?.toLowerCase()
            return !status || ['accepted', 'confirmed', 'locked', 'pending'].includes(status)
          })
          .map((m: any) => m.a_user === user.id ? m.b_user : m.a_user)
          .filter((id: string) => id && id !== user.id)
        safeLogger.debug('[Search] Extracted', matchedUserIds.length, 'matched user IDs from matches table')
      } else {
        safeLogger.debug('[Search] No matches found in matches table')
      }

      // Also check match_suggestions table (newer system)
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('match_suggestions')
        .select('member_ids, status')
        .contains('member_ids', [user.id])
        .in('status', ['accepted', 'confirmed'])

      if (suggestionsError) {
        safeLogger.error('[Search] Error fetching match suggestions:', suggestionsError)
      } else if (suggestions && suggestions.length > 0) {
        safeLogger.debug('[Search] Found', suggestions.length, 'match suggestions')
        const suggestionUserIds = (suggestions || [])
          .flatMap((s: any) => s.member_ids || [])
          .filter((id: string) => id && id !== user.id)
        matchedUserIds = [...new Set([...matchedUserIds, ...suggestionUserIds])]
        safeLogger.debug('[Search] Total matched user IDs after suggestions:', matchedUserIds.length)
      } else {
        safeLogger.debug('[Search] No match suggestions found')
      }

      safeLogger.debug('[Search] Found matched user IDs:', matchedUserIds.length, matchedUserIds)
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
    
    safeLogger.debug('[Search] Total matched user IDs (matches + chats):', allMatchedUserIds.length, allMatchedUserIds)

    // Search matches (users you've matched with)
    let matchedUsers: any[] = []
    try {
      if (allMatchedUserIds.length > 0) {
        safeLogger.debug('[Search] Searching profiles for matched users:', allMatchedUserIds.length, 'user IDs:', allMatchedUserIds)
        
        // First, get all profiles of matched users (use admin client to bypass RLS)
        const { data: allMatchedProfiles, error: allProfilesError } = await adminSupabase
          .from('profiles')
          .select('user_id, first_name, last_name, program, university_id')
          .in('user_id', allMatchedUserIds)

        if (allProfilesError) {
          console.error('[Search] Error fetching all matched user profiles:', allProfilesError)
        } else {
          safeLogger.debug('[Search] Found', allMatchedProfiles?.length || 0, 'matched user profiles')
          
          // Filter profiles that match the search query
          // Use queryLower (sanitized) instead of query
          const matchingProfiles = (allMatchedProfiles || []).filter((profile: any) => {
            const firstName = (profile.first_name || '').toLowerCase()
            const lastName = (profile.last_name || '').toLowerCase()
            const fullName = `${firstName} ${lastName}`.trim()
            const program = (profile.program || '').toLowerCase()
            
            const matches = firstName.includes(queryLower) || 
                   lastName.includes(queryLower) || 
                   fullName.includes(queryLower) ||
                   program.includes(queryLower)
            
            if (matches) {
              safeLogger.debug('[Search] Profile matches:', {
                firstName,
                lastName,
                fullName,
                program,
                queryLower
              })
            }
            
            return matches
          })

          safeLogger.debug('[Search] Filtered to', matchingProfiles.length, 'profiles matching query:', query)

          if (matchingProfiles.length > 0) {
            // Fetch university names separately if needed
            const universityIds = [...new Set(matchingProfiles.map((p: any) => p.university_id).filter(Boolean))]
            const universityMap = new Map<string, string>()
            
            if (universityIds.length > 0) {
              const { data: universities } = await adminSupabase
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
            
            safeLogger.debug('[Search] Returning', matchedUsers.length, 'matched users')
          } else {
            safeLogger.debug('[Search] No profiles matched the search query')
          }
        }
      } else {
        safeLogger.debug('[Search] No matched user IDs found')
      }
    } catch (err) {
      safeLogger.error('[Search] Exception searching matches:', err)
    }

    // Search all users (not just matches) - for finding new people
    let allUsers: any[] = []
    try {
      safeLogger.debug('[Search] Starting user search with query:', queryLower)
      safeLogger.debug('[Search] Search pattern:', searchPattern)
      // SECURITY: Use sanitized query to prevent filter injection attacks
      // sanitizeSearchInput() removes:
      //   - Commas (which separate filters in PostgREST .or() clauses)
      //   - PostgREST operators (.eq., .neq., .gt., etc.)
      //   - Wildcards (% and _) are escaped
      // This prevents attackers from injecting filters like: q=foo,university_id.eq.victim
      // queryLower is the lowercased, sanitized query - safe for use in string interpolation
      
      // Enhanced user search: search profiles - use simple queries without joins to avoid relationship errors
      let allProfiles: any[] = []
      let allProfilesError: any = null
      
      // Try searching by first name (use admin client to bypass RLS)
      const { data: profilesByName, error: nameError } = await adminSupabase
        .from('profiles')
        .select('user_id, first_name, last_name, program, university_id')
        .neq('user_id', user.id)
        .ilike('first_name', searchPattern)
        .limit(10)
      
      if (nameError) {
        safeLogger.error('[Search] Error searching by first_name:', nameError)
        allProfilesError = nameError
      } else if (profilesByName) {
        safeLogger.debug('[Search] Found', profilesByName.length, 'profiles by first_name')
        allProfiles = [...allProfiles, ...profilesByName]
      }
      
      // Search by last name (if we don't have enough results)
      if (allProfiles.length < 10) {
        const { data: profilesByLastName, error: lastNameError } = await adminSupabase
          .from('profiles')
          .select('user_id, first_name, last_name, program, university_id')
          .neq('user_id', user.id)
          .ilike('last_name', searchPattern)
          .limit(10 - allProfiles.length)
        
        if (lastNameError) {
          safeLogger.error('[Search] Error searching by last_name:', lastNameError)
        } else if (profilesByLastName) {
          safeLogger.debug('[Search] Found', profilesByLastName.length, 'profiles by last_name')
          // Merge and deduplicate
          const existingIds = new Set(allProfiles.map(p => p.user_id))
          const newProfiles = profilesByLastName.filter(p => !existingIds.has(p.user_id))
          allProfiles = [...allProfiles, ...newProfiles]
        }
      }
      
      // Search by program (if we don't have enough results)
      if (allProfiles.length < 10) {
        const { data: profilesByProgram, error: programError } = await adminSupabase
          .from('profiles')
          .select('user_id, first_name, last_name, program, university_id')
          .neq('user_id', user.id)
          .ilike('program', searchPattern)
          .limit(10 - allProfiles.length)
        
        if (programError) {
          safeLogger.error('[Search] Error searching by program:', programError)
        } else if (profilesByProgram) {
          safeLogger.debug('[Search] Found', profilesByProgram.length, 'profiles by program')
          // Merge and deduplicate
          const existingIds = new Set(allProfiles.map(p => p.user_id))
          const newProfiles = profilesByProgram.filter(p => !existingIds.has(p.user_id))
          allProfiles = [...allProfiles, ...newProfiles]
        }
      }

      if (allProfilesError) {
        safeLogger.error('[Search] Error searching all users:', allProfilesError)
      } else {
        safeLogger.debug('[Search] Found profiles by name:', allProfiles?.length || 0)
      }
      
      if (allProfiles && allProfiles.length > 0) {
        safeLogger.debug('[Search] Processing', allProfiles.length, 'profiles')
        
        // Fetch university names separately if needed
        const universityIds = [...new Set(allProfiles.map((p: any) => p.university_id).filter(Boolean))]
        const universityMap = new Map<string, string>()
        
        if (universityIds.length > 0) {
          const { data: universities } = await adminSupabase
            .from('universities')
            .select('id, name')
            .in('id', universityIds)
          
          if (universities) {
            universities.forEach((u: any) => {
              universityMap.set(u.id, u.name)
            })
          }
        }
        
        // Get chat IDs for these users (if they have existing chats with the current user)
        const userIds = allProfiles.map((p: any) => p.user_id)
        const chatIdMap = new Map<string, string>()
        
        if (userIds.length > 0 && chatIds.length > 0) {
          // Get all chat members for chats the current user is in
          const { data: allChatMembers } = await adminSupabase
            .from('chat_members')
            .select('chat_id, user_id')
            .in('chat_id', chatIds)
          
          if (allChatMembers) {
            // Group by chat_id to find chats that contain both current user and searched users
            const chatMembersByChat = new Map<string, string[]>()
            allChatMembers.forEach((cm: any) => {
              if (!chatMembersByChat.has(cm.chat_id)) {
                chatMembersByChat.set(cm.chat_id, [])
              }
              chatMembersByChat.get(cm.chat_id)!.push(cm.user_id)
            })
            
            // For each chat, check if it contains both current user and any of the searched users
            chatMembersByChat.forEach((memberIds, chatId) => {
              const hasCurrentUser = memberIds.includes(user.id)
              if (hasCurrentUser) {
                // Find which searched user is in this chat
                const searchedUserInChat = userIds.find(uid => memberIds.includes(uid))
                if (searchedUserInChat) {
                  chatIdMap.set(searchedUserInChat, chatId)
                }
              }
            })
          }
        }
        
        // Process results
        allUsers = allProfiles.map((profile: any) => {
          return {
            id: profile.user_id,
            type: 'user',
            name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
            program: profile.program || '',
            university: profile.university_id ? universityMap.get(profile.university_id) || '' : '',
            chatId: chatIdMap.get(profile.user_id)
          }
        })
        safeLogger.debug('[Search] Processed', allUsers.length, 'users from profiles')
      } else {
        safeLogger.debug('[Search] No profiles found by name, trying program/university search')
        // Fallback: search by program name or university name if no name matches
        // Search programs table
        // Search programs by name
        const { data: programsByName, error: programsError } = await supabase
          .from('programs')
          .select('id, name, name_en, university_id')
          .ilike('name', searchPattern)
          .limit(5)
        
        let programs = programsByName || []
        
        // Also search by English name if we need more results
        if (programs.length < 5) {
          const { data: programsByNameEn, error: nameEnError } = await supabase
            .from('programs')
            .select('id, name, name_en, university_id')
            .ilike('name_en', searchPattern)
            .limit(5 - programs.length)
          
          if (!nameEnError && programsByNameEn) {
            const existingIds = new Set(programs.map(p => p.id))
            const newPrograms = programsByNameEn.filter(p => !existingIds.has(p.id))
            programs = [...programs, ...newPrograms]
          }
        }

        if (!programsError && programs.length > 0) {
          // Search profiles by program name directly (simpler approach)
          const programNames = programs.map(p => p.name_en || p.name).filter(Boolean)
          
          if (programNames.length > 0) {
            // Search profiles where program field matches any of the program names
            for (const programName of programNames.slice(0, 3)) { // Limit to 3 programs to avoid too many queries
              if (allUsers.length >= 10) break
              
              const { data: profilesByProgram, error: programSearchError } = await adminSupabase
                .from('profiles')
                .select('user_id, first_name, last_name, program, university_id')
                .neq('user_id', user.id)
                .ilike('program', `%${programName}%`)
                .limit(10 - allUsers.length)
              
              if (!programSearchError && profilesByProgram) {
                const existingIds = new Set(allUsers.map(u => u.id))
                const newProfiles = profilesByProgram.filter(p => !existingIds.has(p.user_id))
                
                // Fetch university names for new profiles
                const newUniversityIds = [...new Set(newProfiles.map((p: any) => p.university_id).filter(Boolean))]
                const universityMap = new Map<string, string>()
                
                if (newUniversityIds.length > 0) {
                  const { data: universities } = await adminSupabase
                    .from('universities')
                    .select('id, name')
                    .in('id', newUniversityIds)
                  
                  if (universities) {
                    universities.forEach((u: any) => {
                      universityMap.set(u.id, u.name)
                    })
                  }
                }
                
                const newUsers = newProfiles.map((profile: any) => ({
                  id: profile.user_id,
                  type: 'user',
                  name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
                  program: profile.program || programName,
                  university: profile.university_id ? universityMap.get(profile.university_id) || '' : ''
                }))
                
                allUsers = [...allUsers, ...newUsers]
              }
            }
          }
        }
        
        // Also search by university name
        const { data: universities, error: universitiesError } = await supabase
          .from('universities')
          .select('id, name')
          .ilike('name', searchPattern)
          .limit(5)

        if (!universitiesError && universities && universities.length > 0) {
          const universityIds = universities.map(u => u.id)
          const universityNames = universities.map(u => u.name)
          const universityMap = new Map(universities.map(u => [u.id, u.name]))
          
          // Find users with these universities - search profiles directly (use admin client)
          const { data: profilesByUniversity, error: usersUniError } = await adminSupabase
            .from('profiles')
            .select('user_id, first_name, last_name, program, university_id')
            .in('university_id', universityIds)
            .neq('user_id', user.id)
            .limit(10 - allUsers.length)

          if (!usersUniError && profilesByUniversity) {
            const existingIds = new Set(allUsers.map(u => u.id))
            const newProfiles = profilesByUniversity.filter(p => !existingIds.has(p.user_id))
            
            const additionalUsers = newProfiles.map((profile: any) => ({
              id: profile.user_id,
              type: 'user',
              name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
              program: profile.program || '',
              university: profile.university_id ? universityMap.get(profile.university_id) || '' : ''
            }))
            
            // Merge with existing results, avoiding duplicates
            allUsers = [...allUsers, ...additionalUsers].slice(0, 10)
          }
        }
      }
    } catch (err) {
      safeLogger.error('[Search] Exception searching all users:', err)
    }
    
    safeLogger.debug('[Search] Final allUsers count:', allUsers.length)

    // Search messages - search for words in conversations
    let matchedMessages: any[] = []
    try {
      safeLogger.debug('[Search] Searching messages in', chatIds.length, 'chats')
      if (chatIds.length > 0) {
        // Enhanced message search: search for messages containing the query
        // Use text search pattern that matches any word in the query
        const words = queryLower.split(/\s+/).filter(w => w.length > 0)
        let messages: any[] = []
        
        if (words.length > 0) {
          // Search for messages containing the query
          // First try exact phrase match, then individual words
          let messagesData: any[] = []
          
          // Search for full query first (most relevant)
          const { data: fullQueryResults, error: fullQueryError } = await supabase
            .from('messages')
            .select('id, content, chat_id, created_at, user_id')
            .in('chat_id', chatIds)
            .ilike('content', searchPattern)
            .order('created_at', { ascending: false })
            .limit(20)

          if (!fullQueryError && fullQueryResults) {
            messagesData = fullQueryResults
          }
          
          // If we don't have enough results, search for individual words
          if (messagesData.length < 10 && words.length > 0) {
            // Search for each word separately and merge results
            let wordResults: any[] = []
            const existingMessageIds = new Set(messagesData.map(m => m.id))
            
            for (const word of words) {
              if (wordResults.length >= 20) break
              
              const wordPattern = `%${word}%`
              const { data: wordData, error: wordError } = await supabase
                .from('messages')
                .select('id, content, chat_id, created_at, user_id')
                .in('chat_id', chatIds)
                .ilike('content', wordPattern)
                .order('created_at', { ascending: false })
                .limit(20)
              
              if (!wordError && wordData) {
                // Add new messages that aren't already in results
                const newMessages = wordData.filter(m => !existingMessageIds.has(m.id))
                wordResults = [...wordResults, ...newMessages]
                newMessages.forEach(m => existingMessageIds.add(m.id))
              }
            }

            // Merge word results with existing messages
            if (wordResults.length > 0) {
              const existingIds = new Set(messagesData.map(m => m.id))
              const newMessages = wordResults.filter(m => !existingIds.has(m.id))
              messagesData = [...messagesData, ...newMessages]
            }
          }

          if (messagesData.length > 0) {
            // Score messages by relevance (messages with more matching words rank higher)
            messages = messagesData.map((msg: any) => {
              const contentLower = msg.content.toLowerCase()
              const matchCount = words.filter(word => contentLower.includes(word)).length
              // Boost score if full query is found
              const fullQueryMatch = contentLower.includes(queryLower) ? 10 : 0
              return { ...msg, _matchScore: matchCount + fullQueryMatch }
            })
            
            // Sort by match score (descending), then by date (descending)
            messages.sort((a, b) => {
              if (b._matchScore !== a._matchScore) {
                return b._matchScore - a._matchScore
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
            
            // Limit to top 10 results
            messages = messages.slice(0, 10)
          }
        }

        if (messages.length > 0) {
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
              let highlightedContent = msg.content
              words.forEach(word => {
                const regex = new RegExp(`(${word})`, 'gi')
                highlightedContent = highlightedContent.replace(regex, '**$1**')
              })

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
      } else {
        safeLogger.debug('[Search] No chat IDs found, skipping message search')
      }
    } catch (err) {
      safeLogger.error('[Search] Exception searching messages:', err)
    }
    
    safeLogger.debug('[Search] Final matchedMessages count:', matchedMessages.length)

    // Search housing listings
    let housingListings: any[] = []
    try {
      // Search by title first
      const { data: listingsByTitle, error: titleError } = await supabase
        .from('housing_listings')
        .select('id, title, address, city, rent_monthly')
        .ilike('title', searchPattern)
        .eq('status', 'active')
        .limit(5)
      
      if (!titleError && listingsByTitle) {
        housingListings = [...housingListings, ...listingsByTitle]
      }
      
      // Search by address if we need more results
      if (housingListings.length < 5) {
        const { data: listingsByAddress, error: addressError } = await supabase
          .from('housing_listings')
          .select('id, title, address, city, rent_monthly')
          .ilike('address', searchPattern)
          .eq('status', 'active')
          .limit(5 - housingListings.length)
        
        if (!addressError && listingsByAddress) {
          const existingIds = new Set(housingListings.map(l => l.id))
          const newListings = listingsByAddress.filter(l => !existingIds.has(l.id))
          housingListings = [...housingListings, ...newListings]
        }
      }
      
      // Search by city if we need more results
      if (housingListings.length < 5) {
        const { data: listingsByCity, error: cityError } = await supabase
          .from('housing_listings')
          .select('id, title, address, city, rent_monthly')
          .ilike('city', searchPattern)
          .eq('status', 'active')
          .limit(5 - housingListings.length)
        
        if (!cityError && listingsByCity) {
          const existingIds = new Set(housingListings.map(l => l.id))
          const newListings = listingsByCity.filter(l => !existingIds.has(l.id))
          housingListings = [...housingListings, ...newListings]
        }
      }

      // Map results
      housingListings = housingListings.map((listing: any) => ({
        id: listing.id,
        type: 'housing',
        title: listing.title,
        address: listing.address,
        city: listing.city,
        rent: listing.rent_monthly
      }))
    } catch (err) {
      console.error('Exception searching housing:', err)
    }

    // Search pages/navigation (static results based on query)
    const pages: any[] = []
    const pageKeywords: Record<string, { name: string; href: string; icon: string }> = {
      // Matches
      'match': { name: 'Matches', href: '/matches', icon: 'Users' },
      'matches': { name: 'Matches', href: '/matches', icon: 'Users' },
      'mate': { name: 'Matches', href: '/matches', icon: 'Users' },
      'roommate': { name: 'Matches', href: '/matches', icon: 'Users' },
      'compatibility': { name: 'Matches', href: '/matches', icon: 'Users' },
      
      // Chat/Messages
      'chat': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'chats': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'message': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'messages': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'conversation': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'conversations': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      'talk': { name: 'Chats', href: '/chat', icon: 'MessageCircle' },
      
      // Housing
      'housing': { name: 'Housing', href: '/housing', icon: 'Home' },
      'house': { name: 'Housing', href: '/housing', icon: 'Home' },
      'home': { name: 'Housing', href: '/housing', icon: 'Home' },
      'apartment': { name: 'Housing', href: '/housing', icon: 'Home' },
      'apartments': { name: 'Housing', href: '/housing', icon: 'Home' },
      'room': { name: 'Housing', href: '/housing', icon: 'Home' },
      'rooms': { name: 'Housing', href: '/housing', icon: 'Home' },
      'accommodation': { name: 'Housing', href: '/housing', icon: 'Home' },
      'rent': { name: 'Housing', href: '/housing', icon: 'Home' },
      'rental': { name: 'Housing', href: '/housing', icon: 'Home' },
      
      // Dashboard
      'dashboard': { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      'overview': { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      'main': { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      
      // Profile/Settings
      'profile': { name: 'Profile', href: '/settings', icon: 'User' },
      'profiles': { name: 'Profile', href: '/settings', icon: 'User' },
      'settings': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'setting': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'preferences': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'account': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'edit': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'personal': { name: 'Settings', href: '/settings', icon: 'Settings' },
      'information': { name: 'Settings', href: '/settings', icon: 'Settings' },
      
      // Notifications
      'notification': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'notifications': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'alert': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'alerts': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'update': { name: 'Notifications', href: '/notifications', icon: 'Bell' },
      'updates': { name: 'Notifications', href: '/notifications', icon: 'Bell' }
    }

    // Check if query matches any page keywords (allow multiple matches)
    const matchedPages = new Map<string, { name: string; href: string; icon: string }>()
    
    for (const [keyword, pageInfo] of Object.entries(pageKeywords)) {
      // Check if query contains keyword or keyword contains query (for partial matches)
      if (queryLower.includes(keyword) || keyword.includes(queryLower)) {
        // Use href as key to avoid duplicates
        if (!matchedPages.has(pageInfo.href)) {
          matchedPages.set(pageInfo.href, pageInfo)
        }
      }
    }
    
    // Convert to array
    matchedPages.forEach((pageInfo, href) => {
      pages.push({
        id: `page-${href}`,
        type: 'page',
        name: pageInfo.name,
        href: pageInfo.href,
        icon: pageInfo.icon
      })
    })
    
    // Limit to top 5 page results
    pages.splice(5)

    const response = {
      matches: matchedUsers || [],
      messages: matchedMessages || [],
      users: allUsers || [],
      housing: housingListings || [],
      pages: pages || []
    }

    safeLogger.debug('[Search API] Query:', query, 'Results:', {
      matches: response.matches.length,
      messages: response.messages.length,
      users: response.users.length,
      housing: response.housing.length,
      pages: response.pages.length
    })
    
    // Log sample results for debugging
    if (response.users.length > 0) {
      safeLogger.debug('[Search API] Sample users:', response.users.slice(0, 2))
    }
    if (response.messages.length > 0) {
      safeLogger.debug('[Search API] Sample messages:', response.messages.slice(0, 2))
    }
    if (response.matches.length > 0) {
      safeLogger.debug('[Search API] Sample matches:', response.matches.slice(0, 2))
    }

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


