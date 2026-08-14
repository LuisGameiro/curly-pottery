import {
  getCartFromDbAction,
  syncCartAction,
  deleteCart,
  updateCartPrice,
} from './cart.actions'
import { prisma } from 'prisma/prisma'

import { auth } from '@/auth'
import { CartLineItem } from '@lib/types/types'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('@lib/rate-limit', () => ({
  checkRateLimit: jest
    .fn()
    .mockResolvedValue({ success: true, remaining: 999, resetIn: 0 }),
  getRateLimitKey: jest.fn().mockReturnValue('test-key'),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

describe('getCartFromDbAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when session is not available', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
  })

  it('should return null when session user id is not available', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: {} })

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
  })

  it('should return null when user has no cart', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      cart: null,
    })

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
  })

  it('should return cart when user has a cart', async () => {
    const mockCart = {
      id: 'cart-123',
      lineItems: [],
      userId: 'user-123',
      subtotalPrice: 0,
      totalPrice: 0,
      taxes: 0,
      shippingPrice: 0,
      currency: 'GBP',
    }
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)

    const result = await getCartFromDbAction()

    expect(result).toEqual(mockCart)
    expect(prisma.cart.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: {
        lineItems: { include: { variant: { include: { product: true } } } },
      },
    })
  })
})

describe('getCartFromDbAction - additional', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when user is not found in DB', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
    expect(prisma.cart.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: {
        lineItems: { include: { variant: { include: { product: true } } } },
      },
    })
  })
})

describe('syncCartAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not upsert when session is not available', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    await syncCartAction([])

    expect(prisma.cart.upsert).not.toHaveBeenCalled()
  })

  it('should upsert cart with provided items when session user is present', async () => {
    const items: CartLineItem[] = [
      {
        id: 'li-1',
        quantity: 2,
        price: 100,
        variantId: 'v1',
        slug: '',
        sku: '',
        name: '',
        images: '',
        stock: 0,
        currency: 'USD',
        colorName: '',
        sizeName: '',
        discounts: [],
      },
    ]
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.productVariant.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'v1',
        stock: 10,
        price: 100,
        availableForSale: true,
        product: { hide: false },
      },
    ])

    const mockTx = {
      cart: {
        upsert: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      },
      cartLineItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    }
    ;(prisma.$transaction as jest.Mock).mockImplementation(
      (cb: (tx: typeof mockTx) => unknown) => cb(mockTx),
    )

    await syncCartAction(items)

    expect(mockTx.cartLineItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          cartId: 'cart-1',
          variantId: 'v1',
          quantity: 2,
          price: 100,
          currency: 'USD',
        },
      ],
    })
  })

  it('should upsert with empty items array', async () => {
    const items: CartLineItem[] = []
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.productVariant.findMany as jest.Mock).mockResolvedValue([])

    const mockTx = {
      cart: {
        upsert: jest.fn().mockResolvedValue({ id: 'cart-1' }),
      },
      cartLineItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    }
    ;(prisma.$transaction as jest.Mock).mockImplementation(
      (cb: (tx: typeof mockTx) => unknown) => cb(mockTx),
    )

    await syncCartAction(items)

    expect(mockTx.cart.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: {},
      create: { user: { connect: { id: 'user-123' } } },
    })
  })
})

describe('deleteCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete cart by id', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })

    await deleteCart('cart-123')

    expect(prisma.cart.delete).toHaveBeenCalledWith({
      where: {
        id: 'cart-123',
        userId: 'user-123',
      },
    })
  })
})

describe('updateCartPrice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject unauthenticated updates', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await updateCartPrice(20, 10)
    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized: Please sign in before checkout.')

    expect(prisma.cart.update).not.toHaveBeenCalled()
  })

  it('should update cart price for authenticated user', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-123',
    })
    ;(prisma.cartLineItem.findMany as jest.Mock).mockResolvedValue([
      {
        variantId: 'v1',
        quantity: 2,
        price: 50,
        currency: 'GBP',
        variant: { discounts: [] },
      },
    ])

    await updateCartPrice(20, 10)

    expect(prisma.cart.update).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      data: {
        subtotalPrice: 100,
        totalPrice: 130,
        taxes: 20,
        shippingPrice: 10,
      },
    })
  })
})
