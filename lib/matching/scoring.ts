// Matching Algorithm and Scoring System
// This module handles the core matching logic using pgvector and weighted scoring

export interface MatchingWeights {
  personality: number // 0.47 - cosine similarity on user vectors
  schedule: number    // 0.18 - sleep schedule overlap
  cleanliness: number // 0.09 - cleanliness alignment
  social: number      // 0.13 - guests/noise tolerance alignment
  university_affinity: number // 0.08 - same university
  program_affinity: number    // 0.12 - same programme
  faculty_affinity: number    // 0.05 - same faculty, different programme
  study_year_gap_penalty: number // 0.02 - penalty per year gap beyond 2
}

export interface MatchExplanation {
  similarity_score: number
  schedule_overlap: number
  cleanliness_align: number
  guests_noise_align: number
  penalty: number
  top_alignment: 'personality' | 'schedule' | 'lifestyle' | 'social' | 'academic'
  watch_out: 'different_preferences' | 'cleanliness_differences' | 'schedule_conflicts' | 'academic_stage' | 'none'
  house_rules_suggestion?: string
  academic_bonus?: {
    university_affinity: boolean
    program_affinity: boolean
    faculty_affinity: boolean
    study_year_gap?: number
  }
}

export interface UserProfile {
  userId: string
  vector: number[]
  sleepStart: number
  sleepEnd: number
  cleanlinessRoom: number
  cleanlinessKitchen: number
  noiseTolerance: number
  guestsFrequency: number
  partiesFrequency: number
  studyIntensity: number
  socialLevel: number
  extraversion: number
  agreeableness: number
  conscientiousness: number
  neuroticism: number
  openness: number
  // Academic fields
  universityId?: string
  degreeLevel?: string
  programId?: string
  faculty?: string
  studyYear?: number
}

export interface MatchCandidate extends UserProfile {
  compatibilityScore: number
  explanation: MatchExplanation
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  personality: 0.47,
  schedule: 0.18,
  cleanliness: 0.09,
  social: 0.13,
  university_affinity: 0.08,
  program_affinity: 0.12,
  faculty_affinity: 0.05,
  study_year_gap_penalty: 0.02
}

// Vector dimension mapping for questionnaire responses
export const VECTOR_MAPPING = {
  // Lifestyle dimensions (0-19)
  sleep_start: 0,
  sleep_end: 1,
  study_intensity: 2,
  cleanliness_room: 3,
  cleanliness_kitchen: 4,
  noise_tolerance: 5,
  guests_frequency: 6,
  parties_frequency: 7,
  chores_preference: 8,
  alcohol_at_home: 9,
  
  // Social dimensions (10-19)
  social_level: 10,
  food_sharing: 11,
  utensils_sharing: 12,
  
  // Personality dimensions (20-39) - Big Five
  extraversion: 20,
  agreeableness: 21,
  conscientiousness: 22,
  neuroticism: 23,
  openness: 24,
  
  // Communication style (40-49)
  conflict_style: 40,
  communication_preference: 41
} as const

export class MatchingEngine {
  private weights: MatchingWeights

  constructor(weights: MatchingWeights = DEFAULT_WEIGHTS) {
    this.weights = weights
  }

  /**
   * Compute cosine similarity between two vectors
   */
  computeCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Compute schedule overlap score based on sleep patterns
   */
  computeScheduleOverlap(profileA: UserProfile, profileB: UserProfile): number {
    const sleepA = this.normalizeSleepTime(profileA.sleepStart, profileA.sleepEnd)
    const sleepB = this.normalizeSleepTime(profileB.sleepStart, profileB.sleepEnd)
    
    // Calculate overlap in hours
    const overlap = Math.max(0, Math.min(sleepA.end, sleepB.end) - Math.max(sleepA.start, sleepB.start))
    const totalSleep = Math.max(sleepA.end - sleepA.start, sleepB.end - sleepB.start)
    
    return overlap / totalSleep
  }

  /**
   * Compute cleanliness alignment score
   */
  computeCleanlinessAlignment(profileA: UserProfile, profileB: UserProfile): number {
    const roomDiff = Math.abs(profileA.cleanlinessRoom - profileB.cleanlinessRoom)
    const kitchenDiff = Math.abs(profileA.cleanlinessKitchen - profileB.cleanlinessKitchen)
    
    const avgDiff = (roomDiff + kitchenDiff) / 2
    return Math.max(0, 1 - (avgDiff / 10)) // Normalize to 0-1 range
  }

  /**
   * Compute social alignment score (guests/noise tolerance)
   */
  computeSocialAlignment(profileA: UserProfile, profileB: UserProfile): number {
    const guestsDiff = Math.abs(profileA.guestsFrequency - profileB.guestsFrequency)
    const noiseDiff = Math.abs(profileA.noiseTolerance - profileB.noiseTolerance)
    const partiesDiff = Math.abs(profileA.partiesFrequency - profileB.partiesFrequency)
    
    const avgDiff = (guestsDiff + noiseDiff + partiesDiff) / 3
    return Math.max(0, 1 - (avgDiff / 10)) // Normalize to 0-1 range
  }

  /**
   * Compute academic affinity bonus
   */
  computeAcademicAffinity(profileA: UserProfile, profileB: UserProfile): {
    bonus: number
    academicBonus: {
      university_affinity: boolean
      program_affinity: boolean
      faculty_affinity: boolean
      study_year_gap?: number
    }
  } {
    let bonus = 0
    const academicBonus = {
      university_affinity: false,
      program_affinity: false,
      faculty_affinity: false,
      study_year_gap: undefined as number | undefined
    }

    // Same university bonus
    if (profileA.universityId && profileB.universityId && 
        profileA.universityId === profileB.universityId) {
      bonus += this.weights.university_affinity
      academicBonus.university_affinity = true
    }

    // Same programme bonus (highest priority)
    if (profileA.programId && profileB.programId && 
        profileA.programId === profileB.programId) {
      bonus += this.weights.program_affinity
      academicBonus.program_affinity = true
    }
    // Same faculty bonus (only if not same programme)
    else if (profileA.faculty && profileB.faculty && 
             profileA.faculty === profileB.faculty && 
             profileA.programId !== profileB.programId) {
      bonus += this.weights.faculty_affinity
      academicBonus.faculty_affinity = true
    }

    // Study year gap penalty
    if (profileA.studyYear && profileB.studyYear) {
      const yearGap = Math.abs(profileA.studyYear - profileB.studyYear)
      academicBonus.study_year_gap = yearGap
      
      if (yearGap > 2) {
        const penalty = Math.min(
          (yearGap - 2) * this.weights.study_year_gap_penalty, 
          0.06 // Cap penalty at 6%
        )
        bonus -= penalty
      }
    }

    return { bonus, academicBonus }
  }

  /**
   * Apply penalties for hard constraints
   */
  computePenalties(profileA: UserProfile, profileB: UserProfile): number {
    let penalty = 0

    // Study intensity difference penalty
    const studyDiff = Math.abs(profileA.studyIntensity - profileB.studyIntensity)
    if (studyDiff > 6) {
      penalty += 0.15 // Large difference in study habits
    } else if (studyDiff > 3) {
      penalty += 0.08 // Moderate difference
    }

    // Social level mismatch penalty
    const socialDiff = Math.abs(profileA.socialLevel - profileB.socialLevel)
    if (socialDiff > 7) {
      penalty += 0.12 // Very different social preferences
    } else if (socialDiff > 4) {
      penalty += 0.06 // Moderate difference
    }

    // Personality mismatch penalties (Big Five)
    const personalityDiffs = [
      Math.abs(profileA.extraversion - profileB.extraversion),
      Math.abs(profileA.agreeableness - profileB.agreeableness),
      Math.abs(profileA.conscientiousness - profileB.conscientiousness),
      Math.abs(profileA.neuroticism - profileB.neuroticism),
      Math.abs(profileA.openness - profileB.openness)
    ]

    const avgPersonalityDiff = personalityDiffs.reduce((sum, diff) => sum + diff, 0) / personalityDiffs.length
    if (avgPersonalityDiff > 6) {
      penalty += 0.10 // Significant personality differences
    } else if (avgPersonalityDiff > 3) {
      penalty += 0.05 // Moderate differences
    }

    return Math.min(penalty, 0.5) // Cap penalty at 50%
  }

  /**
   * Generate match explanation
   */
  generateExplanation(
    similarityScore: number,
    scheduleOverlap: number,
    cleanlinessAlign: number,
    socialAlign: number,
    penalty: number,
    academicBonus?: {
      university_affinity: boolean
      program_affinity: boolean
      faculty_affinity: boolean
      study_year_gap?: number
    }
  ): MatchExplanation {
    // Calculate academic score if available
    const academicScore = academicBonus ? (
      (academicBonus.university_affinity ? this.weights.university_affinity : 0) +
      (academicBonus.program_affinity ? this.weights.program_affinity : 0) +
      (academicBonus.faculty_affinity ? this.weights.faculty_affinity : 0) -
      (academicBonus.study_year_gap && academicBonus.study_year_gap > 2 ? 
        Math.min((academicBonus.study_year_gap - 2) * this.weights.study_year_gap_penalty, 0.06) : 0)
    ) : 0

    const scores = [
      { name: 'personality' as const, value: similarityScore },
      { name: 'schedule' as const, value: scheduleOverlap },
      { name: 'lifestyle' as const, value: (cleanlinessAlign + socialAlign) / 2 },
      { name: 'social' as const, value: socialAlign },
      ...(academicScore > 0 ? [{ name: 'academic' as const, value: academicScore }] : [])
    ]

    const topAlignment = scores.reduce((max, score) => 
      score.value > max.value ? score : max
    ).name

    let watchOut: MatchExplanation['watch_out'] = 'none'
    if (penalty > 0.15) {
      watchOut = 'different_preferences'
    } else if (cleanlinessAlign < 0.3) {
      watchOut = 'cleanliness_differences'
    } else if (scheduleOverlap < 0.2) {
      watchOut = 'schedule_conflicts'
    } else if (academicBonus?.study_year_gap && academicBonus.study_year_gap > 4) {
      watchOut = 'academic_stage'
    }

    const houseRulesSuggestion = this.generateHouseRulesSuggestion(
      cleanlinessAlign,
      socialAlign,
      scheduleOverlap
    )

    return {
      similarity_score: similarityScore,
      schedule_overlap: scheduleOverlap,
      cleanliness_align: cleanlinessAlign,
      guests_noise_align: socialAlign,
      penalty,
      top_alignment: topAlignment,
      watch_out: watchOut,
      house_rules_suggestion: houseRulesSuggestion,
      academic_bonus: academicBonus
    }
  }

  /**
   * Generate house rules suggestion based on compatibility
   */
  private generateHouseRulesSuggestion(
    cleanlinessAlign: number,
    socialAlign: number,
    scheduleOverlap: number
  ): string {
    const rules = []

    if (cleanlinessAlign < 0.6) {
      rules.push('Establish weekly cleaning schedule')
    }

    if (socialAlign < 0.5) {
      rules.push('Discuss guest policies and quiet hours')
    }

    if (scheduleOverlap < 0.3) {
      rules.push('Set shared quiet hours for different sleep schedules')
    }

    if (rules.length === 0) {
      rules.push('Regular house meetings to maintain harmony')
    }

    return rules.join(', ')
  }

  /**
   * Compute overall compatibility score
   */
  computeCompatibilityScore(
    profileA: UserProfile,
    profileB: UserProfile
  ): { score: number; explanation: MatchExplanation } {
    // Compute cosine similarity for personality
    const similarityScore = this.computeCosineSimilarity(profileA.vector, profileB.vector)
    
    // Compute lifestyle alignment scores
    const scheduleOverlap = this.computeScheduleOverlap(profileA, profileB)
    const cleanlinessAlign = this.computeCleanlinessAlignment(profileA, profileB)
    const socialAlign = this.computeSocialAlignment(profileA, profileB)
    
    // Compute academic affinity
    const { bonus: academicBonus, academicBonus: academicDetails } = this.computeAcademicAffinity(profileA, profileB)
    
    // Apply penalties
    const penalty = this.computePenalties(profileA, profileB)
    
    // Calculate weighted score with academic bonus
    const baseScore = (
      this.weights.personality * similarityScore +
      this.weights.schedule * scheduleOverlap +
      this.weights.cleanliness * cleanlinessAlign +
      this.weights.social * socialAlign
    ) - penalty

    const finalScore = baseScore + academicBonus

    // Generate explanation
    const explanation = this.generateExplanation(
      similarityScore,
      scheduleOverlap,
      cleanlinessAlign,
      socialAlign,
      penalty,
      academicDetails
    )

    return {
      score: Math.max(0, Math.min(1, finalScore)), // Clamp to [0,1]
      explanation
    }
  }

  /**
   * Normalize sleep time to 24-hour format for comparison
   */
  private normalizeSleepTime(sleepStart: number, sleepEnd: number): { start: number; end: number } {
    // Convert to 24-hour format (0-24)
    let start = sleepStart
    let end = sleepEnd

    // Handle overnight sleep (e.g., 23:00 to 07:00)
    if (start > end) {
      end += 24
    }

    return { start, end }
  }

  /**
   * Map questionnaire responses to normalized vector
   */
  mapResponsesToVector(responses: Record<string, any>): number[] {
    const vector = new Array(50).fill(0)

    for (const [questionKey, value] of Object.entries(responses)) {
      const index = VECTOR_MAPPING[questionKey as keyof typeof VECTOR_MAPPING]
      
      if (index !== undefined && typeof value === 'number') {
        // Normalize to [0,1] range
        vector[index] = Math.max(0, Math.min(1, value / 10))
      } else if (typeof value === 'string') {
        // Handle string values (e.g., sleep times, budget ranges)
        switch (questionKey) {
          case 'sleep_start':
          case 'sleep_end':
            vector[index] = parseInt(value) / 24 // Normalize to [0,1]
            break
          case 'budget_min':
          case 'budget_max':
            vector[index] = parseInt(value) / 2000 // Normalize to [0,1]
            break
          case 'commute_max':
            vector[index] = parseInt(value) / 120 // Normalize to [0,1]
            break
        }
      } else if (Array.isArray(value)) {
        // Handle array values (e.g., languages)
        vector[index] = value.length > 0 ? 1 : 0
      }
    }

    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    if (magnitude > 0) {
      return vector.map(val => val / magnitude)
    }

    return vector
  }
}

// Export singleton instance
export const matchingEngine = new MatchingEngine()

// Utility functions
export function calculateGroupScore(members: UserProfile[]): number {
  if (members.length < 2) return 0

  let totalScore = 0
  let pairCount = 0

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const { score } = matchingEngine.computeCompatibilityScore(members[i], members[j])
      totalScore += score
      pairCount++
    }
  }

  return totalScore / pairCount
}

export function findOptimalGroups(
  candidates: UserProfile[],
  groupSize: number = 2,
  maxGroups: number = 10
): Array<{ members: UserProfile[]; score: number }> {
  const groups: Array<{ members: UserProfile[]; score: number }> = []
  const used = new Set<string>()

  // Simple greedy algorithm for group formation
  while (groups.length < maxGroups && used.size < candidates.length) {
    const available = candidates.filter(c => !used.has(c.userId))
    
    if (available.length < groupSize) break

    // Find the best group of size groupSize
    let bestGroup: UserProfile[] = []
    let bestScore = 0

    // Try different combinations (simplified - in production, use more sophisticated algorithm)
    for (let i = 0; i < Math.min(100, available.length); i++) {
      const group = available.slice(i, i + groupSize)
      if (group.length === groupSize) {
        const score = calculateGroupScore(group)
        if (score > bestScore) {
          bestScore = score
          bestGroup = group
        }
      }
    }

    if (bestGroup.length > 0) {
      groups.push({ members: bestGroup, score: bestScore })
      bestGroup.forEach(member => used.add(member.userId))
    } else {
      break
    }
  }

  return groups.sort((a, b) => b.score - a.score)
}
