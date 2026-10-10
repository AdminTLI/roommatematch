import { describe, expect, it } from 'vitest'
import { answerSimilarity, buildMatchModuleInsights } from './match-module-feedback'

describe('answerSimilarity', () => {
  it('scores identical likert answers as 1', () => {
    expect(answerSimilarity(4, 4)).toBe(1)
  })

  it('scores far likert answers lower', () => {
    const close = answerSimilarity(4, 5)
    const far = answerSimilarity(1, 5)
    expect(close).not.toBeNull()
    expect(far).not.toBeNull()
    expect(close!).toBeGreaterThan(far!)
  })

  it('treats matching MCQ strings as exact', () => {
    expect(answerSimilarity('same_day', 'same_day')).toBe(1)
    expect(answerSimilarity('same_day', 'next_morning')).toBe(0)
  })
})

describe('buildMatchModuleInsights', () => {
  it('returns strengths when answers align and watch-outs when they diverge', () => {
    const insights = buildMatchModuleInsights({
      dimensionScores: {
        logistics_context: 0.8,
        environment: 0.4,
        cleanliness: 0.85,
        communication: 0.7,
        social: 0.35,
      },
      answersA: {
        M2_Q1: 2,
        M2_Q13: { start: '22:00', end: '07:00' },
        M4_Q1: 'very_tidy',
        M5_Q1: 5,
        M5_Q5: 5,
      },
      answersB: {
        M2_Q1: 5,
        M2_Q13: { start: '01:00', end: '10:00' },
        M4_Q1: 'very_tidy',
        M5_Q1: 1,
        M5_Q5: 1,
      },
      overallScore: 0.62,
      seed: 'a:b',
    })

    expect(insights.modules).toHaveLength(5)
    expect(insights.summary.headline.length).toBeGreaterThan(20)
    expect(insights.summary.strengths.length).toBeGreaterThan(0)
    expect(insights.summary.watchOuts.length).toBeGreaterThan(0)

    const cleanliness = insights.modules.find(m => m.key === 'cleanliness')
    const environment = insights.modules.find(m => m.key === 'environment')
    const social = insights.modules.find(m => m.key === 'social')

    expect(cleanliness?.strengths.length).toBeGreaterThan(0)
    expect(environment?.watchOuts.length).toBeGreaterThan(0)
    expect(social?.watchOuts.length).toBeGreaterThan(0)
  })

  it('is stable for the same seed', () => {
    const input = {
      dimensionScores: {
        logistics_context: 0.7,
        environment: 0.7,
        cleanliness: 0.7,
        communication: 0.7,
        social: 0.7,
      },
      overallScore: 0.7,
      seed: 'stable-seed',
    }
    const a = buildMatchModuleInsights(input)
    const b = buildMatchModuleInsights(input)
    expect(a).toEqual(b)
  })
})
