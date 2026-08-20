import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimeRange, timesInRange } from '@/components/questionnaire/TimeRange'

describe('TimeRange', () => {
  it('renders start and end selects', () => {
    render(
      <TimeRange id="t" label="Range" start="08:00" end="10:00" onChange={() => {}} />
    )
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })
})

describe('timesInRange', () => {
  it('includes overnight start times from 20:00 through 00:00', () => {
    expect(timesInRange('20:00', '00:00')).toEqual([
      '20:00',
      '20:30',
      '21:00',
      '21:30',
      '22:00',
      '22:30',
      '23:00',
      '23:30',
      '00:00',
    ])
  })

  it('includes morning end times from 06:00 through 09:00', () => {
    expect(timesInRange('06:00', '09:00')).toEqual([
      '06:00',
      '06:30',
      '07:00',
      '07:30',
      '08:00',
      '08:30',
      '09:00',
    ])
  })
})
