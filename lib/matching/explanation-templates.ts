// Explanation template library
// Multiple variations for each section to provide natural variety

export interface TemplateContext {
  alignments: Array<{
    description: string
    humanizedA: string
    humanizedB: string
    category: string
  }>
  sectionScores: Record<string, number>
  concerns?: string[]
}

/**
 * Generate a deterministic hash from match ID for template selection
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Select a template from an array deterministically based on hash
 */
function selectTemplate<T>(templates: T[], seed: string): T {
  const hash = hashString(seed)
  const index = hash % templates.length
  return templates[index]
}

/**
 * Opening sentence templates
 */
const openingTemplates = [
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `This looks like a promising match because ${first.description.toLowerCase()}.`
    }
    return 'This looks like a promising match based on your profiles.'
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `You two seem like a great fit because ${first.description.toLowerCase()}.`
    }
    return 'You two seem like a great fit based on your questionnaire responses.'
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `Based on your answers, you're well-matched because ${first.description.toLowerCase()}.`
    }
    return 'Based on your answers, you both share similar values and lifestyle preferences.'
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `What stands out here is that ${first.description.toLowerCase()}, which suggests good compatibility.`
    }
    return 'What stands out here is how well your preferences align.'
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `Your profiles suggest you'd get along well, especially since ${first.description.toLowerCase()}.`
    }
    return "Your profiles suggest you'd get along well."
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `There's clear alignment between you two - ${first.description.toLowerCase()}, which is always a good sign.`
    }
    return "There's clear alignment between you two based on your preferences."
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `This match shows real potential because ${first.description.toLowerCase()}.`
    }
    return 'This match shows real potential based on your shared values.'
  },
  (alignments: TemplateContext['alignments']) => {
    if (alignments.length > 0) {
      const first = alignments[0]
      return `You both indicated that ${first.description.toLowerCase()}, which is a strong foundation for living together.`
    }
    return 'You both share similar values, which is a strong foundation for living together.'
  }
]

/**
 * Strength description templates
 */
const strengthTemplates = [
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `Plus, you both ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, which should help you both feel comfortable and understand each other's routines.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `Your ${first.category} preferences align really well, which should help you both feel at home.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `What's particularly nice is that ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, so your daily routines should sync naturally.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `What's particularly nice is that ${first.description.toLowerCase()}, so your daily routines should sync naturally.`
    }
    const topScore = Object.entries(sectionScores)
      .sort((a, b) => b[1] - a[1])[0]
    if (topScore && topScore[1] > 0.7) {
      return `Your ${topScore[0]} align really well, which should help you both feel at home and understand each other's routines.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `Another plus is that you both ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, which means less friction in day-to-day living.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `Another plus is that ${first.description.toLowerCase()}, which means less friction in day-to-day living.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `Your shared preferences around ${first.category} and ${second.category} mean you're likely on the same page about the important stuff.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `Your shared preferences around ${first.category} mean you're likely on the same page about the important stuff.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `It's also worth noting that ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, which suggests you'd understand each other's habits well.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `It's also worth noting that ${first.description.toLowerCase()}, which suggests you'd understand each other's habits well.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `You both indicated similar preferences around ${first.category} and ${second.category}, which is always a good foundation for a roommate relationship.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `You both indicated similar preferences around ${first.category}, which is always a good foundation for a roommate relationship.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `On top of that, ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, so you're likely to have smooth day-to-day interactions.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `On top of that, ${first.description.toLowerCase()}, so you're likely to have smooth day-to-day interactions.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `Your answers show that ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, which means you'd probably mesh well in a shared space.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `Your answers show that ${first.description.toLowerCase()}, which means you'd probably mesh well in a shared space.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `The fact that you both ${first.description.toLowerCase()} and ${second.description.toLowerCase()} suggests you'd have compatible lifestyles.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `The fact that ${first.description.toLowerCase()} suggests you'd have compatible lifestyles.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  },
  (alignments: TemplateContext['alignments'], sectionScores: Record<string, number>) => {
    if (alignments.length >= 2) {
      const first = alignments[0]
      const second = alignments[1]
      return `What makes this match interesting is that ${first.description.toLowerCase()} and ${second.description.toLowerCase()}, which shows real compatibility.`
    }
    if (alignments.length === 1) {
      const first = alignments[0]
      return `What makes this match interesting is that ${first.description.toLowerCase()}, which shows real compatibility.`
    }
    return 'You both seem to value similar things when it comes to shared living spaces.'
  }
]

/**
 * Concern/constructive feedback templates
 */
const concernTemplates = [
  (sectionScores: Record<string, number>, concerns?: string[]) => {
    const scheduleScore = sectionScores.schedule || 0
    const lifestyleScore = sectionScores.lifestyle || 0
    const socialScore = sectionScores.social || 0
    
    if (scheduleScore < 0.5) {
      return 'One thing to keep in mind is that your schedules might be quite different, so it\'d be worth discussing quiet hours and study times early on to make sure you\'re both comfortable.'
    }
    if (lifestyleScore < 0.5) {
      return 'You might want to chat about cleanliness expectations and how you both like to keep shared spaces, since those small differences can sometimes cause friction if not discussed upfront.'
    }
    if (socialScore < 0.5) {
      return 'Since you have different preferences around guests and socializing at home, having an open conversation about boundaries and house rules would help you both feel respected.'
    }
    return 'Like with any roommate situation, communication is key - make sure you\'re both on the same page about the important stuff like bills, shared responsibilities, and what happens if plans change.'
  },
  (sectionScores: Record<string, number>, concerns?: string[]) => {
    const scheduleScore = sectionScores.schedule || 0
    const lifestyleScore = sectionScores.lifestyle || 0
    const socialScore = sectionScores.social || 0
    
    if (scheduleScore < 0.5) {
      return 'Your sleep schedules differ a bit, which is totally normal, but having a quick chat about quiet hours upfront can prevent any misunderstandings later.'
    }
    if (lifestyleScore < 0.5) {
      return 'There are some differences in how you prefer to maintain shared spaces, so setting clear expectations about cleaning routines early on would be smart.'
    }
    if (socialScore < 0.5) {
      return 'Your social preferences at home are a bit different, so talking through guest policies and house rules together would help you both feel comfortable.'
    }
    return 'Communication is always important in shared living, so make sure you talk through the essentials like household responsibilities and boundaries early on.'
  },
  (sectionScores: Record<string, number>, concerns?: string[]) => {
    const scheduleScore = sectionScores.schedule || 0
    const lifestyleScore = sectionScores.lifestyle || 0
    const socialScore = sectionScores.social || 0
    
    if (scheduleScore < 0.5) {
      return 'Since your daily routines are different, it\'d be helpful to discuss when quiet hours work best for both of you and how to accommodate each other\'s schedules.'
    }
    if (lifestyleScore < 0.5) {
      return 'You have slightly different standards around cleanliness, so having a conversation about what "clean enough" means to each of you would set clear expectations.'
    }
    if (socialScore < 0.5) {
      return 'Your preferences around hosting and socializing differ, which is fine, but establishing some ground rules about guests and noise levels would help avoid conflicts.'
    }
    return 'As with any living arrangement, keeping open communication about household rules, shared expenses, and expectations is essential for a smooth experience.'
  },
  (sectionScores: Record<string, number>, concerns?: string[]) => {
    const scheduleScore = sectionScores.schedule || 0
    const lifestyleScore = sectionScores.lifestyle || 0
    const socialScore = sectionScores.social || 0
    
    if (scheduleScore < 0.5) {
      return 'Your sleep patterns don\'t perfectly align, but that\'s workable - just make sure you both know when the other needs quiet time and how to be respectful of different schedules.'
    }
    if (lifestyleScore < 0.5) {
      return 'You each have your own way of keeping things tidy, so aligning on basic cleanliness standards and chore responsibilities would prevent any misunderstandings.'
    }
    if (socialScore < 0.5) {
      return 'You both have different comfort levels around guests and home socializing, so being upfront about boundaries and house rules from the start would set a good foundation.'
    }
    return 'As with any shared living situation, talking through your expectations about daily life, shared responsibilities, and how to handle changes is really important.'
  },
  (sectionScores: Record<string, number>, concerns?: string[]) => {
    const scheduleScore = sectionScores.schedule || 0
    const lifestyleScore = sectionScores.lifestyle || 0
    const socialScore = sectionScores.social || 0
    
    if (scheduleScore < 0.5) {
      return 'Your wake and sleep times are different, which is completely normal, but having a quick check-in about quiet hours and noise expectations would help you both plan better.'
    }
    if (lifestyleScore < 0.5) {
      return 'There are some differences in your cleanliness preferences, so establishing mutual standards for shared spaces early on would help you both feel comfortable.'
    }
    if (socialScore < 0.5) {
      return 'Your approaches to socializing at home differ, so discussing guest policies, noise levels, and house rules together would ensure you both feel respected.'
    }
    return 'Good communication makes all the difference in shared living, so be sure to talk through the basics like household expectations, shared costs, and how you\'ll handle day-to-day decisions.'
  }
]

/**
 * Generate opening sentence
 */
export function generateOpening(context: TemplateContext, matchId: string): string {
  const template = selectTemplate(openingTemplates, matchId)
  return template(context.alignments)
}

/**
 * Generate strength description
 */
export function generateStrength(context: TemplateContext, matchId: string): string {
  const template = selectTemplate(strengthTemplates, matchId + '_strength')
  return template(context.alignments, context.sectionScores)
}

/**
 * Generate concern/constructive feedback
 */
export function generateConcern(context: TemplateContext, matchId: string): string {
  const template = selectTemplate(concernTemplates, matchId + '_concern')
  return template(context.sectionScores, context.concerns)
}

