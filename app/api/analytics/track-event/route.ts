import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { parseUTMParamsFromURL, classifyTrafficSource } from '@/lib/analytics/traffic-source-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user (optional - can be null for anonymous users)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Use admin client for inserts to bypass RLS and avoid infinite recursion
    // Analytics tracking should not be blocked by RLS policies
    const adminSupabase = createAdminClient()
    
    // Parse request body with error handling
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      safeLogger.error('Failed to parse request body', { error: parseError })
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
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
    } = body || {}

    if (!sessionId || !eventName || !eventCategory) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, eventName, eventCategory' },
        { status: 400 }
      )
    }

    // Extract UTM parameters from pageUrl if available
    let utmParams: { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null; utm_term?: string | null; utm_content?: string | null } = {}
    let trafficSource: string | null = null
    
    if (pageUrl && typeof pageUrl === 'string' && pageUrl.includes('?')) {
      // Only parse UTM params if URL has query parameters
      // UTM params are typically only in the initial page load URL with query string
      try {
        utmParams = parseUTMParamsFromURL(pageUrl)
        // Ensure referrerUrl is a string or null
        const referrerStr = referrerUrl && typeof referrerUrl === 'string' && referrerUrl.trim() !== '' ? referrerUrl : null
        trafficSource = classifyTrafficSource(referrerStr, utmParams.utm_source || null, utmParams.utm_medium || null)
      } catch (error) {
        safeLogger.error('Error parsing UTM params', { error, pageUrl })
        // Continue without UTM params - not a critical error
      }
    } else if (referrerUrl && typeof referrerUrl === 'string' && referrerUrl.trim() !== '') {
      // If no UTM params but we have a referrer, classify traffic source from referrer only
      try {
        trafficSource = classifyTrafficSource(referrerUrl, null, null)
      } catch (error) {
        safeLogger.error('Error classifying traffic source', { error, referrerUrl })
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
    // Use admin client to bypass RLS and avoid infinite recursion in policies
    let { error, data } = await adminSupabase
      .from('user_journey_events')
      .insert(insertDataWithUTM)
      .select()

    // Log the attempt for debugging
    console.log('[Track Event API] Insert attempt:', {
      eventName,
      hasUTMColumns: !!(utmParams.utm_source || utmParams.utm_medium),
      trafficSource,
      userId: user?.id,
      hasError: !!error
    })

    // If error is about missing columns (migration not applied), retry without UTM columns
    if (error && (
      error.message?.includes('column') || 
      error.message?.includes('does not exist') ||
      error.code === '42703' // PostgreSQL undefined column error
    )) {
      safeLogger.warn('UTM columns not found, inserting without them', { eventName, error: error.message })
      
      // Retry without UTM columns
      const { error: fallbackError } = await adminSupabase
        .from('user_journey_events')
        .insert(baseInsertData)
      
      if (fallbackError) {
        safeLogger.error('Failed to track user journey event (fallback)', { 
          error: fallbackError, 
          eventName,
          fallbackErrorCode: fallbackError.code,
          fallbackErrorMessage: fallbackError.message
        })
        return NextResponse.json(
          { error: 'Failed to track event', details: fallbackError.message, code: fallbackError.code },
          { status: 500 }
        )
      }
      // Success with fallback - return early
      return NextResponse.json({ success: true })
    }
    
    // Check for CHECK constraint violations (e.g., invalid traffic_source value)
    if (error && (
      error.code === '23514' || // CHECK constraint violation
      error.message?.includes('check constraint') ||
      error.message?.includes('violates check constraint')
    )) {
      safeLogger.warn('CHECK constraint violation, retrying without problematic fields', { 
        eventName, 
        error: error.message,
        trafficSource 
      })
      
      // Retry without traffic_source if it's causing the issue
      const insertDataWithoutTrafficSource = {
        ...baseInsertData,
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null,
        // Omit traffic_source if it's invalid
      }
      
      const { error: retryError } = await adminSupabase
        .from('user_journey_events')
        .insert(insertDataWithoutTrafficSource)
      
      if (retryError) {
        // Final fallback: try with base data only
        const { error: finalError } = await adminSupabase
          .from('user_journey_events')
          .insert(baseInsertData)
        
        if (finalError) {
          safeLogger.error('Failed to track user journey event (final fallback)', { 
            error: finalError, 
            eventName 
          })
          return NextResponse.json(
            { error: 'Failed to track event', details: finalError.message, code: finalError.code },
            { status: 500 }
          )
        }
      }
      return NextResponse.json({ success: true })
    }

    // If there's an error that's not about missing columns
    if (error) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }
      // Log full error object for debugging
      console.error('[Track Event API] Database error:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        eventName,
        userId: user?.id,
        insertDataKeys: Object.keys(insertDataWithUTM)
      })
      safeLogger.error('Failed to track user journey event', { 
        error: errorDetails, 
        eventName,
        insertData: insertDataWithUTM,
        userId: user?.id,
        fullError: error
      })
      // Stringify error for better visibility in logs
      const errorString = JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, null, 2)
      
      console.error('[Track Event API] Error details (stringified):', errorString)
      
      return NextResponse.json(
        { 
          error: 'Failed to track event', 
          details: error.message || 'Unknown error',
          code: error.code || 'UNKNOWN',
          hint: error.hint,
          message: error.message || 'Database insert failed',
          // Include full error for debugging
          fullError: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    safeLogger.error('Error in track-event API', { 
      error: errorMessage,
      stack: errorStack,
      errorObject: error
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

