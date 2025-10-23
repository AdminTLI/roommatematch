import { createClient } from '@/lib/supabase/server';
import type { QuestionnaireResult, Section, SectionAnswer } from '@/types/report';

export async function fetchReportData(userId: string): Promise<QuestionnaireResult> {
  const supabase = await createClient();

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      first_name,
      users!inner(email)
    `)
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Failed to fetch user profile: ${profileError?.message}`);
  }

  // Fetch all responses with question items
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      question_key,
      value,
      question_items!inner(
        key,
        section,
        type,
        options
      )
    `)
    .eq('user_id', userId);

  if (responsesError) {
    throw new Error(`Failed to fetch responses: ${responsesError.message}`);
  }

  // Group responses by section
  const sectionsMap = new Map<string, SectionAnswer[]>();
  
  for (const response of responses || []) {
    const questionItem = response.question_items;
    const sectionId = questionItem.section;
    
    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, []);
    }

    const answer: SectionAnswer = {
      id: response.question_key,
      label: getQuestionLabel(response.question_key, questionItem.options),
      value: response.value,
      meta: getAnswerMeta(response.question_key, questionItem.options),
      dealBreaker: response.question_key.includes('deal_breaker') ? {
        isDealBreaker: true,
        note: 'Non-negotiable'
      } : undefined
    };

    sectionsMap.get(sectionId)!.push(answer);
  }

  // Convert to sections array
  const sections: Section[] = Array.from(sectionsMap.entries()).map(([sectionId, answers]) => ({
    id: sectionId,
    title: getSectionTitle(sectionId),
    whyItMatters: getSectionWhyItMatters(sectionId),
    answers
  }));

  return {
    generatedAtISO: new Date().toISOString(),
    student: {
      name: profile.first_name,
      email: profile.users?.email
    },
    sections
  };
}

function getQuestionLabel(key: string, options: any): string {
  // Map question keys to human-readable labels
  const labelMap: Record<string, string> = {
    'sleep_start': 'Quiet hours start',
    'sleep_end': 'Quiet hours end',
    'study_intensity': 'Study intensity',
    'cleanliness_room': 'Room cleanliness preference',
    'cleanliness_kitchen': 'Kitchen cleanliness preference',
    'noise_tolerance': 'Noise tolerance',
    'guests_frequency': 'Guest frequency',
    'parties_frequency': 'Party frequency',
    'social_level': 'Social activity level',
    'alcohol_at_home': 'Alcohol at home',
    'pets_tolerance': 'Pet tolerance',
    'food_sharing': 'Food sharing preference',
    'utensils_sharing': 'Utensils sharing preference',
    'smoking': 'Smoking preference',
    'budget_min': 'Minimum budget',
    'budget_max': 'Maximum budget',
    'commute_max': 'Maximum commute time',
    'room_type': 'Preferred room type',
    'lease_length': 'Preferred lease length',
    'move_in_window': 'Move-in window'
  };

  return labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getAnswerMeta(key: string, options: any): SectionAnswer['meta'] {
  const metaMap: Record<string, SectionAnswer['meta']> = {
    'sleep_start': { unit: 'time-24h' },
    'sleep_end': { unit: 'time-24h' },
    'study_intensity': { endpoints: ['Relaxed', 'Intense'], unit: 'time-24h' },
    'cleanliness_room': { endpoints: ['Messy', 'Very Clean'] },
    'cleanliness_kitchen': { endpoints: ['Messy', 'Very Clean'] },
    'noise_tolerance': { endpoints: ['Quiet', 'Noisy'] },
    'guests_frequency': { endpoints: ['Rarely', 'Often'], unit: 'guests/mo' },
    'parties_frequency': { endpoints: ['Never', 'Weekly'] },
    'social_level': { endpoints: ['Introvert', 'Extrovert'] },
    'alcohol_at_home': { endpoints: ['Never', 'Often'] },
    'pets_tolerance': { endpoints: ['No pets', 'Pet lover'] },
    'budget_min': { unit: '€/month' },
    'budget_max': { unit: '€/month' },
    'commute_max': { unit: 'minutes' }
  };

  return metaMap[key];
}

function getSectionTitle(sectionId: string): string {
  const titleMap: Record<string, string> = {
    'sleep': 'Sleep & Circadian',
    'lifestyle': 'Lifestyle & Habits',
    'social': 'Social Preferences',
    'logistics': 'Housing Logistics',
    'personality': 'Personality Traits',
    'preferences': 'General Preferences'
  };

  return titleMap[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

function getSectionWhyItMatters(sectionId: string): string {
  const whyItMattersMap: Record<string, string> = {
    'sleep': 'Sleep schedules affect daily routines and household harmony.',
    'lifestyle': 'Daily habits and preferences shape shared living experiences.',
    'social': 'Social preferences impact roommate interactions and household atmosphere.',
    'logistics': 'Practical considerations for successful co-living arrangements.',
    'personality': 'Personality traits influence communication and conflict resolution.',
    'preferences': 'General preferences help identify compatibility areas.'
  };

  return whyItMattersMap[sectionId] || 'Understanding these preferences helps find compatible roommates.';
}
