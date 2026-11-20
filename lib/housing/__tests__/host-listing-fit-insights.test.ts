import { describe, expect, it } from 'vitest'
import {
  buildHostListingFitInsights,
  explainHostGateConflicts,
} from '../host-listing-fit-insights'

describe('buildHostListingFitInsights', () => {
  it('writes host-facing copy about the applicant', () => {
    const insights = buildHostListingFitInsights(
      {
        lifestyle: 0.9,
        budget: 0.85,
        timeline: 0.8,
        capacity: 0.9,
        amenities: 0.7,
        cohesion: 1,
      },
      0.86,
      { groupSize: 1 },
    )

    expect(insights.overall.toLowerCase()).toContain('they')
    expect(insights.overall.toLowerCase()).not.toContain('your answers')
    expect(insights.lifestyle.toLowerCase()).toContain('their')
    expect(insights.budget.toLowerCase()).toContain('budget')
    expect(insights.timeline.toLowerCase()).toContain('move-in')
    expect(insights.capacity.toLowerCase()).toContain('one person')
    expect(insights.amenities.length).toBeGreaterThan(20)
    expect(insights.cohesion.toLowerCase()).toContain('solo')
  })

  it('calls out the weakest dimension when scores diverge', () => {
    const insights = buildHostListingFitInsights(
      { lifestyle: 0.9, budget: 0.4, timeline: 0.85 },
      0.7,
    )

    expect(insights.overall.toLowerCase()).toContain('budget')
  })
})

describe('explainHostGateConflicts', () => {
  it('explains smoking and pets in plain language', () => {
    const lines = explainHostGateConflicts(['smoking', 'pets'])
    expect(lines).toHaveLength(2)
    expect(lines[0]!.toLowerCase()).toContain('smoke')
    expect(lines[1]!.toLowerCase()).toContain('pet')
  })
})
