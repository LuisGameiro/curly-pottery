jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
jest.mock('@lib/rate-limit', () => ({
  checkRateLimit: jest
    .fn()
    .mockResolvedValue({ success: true, remaining: 999, resetIn: 0 }),
  getRateLimitKey: jest.fn().mockReturnValue('test-key'),
}))

import { auth } from '@/auth'
import { prisma } from 'prisma/prisma'
import {
  addFavouriteAction,
  getFavouritesAction,
  getFavouritesWithProductsAction,
  removeFavouriteAction,
} from './Favourite.actions'
import { FAVOURITES_PAGE_SIZE, encodeCursor } from '@lib/pagination'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'

const mockUserId = 'user-1'

beforeEach(() => {
  jest.clearAllMocks()
  ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
  ;(checkRateLimit as jest.Mock).mockResolvedValue({
    success: true,
    remaining: 999,
    resetIn: 0,
  })
  ;(getRateLimitKey as jest.Mock).mockReturnValue('test-key')
})

describe('getFavouritesAction', () => {
  it('returns product IDs from prisma.favourite.findMany', async () => {
    ;(prisma.favourite.findMany as jest.Mock).mockResolvedValue([
      { productId: 'p1' },
      { productId: 'p2' },
      { productId: 'p3' },
    ])

    const result = await getFavouritesAction()

    expect(result.success).toBe(true)
    expect(result.success && result.data).toEqual(['p1', 'p2', 'p3'])
    expect(prisma.favourite.findMany).toHaveBeenCalledWith({
      where: { userId: mockUserId, product: { hide: false } },
      select: { productId: true },
    })
  })

  it('returns empty array when no favourites exist', async () => {
    ;(prisma.favourite.findMany as jest.Mock).mockResolvedValue([])

    const result = await getFavouritesAction()

    expect(result.success && result.data).toEqual([])
  })

  it('returns authentication error when session has no user', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await getFavouritesAction()

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Authentication required',
    )
    expect(prisma.favourite.findMany).not.toHaveBeenCalled()
  })

  it('returns authentication error when session user has no id', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: {} })

    const result = await getFavouritesAction()

    expect(result.success).toBe(false)
    expect(prisma.favourite.findMany).not.toHaveBeenCalled()
  })

  it('returns failure response when findMany throws', async () => {
    ;(prisma.favourite.findMany as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await getFavouritesAction()

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Failed to fetch favourites',
    )
  })
})

describe('addFavouriteAction', () => {
  it('creates favourite, revalidates, and returns success', async () => {
    ;(prisma.product.findFirst as jest.Mock).mockResolvedValue({
      id: 'prod-1',
    })
    ;(prisma.favourite.upsert as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      productId: 'prod-1',
    })

    const result = await addFavouriteAction('prod-1')

    expect(result).toEqual({
      success: true,
      message: 'Added to favourites',
      data: null,
    })
    expect(prisma.favourite.upsert).toHaveBeenCalledWith({
      where: {
        userId_productId: { userId: mockUserId, productId: 'prod-1' },
      },
      update: {},
      create: { userId: mockUserId, productId: 'prod-1' },
    })
  })

  it('returns error when auth returns no user', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await addFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Authentication required',
    )
    expect(prisma.favourite.upsert).not.toHaveBeenCalled()
  })

  it('returns error for invalid product ID', async () => {
    const result = await addFavouriteAction('')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Invalid product ID',
    )
    expect(prisma.favourite.upsert).not.toHaveBeenCalled()
  })

  it('returns error when productId is not a string', async () => {
    const result = await addFavouriteAction(undefined as unknown as string)

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Invalid product ID',
    )
  })

  it('returns error for hidden/non-existent products', async () => {
    ;(prisma.product.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await addFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Product not found.',
    )
    expect(prisma.favourite.upsert).not.toHaveBeenCalled()
  })

  it('returns error when rate limited', async () => {
    ;(checkRateLimit as jest.Mock).mockResolvedValue({
      success: false,
      remaining: 0,
      resetIn: 30000,
    })

    const result = await addFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Too many requests. Please slow down.',
    )
    expect(prisma.favourite.upsert).not.toHaveBeenCalled()
  })

  it('returns error when upsert throws', async () => {
    ;(prisma.product.findFirst as jest.Mock).mockResolvedValue({
      id: 'prod-1',
    })
    ;(prisma.favourite.upsert as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await addFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Failed to add favourite',
    )
  })
})

describe('removeFavouriteAction', () => {
  it('deletes favourite, revalidates, and returns success', async () => {
    ;(prisma.favourite.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

    const result = await removeFavouriteAction('prod-1')

    expect(result).toEqual({
      success: true,
      message: 'Removed from favourites',
      data: null,
    })
    expect(prisma.favourite.deleteMany).toHaveBeenCalledWith({
      where: { userId: mockUserId, productId: 'prod-1' },
    })
  })

  it('returns error when auth returns no user', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await removeFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Authentication required',
    )
    expect(prisma.favourite.deleteMany).not.toHaveBeenCalled()
  })

  it('returns error for invalid product ID', async () => {
    const result = await removeFavouriteAction('')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Invalid product ID',
    )
    expect(prisma.favourite.deleteMany).not.toHaveBeenCalled()
  })

  it('returns error when productId is not a string', async () => {
    const result = await removeFavouriteAction(undefined as unknown as string)

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Invalid product ID',
    )
  })

  it('returns error when deleteMany throws', async () => {
    ;(prisma.favourite.deleteMany as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await removeFavouriteAction('prod-1')

    expect(result.success).toBe(false)
    expect(result.success === false && result.message).toBe(
      'Failed to remove favourite',
    )
  })
})

describe('getFavouritesWithProductsAction', () => {
  it('returns paginated results with cursor, items, hasMore, total', async () => {
    const mockFavourites = Array.from(
      { length: FAVOURITES_PAGE_SIZE + 1 },
      (_, i) => ({
        id: `fav-${i}`,
        userId: mockUserId,
        productId: `prod-${i}`,
        createdAt: new Date(),
        product: {
          id: `prod-${i}`,
          name: `Product ${i}`,
          slug: `product-${i}`,
          description: 'desc',
          images: [],
          price: 1000,
          currency: 'GBP',
          variants: [],
          categories: [],
        },
      }),
    )

    ;(prisma.favourite.findMany as jest.Mock).mockResolvedValue(mockFavourites)
    ;(prisma.favourite.count as jest.Mock).mockResolvedValue(25)

    const result = await getFavouritesWithProductsAction({
      take: FAVOURITES_PAGE_SIZE,
    })

    expect(result.items).toHaveLength(FAVOURITES_PAGE_SIZE)
    expect(result.hasMore).toBe(true)
    expect(result.total).toBe(25)
    expect(result.nextCursor).toEqual(
      encodeCursor(mockFavourites[FAVOURITES_PAGE_SIZE - 1].product.id),
    )
  })

  it('returns hasMore false when fewer items than page size', async () => {
    const mockFavourites = Array.from({ length: 3 }, (_, i) => ({
      id: `fav-${i}`,
      userId: mockUserId,
      productId: `prod-${i}`,
      createdAt: new Date(),
      product: {
        id: `prod-${i}`,
        name: `Product ${i}`,
        slug: `product-${i}`,
        description: 'desc',
        images: [],
        price: 1000,
        currency: 'GBP',
        variants: [],
        categories: [],
      },
    }))

    ;(prisma.favourite.findMany as jest.Mock).mockResolvedValue(mockFavourites)
    ;(prisma.favourite.count as jest.Mock).mockResolvedValue(3)

    const result = await getFavouritesWithProductsAction({
      take: FAVOURITES_PAGE_SIZE,
    })

    expect(result.items).toHaveLength(3)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeNull()
    expect(result.total).toBe(3)
  })

  it('returns empty result when auth returns no user', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const result = await getFavouritesWithProductsAction()

    expect(result).toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    })
    expect(prisma.favourite.findMany).not.toHaveBeenCalled()
    expect(prisma.favourite.count).not.toHaveBeenCalled()
  })

  it('returns empty result when session has no user id', async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: {} })

    const result = await getFavouritesWithProductsAction()

    expect(result).toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    })
  })

  it('returns formatted product data with numeric prices on variants', async () => {
    const mockFavourites = [
      {
        id: 'fav-1',
        userId: mockUserId,
        productId: 'prod-1',
        createdAt: new Date(),
        product: {
          id: 'prod-1',
          name: 'Test Product',
          slug: 'test-product',
          description: 'A test product',
          images: ['/img1.jpg'],
          price: 2500,
          currency: 'GBP',
          variants: [
            {
              id: 'v1',
              price: 1500,
              currency: 'GBP',
              sku: 'SKU1',
              stock: 5,
            },
          ],
          categories: [{ id: 'cat-1', name: 'Category' }],
        },
      },
    ]

    ;(prisma.favourite.findMany as jest.Mock).mockResolvedValue(mockFavourites)
    ;(prisma.favourite.count as jest.Mock).mockResolvedValue(1)

    const result = await getFavouritesWithProductsAction({
      take: FAVOURITES_PAGE_SIZE,
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].variants[0].price).toBe(1500)
    expect(result.items[0].id).toBe('prod-1')
  })

  it('returns empty result when findMany throws', async () => {
    ;(prisma.favourite.findMany as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await getFavouritesWithProductsAction()

    expect(result).toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    })
  })
})
