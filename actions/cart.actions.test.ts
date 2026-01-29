import { getCartFromDbAction, syncCartAction, deleteCart } from './cart.actions'
import { PrismaClient } from 'prisma/generated/prisma/client'
import { prisma } from 'prisma/prisma'
import { mockReset, DeepMockProxy } from 'jest-mock-extended'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { CartLineItem } from '@lib/types/types'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('getCartFromDbAction', () => {
  beforeEach(() => {
    mockReset(prismaMock)

    jest.clearAllMocks()
  })

  it('should return null when session is not available', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
  })

  it('should return null when session user id is not available', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: {} })

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
  })

  it('should return null when user has no cart', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
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
    const mockCart = { id: 'cart-123', lineItems: [], userId: 'user-123' }
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      cart: mockCart,
    })

    const result = await getCartFromDbAction()

    expect(result).toEqual(mockCart)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      include: { cart: true },
    })
  })
})

describe('getCartFromDbAction - additional', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when user is not found in DB', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getCartFromDbAction()

    expect(result).toBeNull()
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      include: { cart: true },
    })
  })
})

describe('syncCartAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not upsert when session is not available', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

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
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })

    await syncCartAction(items)

    expect(prisma.cart.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: { lineItems: items },
      create: {
        lineItems: items,
        user: { connect: { id: 'user-123' } },
      },
    })
  })

  it('should upsert with empty items array', async () => {
    const items: CartLineItem[] = []
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    })

    await syncCartAction(items)

    expect(prisma.cart.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      update: { lineItems: items },
      create: {
        lineItems: items,
        user: { connect: { id: 'user-123' } },
      },
    })
  })
})

describe('deleteCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete cart by id', async () => {
    await deleteCart('cart-123')

    expect(prisma.cart.delete).toHaveBeenCalledWith({
      where: { id: 'cart-123' },
    })
  })
})
