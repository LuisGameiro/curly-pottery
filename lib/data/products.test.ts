import { searchProducts } from './products'
import { prisma } from 'prisma/prisma'
import * as Sentry from '@sentry/nextjs'
import { SEARCH_PAGE_SIZE, encodeCursor } from '@lib/pagination'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

const createMockProduct = (id: string) =>
  ({
    id,
    name: 'Test Product',
    slug: `test-product-${id}`,
    description: 'A test product description for testing purposes',
    hide: false,
    images: ['https://example.com/img1.jpg'],
    requiresShipping: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    categories: [
      {
        id: 'cat-1',
        name: 'Test Category',
        image: 'https://example.com/cat.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    variants: [
      {
        id: `var-${id}`,
        productId: id,
        sku: 'TST-001',
        price: 29.99,
        currency: 'GBP',
        stock: 10,
        availableForSale: true,
        images: [],
        sizeName: 'One Size',
        colorName: 'Natural',
        colorHex: '#f0e3d4',
        details: null,
        discounts: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        optionValues: [],
      },
    ],
  }) as never

describe('searchProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns paginated results with items, cursor, hasMore, total', async () => {
    jest
      .mocked(prisma.product.findMany)
      .mockResolvedValue([createMockProduct('prod-1')])
    jest.mocked(prisma.product.count).mockResolvedValue(1)

    const result = await searchProducts('test')

    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].name).toBe('Test Product')
      expect(result.data.total).toBe(1)
      expect(result.data.hasMore).toBe(false)
      expect(result.data.nextCursor).toBeNull()
    }
  })

  it('filters by search query in name', async () => {
    jest
      .mocked(prisma.product.findMany)
      .mockResolvedValue([createMockProduct('prod-1')])
    jest.mocked(prisma.product.count).mockResolvedValue(1)

    await searchProducts('vase')

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          hide: false,
          OR: [
            { name: { contains: 'vase', mode: 'insensitive' } },
            {
              categories: {
                some: { name: { contains: 'vase', mode: 'insensitive' } },
              },
            },
          ],
        },
      }),
    )
  })

  it('pagination with cursor decodes cursor and skips 1', async () => {
    const cursor = encodeCursor('prod-1')
    jest
      .mocked(prisma.product.findMany)
      .mockResolvedValue([createMockProduct('prod-2')])
    jest.mocked(prisma.product.count).mockResolvedValue(1)

    await searchProducts('test', { cursor })

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'prod-1' },
        skip: 1,
      }),
    )
  })

  it('hasMore is true when more results than take', async () => {
    const take = SEARCH_PAGE_SIZE
    const products = Array.from({ length: take + 1 }, (_, i) =>
      createMockProduct(`prod-${i}`),
    )
    jest.mocked(prisma.product.findMany).mockResolvedValue(products)
    jest.mocked(prisma.product.count).mockResolvedValue(take + 1)

    const result = await searchProducts('test', { take })

    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data.items).toHaveLength(take)
      expect(result.data.hasMore).toBe(true)
      expect(result.data.nextCursor).not.toBeNull()
    }
  })

  it('handles Prisma error, returns error response, calls Sentry', async () => {
    const testError = new Error('Database error')
    jest.mocked(prisma.product.findMany).mockRejectedValue(testError)
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await searchProducts('test')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe('Database error')
    }
    expect(Sentry.captureException).toHaveBeenCalledWith(testError)
  })
})
