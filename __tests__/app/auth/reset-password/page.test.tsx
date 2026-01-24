import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResetPasswordPage from '../../../../app/auth/reset-password/page'

// Mocks
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (k: string) => (k === 'token' ? mockToken : null) }),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('actions/email.actions', () => ({
  resetPassword: jest.fn(),
}))

const { toast } = jest.requireMock('sonner') as any
const { resetPassword } = jest.requireMock('actions/email.actions') as any

let mockToken: string | null = 'valid-token'

/**
 * Behaviors covered:
 * - Renders invalid link UI when token is missing
 * - Validates required password and min length (8)
 * - Validates confirm password must match
 * - Calls resetPassword with token and password on submit
 * - Shows success state and schedules redirect on success
 */

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockToken = 'valid-token'
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  function renderPage() {
    return render(<ResetPasswordPage />)
  }

  it('renders invalid link UI when token is missing', () => {
    mockToken = null
    renderPage()
    expect(screen.getByText(/Invalid Link/i)).toBeInTheDocument()
    expect(
      screen.getByText(/This password reset link is invalid or has expired\./i)
    ).toBeInTheDocument()
  })

  it('validates required password and min length', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ success: true })
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))
    // Should show required validation
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument()

    const pwdInput = screen.getByLabelText(/New Password/i)
    fireEvent.change(pwdInput, { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))

    expect(
      await screen.findByText(/Minimum 8 characters/i)
    ).toBeInTheDocument()
  })

  it('validates confirm password must match', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ success: true })
    renderPage()

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'longenough' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'mismatch' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument()
  })

  it('calls resetPassword with token and password on submit', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ success: false, message: 'Invalid' })
    renderPage()

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'longenough' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'longenough' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('valid-token', 'longenough')
    })
  })

  it('shows success state and schedules redirect on success', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ success: true })
    const { container } = renderPage()

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'longenough' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'longenough' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully!')
    })

    // Success UI
    expect(await screen.findByText(/Password Changed!/i)).toBeInTheDocument()

    // Fast-forward timers to trigger redirect
    await waitFor(() => {
      jest.runOnlyPendingTimers()
    })
  })
})
