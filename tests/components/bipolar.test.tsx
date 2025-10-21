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
})


