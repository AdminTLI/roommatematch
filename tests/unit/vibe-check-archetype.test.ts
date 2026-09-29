import { describe, expect, it } from 'vitest'
import {
  calculateArchetype,
  selectArchetypeKey,
} from '@/lib/vibe-check/archetype'
import { summarizeLifestyleFit } from '@/lib/vibe-check/lifestyle-fit'

function answers(partial: Record<string, number>): Record<string, number> {
  return {
    M2_Q1: 3,
    M2_Q13: 3,
    M4_Q1: 3,
    M4_Q4: 3,
    M6_Q9: 3,
    M6_Q1: 3,
    M5_Q1: 3,
    M5_Q5: 3,
    ...partial,
  }
}

describe('calculateArchetype', () => {
  it('selects Zen Sanctuary for high cleanliness + low social', () => {
    const result = calculateArchetype(
      answers({
        M4_Q1: 5,
        M4_Q4: 5,
        M5_Q1: 1,
        M5_Q5: 1,
        M2_Q1: 1,
        M2_Q13: 1,
      })
    )
    expect(result.title).toBe('The Zen Sanctuary')
  })

  it('selects Social Catalyst for high guest / social scores', () => {
    const result = calculateArchetype(
      answers({
        M5_Q1: 5,
        M5_Q5: 5,
        M2_Q1: 5,
        M2_Q13: 5,
        M4_Q1: 2,
        M4_Q4: 2,
      })
    )
    expect(result.title).toBe('The Social Catalyst')
  })

  it('selects Harmonious Co-Director for high communication', () => {
    const result = calculateArchetype(
      answers({
        M6_Q9: 5,
        M6_Q1: 5,
        M4_Q1: 3,
        M4_Q4: 3,
        M5_Q1: 3,
        M5_Q5: 3,
      })
    )
    expect(result.title).toBe('The Harmonious Co-Director')
  })

  it('selects Independent Autonomous for mid / balanced scores', () => {
    const result = calculateArchetype(answers({}))
    expect(result.title).toBe('The Independent Autonomous')
  })

  it('does not always return the same archetype across profiles', () => {
    const titles = new Set([
      calculateArchetype(
        answers({ M4_Q1: 5, M4_Q4: 5, M5_Q1: 1, M5_Q5: 1, M2_Q1: 1, M2_Q13: 1 })
      ).title,
      calculateArchetype(
        answers({ M5_Q1: 5, M5_Q5: 5, M2_Q1: 5, M2_Q13: 4, M4_Q1: 2, M4_Q4: 2 })
      ).title,
      calculateArchetype(answers({ M6_Q9: 5, M6_Q1: 5 })).title,
      calculateArchetype(answers({})).title,
    ])
    expect(titles.size).toBeGreaterThanOrEqual(3)
  })

  it('selectArchetypeKey prefers the nearest centroid', () => {
    expect(
      selectArchetypeKey({
        environment: 25,
        cleanliness: 90,
        communication: 55,
        social: 20,
      })
    ).toBe('zen')
    expect(
      selectArchetypeKey({
        environment: 75,
        cleanliness: 45,
        communication: 55,
        social: 90,
      })
    ).toBe('social')
  })
})

describe('summarizeLifestyleFit match count', () => {
  it('uses offset + submission count so each form fill increases the display', () => {
    const emptyPeers = new Map<string, Record<string, number>>()
    const scores = {
      environment: 50,
      cleanliness: 50,
      communication: 50,
      social: 50,
      overallHarmony: 50,
    }

    const zero = summarizeLifestyleFit(scores, emptyPeers, { submissionCount: 0 })
    expect(zero.matchCount).toBe(100)

    const five = summarizeLifestyleFit(scores, emptyPeers, { submissionCount: 5 })
    expect(five.matchCount).toBe(105)

    const six = summarizeLifestyleFit(scores, emptyPeers, { submissionCount: 6 })
    expect(six.matchCount).toBe(106)
  })
})
