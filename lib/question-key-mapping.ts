/**
 * Maps item bank IDs to canonical question keys for the responses table.
 * 
 * Item Bank IDs (from data/item-bank.v1.json):
 * - M1_Q1, M1_Q2, ... (Personality/Big Five questions)
 * - M2_Q1, M2_Q2, ... (Sleep/Circadian questions)
 * - M3_Q1, M3_Q2, ... (Noise/Sensory questions)
 * - M4_Q1, M4_Q2, ... (Home Operations questions)
 * - M5_Q1, M5_Q2, ... (Social/Hosting/Language questions)
 * - M6_Q1, M6_Q2, ... (Communication/Conflict questions)
 * - M7_Q1, M7_Q2, ... (Privacy/Territoriality questions)
 * - M8_Q1, M8_Q2, ... (Reliability/Logistics questions)
 * 
 * Question Keys (from db/schema.sql, db/seed.sql):
 * - extraversion, agreeableness, conscientiousness, neuroticism, openness
 * - sleep_start, sleep_end
 * - budget_min, budget_max
 * - social_level, smoking, pets_allowed
 * - etc.
 */

export const itemIdToQuestionKey: Record<string, string> = {
  // Only map to question_keys that actually exist in the database
  // Based on db/seed.sql question_items table
  
  // Personality & Values - Map to Big Five traits that exist in DB
  'M1_Q1': 'conscientiousness',  // Structured, punctual, schedules
  'M1_Q2': 'extraversion',       // Study-heavy weeks: quiet ↔ social/collaborative home
  'M1_Q3': 'conscientiousness',  // Reliable and on time (others' view)
  'M1_Q4': 'agreeableness',      // Ignore minor annoyances for harmony
  'M1_Q5': 'communication_preference', // Issue handling: direct ↔ avoidant
  'M1_Q6': 'extraversion',       // Home identity: hub ↔ retreat
  'M1_Q7': 'chores_preference', // Household org role: initiator / contributor / observer
  'M1_Q8': 'communication_preference', // Comfortable giving constructive feedback
  'M1_Q9': 'agreeableness',      // Apologize first to resolve tension
  'M1_Q10': 'agreeableness',     // Equality vs needs-based fairness (shared costs)
  'M1_Q11': 'openness',          // Flexible about different ways at home
  'M1_Q12': 'extraversion',      // Independent cost-share ↔ close-knit household
  'M1_Q13': 'agreeableness',     // Initiative on shared purchases + split cost
  'M1_Q14': 'extraversion',      // Quiet empty home after long day (recharge style)
  'M1_Q15': 'conscientiousness', // Prefer fixed schedules vs spontaneous change
  'M1_Q16': 'communication_preference', // Talk issues out vs let them fade
  'M1_Q17': 'communication_preference', // Respect: privacy ↔ check-in/include
  'M1_Q18': 'communication_preference', // Support preference when user struggles (MCQ)
  'M1_Q19': 'openness',          // Curious about others' routines/traditions
  'M1_Q20': 'conscientiousness', // House rules: strict ↔ flexible case-by-case
  'M1_Q21': 'agreeableness',     // Mess tolerance
  'M1_Q22': 'conscientiousness', // Structured/predictable daily home routine
  'M1_Q23': 'communication_preference', // Conflict: quick compromise ↔ thorough discussion
  'M1_Q24': 'openness',          // Comfortable with diverse habits if rules clear
  'M1_Q25': 'conscientiousness', // Worst-case prep vs assume it works out

  // Sleep & Circadian (responses table uses question_keys; onboarding_sections keep full itemId answers)
  'M2_Q1': 'sleep_start',        // Sun–Thu typical sleep window (timeRange)
  'M2_Q2': 'sleep_end',          // Fri–Sat typical sleep window (timeRange)
  'M2_Q3': 'noise_tolerance',    // Quiet-hours expectation: silence ↔ ambient life
  'M2_Q4': 'noise_tolerance',    // Night temperature / ventilation (MCQ)
  'M2_Q5': 'noise_tolerance',    // Consistent quiet to feel rested
  'M2_Q6': 'noise_tolerance',    // Wake easily from light
  'M2_Q7': 'conscientiousness',  // Wake-up style (MCQ)
  'M2_Q8': 'extraversion',       // Morning routine energy around housemates
  'M2_Q9': 'communication_preference', // Pre-sleep house environment (bipolar)
  'M2_Q10': 'noise_tolerance',   // Afternoon quiet hours (frequency)
  'M2_Q11': 'noise_tolerance',   // Noise in shared spaces after quiet hours (comfort)
  'M2_Q12': 'noise_tolerance',   // Adjacent commons vacated at bedtime
  'M2_Q13': 'study_intensity',   // Quiet-hours start weekdays (MCQ time)  -  distinct key vs sleep_start
  'M2_Q14': 'conflict_style',    // Quiet-hours end weekdays (MCQ)
  'M2_Q15': 'parties_frequency', // Quiet-hours end weekends (MCQ)
  'M2_Q16': 'noise_tolerance',   // Staying up later than housemates (MCQ)
  'M2_Q17': 'noise_tolerance',   // Waking earlier than housemates (MCQ)
  'M2_Q18': 'noise_tolerance',   // Early appliances before 08:00 (comfort)
  'M2_Q19': 'neuroticism',       // Schedule consistency vs unpredictable (bipolar)
  'M2_Q20': 'noise_tolerance',   // Hallway light under door while sleeping
  'M2_Q21': 'noise_tolerance',   // Background noise out loud to fall asleep
  'M2_Q22': 'noise_tolerance',   // Weekend morning household energy (bipolar)
  'M2_Q23': 'utensils_sharing',  // Woken at night: typical reaction (MCQ)  -  legacy key spare slot for JSON value
  'M2_Q24': 'noise_tolerance',   // Daytime rest: expect lower noise in commons
  'M2_Q25': 'agreeableness',     // Opposite schedules: can plan around (agreement)

  // Noise & Sensory → mostly noise_tolerance (responses dedupe keeps last per key; onboarding_sections are authoritative)
  'M3_Q1': 'noise_tolerance',    // Predictable household; no sudden loud disruptions
  'M3_Q2': 'noise_tolerance',    // Background noise disrupts focus/relax
  'M3_Q3': 'noise_tolerance',    // Headphones in shared spaces (frequency)
  'M3_Q4': 'noise_tolerance',    // Ventilation: open windows ↔ closed (bipolar)
  'M3_Q5': 'noise_tolerance',    // Faint living-room convos audible in room (comfort)
  'M3_Q6': 'noise_tolerance',    // Doors closed gently
  'M3_Q7': 'noise_tolerance',    // Daytime noise acceptable
  'M3_Q8': 'noise_tolerance',    // Room media: headphones vs speakers (MCQ)
  'M3_Q9': 'noise_tolerance',    // Fragrance sensitivity
  'M3_Q10': 'noise_tolerance',   // Fragrance-free laundry/cleaners
  'M3_Q11': 'noise_tolerance',   // Air fresheners in commons (comfort)
  'M3_Q12': 'noise_tolerance',   // Ideal daytime temperature (MCQ)
  'M3_Q13': 'noise_tolerance',   // Shared lighting brightness (bipolar)
  'M3_Q14': 'noise_tolerance',   // Daytime house energy: library quiet ↔ lively (bipolar)
  'M3_Q15': 'noise_tolerance',   // Strong cooking aromas from self
  'M3_Q16': 'noise_tolerance',   // Bothered by others' food smells
  'M3_Q17': 'noise_tolerance',   // Naturally loud / expressive
  'M3_Q18': 'noise_tolerance',   // Lighting in shared spaces (bipolar, second phrasing)
  'M3_Q19': 'noise_tolerance',   // Calls in shared kitchen/living (bipolar)
  'M3_Q20': 'noise_tolerance',   // Instrument / vocals at home (MCQ)
  'M3_Q21': 'noise_tolerance',   // Bedroom door open vs closed (MCQ)
  'M3_Q22': 'noise_tolerance',   // Conscious of noise; walk/close gently
  'M3_Q23': 'noise_tolerance',   // Winter heating preference (MCQ)
  'M3_Q24': 'noise_tolerance',   // Visual clutter exhausting
  'M3_Q25': 'noise_tolerance',   // Adapt vs fixed sensory needs (bipolar)

  // Home Operations (cleanliness / chores / shared logistics)
  'M4_Q1': 'cleanliness_room',     // Shared living areas: pristine ↔ lived-in (bipolar)
  'M4_Q2': 'cleanliness_kitchen',  // Kitchen clean-up timing after cooking (MCQ)
  'M4_Q3': 'cleanliness_room',     // Bathroom wipe-down diligence (likert)
  'M4_Q4': 'cleanliness_room',     // Personal items in shared living room (bipolar)
  'M4_Q5': 'cleanliness_room',     // Shoes in house (MCQ)
  'M4_Q6': 'chores_preference',    // Chore organization: roster ↔ see-it-clean-it (bipolar)
  'M4_Q7': 'chores_preference',    // Weekly chore execution style (MCQ)
  'M4_Q8': 'chores_preference',    // Extra help: trash, dishwasher, counters (likert)
  'M4_Q9': 'chores_preference',    // Forgotten chore response (MCQ)
  'M4_Q10': 'chores_preference',   // Monthly deep clean contribution (likert)
  'M4_Q11': 'cleanliness_kitchen', // Basic supplies: individual ↔ shared pool (bipolar)
  'M4_Q12': 'cleanliness_kitchen', // Shelf/storage style (MCQ)
  'M4_Q13': 'cleanliness_kitchen', // Shared fridge organization (likert)
  'M4_Q14': 'cleanliness_room',    // Toiletries in shared bathroom (likert)
  'M4_Q15': 'communication_preference', // Shared expense apps (likert); avoid `food_sharing` (YP 1–10 slider)
  'M4_Q16': 'chores_preference',   // Energy/water / bills consciousness (likert)
  'M4_Q17': 'communication_preference', // Arrange repairs / landlord contact (likert)
  'M4_Q18': 'cleanliness_room',    // Winter heating level (bipolar)
  'M4_Q19': 'agreeableness',      // Replace broken shared items (likert)
  'M4_Q20': 'cleanliness_kitchen', // Recycling separation (likert)
  'M4_Q21': 'social_level',       // Post-guest common area cleanup timing (MCQ); avoid extra `guests_frequency` slot contention
  'M4_Q22': 'chores_preference',   // Flex chores during stress week (likert)
  'M4_Q23': 'cleanliness_kitchen', // Expired food in fridge bothers me (likert)
  'M4_Q24': 'cleanliness_room',   // Common-area furniture/decor (bipolar)
  'M4_Q25': 'agreeableness',      // Adapt to different cleanliness standards (likert)

  // Social, Hosting & Language (student M5 2026)
  'M5_Q1': 'social_level',       // Living/kitchen as retreat ↔ social hub (bipolar)
  'M5_Q2': 'social_level',       // Housemates as close friends (likert)
  'M5_Q3': 'social_level',       // Dinner house culture (MCQ)
  'M5_Q4': 'social_level',       // Weekends: solo ↔ with housemates (bipolar)
  'M5_Q5': 'communication_preference', // Common-area approachability (MCQ)
  'M5_Q6': 'guests_frequency',   // Unannounced daytime drop-ins (likert)
  'M5_Q7': 'parties_frequency',  // Pre-drinks / small gatherings (bipolar)
  'M5_Q8': 'social_level',       // Group study in shared space (likert)
  'M5_Q9': 'guests_frequency',   // Others' friends/partner in living when away (likert)
  'M5_Q10': 'agreeableness',    // Own guest mess = my responsibility (likert)
  'M5_Q11': 'parties_frequency', // Big parties frequency (MCQ)
  'M5_Q12': 'social_level',      // Expect invite to housemate parties (likert)
  'M5_Q13': 'parties_frequency', // Weeknight guests after 22:00 (bipolar)
  'M5_Q14': 'chores_preference', // Post-gathering cleanup timing (MCQ)
  'M5_Q15': 'guests_frequency',  // Overnight guest notification (MCQ)
  'M5_Q16': 'guests_frequency', // Partner sleep-over frequency (MCQ)
  'M5_Q17': 'communication_preference', // Partner using commons without paying (likert)
  'M5_Q18': 'social_level',      // Partner mostly in bedroom vs living (likert)
  'M5_Q19': 'agreeableness',    // Partner should contribute rent/utilities (likert)
  'M5_Q20': 'guests_frequency', // Extended stay visitors from abroad (likert)
  'M5_Q21': 'languages_daily',   // Household language (MCQ)
  'M5_Q22': 'languages_daily',   // English in common areas for inclusion (likert)
  'M5_Q23': 'conflict_style',   // Direct ↔ diplomatic household feedback (bipolar)
  'M5_Q24': 'openness',         // Excited for cross-cultural household (likert)
  'M5_Q25': 'openness',         // Adapt boundaries vs house social activity (likert)

  // Communication & Conflict (student M6 2026)
  'M6_Q1': 'communication_preference', // Mild annoyance: address now ↔ wait-and-see (bipolar)
  'M6_Q2': 'neuroticism',               // Let issues slide until visibly frustrated (likert)
  'M6_Q3': 'conscientiousness',         // Comfortable enforcing house rules (likert)
  'M6_Q4': 'agreeableness',             // Assume forgot vs careless (bipolar)
  'M6_Q5': 'conflict_style',            // How to raise issue with one housemate (MCQ)
  'M6_Q6': 'social_level',             // Channel for routine complaints (MCQ)
  'M6_Q7': 'communication_preference', // Corrective feedback blunt ↔ diplomatic (bipolar)
  'M6_Q8': 'openness',                  // Written notes feel passive-aggressive (likert)
  'M6_Q9': 'study_intensity',          // Text disagreement reflex (MCQ)  -  may collide with M2_Q13 quiet-hours key
  'M6_Q10': 'openness',                // Mandatory monthly house meeting (likert)
  'M6_Q11': 'extraversion',            // After critical feedback: cool down ↔ resolve now (bipolar)
  'M6_Q12': 'parties_frequency',       // Defend before accepting critique (likert)
  'M6_Q13': 'guests_frequency',        // Embarrassed if corrected in front of others (likert)
  'M6_Q14': 'communication_preference', // Prefer immediate in-the-moment correction (likert)
  'M6_Q15': 'alcohol_at_home',         // When wrong: apologize / fix quietly / deflect (MCQ)
  'M6_Q16': 'pets_tolerance',          // Friendly again day after fight (likert)
  'M6_Q17': 'conscientiousness',       // Apology must pair with behavior change (likert)
  'M6_Q18': 'conflict_style',          // Open to mediation (likert)
  'M6_Q19': 'openness',                // Accountability vs clean slate (bipolar)
  'M6_Q20': 'communication_preference', // Third-party housemate conflict instinct (MCQ)
  'M6_Q21': 'food_sharing',            // Roommate agreement as authority (likert)
  'M6_Q22': 'conflict_style',          // Rule enforcement vs context (bipolar)
  'M6_Q23': 'utensils_sharing',        // External escalation (MCQ)  -  may collide with M2_Q23
  'M6_Q24': 'agreeableness',           // Money conflicts: zero tolerance ↔ flexibility (bipolar)
  'M6_Q25': 'openness',                // Willing to adapt communication style (likert)

  // Privacy & Territoriality (student M7 2026)
  'M7_Q1': 'social_level',             // Closed-door entry norm (MCQ)
  'M7_Q2': 'guests_frequency',         // Enter room to borrow when away (likert)
  'M7_Q3': 'noise_tolerance',          // Bedroom call privacy from hallway (likert)
  'M7_Q4': 'social_level',             // Bedroom as sanctuary only (likert)
  'M7_Q5': 'conscientiousness',        // Prefer locking door asleep/away (likert)
  'M7_Q6': 'food_sharing',             // Fridge: separate ↔ communal (bipolar)
  'M7_Q7': 'agreeableness',            // Reaction to milk/supplies used (MCQ)
  'M7_Q8': 'cleanliness_room',         // Toiletries in shared bath (likert)
  'M7_Q9': 'utensils_sharing',         // Nice appliance placement (MCQ)
  'M7_Q10': 'chores_preference',       // Laundry machine handling (likert)
  'M7_Q11': 'communication_preference', // Social media of you/space (MCQ)
  'M7_Q12': 'conflict_style',          // House chat: admin-only ↔ casual (bipolar)
  'M7_Q13': 'openness',                // Live location sharing (likert)
  'M7_Q14': 'neuroticism',             // Uncomfortable if personal life shared outside (likert)
  'M7_Q15': 'parties_frequency',       // Announce comings/goings (bipolar)
  'M7_Q16': 'extraversion',            // Leave trace in living room vs pack up (bipolar)
  'M7_Q17': 'social_level',            // Camp in living room all day (likert)
  'M7_Q18': 'guests_frequency',       // Reaction when housemate brings guests (MCQ)
  'M7_Q19': 'study_intensity',         // Signal want to be alone (MCQ)  -  may collide with M2
  'M7_Q20': 'alcohol_at_home',         // Package handling when away (MCQ)  -  spare key
  'M7_Q21': 'pets_tolerance',          // Unsolicited advice on habits (likert)  -  spare key
  'M7_Q22': 'openness',                // Personal struggles private ↔ open (bipolar)
  'M7_Q23': 'cleanliness_kitchen',     // Okay quick bathroom entry while grooming (likert)
  'M7_Q24': 'conscientiousness',       // Monitor housemates' wellbeing (likert)
  'M7_Q25': 'openness',                // Willing to loosen stricter boundaries (likert)

  // Reliability & Logistics (2026-04 student bank)  -  dedicated keys in question_items (m8_q01–m8_q25)
  'M8_Q1': 'm8_q01',
  'M8_Q2': 'm8_q02',
  'M8_Q3': 'm8_q03',
  'M8_Q4': 'm8_q04',
  'M8_Q5': 'm8_q05',
  'M8_Q6': 'm8_q06',
  'M8_Q7': 'm8_q07',
  'M8_Q8': 'm8_q08',
  'M8_Q9': 'm8_q09',
  'M8_Q10': 'm8_q10',
  'M8_Q11': 'm8_q11',
  'M8_Q12': 'm8_q12',
  'M8_Q13': 'm8_q13',
  'M8_Q14': 'm8_q14',
  'M8_Q15': 'm8_q15',
  'M8_Q16': 'm8_q16',
  'M8_Q17': 'm8_q17',
  'M8_Q18': 'm8_q18',
  'M8_Q19': 'm8_q19',
  'M8_Q20': 'm8_q20',
  'M8_Q21': 'm8_q21',
  'M8_Q22': 'm8_q22',
  'M8_Q23': 'm8_q23',
  'M8_Q24': 'm8_q24',
  'M8_Q25': 'm8_q25',
}

/**
 * Transform an answer from the new questionnaire format to the old responses format.
 * 
 * New format: { itemId: 'M1_Q1', value: { value: 4 }, dealBreaker: false }
 * Old format: { question_key: 'extraversion', value: 4 }
 */
export function transformAnswer(answer: any): { question_key: string; value: any } | null {
  if (!answer || !answer.itemId) {
    console.warn('[transformAnswer] Invalid answer object:', answer)
    return null
  }

  // Professional context answers are stored with raw keys (not in the item bank).
  // We still want them to appear in onboarding_submissions.snapshot.transformed_responses.
  const isProfessionalContextKey = answer.itemId === 'wfh_status' || answer.itemId === 'age'
  const questionKey = isProfessionalContextKey ? answer.itemId : itemIdToQuestionKey[answer.itemId]
  if (!questionKey) {
    console.warn(`[transformAnswer] No mapping found for item ID: ${answer.itemId}`)
    return null
  }
  
  // Extract the actual value
  let value = answer.value
  
  // Handle nested value object: { value: X }
  if (value && typeof value === 'object' && 'value' in value) {
    value = value.value
  }
  
  // Handle special cases
  if (value === undefined || value === null) {
    console.warn(`[transformAnswer] Undefined/null value for ${answer.itemId}`)
    return null
  }
  
  return {
    question_key: questionKey,
    value: value
  }
}
