import { mockDeep } from 'jest-mock-extended'
import { Resend } from 'resend'

jest.mock('@lib/auth/password', () => ({
  hashPassword: jest.fn(),
}))

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

const mockResend = mockDeep<Resend>()

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend),
}))

import { resetPassword, sendEmail } from './email.actions'
import { sendResetEmail } from './email.actions'
import { prisma } from 'prisma/prisma'
import { hashPassword } from '@lib/auth/password'
import { User } from '@lib/types/types'

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send email successfully', async () => {
    const mockData = { id: '123' }
    Object.defineProperty(mockResend, 'emails', {
      value: {
        send: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      },
      writable: true,
    })

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Email sent successfully!')
    expect(result.data).toEqual(mockData)
  })

  it('should return error when resend fails', async () => {
    const mockError = { message: 'Resend API error' }
    Object.defineProperty(mockResend, 'emails', {
      value: {
        send: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      },
      writable: true,
    })

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Resend API error')
  })

  it('should handle exceptions', async () => {
    Object.defineProperty(mockResend, 'emails', {
      value: {
        send: jest.fn().mockRejectedValue(new Error('Network error')),
      },
      writable: true,
    })

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to send email')
  })

  it('should use custom from address', async () => {
    const mockData = { id: '123' }
    const sendSpy = jest.fn().mockResolvedValue({ data: mockData, error: null })
    Object.defineProperty(mockResend, 'emails', {
      value: { send: sendSpy },
      writable: true,
    })

    await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body',
      from: 'custom@example.com',
    })

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@example.com' }),
    )
  })

  it('should use default from address', async () => {
    const mockData = { id: '123' }
    const sendSpy = jest.fn().mockResolvedValue({ data: mockData, error: null })
    Object.defineProperty(mockResend, 'emails', {
      value: { send: sendSpy },
      writable: true,
    })

    await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body',
    })

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'onboarding@resend.dev' }),
    )
  })
})

describe('sendResetEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(global.crypto, 'randomUUID').mockReturnValue('mock-token-123')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should send reset email successfully', async () => {
    const mockUser = { email: 'user@example.com', firstName: 'John' } as User
    jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    jest.mocked(prisma.user.update).mockResolvedValue(mockUser)
    Object.defineProperty(mockResend, 'emails', {
      value: {
        send: jest
          .fn()
          .mockResolvedValue({ data: { id: 'mock-token-123' }, error: null }),
      },
      writable: true,
    })

    const result = await sendResetEmail('user@example.com')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Email sent successfully!')
    expect(result.data?.id).toBe('mock-token-123')
  })

  it('should return error when user not found', async () => {
    jest.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const result = await sendResetEmail('nonexistent@example.com')

    expect(result.success).toBe(false)
    expect(result.message).toBe('User not found')
  })

  it('should update user with reset token and expiry', async () => {
    const mockUser = { email: 'user@example.com', firstName: 'John' } as User
    jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    jest.mocked(prisma.user.update).mockResolvedValue(mockUser)
    Object.defineProperty(mockResend, 'emails', {
      value: {
        send: jest
          .fn()
          .mockResolvedValue({ data: { id: 'mock-token-123' }, error: null }),
      },
      writable: true,
    })

    await sendResetEmail('user@example.com')

    expect(jest.mocked(prisma.user.update)).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: expect.objectContaining({
        resetToken: 'mock-token-123',
        resetTokenExpiry: expect.any(Date),
      }),
    })
  })

  it('should handle database errors', async () => {
    jest
      .mocked(prisma.user.findUnique)
      .mockRejectedValue(new Error('Database error'))

    const result = await sendResetEmail('user@example.com')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to send email')
  })
})

describe('resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reset password successfully', async () => {
    jest.mocked(hashPassword).mockResolvedValue('123hashedpassword ')
    jest.mocked(prisma.user.update).mockResolvedValue({} as User)

    const result = await resetPassword({
      email: 'user@example.com',
      newPassword: 'newPassword123',
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Password reset successfully')
    expect(result.data).toBeNull()
  })

  it('should hash password before updating', async () => {
    const hashSpy = jest
      .mocked(hashPassword)
      .mockResolvedValue('hashed-password-123')
    jest.mocked(prisma.user.update).mockResolvedValue({} as User)

    await resetPassword({
      email: 'user@example.com',
      newPassword: 'newPassword123',
    })

    expect(hashSpy).toHaveBeenCalledWith('newPassword123')
  })

  it('should update user with hashed password and clear reset tokens', async () => {
    jest.mocked(hashPassword).mockResolvedValue('hashed-password-123')
    const updateSpy = jest
      .mocked(prisma.user.update)
      .mockResolvedValue({} as User)

    await resetPassword({
      email: 'user@example.com',
      newPassword: 'newPassword123',
    })

    expect(updateSpy).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: {
        password: 'hashed-password-123',
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
  })

  it('should return error message when Error is thrown', async () => {
    jest.mocked(hashPassword).mockRejectedValue(new Error('Hash error'))

    const result = await resetPassword({
      email: 'user@example.com',
      newPassword: 'newPassword123',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Hash error')
  })

  it('should return default error message for non-Error exceptions', async () => {
    jest.mocked(hashPassword).mockRejectedValue('Unknown error')

    const result = await resetPassword({
      email: 'user@example.com',
      newPassword: 'newPassword123',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})
