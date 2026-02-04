import { Session } from '@sentry/nextjs'
import { createSumUpCheckout } from './sumUpPayment.actions'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>

describe('createSumUpCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return success with checkout id when API call succeeds', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as Session)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-123' }),
    })

    const result = await createSumUpCheckout('cart-456')

    expect(result.success).toBe(true)
    expect(result.data).toBe('checkout-123')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.sumup.com/v0.1/checkouts',
      expect.any(Object),
    )
  })

  it('should return error when API response is not ok', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as Session)
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid amount' }),
    })

    const result = await createSumUpCheckout('cart-456')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Invalid amount')
  })

  it('should return error when fetch throws exception', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as Session)
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const result = await createSumUpCheckout('cart-456')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Network error')
  })
})
