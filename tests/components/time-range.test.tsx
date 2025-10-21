import { render, screen } from '@testing-library/react'
import { TimeRange } from '@/components/questionnaire/TimeRange'

describe('TimeRange', () => {
  it('renders start and end selects', () => {
    render(
      <TimeRange id="t" label="Range" start="08:00" end="10:00" onChange={() => {}} />
    )
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })
})


