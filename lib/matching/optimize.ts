// Optimization solvers for matching
// Implements maximum weight matching for pairs and greedy k-grouping for groups

import type { StudentProfile } from './answer-map'
import { MatchingEngine, DEFAULT_WEIGHTS } from './scoring'

export interface PairMatch {
  aId: string
  bId: string
  fit: number
}

export interface GroupMatch {
  memberIds: string[]
  avgFit: number
}

export interface OptimizationResult {
  pairs?: PairMatch[]
  groups?: GroupMatch[]
}

export function solvePairs({ 
  students, 
  metas, 
  weights = DEFAULT_WEIGHTS, 
  mode = 'pairs' 
}: {
  students: StudentProfile[]
  metas: Record<string, any>
  weights?: any
  mode?: 'pairs' | 'groups'
}): OptimizationResult {
  if (students.length < 2) {
    return { pairs: [] }
  }
  
  // Create compatibility matrix
  const engine = new MatchingEngine(weights)
  const scores: number[][] = []
  const studentIds = students.map(s => s.id)
  
  // Initialize matrix
  for (let i = 0; i < students.length; i++) {
    scores[i] = new Array(students.length).fill(0)
  }
  
  // Calculate pairwise scores
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const studentA = students[i]
      const studentB = students[j]
      
      // Convert to engine format
      const profileA = toEngineProfile(studentA)
      const profileB = toEngineProfile(studentB)
      
      const { score } = engine.computeCompatibilityScore(profileA, profileB)
      scores[i][j] = score
      scores[j][i] = score
    }
  }
  
  // Use greedy maximum weight matching
  const pairs = greedyMaximumMatching(scores, studentIds)
  
  return { pairs }
}

export function solveGroups({ 
  students, 
  metas, 
  weights = DEFAULT_WEIGHTS, 
  mode = 'groups',
  groupSize = 3 
}: {
  students: StudentProfile[]
  metas: Record<string, any>
  weights?: any
  mode?: 'pairs' | 'groups'
  groupSize?: number
}): OptimizationResult {
  if (students.length < groupSize) {
    return { groups: [] }
  }
  
  // Create compatibility matrix
  const engine = new MatchingEngine(weights)
  const scores: number[][] = []
  const studentIds = students.map(s => s.id)
  
  // Initialize matrix
  for (let i = 0; i < students.length; i++) {
    scores[i] = new Array(students.length).fill(0)
  }
  
  // Calculate pairwise scores
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const studentA = students[i]
      const studentB = students[j]
      
      // Convert to engine format
      const profileA = toEngineProfile(studentA)
      const profileB = toEngineProfile(studentB)
      
      const { score } = engine.computeCompatibilityScore(profileA, profileB)
      scores[i][j] = score
      scores[j][i] = score
    }
  }
  
  // Use greedy k-grouping
  const groups = greedyKGrouping(scores, studentIds, groupSize)
  
  return { groups }
}

function greedyMaximumMatching(scores: number[][], studentIds: string[]): PairMatch[] {
  const pairs: PairMatch[] = []
  const used = new Set<number>()
  
  // Create list of all possible pairs with their scores
  const allPairs: { i: number; j: number; score: number }[] = []
  
  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      allPairs.push({
        i,
        j,
        score: scores[i][j]
      })
    }
  }
  
  // Sort by score (highest first)
  allPairs.sort((a, b) => b.score - a.score)
  
  // Greedily select pairs
  for (const pair of allPairs) {
    if (!used.has(pair.i) && !used.has(pair.j)) {
      pairs.push({
        aId: studentIds[pair.i],
        bId: studentIds[pair.j],
        fit: pair.score
      })
      used.add(pair.i)
      used.add(pair.j)
    }
  }
  
  return pairs
}

function greedyKGrouping(scores: number[][], studentIds: string[], groupSize: number): GroupMatch[] {
  const groups: GroupMatch[] = []
  const used = new Set<number>()
  
  // Calculate average compatibility for each student
  const avgScores = scores.map((row, i) => {
    const sum = row.reduce((acc, score, j) => j !== i ? acc + score : acc, 0)
    return {
      index: i,
      avgScore: sum / (row.length - 1)
    }
  })
  
  // Sort by average compatibility (highest first)
  avgScores.sort((a, b) => b.avgScore - a.avgScore)
  
  // Form groups greedily
  for (const student of avgScores) {
    if (used.has(student.index)) continue
    
    const group: number[] = [student.index]
    used.add(student.index)
    
    // Find best remaining students to add to this group
    while (group.length < groupSize) {
      let bestCandidate = -1
      let bestScore = -1
      
      for (let i = 0; i < scores.length; i++) {
        if (used.has(i) || group.includes(i)) continue
        
        // Calculate average compatibility with current group members
        const avgCompatibility = group.reduce((sum, memberIndex) => 
          sum + scores[memberIndex][i], 0) / group.length
        
        if (avgCompatibility > bestScore) {
          bestScore = avgCompatibility
          bestCandidate = i
        }
      }
      
      if (bestCandidate === -1) break // No more candidates
      
      group.push(bestCandidate)
      used.add(bestCandidate)
    }
    
    // Only add groups that meet the minimum size
    if (group.length >= 2) {
      // Calculate average fit for the group
      let totalFit = 0
      let pairCount = 0
      
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          totalFit += scores[group[i]][group[j]]
          pairCount++
        }
      }
      
      const avgFit = pairCount > 0 ? totalFit / pairCount : 0
      
      groups.push({
        memberIds: group.map(index => studentIds[index]),
        avgFit
      })
    }
  }
  
  return groups
}

function toEngineProfile(student: StudentProfile) {
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
    faculty: undefined, // Not available in current data
    studyYear: student.meta.graduationYear
  }
}
