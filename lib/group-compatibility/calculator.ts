import { createAdminClient } from '@/lib/supabase/server'
import { 
  GroupCompatibilityScore, 
  MemberDeviation, 
  GroupCentroid,
  CategoryWeights,
  DEFAULT_INTENT_WEIGHTS
} from './types'

interface UserVectorData {
  user_id: string
  vector: number[]
  personality_scores?: {
    extraversion: number
    agreeableness: number
    conscientiousness: number
    neuroticism: number
    openness: number
  }
  schedule_data?: {
    sleep_start: number
    sleep_end: number
    study_intensity: number
  }
  lifestyle_data?: {
    cleanliness_room: number
    cleanliness_kitchen: number
    noise_tolerance: number
  }
  social_data?: {
    guests_frequency: number
    parties_frequency: number
    social_level: number
  }
  academic_data?: {
    university_id: string
    program_id: string
    study_year: number
  }
}

/**
 * Calculate group centroid for a given category
 */
function calculateCentroid(
  members: UserVectorData[],
  category: 'personality' | 'schedule' | 'lifestyle' | 'social' | 'academic'
): number[] {
  if (members.length === 0) return []

  const categoryMappings = {
    personality: (m: UserVectorData) => {
      if (m.personality_scores) {
        return [
          m.personality_scores.extraversion,
          m.personality_scores.agreeableness,
          m.personality_scores.conscientiousness,
          m.personality_scores.neuroticism,
          m.personality_scores.openness
        ]
      }
      // Fallback: extract from vector positions 20-24
      return m.vector.slice(20, 25)
    },
    schedule: (m: UserVectorData) => {
      if (m.schedule_data) {
        return [
          m.schedule_data.sleep_start,
          m.schedule_data.sleep_end,
          m.schedule_data.study_intensity
        ]
      }
      // Fallback: extract from vector positions 0-2
      return m.vector.slice(0, 3)
    },
    lifestyle: (m: UserVectorData) => {
      if (m.lifestyle_data) {
        return [
          m.lifestyle_data.cleanliness_room,
          m.lifestyle_data.cleanliness_kitchen,
          m.lifestyle_data.noise_tolerance
        ]
      }
      // Fallback: extract from vector positions 3-5
      return m.vector.slice(3, 6)
    },
    social: (m: UserVectorData) => {
      if (m.social_data) {
        return [
          m.social_data.guests_frequency,
          m.social_data.parties_frequency,
          m.social_data.social_level
        ]
      }
      // Fallback: extract from vector positions 6, 7, 10
      return [m.vector[6] || 0, m.vector[7] || 0, m.vector[10] || 0]
    },
    academic: (m: UserVectorData) => {
      // Academic is more complex - we'll use a simplified approach
      // For now, return a single value representing academic similarity
      return [m.academic_data?.study_year || 0]
    }
  }

  const extractor = categoryMappings[category]
  const memberVectors = members.map(extractor)
  
  // Calculate mean for each dimension
  const dimensions = memberVectors[0]?.length || 0
  const centroid: number[] = []
  
  for (let d = 0; d < dimensions; d++) {
    const sum = memberVectors.reduce((acc, vec) => acc + (vec[d] || 0), 0)
    centroid.push(sum / members.length)
  }
  
  return centroid
}

/**
 * Calculate distance from centroid (Euclidean distance)
 */
function calculateDistance(memberVector: number[], centroid: number[]): number {
  if (memberVector.length !== centroid.length) return 1.0
  
  const sumSquaredDiffs = memberVector.reduce((sum, val, i) => {
    const diff = val - centroid[i]
    return sum + diff * diff
  }, 0)
  
  return Math.sqrt(sumSquaredDiffs)
}

/**
 * Normalize distance to 0-1 score (lower distance = higher score)
 */
function normalizeDistance(distance: number, maxDistance: number = 10): number {
  // Clamp and invert: distance 0 = score 1, distance max = score 0
  const normalized = Math.max(0, Math.min(1, 1 - (distance / maxDistance)))
  return normalized
}

/**
 * Calculate group compatibility score
 */
export async function calculateGroupCompatibility(
  chatId: string,
  memberIds: string[],
  groupIntent: 'housing' | 'study' | 'social' | 'general' = 'general'
): Promise<GroupCompatibilityScore> {
  const supabase = await createAdminClient()
  
  if (memberIds.length < 2) {
    throw new Error('Group must have at least 2 members')
  }

  // Fetch user vectors and profile data
  const { data: vectors } = await supabase
    .from('user_vectors')
    .select('user_id, vector')
    .in('user_id', memberIds)

  if (!vectors || vectors.length !== memberIds.length) {
    throw new Error('Failed to fetch user vectors for all members')
  }

  // Fetch additional profile data for better category extraction
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id')
    .in('user_id', memberIds)

  const { data: academic } = await supabase
    .from('user_academic')
    .select('user_id, university_id, program_id')
    .in('user_id', memberIds)

  // Build user data objects - handle vector conversion
  const userData: UserVectorData[] = vectors.map(v => {
    // Convert vector from pgvector format (could be string like "[0.1,0.2,...]" or array)
    let vectorArray: number[] = []
    if (Array.isArray(v.vector)) {
      vectorArray = v.vector
    } else if (typeof v.vector === 'string') {
      // Parse string format "[0.1,0.2,...]"
      try {
        vectorArray = JSON.parse(v.vector)
      } catch {
        // If parsing fails, try to extract numbers
        const matches = v.vector.match(/[\d.]+/g)
        if (matches) {
          vectorArray = matches.map(Number)
        }
      }
    }
    
    // Ensure vector has 50 dimensions
    while (vectorArray.length < 50) {
      vectorArray.push(0)
    }
    vectorArray = vectorArray.slice(0, 50)

    return {
      user_id: v.user_id,
      vector: vectorArray,
      academic_data: academic?.find(a => a.user_id === v.user_id) ? {
        university_id: academic.find(a => a.user_id === v.user_id)!.university_id,
        program_id: academic.find(a => a.user_id === v.user_id)!.program_id || '',
        study_year: 0 // Would need to fetch from user_study_year_v
      } : undefined
    }
  })

  // Calculate centroids for each category
  const centroids: GroupCentroid = {
    personality: calculateCentroid(userData, 'personality'),
    schedule: calculateCentroid(userData, 'schedule'),
    lifestyle: calculateCentroid(userData, 'lifestyle'),
    social: calculateCentroid(userData, 'social'),
    academic: calculateCentroid(userData, 'academic')
  }

  // Calculate scores and deviations for each member
  const memberDeviations: MemberDeviation[] = []
  const categoryScores: Record<string, number[]> = {
    personality: [],
    schedule: [],
    lifestyle: [],
    social: [],
    academic: []
  }

  for (const member of userData) {
    const personalityVec = centroids.personality.length > 0 
      ? (member.personality_scores ? [
          member.personality_scores.extraversion,
          member.personality_scores.agreeableness,
          member.personality_scores.conscientiousness,
          member.personality_scores.neuroticism,
          member.personality_scores.openness
        ] : member.vector.slice(20, 25))
      : []
    
    const scheduleVec = centroids.schedule.length > 0
      ? (member.schedule_data ? [
          member.schedule_data.sleep_start,
          member.schedule_data.sleep_end,
          member.schedule_data.study_intensity
        ] : member.vector.slice(0, 3))
      : []
    
    const lifestyleVec = centroids.lifestyle.length > 0
      ? (member.lifestyle_data ? [
          member.lifestyle_data.cleanliness_room,
          member.lifestyle_data.cleanliness_kitchen,
          member.lifestyle_data.noise_tolerance
        ] : member.vector.slice(3, 6))
      : []
    
    const socialVec = centroids.social.length > 0
      ? (member.social_data ? [
          member.social_data.guests_frequency,
          member.social_data.parties_frequency,
          member.social_data.social_level
        ] : [member.vector[6] || 0, member.vector[7] || 0, member.vector[10] || 0])
      : []
    
    const academicVec = centroids.academic.length > 0
      ? [member.academic_data?.study_year || 0]
      : []

    const personalityDist = personalityVec.length > 0 
      ? calculateDistance(personalityVec, centroids.personality)
      : 0
    const scheduleDist = scheduleVec.length > 0
      ? calculateDistance(scheduleVec, centroids.schedule)
      : 0
    const lifestyleDist = lifestyleVec.length > 0
      ? calculateDistance(lifestyleVec, centroids.lifestyle)
      : 0
    const socialDist = socialVec.length > 0
      ? calculateDistance(socialVec, centroids.social)
      : 0
    const academicDist = academicVec.length > 0
      ? calculateDistance(academicVec, centroids.academic)
      : 0

    // Convert distances to scores (inverted)
    const personalityScore = normalizeDistance(personalityDist)
    const scheduleScore = normalizeDistance(scheduleDist)
    const lifestyleScore = normalizeDistance(lifestyleDist)
    const socialScore = normalizeDistance(socialDist)
    const academicScore = normalizeDistance(academicDist)

    categoryScores.personality.push(personalityScore)
    categoryScores.schedule.push(scheduleScore)
    categoryScores.lifestyle.push(lifestyleScore)
    categoryScores.social.push(socialScore)
    categoryScores.academic.push(academicScore)

    // Identify outliers (more than 1 standard deviation from mean)
    const personalityMean = categoryScores.personality.reduce((a, b) => a + b, 0) / categoryScores.personality.length
    const personalityStd = Math.sqrt(
      categoryScores.personality.reduce((sum, score) => sum + Math.pow(score - personalityMean, 2), 0) / categoryScores.personality.length
    )
    const isPersonalityOutlier = Math.abs(personalityScore - personalityMean) > personalityStd

    const scheduleMean = categoryScores.schedule.reduce((a, b) => a + b, 0) / categoryScores.schedule.length
    const scheduleStd = Math.sqrt(
      categoryScores.schedule.reduce((sum, score) => sum + Math.pow(score - scheduleMean, 2), 0) / categoryScores.schedule.length
    )
    const isScheduleOutlier = Math.abs(scheduleScore - scheduleMean) > scheduleStd

    const lifestyleMean = categoryScores.lifestyle.reduce((a, b) => a + b, 0) / categoryScores.lifestyle.length
    const lifestyleStd = Math.sqrt(
      categoryScores.lifestyle.reduce((sum, score) => sum + Math.pow(score - lifestyleMean, 2), 0) / categoryScores.lifestyle.length
    )
    const isLifestyleOutlier = Math.abs(lifestyleScore - lifestyleMean) > lifestyleStd

    const socialMean = categoryScores.social.reduce((a, b) => a + b, 0) / categoryScores.social.length
    const socialStd = Math.sqrt(
      categoryScores.social.reduce((sum, score) => sum + Math.pow(score - socialMean, 2), 0) / categoryScores.social.length
    )
    const isSocialOutlier = Math.abs(socialScore - socialMean) > socialStd

    const academicMean = categoryScores.academic.reduce((a, b) => a + b, 0) / categoryScores.academic.length
    const academicStd = Math.sqrt(
      categoryScores.academic.reduce((sum, score) => sum + Math.pow(score - academicMean, 2), 0) / categoryScores.academic.length
    )
    const isAcademicOutlier = Math.abs(academicScore - academicMean) > academicStd

    const outlierCategories: string[] = []
    if (isPersonalityOutlier) outlierCategories.push('personality')
    if (isScheduleOutlier) outlierCategories.push('schedule')
    if (isLifestyleOutlier) outlierCategories.push('lifestyle')
    if (isSocialOutlier) outlierCategories.push('social')
    if (isAcademicOutlier) outlierCategories.push('academic')

    memberDeviations.push({
      user_id: member.user_id,
      personality_deviation: personalityDist,
      schedule_deviation: scheduleDist,
      lifestyle_deviation: lifestyleDist,
      social_deviation: socialDist,
      academic_deviation: academicDist,
      is_outlier: outlierCategories.length > 0,
      outlier_categories: outlierCategories
    })
  }

  // Calculate aggregate scores per category (mean of all member scores)
  const personalityScore = categoryScores.personality.reduce((a, b) => a + b, 0) / categoryScores.personality.length
  const scheduleScore = categoryScores.schedule.reduce((a, b) => a + b, 0) / categoryScores.schedule.length
  const lifestyleScore = categoryScores.lifestyle.reduce((a, b) => a + b, 0) / categoryScores.lifestyle.length
  const socialScore = categoryScores.social.reduce((a, b) => a + b, 0) / categoryScores.social.length
  const academicScore = categoryScores.academic.reduce((a, b) => a + b, 0) / categoryScores.academic.length

  // Get weights for group intent
  const weights = DEFAULT_INTENT_WEIGHTS[groupIntent]

  // Calculate weighted overall score
  const overallScore = 
    personalityScore * weights.personality +
    scheduleScore * weights.schedule +
    lifestyleScore * weights.lifestyle +
    socialScore * weights.social +
    academicScore * weights.academic

  // Generate group explanation
  const explanation = generateGroupExplanation(
    overallScore,
    personalityScore,
    scheduleScore,
    lifestyleScore,
    socialScore,
    academicScore,
    memberDeviations,
    groupIntent
  )

  const result: GroupCompatibilityScore = {
    chat_id: chatId,
    overall_score: Math.max(0, Math.min(1, overallScore)),
    personality_score: Math.max(0, Math.min(1, personalityScore)),
    schedule_score: Math.max(0, Math.min(1, scheduleScore)),
    lifestyle_score: Math.max(0, Math.min(1, lifestyleScore)),
    social_score: Math.max(0, Math.min(1, socialScore)),
    academic_score: Math.max(0, Math.min(1, academicScore)),
    category_weights: weights,
    member_deviations,
    calculated_at: new Date().toISOString(),
    explanation
  }

  // Save to database (store explanation in member_deviations JSONB)
  const memberDeviationsWithExplanation = {
    deviations: memberDeviations,
    explanation: result.explanation
  }

  await supabase
    .from('group_compatibility_scores')
    .upsert({
      chat_id: chatId,
      overall_score: result.overall_score,
      personality_score: result.personality_score,
      schedule_score: result.schedule_score,
      lifestyle_score: result.lifestyle_score,
      social_score: result.social_score,
      academic_score: result.academic_score,
      category_weights: weights,
      member_deviations: memberDeviationsWithExplanation,
      calculated_at: result.calculated_at
    }, {
      onConflict: 'chat_id'
    })

  return result
}

/**
 * Generate group explanation text
 */
function generateGroupExplanation(
  overallScore: number,
  personalityScore: number,
  scheduleScore: number,
  lifestyleScore: number,
  socialScore: number,
  academicScore: number,
  memberDeviations: MemberDeviation[],
  groupIntent: 'housing' | 'study' | 'social' | 'general'
): {
  top_strength: string
  watch_outs: string
  why_works: string
  why_doesnt_work: string
  suggestions: string
} {
  // Find top scoring category
  const categoryScores = [
    { name: 'personality', score: personalityScore },
    { name: 'schedule', score: scheduleScore },
    { name: 'lifestyle', score: lifestyleScore },
    { name: 'social', score: socialScore },
    { name: 'academic', score: academicScore }
  ]
  const topCategory = categoryScores.reduce((max, cat) => 
    cat.score > max.score ? cat : max
  )

  // Find categories with issues (outliers)
  const outlierCategories = new Set<string>()
  memberDeviations.forEach(dev => {
    dev.outlier_categories.forEach(cat => outlierCategories.add(cat))
  })

  // Generate top strength
  const topStrengthMessages: Record<string, string> = {
    personality: 'Strong personality alignment - you share similar communication styles and values',
    schedule: 'Great schedule compatibility - your daily routines align well',
    lifestyle: 'Lifestyle harmony - similar cleanliness and home habits',
    social: 'Social preferences match - compatible guest policies and activity levels',
    academic: 'Academic alignment - similar study approaches and goals'
  }
  const top_strength = topStrengthMessages[topCategory.name] || 'Good overall compatibility'

  // Generate watch outs
  let watch_outs = 'No major concerns'
  if (outlierCategories.size > 0) {
    const issues: string[] = []
    if (outlierCategories.has('personality')) {
      issues.push('personality differences')
    }
    if (outlierCategories.has('schedule')) {
      issues.push('schedule conflicts')
    }
    if (outlierCategories.has('lifestyle')) {
      issues.push('lifestyle mismatches')
    }
    if (outlierCategories.has('social')) {
      issues.push('social preference differences')
    }
    if (outlierCategories.has('academic')) {
      issues.push('academic differences')
    }
    watch_outs = `Watch out for: ${issues.join(', ')}. One or more members have different preferences in these areas.`
  } else if (overallScore < 0.6) {
    watch_outs = 'Moderate compatibility - some areas may need attention and communication'
  }

  // Generate why it works
  const strengths: string[] = []
  if (personalityScore >= 0.7) strengths.push('strong personality alignment')
  if (scheduleScore >= 0.7) strengths.push('compatible schedules')
  if (lifestyleScore >= 0.7) strengths.push('similar lifestyle preferences')
  if (socialScore >= 0.7) strengths.push('matching social expectations')
  if (academicScore >= 0.7) strengths.push('academic compatibility')
  
  const why_works = strengths.length > 0
    ? `This group works well because of ${strengths.join(', ')}.`
    : 'This group has moderate compatibility across all areas.'

  // Generate why it doesn't work
  const weaknesses: string[] = []
  if (personalityScore < 0.5) weaknesses.push('personality differences')
  if (scheduleScore < 0.5) weaknesses.push('schedule conflicts')
  if (lifestyleScore < 0.5) weaknesses.push('lifestyle mismatches')
  if (socialScore < 0.5) weaknesses.push('social preference gaps')
  if (academicScore < 0.5) weaknesses.push('academic differences')

  const why_doesnt_work = weaknesses.length > 0
    ? `Potential challenges: ${weaknesses.join(', ')}. Open communication and setting clear expectations will be important.`
    : 'No major compatibility concerns identified.'

  // Generate suggestions
  const suggestions: string[] = []
  if (lifestyleScore < 0.6) {
    suggestions.push('Establish a cleaning schedule and house rules early')
  }
  if (scheduleScore < 0.6) {
    suggestions.push('Discuss quiet hours and study time preferences')
  }
  if (socialScore < 0.6) {
    suggestions.push('Set clear guest policies and social activity expectations')
  }
  if (personalityScore < 0.6) {
    suggestions.push('Practice open communication and respect different communication styles')
  }
  if (suggestions.length === 0) {
    suggestions.push('Continue open communication and respect each other\'s preferences')
  }

  return {
    top_strength,
    watch_outs,
    why_works,
    why_doesnt_work,
    suggestions: suggestions.join(' ')
  }
}

/**
 * Recalculate compatibility when members change
 */
export async function recalculateGroupCompatibility(chatId: string): Promise<GroupCompatibilityScore> {
  const supabase = await createAdminClient()

  // Get chat details
  const { data: chat } = await supabase
    .from('chats')
    .select('id, group_intent')
    .eq('id', chatId)
    .single()

  if (!chat) {
    throw new Error('Chat not found')
  }

  // Get active members
  const { data: members } = await supabase
    .from('chat_members')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('status', 'active')

  if (!members || members.length < 2) {
    throw new Error('Group must have at least 2 active members')
  }

  const memberIds = members.map(m => m.user_id)
  const groupIntent = (chat.group_intent as 'housing' | 'study' | 'social' | 'general') || 'general'

  return calculateGroupCompatibility(chatId, memberIds, groupIntent)
}

