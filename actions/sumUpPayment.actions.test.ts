import { createSumUpCheckout } from './sumUpPayment.actions'
import { prisma } from 'prisma/prisma'

import { auth } from '@/auth'
import { CurrencyCode } from '@lib/types/types'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('createSumUpCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create a checkout for a guest with validated line items', async () => {
    mockAuth.mockResolvedValue(null as never)
    ;(prisma.productVariant.findMany as jest.Mock).mockResolvedValue([
      { id: 'variant-1', price: 50, stock: 5 },
    ])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-guest-1' }),
    })

    const result = await createSumUpCheckout({
      email: 'guest@example.com',
      lineItems: [
        {
          variantId: 'variant-1',
          quantity: 2,
          name: 'Vase',
        } as never,
      ],
      taxes: 0,
      shippingPrice: 5.95,
      currency: CurrencyCode.GBP,
    })

    expect(result.success).toBe(true)
    expect(result.data).toBe('checkout-guest-1')
    expect(prisma.cart.findUnique).not.toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.sumup.com/v0.1/checkouts',
      expect.objectContaining({
        body: expect.stringContaining('10595'), // 2 x £50 + £5.95 -> minor units
      }),
    )
  })

  it('should return an error for a guest without an email', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await createSumUpCheckout({
      lineItems: [{ variantId: 'variant-1', quantity: 1 }] as never,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Email is required to checkout.')
    expect(prisma.productVariant.findMany).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should return success with checkout id when API call succeeds', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as never)
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: 'cart-123',
      totalPrice: 123.45,
      currency: 'GBP',
      lineItems: [],
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-123' }),
    })

    const result = await createSumUpCheckout()

    expect(result.success).toBe(true)
    expect(result.data).toBe('checkout-123')
    expect(prisma.cart.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: {
        lineItems: {
          include: { variant: true },
        },
      },
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.sumup.com/v0.1/checkouts',
      expect.any(Object),
    )
  })

  it('should return error when cart does not exist', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as never)
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await createSumUpCheckout()

    expect(result.success).toBe(false)
    expect(result.message).toBe(
      'Cart not found. Please add items to your cart.',
    )
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should return error when API response is not ok', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as never)
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: 'cart-123',
      totalPrice: 123.45,
      currency: 'GBP',
      lineItems: [],
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid amount' }),
    })

    const result = await createSumUpCheckout()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Invalid amount')
  })

  it('should return error when fetch throws exception', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as never)
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: 'cart-123',
      totalPrice: 123.45,
      currency: 'GBP',
      lineItems: [],
    })
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const result = await createSumUpCheckout()

    expect(result.success).toBe(false)
    expect(result.message).toBe('An unexpected error occurred')
  })
})
