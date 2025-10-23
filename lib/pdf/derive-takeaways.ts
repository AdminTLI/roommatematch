import type { Section, SectionAnswer } from '@/types/report';

export function deriveTakeaways(section: Section): string[] {
  const takeaways: string[] = [];
  
  for (const answer of section.answers) {
    if (answer.value === 'Neutral') continue;
    
    // Sleep patterns
    if (answer.id === 'sleep_start' && typeof answer.value === 'string') {
      const time = answer.value;
      if (time >= '22:00') {
        takeaways.push('Prefers quiet nights with late sleep schedule');
      } else if (time <= '20:00') {
        takeaways.push('Early sleeper who values quiet evenings');
      }
    }
    
    if (answer.id === 'sleep_end' && typeof answer.value === 'string') {
      const time = answer.value;
      if (time <= '06:00') {
        takeaways.push('Early riser with morning routine preferences');
      } else if (time >= '10:00') {
        takeaways.push('Late riser who values morning quiet');
      }
    }
    
    // Study habits
    if (answer.id === 'study_intensity' && typeof answer.value === 'number') {
      if (answer.value >= 8) {
        takeaways.push('Intensive study schedule requiring quiet environment');
      } else if (answer.value <= 3) {
        takeaways.push('Flexible study schedule with relaxed approach');
      }
    }
    
    // Cleanliness
    if (answer.id === 'cleanliness_room' && typeof answer.value === 'number') {
      if (answer.value >= 8) {
        takeaways.push('High standards for room cleanliness and organization');
      } else if (answer.value <= 4) {
        takeaways.push('Relaxed approach to room cleanliness');
      }
    }
    
    if (answer.id === 'cleanliness_kitchen' && typeof answer.value === 'number') {
      if (answer.value >= 8) {
        takeaways.push('Strict kitchen cleanliness expectations');
      } else if (answer.value <= 4) {
        takeaways.push('Casual kitchen maintenance preferences');
      }
    }
    
    // Social preferences
    if (answer.id === 'guests_frequency' && typeof answer.value === 'number') {
      if (answer.value >= 7) {
        takeaways.push('Frequent social gatherings and guest visits');
      } else if (answer.value <= 3) {
        takeaways.push('Prefers minimal guests and quiet environment');
      }
    }
    
    if (answer.id === 'parties_frequency' && typeof answer.value === 'number') {
      if (answer.value >= 6) {
        takeaways.push('Active social life with regular parties');
      } else if (answer.value <= 2) {
        takeaways.push('Prefers quiet home environment without parties');
      }
    }
    
    if (answer.id === 'social_level' && typeof answer.value === 'number') {
      if (answer.value >= 8) {
        takeaways.push('Highly social and outgoing personality');
      } else if (answer.value <= 3) {
        takeaways.push('Introverted with preference for quiet time');
      }
    }
    
    // Budget preferences
    if (answer.id === 'budget_max' && typeof answer.value === 'string') {
      const budget = parseInt(answer.value.replace(/\D/g, ''));
      if (budget >= 1000) {
        takeaways.push('Higher budget range for premium housing');
      } else if (budget <= 600) {
        takeaways.push('Budget-conscious with cost-effective preferences');
      }
    }
    
    // Lifestyle choices
    if (answer.id === 'alcohol_at_home' && typeof answer.value === 'number') {
      if (answer.value >= 7) {
        takeaways.push('Regular alcohol consumption at home');
      } else if (answer.value <= 2) {
        takeaways.push('Minimal or no alcohol consumption');
      }
    }
    
    if (answer.id === 'smoking' && typeof answer.value === 'boolean') {
      if (answer.value) {
        takeaways.push('Smoker - important for compatibility');
      } else {
        takeaways.push('Non-smoker with clean air preferences');
      }
    }
    
    if (answer.id === 'pets_tolerance' && typeof answer.value === 'number') {
      if (answer.value >= 8) {
        takeaways.push('Pet lover who may want or have pets');
      } else if (answer.value <= 3) {
        takeaways.push('Prefers pet-free environment');
      }
    }
  }
  
  // Remove duplicates and limit to 4 takeaways
  return [...new Set(takeaways)].slice(0, 4);
}
