import { render, screen, fireEvent } from '@testing-library/react'
import { LikertScale } from '@/components/questionnaire/LikertScale'

describe('LikertScale', () => {
  it('renders anchors and handles selection', () => {
    const onChange = vi.fn()
    render(
      <LikertScale id="q" label="Test" scaleType="agreement" value={3} onChange={onChange} />
    )
    expect(screen.getByText('Strongly disagree')).toBeInTheDocument()
    fireEvent.click(screen.getByText('5'))
    expect(onChange).toHaveBeenCalledWith(5)
  })
})


