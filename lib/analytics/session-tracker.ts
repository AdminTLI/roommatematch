// Session Tracking for User Journey Analytics
// This module tracks user sessions and calculates session duration

import { safeLogger } from '@/lib/utils/logger'

export interface SessionData {
  sessionId: string
  userId?: string
  startTime: Date
  lastActivity: Date
  pageViews: number
  events: number
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes of inactivity
const SESSION_STORAGE_KEY = 'domu_session_id'
const SESSION_START_KEY = 'domu_session_start'

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get or create a session ID from localStorage
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId()
  }

  const existing = localStorage.getItem(SESSION_STORAGE_KEY)
  const sessionStart = localStorage.getItem(SESSION_START_KEY)
  
  // Check if session has expired (30 minutes of inactivity)
  if (existing && sessionStart) {
    const startTime = new Date(sessionStart).getTime()
    const now = Date.now()
    
    if (now - startTime < SESSION_TIMEOUT_MS) {
      return existing
    }
  }
  
  // Create new session
  const newSessionId = generateSessionId()
  localStorage.setItem(SESSION_STORAGE_KEY, newSessionId)
  localStorage.setItem(SESSION_START_KEY, new Date().toISOString())
  
  return newSessionId
}

/**
 * Parse user agent for device information
 */
function parseUserAgent(userAgent?: string): {
  deviceType: string
  browser: string
  operatingSystem: string
} {
  let deviceType = 'unknown'
  let browser = 'unknown'
  let operatingSystem = 'unknown'

  if (userAgent) {
    // Device type
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet'
    } else {
      deviceType = 'desktop'
    }

    // Browser
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browser = 'chrome'
    } else if (/firefox/i.test(userAgent)) {
      browser = 'firefox'
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'safari'
    } else if (/edge/i.test(userAgent)) {
      browser = 'edge'
    }

    // Operating system
    if (/windows/i.test(userAgent)) {
      operatingSystem = 'windows'
    } else if (/mac/i.test(userAgent)) {
      operatingSystem = 'macos'
    } else if (/linux/i.test(userAgent)) {
      operatingSystem = 'linux'
    } else if (/android/i.test(userAgent)) {
      operatingSystem = 'android'
    } else if (/ios|iphone|ipad/i.test(userAgent)) {
      operatingSystem = 'ios'
    }
  }

  return { deviceType, browser, operatingSystem }
}

/**
 * Track a user journey event with session information
 * Uses API route to avoid creating multiple Supabase clients
 */
export async function trackUserJourneyEvent(
  eventName: string,
  eventCategory: 'page_view' | 'user_action' | 'system_event' | 'conversion' | 'error' | 'performance',
  userId?: string,
  eventProperties?: Record<string, any>,
  pageUrl?: string
): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      // Server-side: skip tracking
      return
    }

    const sessionId = getOrCreateSessionId()
    const userAgent = window.navigator.userAgent
    const page = pageUrl || window.location.href
    const referrer = document.referrer || undefined

    const { deviceType, browser, operatingSystem } = parseUserAgent(userAgent)

    // Call API route instead of creating Supabase client
    const response = await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        eventName,
        eventCategory,
        eventProperties: eventProperties || {},
        pageUrl: page,
        referrerUrl: referrer,
        userAgent,
        deviceType,
        browser,
        operatingSystem
      })
    })

    if (!response.ok) {
      // Handle 429 rate limit errors gracefully - don't log as errors since rate limiting is expected
      if (response.status === 429) {
        // Rate limited - silently skip tracking for this event
        // Don't log anything to avoid console spam
        return
      }
      
      let errorData: any = {}
      let rawResponseText = ''
      try {
        rawResponseText = await response.text()
        if (rawResponseText) {
          errorData = JSON.parse(rawResponseText)
        }
      } catch (parseError) {
        // If JSON parsing fails, use the raw text as error message
        errorData = { 
          error: 'Failed to parse error response', 
          rawResponse: rawResponseText || 'No response body',
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        }
      }
      
      // Log full error details - stringify to ensure all data is visible
      const errorSummary = {
        error: errorData.error || errorData.details || errorData.message || 'Unknown error',
        details: errorData.details,
        code: errorData.code,
        hint: errorData.hint,
        message: errorData.message,
        status: response.status,
        statusText: response.statusText,
        eventName,
        pageUrl: page
      }
      
      // Only log non-rate-limit errors
      safeLogger.error('Failed to track user journey event', errorSummary)
    } else {
      // Update session start time in localStorage
      localStorage.setItem(SESSION_START_KEY, new Date().toISOString())
    }
  } catch (error) {
    safeLogger.error('Error tracking user journey event', { error, eventName })
  }
}

/**
 * Calculate and update session duration for a session
 * This should be called periodically or when a session ends
 * Note: This requires service role key for updates, so we'll calculate on the server side
 */
export async function updateSessionDuration(sessionId: string, userId?: string): Promise<void> {
  try {
    // For now, we'll calculate session duration on the server side when querying metrics
    // This avoids needing service role key on the client
    // The duration will be calculated from event timestamps in the metrics calculation
    // We can optionally call an API endpoint to update durations if needed
    
    // Store session end time in localStorage for client-side tracking
    if (typeof window !== 'undefined') {
      const sessionEndKey = `domu_session_end_${sessionId}`
      localStorage.setItem(sessionEndKey, new Date().toISOString())
    }
  } catch (error) {
    safeLogger.error('Error updating session duration', { error, sessionId })
  }
}

/**
 * Track a page view
 */
export async function trackPageView(
  page: string,
  userId?: string,
  additionalProps?: Record<string, any>
): Promise<void> {
  await trackUserJourneyEvent(
    'page_view',
    'page_view',
    userId,
    {
      page,
      ...additionalProps
    },
    page
  )
}

/**
 * Track a user action
 */
export async function trackUserAction(
  action: string,
  userId?: string,
  properties?: Record<string, any>
): Promise<void> {
  await trackUserJourneyEvent(
    action,
    'user_action',
    userId,
    properties
  )
}

// Track if session tracking has been initialized to prevent duplicate initialization
let sessionTrackingInitialized = false

/**
 * Initialize session tracking on page load
 * Note: This does NOT track the initial page view - that's handled by SessionTrackerProvider
 * to avoid duplicate tracking
 */
export function initializeSessionTracking(userId?: string): void {
  if (typeof window === 'undefined') {
    return
  }

  // Prevent duplicate initialization (especially important in React Strict Mode)
  if (sessionTrackingInitialized) {
    return
  }
  sessionTrackingInitialized = true

  // Don't track initial page view here - SessionTrackerProvider handles it
  // This prevents duplicate tracking when both initializeSessionTracking and 
  // the pathname effect fire

  // Track page visibility changes (to detect when user leaves)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User left the page - update session duration
      const sessionId = getOrCreateSessionId()
      updateSessionDuration(sessionId, userId)
    }
  })

  // Track before unload (when user closes tab/window)
  window.addEventListener('beforeunload', () => {
    const sessionId = getOrCreateSessionId()
    updateSessionDuration(sessionId, userId)
  })

  // Periodically update session duration (every 5 minutes)
  setInterval(() => {
    const sessionId = getOrCreateSessionId()
    updateSessionDuration(sessionId, userId)
  }, 5 * 60 * 1000)
}

