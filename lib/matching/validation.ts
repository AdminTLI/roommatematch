/**
 * Validation utilities for match suggestions
 * Provides validation functions to ensure data consistency at the API level
 */

import type { MatchSuggestion } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates a match suggestion's data integrity
 */
export function validateMatchSuggestion(suggestion: MatchSuggestion): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!suggestion.id) {
    errors.push('Missing suggestion ID')
  }

  if (!suggestion.memberIds || suggestion.memberIds.length < 2) {
    errors.push('memberIds must contain at least 2 members')
  }

  if (!suggestion.status) {
    errors.push('Missing status')
  }

  // Check for duplicate member IDs
  if (suggestion.memberIds) {
    const uniqueIds = new Set(suggestion.memberIds)
    if (uniqueIds.size !== suggestion.memberIds.length) {
      errors.push('memberIds contains duplicate user IDs')
    }
  }

  // Validate accepted_by contains only member IDs
  if (suggestion.acceptedBy && suggestion.memberIds) {
    const invalidIds = suggestion.acceptedBy.filter(
      id => !suggestion.memberIds!.includes(id)
    )
    if (invalidIds.length > 0) {
      errors.push(`acceptedBy contains IDs not in memberIds: ${invalidIds.join(', ')}`)
    }
  }

  // Validate confirmed status
  if (suggestion.status === 'confirmed') {
    if (!suggestion.acceptedBy || suggestion.acceptedBy.length === 0) {
      errors.push('Confirmed status requires acceptedBy to be set')
    } else if (suggestion.memberIds) {
      const allAccepted = suggestion.memberIds.every(id => 
        suggestion.acceptedBy!.includes(id)
      )
      if (!allAccepted) {
        errors.push('Confirmed status requires all members to be in acceptedBy')
      }

      if (suggestion.acceptedBy.length !== suggestion.memberIds.length) {
        errors.push('Confirmed status: acceptedBy count must match memberIds count')
      }
    }
  }

  // Validate accepted status - warn if all members have accepted but status isn't confirmed
  if (suggestion.status === 'accepted' && suggestion.acceptedBy && suggestion.memberIds) {
    const allAccepted = suggestion.memberIds.every(id => 
      suggestion.acceptedBy!.includes(id)
    )
    if (allAccepted && suggestion.acceptedBy.length === suggestion.memberIds.length) {
      warnings.push('All members have accepted but status is "accepted" (should be "confirmed")')
    }
  }

  // Validate declined status - warn if all members have accepted
  if (suggestion.status === 'declined' && suggestion.acceptedBy && suggestion.memberIds) {
    const allAccepted = suggestion.memberIds.every(id => 
      suggestion.acceptedBy!.includes(id)
    )
    if (allAccepted && suggestion.acceptedBy.length === suggestion.memberIds.length) {
      warnings.push('All members have accepted but status is "declined" (should be "confirmed")')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates that a user action (accept/decline) can be performed on a suggestion
 */
export function validateUserAction(
  suggestion: MatchSuggestion,
  userId: string,
  action: 'accept' | 'decline'
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check user is in memberIds
  if (!suggestion.memberIds || !suggestion.memberIds.includes(userId)) {
    errors.push('User is not part of this match suggestion')
    return { valid: false, errors, warnings }
  }

  // Check user hasn't already acted
  if (suggestion.acceptedBy && suggestion.acceptedBy.includes(userId) && action === 'accept') {
    warnings.push('User has already accepted this suggestion')
  }

  // Check suggestion isn't already confirmed
  if (suggestion.status === 'confirmed') {
    if (action === 'decline') {
      warnings.push('Cannot decline a confirmed match')
    } else {
      warnings.push('Match is already confirmed')
    }
  }

  // Check suggestion isn't declined
  if (suggestion.status === 'declined' && action === 'accept') {
    warnings.push('Match suggestion was declined. Cannot accept a declined match.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates the state transition when updating a suggestion
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string,
  currentAcceptedBy: string[] | undefined,
  newAcceptedBy: string[] | undefined,
  memberIds: string[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate transition to confirmed
  if (newStatus === 'confirmed') {
    if (!newAcceptedBy || newAcceptedBy.length === 0) {
      errors.push('Cannot set status to confirmed without acceptedBy')
    } else if (newAcceptedBy.length !== memberIds.length) {
      errors.push('Cannot set status to confirmed: not all members have accepted')
    } else {
      const allAccepted = memberIds.every(id => newAcceptedBy.includes(id))
      if (!allAccepted) {
        errors.push('Cannot set status to confirmed: acceptedBy does not contain all members')
      }
    }
  }

  // Validate transition from confirmed
  if (currentStatus === 'confirmed' && newStatus !== 'confirmed') {
    warnings.push('Changing status away from confirmed may cause data inconsistency')
  }

  // Validate transition to declined when all members have accepted
  if (newStatus === 'declined' && newAcceptedBy && newAcceptedBy.length === memberIds.length) {
    const allAccepted = memberIds.every(id => newAcceptedBy.includes(id))
    if (allAccepted) {
      errors.push('Cannot set status to declined when all members have accepted (should be confirmed)')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
