import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDSARRequest, updateDSARRequestStatus } from '@/lib/privacy/dsar-tracker'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/privacy/export
 * 
 * Export all user data in JSON format (GDPR Article 15 - Right of Access)
 * Rate limited to 1 export per 24 hours
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 1 export per 24 hours
    const rateLimitKey = getUserRateLimitKey('data_export', user.id)
    const rateLimitResult = await checkRateLimit('data_export', rateLimitKey, {
      maxRequests: 1,
      windowMs: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    if (!rateLimitResult.allowed) {
      const hoursRemaining = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60 * 60))
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `You can only request one data export per 24 hours. Please try again in ${hoursRemaining} hour(s).`,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '1',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Create DSAR request record
    let dsarRequest
    try {
      dsarRequest = await createDSARRequest({
        userId: user.id,
        requestType: 'export',
        metadata: {
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })
    } catch (error: any) {
      // If rate limit error from DSAR tracker, return it
      if (error.message?.includes('24 hours')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        )
      }
      throw error
    }

    // Update status to in_progress
    await updateDSARRequestStatus(dsarRequest.id, 'in_progress')

    try {
      // Collect all user data
      const exportData: any = {
        export_metadata: {
          export_date: new Date().toISOString(),
          request_id: dsarRequest.id,
          user_id: user.id,
          format_version: '1.0'
        },
        account: {},
        profile: {},
        academic: {},
        questionnaire: {},
        matches: {},
        chats: {},
        messages: {},
        verifications: {},
        reports: {},
        notifications: {},
        preferences: {},
        activity: {}
      }

      // 1. Account information (from auth.users)
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
      if (authUser?.user) {
        exportData.account = {
          id: authUser.user.id,
          email: authUser.user.email,
          email_confirmed_at: authUser.user.email_confirmed_at,
          created_at: authUser.user.created_at,
          updated_at: authUser.user.updated_at,
          last_sign_in_at: authUser.user.last_sign_in_at,
          // Note: We don't export password hashes or sensitive auth metadata
        }
      }

      // 2. User table data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userData) {
        exportData.account = { ...exportData.account, ...userData }
      }

      // 3. Profile information
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        exportData.profile = profile
      }

      // 4. Academic information
      const { data: academic } = await supabase
        .from('user_academic')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (academic) {
        exportData.academic = academic
      }

      // 5. Questionnaire responses
      const { data: responses } = await supabase
        .from('responses')
        .select(`
          *,
          question_items (
            key,
            section,
            type,
            options
          )
        `)
        .eq('user_id', user.id)
      
      if (responses) {
        exportData.questionnaire = {
          responses: responses.map((r: any) => ({
            question_key: r.question_key,
            question_section: r.question_items?.section,
            question_type: r.question_items?.type,
            value: r.value,
            created_at: r.created_at,
            updated_at: r.updated_at
          }))
        }
      }

      // 6. Matches
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`)
        .order('created_at', { ascending: false })
      
      if (matches) {
        exportData.matches = {
          matches: matches.map(m => ({
            id: m.id,
            other_user_id: m.a_user === user.id ? m.b_user : m.a_user,
            score: m.score,
            explanation: m.explanation,
            status: m.status,
            created_at: m.created_at,
            updated_at: m.updated_at
          }))
        }
      }

      // 7. Group suggestions
      const { data: groupSuggestions } = await supabase
        .from('group_suggestions')
        .select('*')
        .contains('member_ids', [user.id])
        .order('created_at', { ascending: false })
      
      if (groupSuggestions) {
        exportData.matches.group_suggestions = groupSuggestions
      }

      // 8. Chats
      const { data: chats } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner (
            user_id,
            joined_at
          )
        `)
        .eq('chat_members.user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (chats) {
        exportData.chats = {
          chats: chats.map((chat: any) => ({
            id: chat.id,
            is_group: chat.is_group,
            group_id: chat.group_id,
            match_id: chat.match_id,
            created_by: chat.created_by,
            first_message_at: chat.first_message_at,
            created_at: chat.created_at,
            updated_at: chat.updated_at,
            members: chat.chat_members
          }))
        }
      }

      // 9. Messages (for user's chats)
      if (chats && chats.length > 0) {
        const chatIds = chats.map((c: any) => c.id)
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })
        
        if (messages) {
          exportData.messages = {
            messages: messages.map(m => ({
              id: m.id,
              chat_id: m.chat_id,
              user_id: m.user_id,
              content: m.content,
              created_at: m.created_at,
              is_from_user: m.user_id === user.id
            }))
          }
        }
      }

      // 10. Verifications
      const { data: verifications } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (verifications) {
        exportData.verifications = {
          verifications: verifications.map(v => ({
            id: v.id,
            provider: v.provider,
            status: v.status,
            review_reason: v.review_reason,
            created_at: v.created_at,
            updated_at: v.updated_at
            // Note: We don't export provider_session_id or provider_data for security
          }))
        }
      }

      // 11. Reports (where user is reporter or target)
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .or(`reporter_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      
      if (reports) {
        exportData.reports = {
          reports: reports.map(r => ({
            id: r.id,
            reporter_id: r.reporter_id,
            target_user_id: r.target_user_id,
            message_id: r.message_id,
            reason: r.reason,
            details: r.details,
            status: r.status,
            action_taken: r.action_taken,
            created_at: r.created_at,
            updated_at: r.updated_at,
            is_reporter: r.reporter_id === user.id
          }))
        }
      }

      // 12. Notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit to most recent 1000
      
      if (notifications) {
        exportData.notifications = {
          notifications: notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            read: n.read,
            created_at: n.created_at
          }))
        }
      }

      // 13. App events (analytics)
      const { data: events } = await supabase
        .from('app_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit to most recent 1000
      
      if (events) {
        exportData.activity = {
          events: events.map(e => ({
            id: e.id,
            name: e.name,
            props: e.props,
            created_at: e.created_at
          }))
        }
      }

      // 14. User vectors (matching data)
      const { data: userVector } = await supabase
        .from('user_vectors')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (userVector) {
        exportData.preferences = {
          matching_vector: {
            created_at: userVector.created_at,
            updated_at: userVector.updated_at
            // Note: Vector data itself is not exported as it's not meaningful to users
          }
        }
      }

      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const buffer = Buffer.from(await blob.arrayBuffer())

      // Update DSAR request with completion
      await updateDSARRequestStatus(dsarRequest.id, 'completed', undefined, undefined, {
        export_size_bytes: buffer.length,
        export_format: 'json',
        data_categories: Object.keys(exportData).filter(k => k !== 'export_metadata')
      })

      safeLogger.info('Data export completed', { 
        requestId: dsarRequest.id, 
        userId: user.id,
        sizeBytes: buffer.length 
      })

      // Return JSON file
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="domu-match-data-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-ID': dsarRequest.id
        }
      })

    } catch (error) {
      // Update DSAR request status to rejected on error
      await updateDSARRequestStatus(dsarRequest.id, 'rejected', undefined, `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }

  } catch (error) {
    safeLogger.error('Data export error', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

