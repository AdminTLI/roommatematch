import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
        // Check what's missing to provide helpful error message
        // Use admin client to access all data
        const adminClient = createAdminClient()
        const { data: profile } = await adminClient
          .from('profiles')
          .select('user_id, degree_level, campus')
          .eq('user_id', user.id)
          .maybeSingle()
        
        const { data: academic } = await adminClient
          .from('user_academic')
          .select('user_id, degree_level, program_id, undecided_program')
          .eq('user_id', user.id)
          .maybeSingle()
        
        const { data: submission } = await adminClient
          .from('onboarding_submissions')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        // Fetch responses to check what's actually missing
        const { data: responses } = await adminClient
          .from('responses')
          .select('question_key, value')
          .eq('user_id', user.id)
        
        // Build answers object from responses
        let answers: Record<string, any> = (responses || []).reduce((acc: Record<string, any>, r: any) => {
          acc[r.question_key] = r.value
          return acc
        }, {})
        
        // If responses are missing, try reading from onboarding_sections and transforming
        if (!responses || responses.length === 0) {
          const { data: sections } = await adminClient
            .from('onboarding_sections')
            .select('section, answers')
            .eq('user_id', user.id)
          
          if (sections && sections.length > 0) {
            // Transform answers from onboarding_sections format to responses format
            const { transformAnswer } = await import('@/lib/question-key-mapping')
            for (const section of sections) {
              if (section.answers && Array.isArray(section.answers)) {
                for (const answer of section.answers) {
                  const transformed = transformAnswer(answer)
                  if (transformed) {
                    answers[transformed.question_key] = transformed.value
                  }
                }
              }
            }
          }
        }
        
        // Enrich with profile/academic data
        if (academic) {
          if (!answers.degree_level) answers.degree_level = academic.degree_level
          if (!answers.program) {
            if (academic.undecided_program) {
              answers.program = 'undecided'
            } else if (academic.program_id) {
              answers.program = academic.program_id
            }
          }
        }
        if (profile && !answers.campus) {
          answers.campus = profile.campus || null
        }
        
        // Get missing fields
        const { getMissingFields } = await import('@/lib/matching/completeness')
        const missingFields = getMissingFields(answers)
        
        let errorMessage = 'Your profile is not set up for matching.'
        let details = ''
        
        if (!profile) {
          errorMessage = 'Profile not found. Please complete your profile setup.'
          details = 'You need to create a profile before you can get matches.'
        } else if (!academic) {
          errorMessage = 'Academic information missing. Please complete your academic details.'
          details = 'You need to provide your university, degree level, and program information.'
        } else if (!submission) {
          errorMessage = 'Questionnaire not completed. Please finish the onboarding questionnaire.'
          details = 'You need to complete all required questions in the questionnaire to get matches.'
        } else if (missingFields.length > 0) {
          errorMessage = 'Questionnaire incomplete. Please complete all required questions.'
          details = `Missing required fields: ${missingFields.slice(0, 5).join(', ')}${missingFields.length > 5 ? ` and ${missingFields.length - 5} more` : ''}. Please complete your onboarding.`
          safeLogger.warn('[Matching] User not eligible - missing fields', {
            userId: user.id,
            missingFields,
            missingCount: missingFields.length,
            totalResponses: responses?.length || 0
          })
        } else {
          errorMessage = 'Questionnaire incomplete. Please complete all required questions.'
          details = 'Some required questions in your questionnaire are missing. Please complete your onboarding.'
        }
        
        safeLogger.warn('[Matching] User not eligible for matching', {
          userId: user.id,
          hasProfile: !!profile,
          hasAcademic: !!academic,
          hasSubmission: !!submission,
          missingFields: missingFields.length > 0 ? missingFields : undefined,
          responseCount: responses?.length || 0
        })
        
        return NextResponse.json({ 
          error: errorMessage,
          details,
          requiresOnboarding: true,
          missingFields: missingFields.length > 0 ? missingFields : undefined
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
        safeLogger.warn('[Matching] User not eligible after vector generation')
        return NextResponse.json({ 
          error: 'Your profile is not set up for matching',
          details: 'Please complete your onboarding questionnaire to get matches.',
          requiresOnboarding: true
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
      
      // Matches don't expire - skip expiration logic
      // Generate new suggestions with detailed logging
      const result = await runMatchingAsSuggestions({
        repo,
        mode: 'pairs',
        groupSize: 2,
        cohort,
        runId: `refresh_${Date.now()}`,
        currentUserId: user.id // Pass current user ID for detailed logging
      })

      // Filter suggestions to only include ones for the current user
      const userSuggestions = result.suggestions.filter(s => 
        s.memberIds && s.memberIds.includes(user.id)
      )

      safeLogger.info('[Matching] Refresh completed', {
        created: result.created,
        totalSuggestions: result.suggestions.length,
        userSuggestions: userSuggestions.length,
        message: result.message,
        hasDiagnostic: !!result.diagnostic,
        diagnosticKeys: result.diagnostic ? Object.keys(result.diagnostic) : []
      })
      
      // If no suggestions found for this user, provide diagnostic information
      if (userSuggestions.length === 0) {
        safeLogger.debug('[Matching] No suggestions for user, gathering diagnostic info', {
          resultDiagnostic: result.diagnostic,
          resultDiagnosticType: typeof result.diagnostic,
          resultKeys: Object.keys(result)
        })
        // Check how many candidates were found in the cohort
        const allCandidates = await repo.loadCandidates({
          ...cohort,
          excludeUserIds: [user.id]
        })
        
        // Check how many total eligible users exist (without filters)
        const allEligibleUsers = await repo.loadCandidates({
          onlyActive: true,
          excludeUserIds: [user.id]
        })
        
        // Check how many users exist with same degree level (without campus filter)
        const sameDegreeLevel = await repo.loadCandidates({
          degreeLevel: cohort.degreeLevel,
          onlyActive: true,
          excludeUserIds: [user.id]
        })
        
        // Use result.diagnostic if available, otherwise create a basic one
        // result.diagnostic exists when NO pairs passed (pairFits.length === 0)
        // If it doesn't exist, it means pairs DID pass but none included this user
        const matchingStats = result.diagnostic || (result.suggestions.length > 0 ? {
          totalPairs: 'unknown',
          dealBreakerBlocks: 'unknown',
          belowThreshold: 'unknown',
          passedDealBreakers: 'unknown',
          scoreStats: { avg: 'unknown', max: 'unknown', min: 'unknown', count: 'unknown' },
          dealBreakerReasons: {},
          note: `Matching succeeded for other users (${result.suggestions.length} suggestions created), but none include you. This may indicate deal-breakers or low compatibility scores between you and other users.`
        } : null)
        
        const diagnosticInfo = {
          message: result.message || (result.suggestions.length > 0 
            ? 'No suggestions found for you, but matching succeeded for other users'
            : 'No suggestions found'),
          cohortFilter: {
            degreeLevel: cohort.degreeLevel,
            campusCity: cohort.campusCity || null,
            onlyActive: cohort.onlyActive,
            excludeAlreadyMatched: cohort.excludeAlreadyMatched
          },
          candidateCounts: {
            inCohort: allCandidates.length,
            sameDegreeLevel: sameDegreeLevel.length,
            totalEligible: allEligibleUsers.length
          },
          matchingStats: matchingStats,
          possibleReasons: [] as string[]
        }
        
        if (allCandidates.length === 0) {
          if (sameDegreeLevel.length === 0) {
            diagnosticInfo.possibleReasons.push('No other users with the same degree level found')
          } else if (cohort.campusCity && sameDegreeLevel.length > 0) {
            diagnosticInfo.possibleReasons.push(`No other users found in ${cohort.campusCity} with the same degree level`)
            diagnosticInfo.possibleReasons.push(`There are ${sameDegreeLevel.length} users with the same degree level, but none in your city`)
          }
          
          if (cohort.excludeAlreadyMatched && sameDegreeLevel.length > 0) {
            diagnosticInfo.possibleReasons.push('All users with matching criteria may already be matched')
          }
        } else {
          // Use detailed matching stats if available
          if (diagnosticInfo.matchingStats) {
            const stats = diagnosticInfo.matchingStats
            if (stats.dealBreakerBlocks > 0) {
              diagnosticInfo.possibleReasons.push(`${stats.dealBreakerBlocks} out of ${stats.totalPairs} pairs blocked by deal-breakers`)
              if (Object.keys(stats.dealBreakerReasons || {}).length > 0) {
                const topReason = Object.entries(stats.dealBreakerReasons || {})
                  .sort((a, b) => b[1] - a[1])[0]
                if (topReason) {
                  diagnosticInfo.possibleReasons.push(`Most common issue: ${topReason[0]} (${topReason[1]} times)`)
                }
              }
            }
            if (stats.belowThreshold > 0) {
              const avgScore = stats.scoreStats?.avg || 0
              diagnosticInfo.possibleReasons.push(`${stats.belowThreshold} pairs passed deal-breakers but scored below 30% threshold (average: ${avgScore}%)`)
            }
            if (stats.passedDealBreakers === 0 && stats.dealBreakerBlocks === stats.totalPairs) {
              diagnosticInfo.possibleReasons.push('All potential matches were blocked by deal-breakers. Consider adjusting your preferences.')
            }
          } else {
            diagnosticInfo.possibleReasons.push('Candidates found but no matches passed deal-breaker checks or minimum score threshold (30%)')
            diagnosticInfo.possibleReasons.push('Try adjusting your preferences or wait for more users to join')
          }
        }
        
        return NextResponse.json({
          ...result,
          suggestions: userSuggestions, // Only return suggestions for current user
          created: userSuggestions.length, // Update count to reflect user's suggestions
          diagnostic: diagnosticInfo
        })
      }
      
      // Return only suggestions for the current user
      return NextResponse.json({
        ...result,
        suggestions: userSuggestions,
        created: userSuggestions.length
      })
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
