import { render, screen, fireEvent } from '@testing-library/react'
import { BipolarScale } from '@/components/questionnaire/BipolarScale'

describe('BipolarScale', () => {
  it('renders and handles change', () => {
    const onChange = vi.fn()
    render(
      <BipolarScale id="q" leftLabel="Left" rightLabel="Right" value={3} onChange={onChange} />
    )
    fireEvent.click(screen.getByText('1'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('uses soft mid labels when provided', () => {
    render(
      <BipolarScale
        id="q"
        leftLabel="Handle everything internally"
        rightLabel="Loop in landlord or admin early"
        softLeftLabel="Mostly handle internally"
        softRightLabel="Often loop in landlord early"
        value={2}
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Mostly handle internally')).toBeInTheDocument()
    expect(screen.getByText('Often loop in landlord early')).toBeInTheDocument()
    expect(screen.queryByText(/More handle/i)).not.toBeInTheDocument()
  })
})
