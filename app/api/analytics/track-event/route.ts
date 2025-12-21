import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { parseUTMParamsFromURL, classifyTrafficSource } from '@/lib/analytics/traffic-source-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user (optional - can be null for anonymous users)
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const {
      sessionId,
      eventName,
      eventCategory,
      eventProperties,
      pageUrl,
      referrerUrl,
      userAgent,
      deviceType,
      browser,
      operatingSystem
    } = body

    if (!sessionId || !eventName || !eventCategory) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, eventName, eventCategory' },
        { status: 400 }
      )
    }

    // Extract UTM parameters from pageUrl if available
    let utmParams = {}
    let trafficSource: string | null = null
    
    if (pageUrl) {
      try {
        utmParams = parseUTMParamsFromURL(pageUrl)
        trafficSource = classifyTrafficSource(referrerUrl, utmParams.utm_source || null, utmParams.utm_medium || null)
      } catch (error) {
        safeLogger.error('Error parsing UTM params', { error, pageUrl })
      }
    }

    // Build base insert object (always include these)
    const baseInsertData: Record<string, any> = {
      user_id: user?.id || null,
      session_id: sessionId,
      event_name: eventName,
      event_category: eventCategory,
      event_properties: eventProperties || {},
      page_url: pageUrl || null,
      referrer_url: referrerUrl || null,
      user_agent: userAgent || null,
      device_type: deviceType || null,
      browser: browser || null,
      operating_system: operatingSystem || null,
      event_timestamp: new Date().toISOString()
    }

    // Try inserting with UTM columns first
    const insertDataWithUTM = {
      ...baseInsertData,
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_term: utmParams.utm_term || null,
      utm_content: utmParams.utm_content || null,
      traffic_source: trafficSource
    }

    // Insert the event - try with UTM columns first
    let { error } = await supabase
      .from('user_journey_events')
      .insert(insertDataWithUTM)

    // If error is about missing columns (migration not applied), retry without UTM columns
    if (error && (
      error.message?.includes('column') || 
      error.message?.includes('does not exist') ||
      error.code === '42703' // PostgreSQL undefined column error
    )) {
      safeLogger.warn('UTM columns not found, inserting without them', { eventName, error: error.message })
      
      // Retry without UTM columns
      const { error: fallbackError } = await supabase
        .from('user_journey_events')
        .insert(baseInsertData)
      
      if (fallbackError) {
        safeLogger.error('Failed to track user journey event (fallback)', { error: fallbackError, eventName })
        return NextResponse.json(
          { error: 'Failed to track event', details: fallbackError.message },
          { status: 500 }
        )
      }
      // Success with fallback - return early
      return NextResponse.json({ success: true })
    }

    // If there's an error that's not about missing columns
    if (error) {
      safeLogger.error('Failed to track user journey event', { 
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }, 
        eventName,
        insertData: insertDataWithUTM
      })
      return NextResponse.json(
        { 
          error: 'Failed to track event', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('Error in track-event API', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

