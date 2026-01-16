/**
 * Housing Status Definitions
 * 
 * Defines the available housing status options that users can select
 * to indicate their current housing situation.
 */

export type HousingStatusKey = 'seeking_room' | 'offering_room' | 'team_up' | 'exploring'

export interface HousingStatusDefinition {
  key: HousingStatusKey
  label: string
  subtitle: string
  emoji: string
}

export const HOUSING_STATUSES: HousingStatusDefinition[] = [
  {
    key: 'seeking_room',
    label: 'Seeking a Room',
    subtitle: 'I am looking for a room in an existing house or shared flat.',
    emoji: '🔍'
  },
  {
    key: 'offering_room',
    label: 'Offering a Room',
    subtitle: 'I have a room available and I am looking for a new roommate.',
    emoji: '🏠'
  },
  {
    key: 'team_up',
    label: 'Looking to Team Up',
    subtitle: 'I want to find a group to search for and rent a new house together.',
    emoji: '🤝'
  },
  {
    key: 'exploring',
    label: 'Exploring the Market',
    subtitle: "I'm currently just seeing what's out there.",
    emoji: '✨'
  }
]

/**
 * Get housing status definition by key
 */
export function getHousingStatus(key: HousingStatusKey): HousingStatusDefinition | undefined {
  return HOUSING_STATUSES.find(status => status.key === key)
}

/**
 * Get all housing status keys
 */
export function getHousingStatusKeys(): HousingStatusKey[] {
  return HOUSING_STATUSES.map(status => status.key)
}

/**
 * Validate if a string is a valid housing status key
 */
export function isValidHousingStatus(key: string): key is HousingStatusKey {
  return HOUSING_STATUSES.some(status => status.key === key)
}
