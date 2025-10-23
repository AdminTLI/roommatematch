// Main orchestrator for the matching system
// Coordinates the complete matching flow: load → filter → score → optimize → persist

import type { MatchRepo, CohortFilter, MatchRecord } from './repo'
import { toStudent } from './answer-map'
import { checkDealBreakers, getReadableReasons } from './dealbreakers'
import { solvePairs, solveGroups } from './optimize'
import { MatchingEngine, DEFAULT_WEIGHTS } from './scoring'
import itemBank from '@/data/item-bank.v1.json'

export interface MatchingResult {
  runId: string
  count: number
  matches: MatchRecord[]
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
      onlyActive: true, 
      ...cohort 
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
    const students = rawCandidates.map(candidate => toStudent({
      id: candidate.id,
      answers: candidate.answers,
      campusCity: candidate.campusCity,
      universityId: candidate.universityId,
      degreeLevel: candidate.degreeLevel,
      programmeId: candidate.programmeId,
      graduationYear: candidate.graduationYear
    }))
    
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
          console.log(`[Matching] Deal-breaker conflict between ${studentA.id} and ${studentB.id}:`, dealBreakerResult.conflicts)
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
  return {
    userId: student.id,
    vector: student.raw.vector || new Array(50).fill(0),
    sleepStart: student.raw.sleep_start || 22,
    sleepEnd: student.raw.sleep_end || 8,
    cleanlinessRoom: student.raw.cleanliness_room || 5,
    cleanlinessKitchen: student.raw.cleanliness_kitchen || 5,
    noiseTolerance: student.raw.noise_tolerance || 5,
    guestsFrequency: student.raw.guests_frequency || 5,
    partiesFrequency: student.raw.parties_frequency || 5,
    studyIntensity: student.raw.study_intensity || 5,
    socialLevel: student.raw.social_level || 5,
    extraversion: student.raw.extraversion || 5,
    agreeableness: student.raw.agreeableness || 5,
    conscientiousness: student.raw.conscientiousness || 5,
    neuroticism: student.raw.neuroticism || 5,
    openness: student.raw.openness || 5,
    universityId: student.meta.universityId,
    degreeLevel: student.meta.degreeLevel,
    programId: student.meta.programmeId,
    faculty: undefined,
    studyYear: student.meta.graduationYear
  }
}
