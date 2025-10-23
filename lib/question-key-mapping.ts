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
  'M1_Q1': 'conscientiousness',  // "I keep shared promises even when inconvenient."
  'M1_Q2': 'conscientiousness',  // "I stick to plans and schedules I make."
  'M1_Q3': 'conscientiousness',  // "People describe me as reliable and on time."
  'M1_Q4': 'agreeableness',      // "I can ignore minor annoyances to keep harmony."
  'M1_Q5': 'agreeableness',      // "I speak up if something repeatedly bothers me."
  'M1_Q6': 'extraversion',       // Home identity: hub ↔ retreat
  'M1_Q7': 'communication_preference', // Feedback style: direct ↔ cushioned
  'M1_Q8': 'communication_preference', // "I'm comfortable giving constructive feedback..."
  'M1_Q9': 'agreeableness',      // "I usually apologize first to resolve tension."
  'M1_Q10': 'agreeableness',     // Sharing principle: equality ↔ fairness
  'M1_Q11': 'openness',          // "I'm flexible about different ways of doing things..."
  'M1_Q12': 'conscientiousness', // "I prefer written rules we can all see..."
  'M1_Q13': 'extraversion',      // "I'm energized by social activity at home..."
  'M1_Q14': 'conscientiousness', // "Tidy surroundings help me de-stress."
  'M1_Q15': 'neuroticism',       // "I get anxious if plans change last-minute."
  'M1_Q16': 'communication_preference', // "I'd rather talk issues out than let them fade."
  'M1_Q17': 'conscientiousness', // "I keep track of shared tasks without being asked."
  'M1_Q18': 'communication_preference', // "I'm comfortable setting personal boundaries..."
  'M1_Q19': 'openness',          // "I'm curious about others' routines/traditions..."
  'M1_Q20': 'conscientiousness', // Rule orientation: strict ↔ flexible
  'M1_Q21': 'agreeableness',     // "I can separate 'mess I dislike' from 'mess I can live with'..."
  'M1_Q22': 'agreeableness',     // "I'm okay borrowing/lending small items..."
  'M1_Q23': 'communication_preference', // Conflict goal: quick ↔ thorough
  'M1_Q24': 'openness',          // "I'm comfortable living with diverse habits..."
  'M1_Q25': 'conscientiousness', // "I can adapt my way of doing chores..."

  // Sleep & Circadian - Map to existing sleep keys
  'M2_Q1': 'sleep_start',        // Chronotype: night ↔ morning
  'M2_Q2': 'sleep_start',        // Weeknight sleep window start
  'M2_Q3': 'sleep_start',        // Weekend sleep window start
  'M2_Q4': 'sleep_start',        // "I adapt quickly when my sleep schedule shifts."
  'M2_Q5': 'noise_tolerance',    // "I need consistent quiet to feel rested."
  'M2_Q6': 'noise_tolerance',    // "I wake easily if there's light in the room."
  'M2_Q7': 'noise_tolerance',    // "I wake easily if there's noise in the hallway."
  'M2_Q8': 'sleep_start',        // Night light preference: ambient ↔ blackout
  'M2_Q9': 'sleep_start',        // "I use screens in bed within 30 minutes of sleep."
  'M2_Q10': 'sleep_start',       // "I nap most days."
  'M2_Q11': 'noise_tolerance',   // "I'm comfortable with water/cooking sounds after 22:30..."
  'M2_Q12': 'noise_tolerance',   // "I'm comfortable with quiet living-room conversations..."
  'M2_Q13': 'sleep_start',       // Preferred quiet-hours start (weekdays)
  'M2_Q14': 'sleep_end',         // Preferred quiet-hours end (weekdays)
  'M2_Q15': 'sleep_end',         // Preferred quiet-hours end (weekends)
  'M2_Q16': 'noise_tolerance',   // "I'm okay with a fan or white-noise running at night."
  'M2_Q17': 'sleep_start',       // "I often feel unrested in the morning."
  'M2_Q18': 'noise_tolerance',   // "I'm okay with early appliances (coffee grinder/blender)..."
  'M2_Q19': 'noise_tolerance',   // "I'm okay with housemates awake in common areas..."
  'M2_Q20': 'noise_tolerance',   // "No loud calls/gaming in common areas after quiet hours."
  'M2_Q21': 'noise_tolerance',   // "I rarely wake during the night due to household sounds."
  'M2_Q22': 'noise_tolerance',   // "I'm okay with late study sessions in common areas..."
  'M2_Q23': 'noise_tolerance',   // "I prefer no showers after quiet hours begin."
  'M2_Q24': 'sleep_start',       // "I'm flexible moving my quiet hours slightly..."
  'M2_Q25': 'sleep_start',       // "If a housemate's schedule is opposite mine..."

  // Noise & Sensory - Map to noise_tolerance
  'M3_Q1': 'noise_tolerance',    // "I'm more sensitive to sudden than steady noises."
  'M3_Q2': 'noise_tolerance',    // "Ongoing background noise (TV, music) distracts me."
  'M3_Q3': 'noise_tolerance',    // "I usually use headphones for media in shared spaces."
  'M3_Q4': 'noise_tolerance',    // Personal listening volume: low ↔ high
  'M3_Q5': 'noise_tolerance',    // "I'm comfortable when living-room conversations..."
  'M3_Q6': 'noise_tolerance',    // "Doors should be closed gently at all times."
  'M3_Q7': 'noise_tolerance',    // "Daytime maintenance noise (vacuum/drill) is acceptable."
  'M3_Q8': 'noise_tolerance',    // Window preference: open ↔ closed
  'M3_Q9': 'noise_tolerance',    // "I'm sensitive to strong fragrances (sprays/incense)."
  'M3_Q10': 'noise_tolerance',   // "Prefer fragrance-free laundry/cleaners at home."
  'M3_Q11': 'noise_tolerance',   // "I'm okay with air-fresheners in common spaces."
  'M3_Q12': 'noise_tolerance',   // Preferred room temperature range
  'M3_Q13': 'noise_tolerance',   // "I overheat easily indoors."
  'M3_Q14': 'noise_tolerance',   // "I feel cold easily indoors."
  'M3_Q15': 'noise_tolerance',   // "I like using a fan for airflow in common areas."
  'M3_Q16': 'noise_tolerance',   // Humidity preference: drier ↔ more humid
  'M3_Q17': 'noise_tolerance',   // "I accept cross-ventilation even if a bit noisy."
  'M3_Q18': 'noise_tolerance',   // Lighting in common areas: soft ↔ bright
  'M3_Q19': 'noise_tolerance',   // "I'm comfortable with short music practice in daytime."
  'M3_Q20': 'noise_tolerance',   // "I'm comfortable with gaming voice chat..."
  'M3_Q21': 'noise_tolerance',   // "No external speakers in bedrooms."
  'M3_Q22': 'noise_tolerance',   // "I prefer door-closers or felt pads to reduce slams."
  'M3_Q23': 'noise_tolerance',   // "I tolerate street noise if windows are open."
  'M3_Q24': 'noise_tolerance',   // "I'm comfortable with vacuuming up to 20:00."
  'M3_Q25': 'noise_tolerance',   // "I prefer quiet-hours reminders posted in the hallway."

  // Home Operations - Map to existing cleanliness and chores keys
  'M4_Q1': 'cleanliness_kitchen', // Cleanliness standard — Kitchen
  'M4_Q2': 'cleanliness_room',    // Cleanliness standard — Bathroom
  'M4_Q3': 'cleanliness_room',    // Cleanliness standard — Living area
  'M4_Q4': 'cleanliness_kitchen', // Dishes latency (how soon you clear/wash)
  'M4_Q5': 'cleanliness_kitchen', // "No dishes left overnight."
  'M4_Q6': 'cleanliness_kitchen', // "I wipe stove/counters immediately after cooking."
  'M4_Q7': 'cleanliness_kitchen', // Kitchen storage & staples policy
  'M4_Q8': 'cleanliness_kitchen', // "Comfortable sharing basic condiments..."
  'M4_Q9': 'cleanliness_kitchen', // "Prefer separate cookware..."
  'M4_Q10': 'cleanliness_kitchen', // "Comfortable with strong cooking smells..."
  'M4_Q11': 'cleanliness_room',   // Shoes policy: off ↔ on
  'M4_Q12': 'chores_preference',  // Chore model preference
  'M4_Q13': 'chores_preference',  // "If I miss my chore, I do it within 24h..."
  'M4_Q14': 'chores_preference',  // "Okay with a monthly deep-clean day."
  'M4_Q15': 'chores_preference',  // "Chip in for shared cleaning supplies."
  'M4_Q16': 'chores_preference',  // "Take out trash when full even if not my turn."
  'M4_Q17': 'cleanliness_room',    // "Okay with a photo standard for 'clean enough'."
  'M4_Q18': 'cleanliness_room',    // "Prefer separate bathroom storage per person."
  'M4_Q19': 'cleanliness_kitchen', // "Guests can use our cookware if they clean it immediately."
  'M4_Q20': 'noise_tolerance',     // Laundry hours stance
  'M4_Q21': 'chores_preference',  // "Repeated chore misses should incur agreed consequences."
  'M4_Q22': 'cleanliness_room',    // "Okay with eco-cleaning (vinegar/baking soda)..."
  'M4_Q23': 'cleanliness_kitchen', // "Prefer dishwasher loading rules posted."
  'M4_Q24': 'cleanliness_room',    // Bathroom etiquette preference
  'M4_Q25': 'chores_preference',   // "Okay with rotating 'kitchen closer'..."

  // Social, Hosting & Language - Map to existing social keys
  'M5_Q1': 'social_level',       // "I want a socially active home (weekly hangs/meals)."
  'M5_Q2': 'social_level',       // "I prefer a quiet home (rare group hangs)."
  'M5_Q3': 'guests_frequency',   // Typical daytime guests per week
  'M5_Q4': 'guests_frequency',    // Typical overnight guests per month
  'M5_Q5': 'guests_frequency',    // "Prefer no overnight guests on weeknights."
  'M5_Q6': 'guests_frequency',    // Minimum notice before inviting guests
  'M5_Q7': 'parties_frequency',   // Max group size I'm comfortable with at home
  'M5_Q8': 'parties_frequency',   // Latest gathering end (weeknights)
  'M5_Q9': 'parties_frequency',   // Latest gathering end (weekends)
  'M5_Q10': 'social_level',      // "I'm comfortable co-hosting dinners/events..."
  'M5_Q11': 'chores_preference', // "Post-event cleanup should happen before bedtime."
  'M5_Q12': 'languages_daily',   // Common language in shared areas
  'M5_Q13': 'languages_daily',   // "I'm willing to switch to the common language..."
  'M5_Q14': 'languages_daily',   // "I'm comfortable hosting friends who don't speak..."
  'M5_Q15': 'languages_daily',   // "I'd like to practice Dutch at home (opt-in)."
  'M5_Q16': 'social_level',       // "Okay with gaming/movie nights before quiet hours."
  'M5_Q17': 'smoking',           // "Smoking/vaping only outside and away from windows."
  'M5_Q18': 'alcohol_at_home',    // "Alcohol in common areas is okay in moderation."
  'M5_Q19': 'alcohol_at_home',    // "Prefer alcohol limited to private rooms."
  'M5_Q20': 'guests_frequency',   // "Prefer to meet regular visitors/partners beforehand."
  'M5_Q21': 'guests_frequency',   // "Okay with relatives from abroad staying multiple nights..."
  'M5_Q22': 'languages_daily',   // "During gatherings, I'm comfortable keeping to the common language..."
  'M5_Q23': 'parties_frequency',  // "After gatherings, quiet hours apply immediately."
  'M5_Q24': 'social_level',       // "I prefer a shared calendar for events/visits."
  'M5_Q25': 'guests_frequency',   // "I'm comfortable coordinating guest sleeping arrangements..."

  // Communication & Conflict - Map to existing communication keys
  'M6_Q1': 'communication_preference', // "If a house rule is broken once, I message the group..."
  'M6_Q2': 'communication_preference', // "I'd rather address issues 1-to-1 before the group chat."
  'M6_Q3': 'communication_preference', // "I prefer a 15-minute weekly house check-in."
  'M6_Q4': 'communication_preference', // "I'd rather raise recurring issues within 24–48h..."
  'M6_Q5': 'communication_preference', // "If I caused a problem, I appreciate immediate feedback."
  'M6_Q6': 'conflict_style',     // "If tension rises, I suggest a short break then resume calmly."
  'M6_Q7': 'conflict_style',      // Escalation stance
  'M6_Q8': 'communication_preference', // Sarcasm/banter tolerance
  'M6_Q9': 'communication_preference', // Request phrasing preference
  'M6_Q10': 'communication_preference', // "Comfortable giving feedback across age/year differences."
  'M6_Q11': 'communication_preference', // "I'm okay using a shared board/app for chores/issues."
  'M6_Q12': 'communication_preference', // "Comfortable saying no to last-minute plans at home."
  'M6_Q13': 'conflict_style',     // "I bring solutions, not just complaints."
  'M6_Q14': 'communication_preference', // "I'm comfortable calling a quick meeting if rules slip."
  'M6_Q15': 'communication_preference', // Door etiquette for getting attention
  'M6_Q16': 'communication_preference', // Response time in house chat
  'M6_Q17': 'communication_preference', // "I avoid non-urgent issues during exam weeks."
  'M6_Q18': 'conflict_style',     // "I'm open to mediation if we get stuck."
  'M6_Q19': 'communication_preference', // Feedback channel for sensitive topics
  'M6_Q20': 'communication_preference', // "I'm comfortable rotating a 'feedback lead'..."
  'M6_Q21': 'communication_preference', // "I'm okay with an anonymous suggestion form..."
  'M6_Q22': 'conflict_style',     // Conflict goal: speed ↔ principle
  'M6_Q23': 'communication_preference', // "I'm fine with agenda + notes for house meetings."
  'M6_Q24': 'communication_preference', // "I prefer tone guidelines in chat..."
  'M6_Q25': 'communication_preference', // "I'm comfortable owning mistakes in the chat publicly."

  // Privacy & Territoriality - Map to social_level (closest existing key)
  'M7_Q1': 'social_level',       // Baseline door policy: open ↔ closed
  'M7_Q2': 'social_level',       // "I need daily alone time at home to recharge."
  'M7_Q3': 'social_level',       // "I'm happy to study/work in common areas together."
  'M7_Q4': 'social_level',       // "Common areas for socializing, bedrooms for privacy."
  'M7_Q5': 'social_level',       // "Quiet reading in living room while others chat softly is okay."
  'M7_Q6': 'social_level',       // Borrowing policy
  'M7_Q7': 'social_level',       // "I want my own fridge/pantry shelf clearly marked."
  'M7_Q8': 'social_level',       // "Comfortable pooling spices/condiments in a shared bin."
  'M7_Q9': 'social_level',       // "Tool sharing (vacuum/mop/toolkit) is okay."
  'M7_Q10': 'social_level',      // "Prefer labeling personal cleaning supplies."
  'M7_Q11': 'social_level',      // "Comfortable being in casual photos/videos at home."
  'M7_Q12': 'social_level',      // "Prefer no photos/videos of me at home."
  'M7_Q13': 'social_level',      // "Quiet calls in living room during day are okay."
  'M7_Q14': 'social_level',      // "Prefer calls kept to bedrooms unless group activity."
  'M7_Q15': 'social_level',      // "Study partners can use common areas before quiet hours."
  'M7_Q16': 'social_level',      // "Prefer to ask before hosting study partners."
  'M7_Q17': 'social_level',      // "Prefer decor in common areas discussed first."
  'M7_Q18': 'social_level',      // "Neutral seasonal decor without discussion is okay."
  'M7_Q19': 'social_level',      // "Comfortable with shared parcel handling (sign/collect)."
  'M7_Q20': 'social_level',      // "Prefer not handling others' parcels unless asked."
  'M7_Q21': 'social_level',      // "Okay with lockbox spare key for emergencies."
  'M7_Q22': 'social_level',      // "Prefer no key sharing; use intercom instead."
  'M7_Q23': 'social_level',      // "Knock-and-wait rule for bedroom doors."
  'M7_Q24': 'social_level',      // "I prefer privacy shades in common rooms at night."
  'M7_Q25': 'social_level',      // "I want clearly defined personal zones in the living room..."

  // Reliability & Logistics - Map to existing keys
  'M8_Q1': 'social_level',       // "I pay my share on time every month."
  'M8_Q2': 'social_level',       // "I'll use a shared expenses app (e.g., Splitwise)."
  'M8_Q3': 'social_level',       // "I keep receipts for shared purchases when asked."
  'M8_Q4': 'social_level',       // "I report maintenance issues promptly."
  'M8_Q5': 'social_level',       // "I handle small fixes (e.g., lightbulb) without delay."
  'M8_Q6': 'social_level',       // "I separate waste/recycling as required locally."
  'M8_Q7': 'social_level',       // "I'm comfortable with energy-saving practices..."
  'M8_Q8': 'smoking',           // "No smoking/vaping indoors under any circumstances."
  'M8_Q9': 'smoking',           // "No smoking on balconies/windows if housemates request."
  'M8_Q10': 'social_level',      // "I can commit to building/landlord rules."
  'M8_Q11': 'social_level',      // "No subletting/paid guests (e.g., Airbnb) without unanimous consent."
  'M8_Q12': 'social_level',      // "I have or will get liability insurance if required."
  'M8_Q13': 'social_level',      // "I agree to share a basic emergency contact with housemates."
  'M8_Q14': 'pets_allowed',    // Pets policy: none ↔ some
  'M8_Q15': 'pets_allowed',      // "I'm okay with cats."
  'M8_Q16': 'pets_allowed',      // "I'm okay with dogs."
  'M8_Q17': 'pets_allowed',      // "I'm okay with small caged animals."
  'M8_Q18': 'social_level',      // "I need to register (BRP) at this address."
  'M8_Q19': 'social_level',      // "The address must allow BRP registration."
  'M8_Q20': 'social_level',      // Move-in date flexibility (± days)
  'M8_Q21': 'social_level',      // "I'll provide documents for municipal registration when asked."
  'M8_Q22': 'social_level',      // "I prefer contracts that specify quiet hours and guest rules."
  'M8_Q23': 'social_level',      // Minimum stay commitment (months)
  'M8_Q24': 'social_level',      // "I agree to a roommate agreement created from our answers."
  'M8_Q25': 'languages_daily',   // Preferred communication language for rental/house docs
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

  const questionKey = itemIdToQuestionKey[answer.itemId]
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
