// Main orchestrator for the matching system
// Coordinates the complete matching flow: load → filter → score → optimize → persist

import { randomUUID } from 'crypto'
import type { MatchRepo, CohortFilter, MatchRecord } from './repo'
import type { MatchSuggestion } from './types'
import { toStudent, mapAnswersToVector } from './answer-map'
import { checkDealBreakers, getReadableReasons } from './dealbreakers'
import { solvePairs, solveGroups } from './optimize'
import { MatchingEngine, DEFAULT_WEIGHTS, type MatchingWeights } from './scoring'
import itemBank from '@/data/item-bank.v1.json'
import matchModeConfig from '@/config/match-mode.json'
import { safeLogger } from '@/lib/utils/logger'
import { getActiveExperiments, assignUserToExperiment, getUserVariant, trackMatchQualityMetrics } from './experiments'

export interface MatchingResult {
  runId: string
  count: number
  matches: MatchRecord[]
  message?: string
}

export interface SuggestionResult {
  runId: string
  created: number
  suggestions: MatchSuggestion[]
  message?: string
  diagnostic?: {
    totalPairs: number
    dealBreakerBlocks: number
    belowThreshold: number
    passedDealBreakers: number
    scoreStats: {
      avg: number
      max: number
      min: number
      count: number
    }
    dealBreakerReasons: Record<string, number>
  }
}

export async function runMatching({
  repo,
  mode,
  groupSize = 2,
  cohort,
  runId = `run_${Date.now()}`
}: {
  repo: MatchRepo
  mode: 'pairs' | 'groups'
  groupSize?: number
  cohort: CohortFilter
  runId?: string
}): Promise<MatchingResult> {
  try {
    // 1) Load raw candidates and map to engine shape
    safeLogger.debug(`[Matching] Loading candidates with filter`)
    const rawCandidates = await repo.loadCandidates({
      excludeAlreadyMatched: true,
      ...cohort,
      // onlyActive defaults to cohort value, but ensure it's set if not provided
      onlyActive: cohort.onlyActive ?? true
    })

    if (rawCandidates.length === 0) {
      return {
        runId,
        count: 0,
        matches: [],
        message: 'No candidates found in cohort'
      }
    }

    safeLogger.debug(`[Matching] Found ${rawCandidates.length} candidates`)

    // Transform to student profiles
    // Include vector in answers so it's accessible via student.raw.vector
    const students = rawCandidates.map(candidate => {
      const answersWithVector = {
        ...candidate.answers,
        vector: candidate.vector // Include vector in answers for toEngineProfile access
      }
      return toStudent({
        id: candidate.id,
        answers: answersWithVector,
        campusCity: candidate.campusCity,
        universityId: candidate.universityId,
        degreeLevel: candidate.degreeLevel,
        programmeId: candidate.programmeId,
        graduationYear: candidate.graduationYear
      })
    })

    // Get active experiments for A/B testing
    const universityId = cohort.universityId || students[0]?.meta?.universityId
    const activeExperiments = universityId ? await getActiveExperiments(students[0]?.id || '', universityId) : []

    // Assign users to experiment variants and get variant configurations
    const userVariantMap: Record<string, { experimentId: string; variantName: string; weights: MatchingWeights }> = {}

    if (activeExperiments.length > 0) {
      for (const experiment of activeExperiments) {
        for (const student of students) {
          try {
            let variantName = await getUserVariant(student.id, experiment.id)

            if (!variantName) {
              variantName = await assignUserToExperiment(student.id, experiment.id, experiment)
            }

            if (variantName) {
              const variant = experiment.variants.find(v => v.name === variantName)
              if (variant && variant.configuration?.weights) {
                userVariantMap[student.id] = {
                  experimentId: experiment.id,
                  variantName,
                  weights: { ...DEFAULT_WEIGHTS, ...variant.configuration.weights }
                }
              }
            }
          } catch (error) {
            safeLogger.error('Failed to assign user to experiment', { error, userId: student.id, experimentId: experiment.id })
          }
        }
      }
    }

    // Helper function to get weights for a user pair
    const getWeightsForPair = (userIdA: string, userIdB: string): MatchingWeights => {
      // If both users are in the same experiment variant, use variant weights
      // Otherwise, use default weights
      const variantA = userVariantMap[userIdA]
      const variantB = userVariantMap[userIdB]

      if (variantA && variantB && variantA.experimentId === variantB.experimentId && variantA.variantName === variantB.variantName) {
        return variantA.weights
      }

      return DEFAULT_WEIGHTS
    }

    // 2) Apply deal-breaker filtering
    safeLogger.debug(`[Matching] Applying deal-breaker filtering`)
    const validPairs: { a: number; b: number; score: number }[] = []

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i]
        const studentB = students[j]

        // Check deal-breakers
        const dealBreakerResult = checkDealBreakers(studentA, studentB)

        if (dealBreakerResult.canMatch) {
          // Get weights for this pair (considering experiments)
          const weights = getWeightsForPair(studentA.id, studentB.id)

          // Calculate compatibility score
          const engine = new MatchingEngine(weights)
          const profileA = toEngineProfile(studentA)
          const profileB = toEngineProfile(studentB)

          const { score } = engine.computeCompatibilityScore(profileA, profileB)

          validPairs.push({
            a: i,
            b: j,
            score
          })
        } else {
          safeLogger.debug(`[Matching] Deal-breaker conflict detected`, {
            conflicts: dealBreakerResult.conflicts
          })
        }
      }
    }

    safeLogger.debug(`[Matching] Found ${validPairs.length} valid pairs after deal-breaker filtering`)

    if (validPairs.length === 0) {
      return {
        runId,
        count: 0,
        matches: [],
        message: 'No valid matches found after applying deal-breaker filters'
      }
    }

    // 3) Solve optimization problem
    safeLogger.debug(`[Matching] Running ${mode} optimization`)
    const metas = Object.fromEntries(itemBank.map((item: any) => [item.id, item]))
    let optimizationResult

    if (mode === 'pairs' || groupSize === 2) {
      optimizationResult = solvePairs({
        students,
        metas,
        weights: DEFAULT_WEIGHTS,
        mode: 'pairs'
      })
    } else {
      optimizationResult = solveGroups({
        students,
        metas,
        weights: DEFAULT_WEIGHTS,
        mode: 'groups',
        groupSize
      })
    }

    // 4) Build MatchRecords with explanations
    const now = new Date().toISOString()
    const records: MatchRecord[] = []

    if (optimizationResult.pairs) {
      safeLogger.debug(`[Matching] Processing ${optimizationResult.pairs.length} pairs`)

      for (const pair of optimizationResult.pairs) {
        const studentA = students.find(s => s.id === pair.aId)!
        const studentB = students.find(s => s.id === pair.bId)!

        // Get weights for this pair (considering experiments)
        const weights = getWeightsForPair(studentA.id, studentB.id)

        // Get detailed scoring
        const engine = new MatchingEngine(weights)
        const profileA = toEngineProfile(studentA)
        const profileB = toEngineProfile(studentB)

        const { score, explanation } = engine.computeCompatibilityScore(profileA, profileB)

        // Generate human-readable reasons
        const reasons = getReadableReasons(studentA, studentB)

        // Extract section scores from explanation
        const sectionScores = {
          personality: explanation.similarity_score,
          schedule: explanation.schedule_overlap,
          lifestyle: (explanation.cleanliness_align + explanation.guests_noise_align) / 2,
          social: explanation.guests_noise_align,
          academic: explanation.academic_bonus ?
            (explanation.academic_bonus.university_affinity ? 0.08 : 0) +
            (explanation.academic_bonus.program_affinity ? 0.12 : 0) +
            (explanation.academic_bonus.faculty_affinity ? 0.05 : 0) : 0
        }

        records.push({
          kind: 'pair',
          aId: pair.aId,
          bId: pair.bId,
          fit: score,
          fitIndex: Math.round(score * 100),
          sectionScores,
          reasons,
          runId,
          locked: false,
          createdAt: now
        })

        // Track quality metrics for experiments (async, don't block)
        for (const userId of [pair.aId, pair.bId]) {
          const variant = userVariantMap[userId]
          if (variant) {
            // Track metrics asynchronously (don't await to avoid blocking)
            trackMatchQualityMetrics(
              `${pair.aId}-${pair.bId}`, // Use pair ID as match ID
              userId,
              variant.experimentId,
              variant.variantName,
              {
                compatibility_score: score,
                match_quality_score: score,
                outcome: 'created',
                outcome_timestamp: now
              }
            ).catch(err => {
              safeLogger.error('Failed to track match quality metrics', { error: err })
            })
          }
        }
      }
    } else if (optimizationResult.groups) {
      safeLogger.debug(`[Matching] Processing ${optimizationResult.groups.length} groups`)

      for (const group of optimizationResult.groups) {
        records.push({
          kind: 'group',
          memberIds: group.memberIds,
          avgFit: group.avgFit,
          fitIndex: Math.round(group.avgFit * 100),
          runId,
          locked: false,
          createdAt: now
        })
      }
    }

    // 5) Persist results
    safeLogger.debug(`[Matching] Persisting ${records.length} matches`)

    // Save match run
    await repo.saveMatchRun({
      runId,
      mode,
      cohortFilter: cohort,
      matchCount: records.length
    })

    // Save match records
    await repo.saveMatches(records)

    safeLogger.info(`[Matching] Successfully created ${records.length} matches`)

    return {
      runId,
      count: records.length,
      matches: records
    }

  } catch (error) {
    safeLogger.error('[Matching] Error during matching', error)
    throw new Error(`Matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function toEngineProfile(student: any) {
  // Convert StudentProfile to the format expected by MatchingEngine
  // Ensure sleep times are numbers (they might be strings from database)
  const sleepStart = student.raw.sleep_start !== undefined
    ? (typeof student.raw.sleep_start === 'string' ? parseFloat(student.raw.sleep_start) : Number(student.raw.sleep_start))
    : undefined
  const sleepEnd = student.raw.sleep_end !== undefined
    ? (typeof student.raw.sleep_end === 'string' ? parseFloat(student.raw.sleep_end) : Number(student.raw.sleep_end))
    : undefined

  // Use actual vector from candidate if available
  let vector: number[] = Array.isArray(student.raw.vector) ? student.raw.vector : []

  // If vector is missing OR appears to be all zeros, fall back to computing from answers
  const isZeroVector = (v: number[]) => v.length === 0 || v.every((x) => x === 0)
  if (isZeroVector(vector)) {
    try {
      safeLogger.warn('[Matching] Fallback vector computation from answers')
      vector = mapAnswersToVector(student.raw)
    } catch (e) {
      // As a last resort, provide a zero-vector of expected dimension
      vector = new Array(50).fill(0)
    }
  }

  return {
    userId: student.id,
    vector,
    sleepStart,
    sleepEnd,
    cleanlinessRoom: student.raw.cleanliness_room !== undefined ? Number(student.raw.cleanliness_room) : undefined,
    cleanlinessKitchen: student.raw.cleanliness_kitchen !== undefined ? Number(student.raw.cleanliness_kitchen) : undefined,
    noiseTolerance: student.raw.noise_tolerance !== undefined ? Number(student.raw.noise_tolerance) : undefined,
    guestsFrequency: student.raw.guests_frequency !== undefined ? Number(student.raw.guests_frequency) : undefined,
    partiesFrequency: student.raw.parties_frequency !== undefined ? Number(student.raw.parties_frequency) : undefined,
    studyIntensity: student.raw.study_intensity !== undefined ? Number(student.raw.study_intensity) : undefined,
    socialLevel: student.raw.social_level !== undefined ? Number(student.raw.social_level) : undefined,
    extraversion: student.raw.extraversion !== undefined ? Number(student.raw.extraversion) : undefined,
    agreeableness: student.raw.agreeableness !== undefined ? Number(student.raw.agreeableness) : undefined,
    conscientiousness: student.raw.conscientiousness !== undefined ? Number(student.raw.conscientiousness) : undefined,
    neuroticism: student.raw.neuroticism !== undefined ? Number(student.raw.neuroticism) : undefined,
    openness: student.raw.openness !== undefined ? Number(student.raw.openness) : undefined,
    universityId: student.meta.universityId,
    degreeLevel: student.meta.degreeLevel,
    programId: student.meta.programmeId,
    faculty: undefined,
    studyYear: student.meta.graduationYear
  }
}

export async function runMatchingAsSuggestions({
  repo,
  mode,
  groupSize = 2,
  cohort,
  runId = `run_${Date.now()}`,
  currentUserId
}: {
  repo: MatchRepo
  mode: 'pairs' | 'groups'
  groupSize?: number
  cohort: CohortFilter
  runId?: string
  currentUserId?: string // Optional: to track pairs involving a specific user
}): Promise<SuggestionResult> {
  try {
    const { topN, minFitIndex, expiryHours, maxSuggestionsPerUser } = matchModeConfig

    // 1) Load candidates
    safeLogger.debug(`[Suggestions] Loading candidates with filter`)
    const rawCandidates = await repo.loadCandidates({
      excludeAlreadyMatched: true,
      ...cohort,
      // onlyActive defaults to cohort value, but ensure it's set if not provided
      onlyActive: cohort.onlyActive ?? true
    })

    if (rawCandidates.length === 0) {
      safeLogger.debug(`[Suggestions] No candidates found in cohort`)
      return {
        runId,
        created: 0,
        suggestions: [],
        message: 'No candidates found in cohort'
      }
    }

    safeLogger.debug(`[Suggestions] Found ${rawCandidates.length} candidates`)

    // If currentUserId is provided, ensure they're included in the matching process
    // (they may have been excluded from the cohort filter)
    let candidatesToMatch = [...rawCandidates]
    if (currentUserId && !candidatesToMatch.find(c => c.id === currentUserId)) {
      safeLogger.info(`[Suggestions] Current user not in cohort, adding them for matching`, {
        currentUserId: currentUserId.substring(0, 8) + '...'
      })
      // Fetch the current user's candidate data
      const currentUserCandidate = await repo.getCandidateByUserId(currentUserId)
      if (currentUserCandidate) {
        candidatesToMatch.push(currentUserCandidate)
        safeLogger.info(`[Suggestions] Added current user to matching pool`)
      } else {
        safeLogger.warn(`[Suggestions] Current user not eligible for matching`)
      }
    }

    // Transform to student profiles
    // Include vector in answers so it's accessible via student.raw.vector
    const students = candidatesToMatch.map(candidate => {
      safeLogger.debug(`[Suggestions] Processing candidate`, {
        id: candidate.id,
        hasVector: !!candidate.vector,
        vectorLength: candidate.vector?.length
      })
      const answersWithVector = {
        ...candidate.answers,
        vector: candidate.vector // Include vector in answers for toEngineProfile access
      }
      return toStudent({
        id: candidate.id,
        answers: answersWithVector,
        campusCity: candidate.campusCity,
        universityId: candidate.universityId,
        degreeLevel: candidate.degreeLevel,
        programmeId: candidate.programmeId,
        graduationYear: candidate.graduationYear
      })
    })

    safeLogger.info(`[Suggestions] Total students in matching pool: ${students.length}`, {
      rawCandidatesCount: rawCandidates.length,
      studentsCount: students.length,
      currentUserIncluded: currentUserId ? students.some(s => s.id === currentUserId) : false
    })

    // 2) Precompute pair fits passing deal-breakers
    const pairFits: { key: string; aId: string; bId: string; fit: number; fitIndex: number; ps: any }[] = []

    safeLogger.info(`[Suggestions] Starting pair matching`, {
      studentCount: students.length,
      minFitIndex
    })

    // Diagnostic counters
    let totalPairs = 0
    let dealBreakerBlocks = 0
    let belowThreshold = 0
    const dealBreakerReasons: Record<string, number> = {}
    const scoreDistribution: number[] = []

    // OPTIMIZATION: Use hybrid vector search (findBestMatchesV2) if available
    // This replaces the O(N^2) loop with O(N) optimized DB queries
    // We process users in batches to manage concurrency

    if (students.length > 0) {
      safeLogger.info(`[Suggestions] Using optimized hybrid matching for ${students.length} students`)

      const BATCH_SIZE = 10 // Concurrent DB calls

      // Helper to process a batch of students
      const processBatch = async (batchStudents: any[]) => {
        const promises = batchStudents.map(async (student) => {
          try {
            // Find best matches for this student using DB optimization
            // This returns top ~20 matches already filtered and scored
            const matches = await repo.findBestMatchesV2(student.id, 20)

            for (const match of matches) {
              const studentB = students.find(s => s.id === match.user_id)
              if (!studentB) continue // Should not happen if cohort is consistent, but safer

              // dedupe: ensure we only process pair A-B once (order independent)
              // We'll use the pairFits array and check existence later or just push all 
              // and let the existing dedupe logic (step 3/4) handle it.
              // Actually, step 3 (byUser) and 4 (seen Set) handle deduplication perfectly.
              // So we just push to pairFits.

              const fitIndex = Math.round(match.compatibility_score * 100)

              if (fitIndex < minFitIndex) continue

              const sectionScores = {
                personality: match.personality_score,
                schedule: match.schedule_score,
                lifestyle: match.lifestyle_score,
                social: match.social_score,
                academic: match.academic_bonus
              }

              const autoMatchThreshold = 80
              const status = fitIndex >= autoMatchThreshold ? 'accepted' : 'pending'
              const acceptedBy = fitIndex >= autoMatchThreshold ? [student.id, studentB.id] : []

              // We need to push the PAIR. Since we iterate A then B, we will see A-B and B-A.
              // pairFits expects key AId::BId.
              // We should construct it consistently.

              pairFits.push({
                key: `${student.id}::${studentB.id}`,
                aId: student.id,
                bId: studentB.id,
                fit: match.compatibility_score,
                fitIndex,
                ps: {
                  sectionScores,
                  explanation: {
                    top_alignment: match.top_alignment,
                    watch_out: match.watch_out
                  }
                },
                status: status as any,
                acceptedBy
              })
            }
          } catch (err) {
            safeLogger.error(`[Suggestions] Error processing student ${student.id}`, err)
          }
        })
        await Promise.all(promises)
      }

      // Execute in chunks
      for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const chunk = students.slice(i, i + BATCH_SIZE)
        await processBatch(chunk)
      }
    }

    // Legacy nested loop (Commented out / Removed for optimization)
    /*
    for (let i = 0; i < students.length; i++) {
       ...
    }
    */

    if (pairFits.length === 0) {
      const message = students.length === 1
        ? `Only ${students.length} eligible candidate found. Need at least 2 candidates to create pair matches.`
        : 'No valid suggestions found above minimum fit threshold'

      // Calculate score statistics
      const avgScore = scoreDistribution.length > 0
        ? Math.round(scoreDistribution.reduce((a, b) => a + b, 0) / scoreDistribution.length)
        : 0
      const maxScore = scoreDistribution.length > 0 ? Math.max(...scoreDistribution) : 0
      const minScore = scoreDistribution.length > 0 ? Math.min(...scoreDistribution) : 0

      safeLogger.info(`[Suggestions] No matches found - Diagnostic`, {
        students: students.length,
        totalPairs,
        dealBreakerBlocks,
        belowThreshold,
        passedDealBreakers: totalPairs - dealBreakerBlocks,
        avgScore,
        maxScore,
        minScore,
        minFitIndex,
        dealBreakerReasons
      })

      safeLogger.debug(`[Suggestions] ${message}. Students: ${students.length}, Pair fits: ${pairFits.length}`)
      return {
        runId,
        created: 0,
        suggestions: [],
        message,
        diagnostic: {
          totalPairs,
          dealBreakerBlocks,
          belowThreshold,
          passedDealBreakers: totalPairs - dealBreakerBlocks,
          scoreStats: {
            avg: avgScore,
            max: maxScore,
            min: minScore,
            count: scoreDistribution.length
          },
          dealBreakerReasons
        }
      }
    }

    safeLogger.debug(`[Suggestions] Found ${pairFits.length} valid pairs above threshold`)

    // 3) Pick topN per user (symmetric pairs)
    const byUser: Record<string, { key: string; otherId: string; fit: number; fitIndex: number; ps: any; status: 'pending' | 'accepted'; acceptedBy: string[] }[]> = {}

    for (const pf of pairFits) {
      if (!byUser[pf.aId]) byUser[pf.aId] = []
      if (!byUser[pf.bId]) byUser[pf.bId] = []
      byUser[pf.aId].push({ key: pf.key, otherId: pf.bId, fit: pf.fit, fitIndex: pf.fitIndex, ps: pf.ps, status: pf.status as any, acceptedBy: pf.acceptedBy })
      byUser[pf.bId].push({ key: pf.key, otherId: pf.aId, fit: pf.fit, fitIndex: pf.fitIndex, ps: pf.ps, status: pf.status as any, acceptedBy: pf.acceptedBy })
    }

    // Sort and limit per user
    for (const uid of Object.keys(byUser)) {
      byUser[uid].sort((a, b) => b.fit - a.fit)
      byUser[uid] = byUser[uid].slice(0, topN)
    }

    // 4) Create suggestions (unique by pair key, using sorted memberIds for dedupe)
    // Matches don't expire - set expiration far in the future for database compatibility
    const now = Date.now()
    // Set expiration to 100 years from now (effectively never expires)
    const expiresAt = new Date(now + 100 * 365 * 24 * 3600 * 1000).toISOString()
    const seen = new Set<string>()
    const suggestions: MatchSuggestion[] = []

    for (const uid of Object.keys(byUser)) {
      for (const cand of byUser[uid]) {
        // Prevent self-matching
        if (uid === cand.otherId) {
          safeLogger.warn(`[WARN] Skipping self-match`)
          continue
        }

        // Use sorted memberIds as unique key to prevent duplicates
        const pairKey = [uid, cand.otherId].sort().join('::')
        if (seen.has(pairKey)) continue

        // Check blocklist
        const blockedA = await repo.getBlocklist(uid)
        const blockedB = await repo.getBlocklist(cand.otherId)
        if (blockedA.includes(cand.otherId) || blockedB.includes(uid)) continue

        const studentA = students.find(s => s.id === uid)!
        const studentB = students.find(s => s.id === cand.otherId)!
        const reasons = getReadableReasons(studentA, studentB)

        // Generate proper UUID for suggestion ID
        const suggestionId = randomUUID()

        // Generate personalized explanation
        let personalizedExplanation: string | undefined
        try {
          const { generatePersonalizedExplanation } = await import('./personalized-explanation')
          personalizedExplanation = generatePersonalizedExplanation({
            studentA,
            studentB,
            sectionScores: cand.ps.sectionScores || {},
            matchId: suggestionId
          })
        } catch (error) {
          safeLogger.warn('[Suggestions] Failed to generate personalized explanation', { error })
          // Continue without personalized explanation if generation fails
        }

        suggestions.push({
          id: suggestionId,
          runId,
          kind: 'pair',
          memberIds: [uid, cand.otherId],
          fitIndex: cand.fitIndex,
          sectionScores: cand.ps.sectionScores,
          reasons,
          personalizedExplanation,
          expiresAt,
          status: cand.status || 'pending',
          acceptedBy: cand.acceptedBy || [],
          createdAt: new Date(now).toISOString()
        })

        seen.add(pairKey)

        if (suggestions.length > (maxSuggestionsPerUser * students.length)) break
      }
    }

    // 5) Persist suggestions
    safeLogger.debug(`[Suggestions] Creating ${suggestions.length} suggestions`)
    await repo.createSuggestions(suggestions)

    return {
      runId,
      created: suggestions.length,
      suggestions
    }

  } catch (error) {
    safeLogger.error('[Suggestions] Error during suggestion generation', error)
    throw new Error(`Suggestion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
