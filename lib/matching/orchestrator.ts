// Main orchestrator for the matching system
// Coordinates the complete matching flow: load → filter → score → optimize → persist

import { randomUUID } from 'crypto'
import type { MatchRepo, CohortFilter, MatchRecord } from './repo'
import type { MatchSuggestion } from './types'
import { toStudent } from './answer-map'
import { checkDealBreakers, getReadableReasons } from './dealbreakers'
import { solvePairs, solveGroups } from './optimize'
import { MatchingEngine, DEFAULT_WEIGHTS } from './scoring'
import itemBank from '@/data/item-bank.v1.json'
import matchModeConfig from '@/config/match-mode.json'

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
    console.log(`[Matching] Loading candidates with filter:`, cohort)
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
    
    console.log(`[Matching] Found ${rawCandidates.length} candidates`)
    
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
    
    // 2) Apply deal-breaker filtering
    console.log(`[Matching] Applying deal-breaker filtering`)
    const validPairs: { a: number; b: number; score: number }[] = []
    
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i]
        const studentB = students[j]
        
        // Check deal-breakers
        const dealBreakerResult = checkDealBreakers(studentA, studentB)
        
        if (dealBreakerResult.canMatch) {
          // Calculate compatibility score
          const engine = new MatchingEngine(DEFAULT_WEIGHTS)
          const profileA = toEngineProfile(studentA)
          const profileB = toEngineProfile(studentB)
          
          const { score } = engine.computeCompatibilityScore(profileA, profileB)
          
          validPairs.push({
            a: i,
            b: j,
            score
          })
          } else {
            console.log(`[Matching] Deal-breaker conflict between ${studentA.id} and ${studentB.id}:`, {
              conflicts: dealBreakerResult.conflicts,
              reasons: dealBreakerResult.reasons
            })
          }
      }
    }
    
    console.log(`[Matching] Found ${validPairs.length} valid pairs after deal-breaker filtering`)
    
    if (validPairs.length === 0) {
      return { 
        runId, 
        count: 0, 
        matches: [], 
        message: 'No valid matches found after applying deal-breaker filters' 
      }
    }
    
    // 3) Solve optimization problem
    console.log(`[Matching] Running ${mode} optimization`)
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
      console.log(`[Matching] Processing ${optimizationResult.pairs.length} pairs`)
      
      for (const pair of optimizationResult.pairs) {
        const studentA = students.find(s => s.id === pair.aId)!
        const studentB = students.find(s => s.id === pair.bId)!
        
        // Get detailed scoring
        const engine = new MatchingEngine(DEFAULT_WEIGHTS)
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
      }
    } else if (optimizationResult.groups) {
      console.log(`[Matching] Processing ${optimizationResult.groups.length} groups`)
      
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
    console.log(`[Matching] Persisting ${records.length} matches`)
    
    // Save match run
    await repo.saveMatchRun({
      runId,
      mode,
      cohortFilter: cohort,
      matchCount: records.length
    })
    
    // Save match records
    await repo.saveMatches(records)
    
    console.log(`[Matching] Successfully created ${records.length} matches`)
    
    return { 
      runId, 
      count: records.length, 
      matches: records 
    }
    
  } catch (error) {
    console.error('[Matching] Error during matching:', error)
    throw new Error(`Matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function toEngineProfile(student: any) {
  // Convert StudentProfile to the format expected by MatchingEngine
  // Ensure sleep times are numbers (they might be strings from database)
  const sleepStart = typeof student.raw.sleep_start === 'string' ? parseFloat(student.raw.sleep_start) : Number(student.raw.sleep_start) || 22
  const sleepEnd = typeof student.raw.sleep_end === 'string' ? parseFloat(student.raw.sleep_end) : Number(student.raw.sleep_end) || 8
  
  // Use actual vector from candidate if available, otherwise use empty array
  // Don't use array of zeros as it breaks cosine similarity calculation
  const vector = student.raw.vector && Array.isArray(student.raw.vector) && student.raw.vector.length > 0
    ? student.raw.vector
    : new Array(50).fill(0) // Only use zeros if truly no vector exists
  
  return {
    userId: student.id,
    vector,
    sleepStart,
    sleepEnd,
    cleanlinessRoom: Number(student.raw.cleanliness_room) || 5,
    cleanlinessKitchen: Number(student.raw.cleanliness_kitchen) || 5,
    noiseTolerance: Number(student.raw.noise_tolerance) || 5,
    guestsFrequency: Number(student.raw.guests_frequency) || 5,
    partiesFrequency: Number(student.raw.parties_frequency) || 5,
    studyIntensity: Number(student.raw.study_intensity) || 5,
    socialLevel: Number(student.raw.social_level) || 5,
    extraversion: Number(student.raw.extraversion) || 5,
    agreeableness: Number(student.raw.agreeableness) || 5,
    conscientiousness: Number(student.raw.conscientiousness) || 5,
    neuroticism: Number(student.raw.neuroticism) || 5,
    openness: Number(student.raw.openness) || 5,
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
  runId = `run_${Date.now()}`
}: {
  repo: MatchRepo
  mode: 'pairs' | 'groups'
  groupSize?: number
  cohort: CohortFilter
  runId?: string
}): Promise<SuggestionResult> {
  try {
    const { topN, minFitIndex, expiryHours, maxSuggestionsPerUser } = matchModeConfig

    // 1) Load candidates
    console.log(`[Suggestions] Loading candidates with filter:`, cohort)
    const rawCandidates = await repo.loadCandidates({ 
      excludeAlreadyMatched: true, 
      ...cohort,
      // onlyActive defaults to cohort value, but ensure it's set if not provided
      onlyActive: cohort.onlyActive ?? true
    })
    
    if (rawCandidates.length === 0) {
      console.log(`[Suggestions] No candidates found in cohort with filter:`, cohort)
      return { 
        runId, 
        created: 0, 
        suggestions: [], 
        message: 'No candidates found in cohort' 
      }
    }
    
    console.log(`[Suggestions] Found ${rawCandidates.length} candidates`)
    
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

    // 2) Precompute pair fits passing deal-breakers
    const pairFits: { key: string; aId: string; bId: string; fit: number; fitIndex: number; ps: any }[] = []
    
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i]
        const studentB = students[j]
        
        // Check deal-breakers
        const dealBreakerResult = checkDealBreakers(studentA, studentB)
        
        console.log(`[DEBUG] Pair check: ${studentA.id} <-> ${studentB.id}`, {
          canMatch: dealBreakerResult.canMatch,
          conflicts: dealBreakerResult.conflicts,
          reasons: dealBreakerResult.reasons
        })
        
        if (dealBreakerResult.canMatch) {
          // Calculate compatibility score
          const engine = new MatchingEngine(DEFAULT_WEIGHTS)
          const profileA = toEngineProfile(studentA)
          const profileB = toEngineProfile(studentB)
          
          // Debug vector information
          console.log(`[DEBUG] Vector check: ${studentA.id} <-> ${studentB.id}`, {
            vectorA: {
              length: profileA.vector?.length,
              isArray: Array.isArray(profileA.vector),
              hasValues: profileA.vector?.some(v => v !== 0),
              sample: profileA.vector?.slice(0, 5)
            },
            vectorB: {
              length: profileB.vector?.length,
              isArray: Array.isArray(profileB.vector),
              hasValues: profileB.vector?.some(v => v !== 0),
              sample: profileB.vector?.slice(0, 5)
            }
          })
          
          const { score, explanation } = engine.computeCompatibilityScore(profileA, profileB)
          const fitIndex = Math.round(score * 100)
          
          console.log(`[DEBUG] Fit calculation: ${studentA.id} <-> ${studentB.id}`, {
            rawScore: score,
            fitIndex,
            minFitIndex,
            passesThreshold: fitIndex >= minFitIndex,
            explanation: {
              similarity_score: explanation.similarity_score,
              schedule_overlap: explanation.schedule_overlap,
              cleanliness_align: explanation.cleanliness_align,
              guests_noise_align: explanation.guests_noise_align,
              academic_bonus: explanation.academic_bonus
            }
          })
          
          if (fitIndex >= minFitIndex) {
            // Extract section scores
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
            
            // Determine status based on fit index (dual-tier system)
            const autoMatchThreshold = matchModeConfig.autoMatchThreshold || 80
            const status = fitIndex >= autoMatchThreshold ? 'accepted' : 'pending'
            const acceptedBy = fitIndex >= autoMatchThreshold ? [studentA.id, studentB.id] : []
            
            pairFits.push({
              key: `${studentA.id}::${studentB.id}`,
              aId: studentA.id,
              bId: studentB.id,
              fit: score,
              fitIndex,
              ps: { sectionScores, explanation },
              status,
              acceptedBy
            })
          }
        }
      }
    }
    
    if (pairFits.length === 0) {
      const message = students.length === 1 
        ? `Only ${students.length} eligible candidate found. Need at least 2 candidates to create pair matches.`
        : 'No valid suggestions found above minimum fit threshold'
      console.log(`[Suggestions] ${message}. Students: ${students.length}, Pair fits: ${pairFits.length}`)
      return { 
        runId, 
        created: 0, 
        suggestions: [], 
        message
      }
    }
    
    console.log(`[Suggestions] Found ${pairFits.length} valid pairs above threshold`)
    
    // 3) Pick topN per user (symmetric pairs)
    const byUser: Record<string, { key: string; otherId: string; fit: number; fitIndex: number; ps: any }[]> = {}
    
    for (const pf of pairFits) {
      if (!byUser[pf.aId]) byUser[pf.aId] = []
      if (!byUser[pf.bId]) byUser[pf.bId] = []
      byUser[pf.aId].push({ key: pf.key, otherId: pf.bId, fit: pf.fit, fitIndex: pf.fitIndex, ps: pf.ps })
      byUser[pf.bId].push({ key: pf.key, otherId: pf.aId, fit: pf.fit, fitIndex: pf.fitIndex, ps: pf.ps })
    }
    
    // Sort and limit per user
    for (const uid of Object.keys(byUser)) {
      byUser[uid].sort((a, b) => b.fit - a.fit)
      byUser[uid] = byUser[uid].slice(0, topN)
    }
    
    // 4) Create suggestions (unique by pair key)
    const now = Date.now()
    const expiresAt = new Date(now + expiryHours * 3600 * 1000).toISOString()
    const seen = new Set<string>()
    const suggestions: MatchSuggestion[] = []
    
    for (const uid of Object.keys(byUser)) {
      for (const cand of byUser[uid]) {
        if (seen.has(cand.key)) continue
        
        // Check blocklist
        const blockedA = await repo.getBlocklist(uid)
        const blockedB = await repo.getBlocklist(cand.otherId)
        if (blockedA.includes(cand.otherId) || blockedB.includes(uid)) continue
        
        const studentA = students.find(s => s.id === uid)!
        const studentB = students.find(s => s.id === cand.otherId)!
        const reasons = getReadableReasons(studentA, studentB)
        
        // Generate proper UUID for suggestion ID
        const suggestionId = randomUUID()
        
        suggestions.push({
          id: suggestionId,
          runId,
          kind: 'pair',
          memberIds: [uid, cand.otherId],
          fitIndex: cand.fitIndex,
          sectionScores: cand.ps.sectionScores,
          reasons,
          expiresAt,
          status: cand.status || 'pending',
          acceptedBy: cand.acceptedBy || [],
          createdAt: new Date(now).toISOString()
        })
        
        seen.add(cand.key)
        
        if (suggestions.length > (maxSuggestionsPerUser * students.length)) break
      }
    }
    
    // 5) Persist suggestions
    console.log(`[Suggestions] Creating ${suggestions.length} suggestions`)
    await repo.createSuggestions(suggestions)
    
    return { 
      runId, 
      created: suggestions.length, 
      suggestions 
    }
    
  } catch (error) {
    console.error('[Suggestions] Error during suggestion generation:', error)
    throw new Error(`Suggestion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
