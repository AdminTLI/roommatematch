import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { runMatchingAsSuggestions } from '@/lib/matching/orchestrator'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { getDistributedLock } from '@/lib/concurrency-lock'
import { safeLogger } from '@/lib/utils/logger'

// Maximum cohort size to prevent DoS
const MAX_COHORT_SIZE = 1000
// Lock TTL: 10 minutes to handle long-running matching operations
const LOCK_TTL_SECONDS = 10 * 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: 'Email verification required',
        requiresVerification: true 
      }, { status: 403 })
    }

    // Rate limiting: 1 request per 5 minutes per user (prevents spam/DoS)
    const rateLimitKey = getUserRateLimitKey('matching_refresh', user.id)
    const rateLimitResult = await checkRateLimit('matching_refresh', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait before refreshing again.',
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

    // Distributed concurrency lock: prevent duplicate concurrent requests from same user
    // Works across serverless instances using Upstash Redis
    const lock = getDistributedLock()
    const lockKey = `matching_refresh:${user.id}`
    
    const lockAcquired = await lock.acquire(lockKey, LOCK_TTL_SECONDS)
    if (!lockAcquired) {
      // Check how long until the lock expires to provide helpful error message
      const ttl = await lock.getTTL(lockKey)
      const minutesRemaining = ttl > 0 ? Math.ceil(ttl / 60) : 0
      
      safeLogger.warn('[Matching] Duplicate refresh request detected (lock already held)', {
        userId: user.id,
        lockKey,
        ttlSeconds: ttl,
        minutesRemaining
      })
      
      const errorMessage = ttl > 0
        ? `A refresh is already in progress. Please wait ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
        : 'A refresh is already in progress. Please wait a few minutes and try again.'
      
      return NextResponse.json(
        { 
          error: errorMessage,
          retryAfter: ttl > 0 ? ttl : 60 // Suggest retry after TTL or 60 seconds
        },
        { status: 409 }
      )
    }

    try {
      const repo = await getMatchRepo()
      
      // Check for recent suggestions (short-circuit if user has recent suggestions)
      const recentSuggestions = await repo.listSuggestionsForUser(user.id, false)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const hasRecentSuggestions = recentSuggestions.some(s => 
        new Date(s.createdAt) > new Date(oneHourAgo)
      )

      if (hasRecentSuggestions) {
        safeLogger.debug('[Matching] User has recent suggestions, returning cached result')
        return NextResponse.json({
          runId: `refresh_${Date.now()}`,
          created: 0,
          suggestions: recentSuggestions.slice(0, 10), // Return top 10
          message: 'Using recent suggestions'
        })
      }
      
      // Efficiently fetch the current user's profile
      let currentUser = await repo.getCandidateByUserId(user.id)
      if (!currentUser) {
        safeLogger.warn('[Matching] User not eligible for matching')
        return NextResponse.json({ 
          error: 'User profile not found or not eligible for matching',
          details: 'Check server logs for missing required fields'
        }, { status: 404 })
      }
      
      // Auto-generate vector if missing
      if (!currentUser.vector) {
        safeLogger.debug('[Matching] Current user missing vector, generating...')
        // Use update_user_vector which we know works with JSONB
        const { error: vectorError } = await supabase.rpc('update_user_vector', { 
          p_user_id: user.id 
        })
        
        if (vectorError) {
          safeLogger.error('[Matching] Vector generation failed', {
            error: vectorError,
            code: vectorError.code,
            message: vectorError.message,
            details: vectorError.details
          })
        } else {
          safeLogger.debug('[Matching] Vector generated successfully, refetching user...')
          // Refetch user to get updated vector
          const refetched = await repo.getCandidateByUserId(user.id)
          if (refetched) {
            currentUser = refetched
          }
        }
      }
      
      // Ensure currentUser is still valid after vector generation
      if (!currentUser) {
        return NextResponse.json({ 
          error: 'User profile not found or not eligible for matching',
          details: 'Check server logs for missing required fields'
        }, { status: 404 })
      }
      
      // Build cohort filter based on user's profile
      // Note: 
      // - institutionId is NOT included - students from different universities can match
      //   (same university is a bonus in scoring, not a requirement)
      // - programmeId is NOT included - program matching is a preference/boost in scoring
      // - campusCity is included to match students in the same city (works across universities)
      // - degreeLevel is kept as a requirement for similar academic stage matching
      const cohort: any = {
        degreeLevel: currentUser.degreeLevel,
        excludeUserIds: [user.id],
        onlyActive: true, // Require verified/active profiles for suggestions
        excludeAlreadyMatched: true,
        limit: MAX_COHORT_SIZE // Cap cohort size to prevent DoS
      }
      
      // Only add campusCity filter if it has a value (city-based matching works across universities)
      if (currentUser.campusCity) {
        cohort.campusCity = currentUser.campusCity
      }
      
      safeLogger.info('[Matching] Starting refresh with cohort filter', {
        hasCampusCity: !!cohort.campusCity,
        degreeLevel: cohort.degreeLevel,
        maxCohortSize: MAX_COHORT_SIZE
      })
      
      // Expire old pending/accepted suggestions for this user before creating new ones
      const expiredCount = await repo.expireOldSuggestionsForUser(user.id)
      if (expiredCount > 0) {
        safeLogger.debug('[Matching] Expired old suggestions', {
          expiredCount
        })
      }
      
      // Generate new suggestions
      const result = await runMatchingAsSuggestions({
        repo,
        mode: 'pairs',
        groupSize: 2,
        cohort,
        runId: `refresh_${Date.now()}`
      })

      safeLogger.info('[Matching] Refresh completed', {
        created: result.created,
        suggestionCount: result.suggestions.length
      })
      
      return NextResponse.json(result)
    } finally {
      // Always release the distributed lock
      try {
        await lock.release(lockKey)
      } catch (lockError) {
        safeLogger.warn('[Matching] Failed to release lock (will expire via TTL)', {
          userId: user.id,
          error: lockError
        })
        // Lock will expire naturally via TTL, so this is not critical
      }
    }
    
  } catch (error) {
    // Ensure we release the lock even on error
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const lock = getDistributedLock()
        const lockKey = `matching_refresh:${user.id}`
        await lock.release(lockKey)
      }
    } catch (cleanupError) {
      // Ignore errors when cleaning up - lock will expire via TTL
      safeLogger.debug('[Matching] Error during lock cleanup', cleanupError)
    }

    safeLogger.error('[Matching] Error refreshing suggestions', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      errorString: String(error),
      errorType: typeof error
    })
    return NextResponse.json(
      { 
        error: 'Failed to refresh suggestions',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
