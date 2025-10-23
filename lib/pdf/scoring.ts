import type { Section, SectionAnswer } from '@/types/report';

export function sectionScore(section: Section): number {
  let score = 0;
  
  for (const answer of section.answers) {
    // Penalize deal breakers heavily
    if (answer.dealBreaker?.isDealBreaker) {
      score += 3;
    }
    
    // Reward non-neutral responses (more signal)
    if (answer.value !== 'Neutral') {
      score -= 0.1;
    }
    
    // Penalize extreme values that might cause conflicts
    if (typeof answer.value === 'number') {
      if (answer.id.includes('guests_frequency') && answer.value > 8) {
        score += 1; // High guest frequency
      }
      if (answer.id.includes('parties_frequency') && answer.value > 7) {
        score += 1; // High party frequency
      }
      if (answer.id.includes('noise_tolerance') && answer.value < 3) {
        score += 1; // Very low noise tolerance
      }
    }
    
    // Penalize conflicting sleep schedules
    if (answer.id === 'sleep_start' && typeof answer.value === 'number' && answer.value > 25) {
      score += 0.5; // Very late sleep start
    }
    if (answer.id === 'sleep_end' && typeof answer.value === 'number' && answer.value < 6) {
      score += 0.5; // Very early wake up
    }
  }
  
  return score;
}

export function sectionTrafficLight(score: number): 'green' | 'amber' | 'red' {
  if (score <= 0.2) return 'green';
  if (score <= 2.5) return 'amber';
  return 'red';
}

export function extractTopSignals(sections: Section[]): SectionAnswer[] {
  const allAnswers: SectionAnswer[] = [];
  
  for (const section of sections) {
    for (const answer of section.answers) {
      // Add deal breakers
      if (answer.dealBreaker?.isDealBreaker) {
        allAnswers.push(answer);
      }
      
      // Add extreme Likert values (1 or 5)
      if (typeof answer.value === 'number' && (answer.value === 1 || answer.value === 5)) {
        allAnswers.push(answer);
      }
      
      // Add high-impact values
      if (typeof answer.value === 'number') {
        if (answer.id.includes('guests_frequency') && answer.value > 8) {
          allAnswers.push(answer);
        }
        if (answer.id.includes('parties_frequency') && answer.value > 7) {
          allAnswers.push(answer);
        }
        if (answer.id.includes('budget_max') && answer.value > 1500) {
          allAnswers.push(answer);
        }
      }
      
      // Add boolean preferences
      if (typeof answer.value === 'boolean') {
        allAnswers.push(answer);
      }
    }
  }
  
  // Sort by impact and return top 10
  return allAnswers
    .sort((a, b) => {
      // Deal breakers first
      if (a.dealBreaker?.isDealBreaker && !b.dealBreaker?.isDealBreaker) return -1;
      if (!a.dealBreaker?.isDealBreaker && b.dealBreaker?.isDealBreaker) return 1;
      
      // Then by extreme values
      const aExtreme = typeof a.value === 'number' && (a.value === 1 || a.value === 5);
      const bExtreme = typeof b.value === 'number' && (b.value === 1 || b.value === 5);
      if (aExtreme && !bExtreme) return -1;
      if (!aExtreme && bExtreme) return 1;
      
      return 0;
    })
    .slice(0, 10);
}

export function extractDealBreakers(sections: Section[]): SectionAnswer[] {
  const dealBreakers: SectionAnswer[] = [];
  
  for (const section of sections) {
    for (const answer of section.answers) {
      if (answer.dealBreaker?.isDealBreaker) {
        dealBreakers.push(answer);
      }
    }
  }
  
  return dealBreakers;
}
