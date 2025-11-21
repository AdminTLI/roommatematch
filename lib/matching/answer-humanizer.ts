// Answer humanization utility
// Converts raw answer values to human-readable text

import itemBank from '@/data/item-bank.v1.json'
import { getItemMetadata } from './answer-map'

const scaleAnchors = {
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  comfort: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
}

/**
 * Humanize a raw answer value to readable text
 */
export function humanizeAnswer(itemId: string, value: any): string {
  if (!value && value !== 0) return ''
  
  const item = getItemMetadata(itemId)
  if (!item) return String(value)

  // Handle value objects (e.g., { kind: 'likert', value: 4 })
  let rawValue = value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    rawValue = value.value
  }

  switch (item.kind) {
    case 'likert': {
      const likertScale = item.scale as 'agreement' | 'frequency' | 'comfort'
      if (typeof rawValue === 'number' && rawValue >= 1 && rawValue <= 5) {
        return scaleAnchors[likertScale][rawValue - 1] || String(rawValue)
      }
      return String(rawValue)
    }

    case 'bipolar': {
      if (typeof rawValue === 'number' && rawValue >= 1 && rawValue <= 5) {
        // Convert bipolar scale to descriptive text
        if (rawValue === 1) return item.bipolarLabels?.left || 'Left'
        if (rawValue === 5) return item.bipolarLabels?.right || 'Right'
        if (rawValue === 3) return 'Moderate'
        if (rawValue < 3) {
          return item.bipolarLabels?.left || 'Left-leaning'
        }
        return item.bipolarLabels?.right || 'Right-leaning'
      }
      return String(rawValue)
    }

    case 'mcq': {
      if (item.options) {
        const option = item.options.find((o: any) => o.value === rawValue)
        return option?.label || String(rawValue)
      }
      return String(rawValue)
    }

    case 'toggle': {
      return rawValue ? 'Yes' : 'No'
    }

    case 'timeRange': {
      if (typeof rawValue === 'object' && rawValue !== null && 'start' in rawValue && 'end' in rawValue) {
        return `${rawValue.start} - ${rawValue.end}`
      }
      return String(rawValue)
    }

    case 'number': {
      return String(rawValue)
    }

    default:
      return String(rawValue)
  }
}

/**
 * Format time for display (e.g., "22:00" -> "10pm" or "10:00pm")
 */
export function formatTimeForDisplay(time: string): string {
  if (!time || typeof time !== 'string') return time
  
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const hour12 = hours % 12 || 12
    const ampm = hours < 12 ? 'am' : 'pm'
    if (minutes === 0) {
      return `${hour12}${ampm}`
    }
    return `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`
  } catch {
    return time
  }
}

/**
 * Format time range for display (e.g., "22:00 - 07:00" -> "10pm - 7am")
 */
export function formatTimeRangeForDisplay(timeRange: any): string {
  if (!timeRange) return ''
  
  if (typeof timeRange === 'object' && timeRange !== null && 'start' in timeRange && 'end' in timeRange) {
    return `${formatTimeForDisplay(timeRange.start)} - ${formatTimeForDisplay(timeRange.end)}`
  }
  
  if (typeof timeRange === 'string') {
    const parts = timeRange.split(' - ')
    if (parts.length === 2) {
      return `${formatTimeForDisplay(parts[0])} - ${formatTimeForDisplay(parts[1])}`
    }
  }
  
  return String(timeRange)
}

/**
 * Get a natural language description for a bipolar value
 */
export function describeBipolarValue(itemId: string, value: any): string {
  const item = getItemMetadata(itemId)
  if (!item || item.kind !== 'bipolar') return ''
  
  let rawValue = value
  if (typeof value === 'object' && value !== null && 'value' in value) {
    rawValue = value.value
  }
  
  if (typeof rawValue !== 'number' || rawValue < 1 || rawValue > 5) return ''
  
  if (rawValue === 1) return item.bipolarLabels?.left || ''
  if (rawValue === 5) return item.bipolarLabels?.right || ''
  if (rawValue === 3) return 'moderate'
  if (rawValue < 3) {
    // Leaning left
    const percent = Math.round(((3 - rawValue) / 2) * 100)
    return `${item.bipolarLabels?.left || 'left-leaning'} (${percent}%)`
  }
  // Leaning right
  const percent = Math.round(((rawValue - 3) / 2) * 100)
  return `${item.bipolarLabels?.right || 'right-leaning'} (${percent}%)`
}

