import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { VerificationFeedback } from '@/components/auth/verification-feedback'

const showInfoToast = vi.fn()
const showWarningToast = vi.fn()

vi.mock('@/lib/toast', () => ({
  showInfoToast: (...args: unknown[]) => showInfoToast(...args),
  showWarningToast: (...args: unknown[]) => showWarningToast(...args),
}))

describe('VerificationFeedback', () => {
  beforeEach(() => {
    showInfoToast.mockClear()
    showWarningToast.mockClear()
  })

  it('renders nothing (no DOM nodes that can hydrate-mismatch)', () => {
    const { container } = render(
      <VerificationFeedback reason="persona_verification_required" redirect="/matches" />
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows the persona toast from server-provided props without useSearchParams', () => {
    render(
      <VerificationFeedback reason="persona_verification_required" redirect="/matches" />
    )

    expect(showInfoToast).toHaveBeenCalledWith(
      'Identity Verification Required',
      expect.stringContaining('identity verification')
    )
    expect(showWarningToast).not.toHaveBeenCalled()
  })

  it('does not toast when reason is missing', () => {
    render(<VerificationFeedback reason={null} />)
    expect(showInfoToast).not.toHaveBeenCalled()
    expect(showWarningToast).not.toHaveBeenCalled()
  })

  it('only toasts once for the same reason', () => {
    const { rerender } = render(
      <VerificationFeedback reason="persona_verification_required" redirect="/matches" />
    )
    rerender(
      <VerificationFeedback reason="persona_verification_required" redirect="/matches" />
    )
    expect(showInfoToast).toHaveBeenCalledTimes(1)
  })
})
