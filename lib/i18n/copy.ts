export const reportCopy = {
  en: {
    // Page titles
    executiveSummary: 'Executive Summary',
    topSignals: 'Top 10 Signals',
    dealBreakers: 'Deal Breakers',
    sectionHeatMap: 'Section Heat Map',
    tableOfContents: 'Table of Contents',
    dealBreakersRecap: 'Deal Breakers Recap',
    
    // Section labels
    whyItMatters: 'Why this matters',
    keyTakeaways: 'Key Takeaways',
    
    // Common terms
    generated: 'Generated',
    compatibility: 'Compatibility',
    report: 'Report',
    
    // Status indicators
    green: 'Good',
    amber: 'Moderate',
    red: 'Attention',
    
    // Deal breaker labels
    nonNegotiable: 'Non-negotiable',
    dealBreaker: 'Deal Breaker',
    important: 'Important',
    
    // Privacy notice
    privacyNotice: 'This report contains personal preferences and should be shared only with potential roommates.',
    
    // Section titles
    sleep: 'Sleep & Circadian',
    lifestyle: 'Lifestyle & Habits',
    social: 'Social Preferences',
    logistics: 'Housing Logistics',
    personality: 'Personality Traits',
    preferences: 'General Preferences',
    
    // Why it matters descriptions
    sleepMatters: 'Sleep schedules affect daily routines and household harmony.',
    lifestyleMatters: 'Daily habits and preferences shape shared living experiences.',
    socialMatters: 'Social preferences impact roommate interactions and household atmosphere.',
    logisticsMatters: 'Practical considerations for successful co-living arrangements.',
    personalityMatters: 'Personality traits influence communication and conflict resolution.',
    preferencesMatters: 'General preferences help identify compatibility areas.',
    
    // Default fallbacks
    loading: 'Loading...',
    noData: 'No data available',
    unknown: 'Unknown'
  }
};

export function getReportCopy(key: string, locale: string = 'en'): string {
  const keys = key.split('.');
  let value: any = reportCopy[locale as keyof typeof reportCopy];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return reportCopy.en[key as keyof typeof reportCopy.en] || key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}
