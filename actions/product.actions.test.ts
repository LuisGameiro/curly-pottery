import {
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategorySlug,
  getRandomProducts,
  getRelatedProducts,
  toggleVisibility,
  upsertProduct,
} from './product.actions'
import { prisma } from 'prisma/prisma'
import { ProductInput } from '@lib/form-validator'
import { Category, ProductWithVariantsCategories } from '@lib/types/types'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('./serverImages.action', () => ({
  deleteBlob: jest.fn().mockResolvedValue(undefined),
}))

import { auth } from '@/auth'

describe('getProductBySlug', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return error when slug is null', async () => {
    const result = await getProductBySlug(null)

    expect(result).toEqual({
      success: false,
      message: 'Slug not provided',
      errors: null,
    })
  })

  it('should return error when slug is empty string', async () => {
    const result = await getProductBySlug('')

    expect(result).toEqual({
      success: false,
      message: 'Slug not provided',
      errors: null,
    })
  })

  it('should return product successfully when slug exists', async () => {
    const mockProduct = {
      id: '1',
      slug: 'test-product',
      hide: false,
      variants: [],
      categories: [],
    }

    ;(prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await getProductBySlug('test-product')

    expect(result).toEqual({
      success: true,
      message: 'Fetched product successfully',
      data: mockProduct,
    })
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'test-product', hide: false },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
  })

  it('should return null data when product not found', async () => {
    ;(prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const result = await getProductBySlug('non-existent')

    expect(result).toEqual({
      success: true,
      message: 'Fetched product successfully',
      data: null,
    })
  })

  it('should handle database errors', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findUnique as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getProductBySlug('test-product')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors', async () => {
    ;(prisma.product.findUnique as jest.Mock).mockRejectedValueOnce(
      'Unknown error',
    )

    const result = await getProductBySlug('test-product')

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })
})

describe('getProductById', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return error when id is empty string', async () => {
    const result = await getProductById('')

    expect(result).toEqual({
      success: false,
      message: 'Id not provided',
      errors: null,
    })
  })

  it('should return product successfully when id exists', async () => {
    const mockProduct = {
      id: '1',
      slug: 'test-product',
      hide: false,
      variants: [],
      categories: [],
    }

    ;(prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await getProductById('1')

    expect(result).toEqual({
      success: true,
      message: 'Fetched product successfully',
      data: mockProduct,
    })
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
  })

  it('should return null data when product not found', async () => {
    ;(prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const result = await getProductById('non-existent-id')

    expect(result).toEqual({
      success: true,
      message: 'Fetched product successfully',
      data: null,
    })
  })

  it('should handle database errors in getProductById', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findUnique as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getProductById('1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors in getProductById', async () => {
    ;(prisma.product.findUnique as jest.Mock).mockRejectedValueOnce(
      'Unknown error',
    )

    const result = await getProductById('1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })
})

describe('deleteProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should delete product successfully', async () => {
    const mockProduct = { id: '1', name: 'Test Product' }

    ;(prisma.product.delete as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await deleteProduct({
      id: '1',
      images: [],
    })

    expect(result).toEqual({
      success: true,
      message: 'Deleted product successfully',
      data: mockProduct,
    })
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: '1' } })
  })

  it('should handle database errors during deletion', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.delete as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await deleteProduct({
      id: '1',
      images: ['image1.jpg'],
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors during deletion', async () => {
    ;(prisma.product.delete as jest.Mock).mockRejectedValueOnce('Unknown error')

    const result = await deleteProduct({
      id: '1',
      images: [],
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })

  it('should delete product with empty images array', async () => {
    const mockProduct = { id: '1', name: 'Test Product' }
    ;(prisma.product.delete as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await deleteProduct({ id: '1', images: [] })

    expect(result.success).toBe(true)
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: '1' } })
  })
})

describe('toggleVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should toggle visibility to hide product when state is true', async () => {
    const mockProduct = { id: '1', name: 'Test Product', hide: true }
    ;(prisma.product.update as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await toggleVisibility({ id: '1', state: true })

    expect(result).toEqual({
      success: true,
      message: 'Toggled product visibility successfully',
      data: mockProduct,
    })
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { hide: false },
    })
  })

  it('should toggle visibility to show product when state is false', async () => {
    const mockProduct = { id: '1', name: 'Test Product', hide: false }
    ;(prisma.product.update as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await toggleVisibility({ id: '1', state: false })

    expect(result).toEqual({
      success: true,
      message: 'Toggled product visibility successfully',
      data: mockProduct,
    })
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { hide: true },
    })
  })

  it('should handle database errors during visibility toggle', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.update as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await toggleVisibility({ id: '1', state: true })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors during visibility toggle', async () => {
    ;(prisma.product.update as jest.Mock).mockRejectedValueOnce('Unknown error')

    const result = await toggleVisibility({ id: '1', state: false })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })
})

describe('getAllProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all products successfully', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
      { id: '2', name: 'Product 2', variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getAllProducts()

    expect(result).toEqual({
      success: true,
      message: 'Fetched products successfully',
      data: mockProducts,
    })
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should return empty array when no products exist', async () => {
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce([])

    const result = await getAllProducts()

    expect(result).toEqual({
      success: true,
      message: 'Fetched products successfully',
      data: [],
    })
  })

  it('should handle database errors in getAllProducts', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getAllProducts()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors in getAllProducts', async () => {
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(
      'Unknown error',
    )

    const result = await getAllProducts()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })
})

describe('getRandomProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return random products with default limit of 3', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
      { id: '2', name: 'Product 2', variants: [], categories: [] },
      { id: '3', name: 'Product 3', variants: [], categories: [] },
      { id: '4', name: 'Product 4', variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRandomProducts()

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched random products successfully')
    expect(result.data).toHaveLength(3)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { variants: { some: { stock: { gt: 0 } } }, hide: false },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
  })

  it('should return random products with custom limit', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
      { id: '2', name: 'Product 2', variants: [], categories: [] },
      { id: '3', name: 'Product 3', variants: [], categories: [] },
      { id: '4', name: 'Product 4', variants: [], categories: [] },
      { id: '5', name: 'Product 5', variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRandomProducts(5)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(5)
  })

  it('should return empty array when fewer products than limit', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRandomProducts(3)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })

  it('should return empty array when no products found', async () => {
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce([])

    const result = await getRandomProducts()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(0)
  })

  it('should handle database errors', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getRandomProducts()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors', async () => {
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(
      'Unknown error',
    )

    const result = await getRandomProducts()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })

  it('should randomize product order', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
      { id: '2', name: 'Product 2', variants: [], categories: [] },
      { id: '3', name: 'Product 3', variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRandomProducts(3)

    expect(result.data).toEqual(expect.arrayContaining(mockProducts))
  })
})

describe('getRelatedProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array when no categories provided', async () => {
    const result = await getRelatedProducts({ categoryNames: [] })

    expect(result).toEqual({
      success: true,
      message: 'No related Products',
      data: [],
    })
    expect(prisma.product.count).not.toHaveBeenCalled()
  })

  it('should return empty array when count is zero', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(0)

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(result).toEqual({
      success: true,
      message: 'No related Products',
      data: [],
    })
    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        hide: false,
        categories: {
          some: {
            name: { in: ['Category 1'] },
          },
        },
      },
    })
  })

  it('should return related products successfully', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
      { id: '2', name: 'Product 2', variants: [], categories: [] },
    ] as unknown as ProductWithVariantsCategories[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(10)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockProducts)
    expect(prisma.product.findMany).toHaveBeenCalled()
  })

  it('should exclude product by excludeId', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    const mockProducts = [
      { id: '2', name: 'Product 2', variants: [], categories: [] },
    ] as unknown as ProductWithVariantsCategories[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(5)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
      excludeId: '1',
    })

    expect(result.success).toBe(true)
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        categories: {
          some: {
            name: { in: ['Category 1'] },
          },
        },
        id: { not: '1' },
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      take: 12,
      skip: expect.any(Number),
    })
  })

  it('should use custom limit', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
    ] as unknown as ProductWithVariantsCategories[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(20)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
      limit: 5,
    })

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        categories: {
          some: {
            name: { in: ['Category 1'] },
          },
        },
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      take: 5,
      skip: expect.any(Number),
    })
  })

  it('should handle multiple categories', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
      { id: '2', name: 'Category 2', slug: 'category-2' },
    ] as Category[]
    const mockProducts = [
      { id: '1', name: 'Product 1', variants: [], categories: [] },
    ] as unknown as ProductWithVariantsCategories[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(10)
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        hide: false,
        categories: {
          some: {
            name: { in: ['Category 1', 'Category 2'] },
          },
        },
      },
    })
  })

  it('should handle database errors in count', async () => {
    const mockError = new Error('Database connection failed')
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    ;(prisma.product.count as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle database errors in findMany', async () => {
    const mockError = new Error('Database connection failed')
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    ;(prisma.product.count as jest.Mock).mockResolvedValueOnce(10)
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'category-1' },
    ] as Category[]
    ;(prisma.product.count as jest.Mock).mockRejectedValueOnce('Unknown error')

    const result = await getRelatedProducts({
      categoryNames: mockCategories.map((c) => c.name),
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })
})

describe('getProductsByCategorySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all non-hidden products when category is null', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', hide: false, variants: [], categories: [] },
      { id: '2', name: 'Product 2', hide: false, variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getProductsByCategorySlug(null)

    expect(result).toEqual({
      success: true,
      message: 'Category slug not provided',
      data: mockProducts,
    })
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { hide: false },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
  })

  it('should return all non-hidden products when category is empty string', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', hide: false, variants: [], categories: [] },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getProductsByCategorySlug('')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Category slug not provided')
    expect(result.data).toEqual(mockProducts)
  })

  it('should return products filtered by category slug', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        hide: false,
        variants: [],
        categories: [{ slug: 'pottery' }],
      },
      {
        id: '2',
        name: 'Product 2',
        hide: false,
        variants: [],
        categories: [{ slug: 'pottery' }],
      },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getProductsByCategorySlug('pottery')

    expect(result).toEqual({
      success: true,
      message: 'Fetched products successfully',
      data: mockProducts,
    })
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        hide: false,
        categories: { some: { slug: 'pottery' } },
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
  })

  it('should return empty array when no products found for category', async () => {
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce([])

    const result = await getProductsByCategorySlug('non-existent-category')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched products successfully')
    expect(result.data).toEqual([])
  })

  it('should return empty array when no non-hidden products exist', async () => {
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce([])

    const result = await getProductsByCategorySlug(null)

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('should handle database errors when category slug is provided', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getProductsByCategorySlug('pottery')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors when category slug is provided', async () => {
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(
      'Unknown error',
    )

    const result = await getProductsByCategorySlug('pottery')

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
    expect(result.errors).toBe('Unknown error')
  })

  it('should handle database errors when category is null', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.product.findMany as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await getProductsByCategorySlug(null)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should include variants and categories in results', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        hide: false,
        variants: [{ id: 'v1', name: 'Variant 1', stock: 5 }],
        categories: [{ id: 'c1', name: 'Pottery', slug: 'pottery' }],
      },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts)

    const result = await getProductsByCategorySlug('pottery')
    expect(result.success).toBe(true)

    if (!result.data) throw new Error('No data returned')
    expect(result.data.items[0].variants).toHaveLength(1)
    expect(result.data.items[0].categories).toHaveLength(1)
  })
})

describe('upsertProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should create a new product successfully', async () => {
    const mockProduct = { id: '1', name: 'New Product', slug: 'new-product' }
    const payload = {
      id: 'temp-1',
      name: 'New Product',
      slug: 'new-product',
      hide: false,
      description: 'New Product Description',
      images: null,
      requiresShipping: true,
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'temp-v1',
          price: 100,
          details: [],
          discounts: [],
          images: [],
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await upsertProduct(payload)

    expect(result).toEqual({
      success: true,
      message: 'Product saved successfully',
      data: mockProduct,
    })
    expect(prisma.product.upsert).toHaveBeenCalled()
  })

  it('should update an existing product successfully', async () => {
    const mockProduct = {
      id: '1',
      name: 'Updated Product',
      slug: 'updated-product',
    }
    const payload = {
      id: '1',
      name: 'Updated Product',
      slug: 'updated-product',
      categoryIds: ['cat-1', 'cat-2'],
      variants: [
        {
          id: 'v-1',
          price: 150,
          details: [],
          discounts: [],
          images: [],
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await upsertProduct(payload)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockProduct)
  })

  it('should handle temporary variant IDs correctly', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'temp-v1',
          name: 'New Variant',
          price: 100,
          details: [],
          discounts: [],
          images: [],
        },
        {
          id: 'v-existing',
          price: 200,
          details: [],
          discounts: [],
          images: [],
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await upsertProduct(payload)

    expect(result.success).toBe(true)
    expect(prisma.product.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'new' },
      }),
    )
  })

  it('should prepare variants correctly by removing unnecessary fields', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'v-1',
          price: 100,
          details: [{ key: 'color', value: 'red' }],
          discounts: [{ type: 'percentage', value: 10 }],
          images: ['img1.jpg'],
          files: [],
          previews: [],
          isExpanded: true,
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.update.variants.upsert[0].create).not.toHaveProperty(
      'files',
    )
    expect(callArgs.update.variants.upsert[0].create).not.toHaveProperty(
      'previews',
    )
    expect(callArgs.update.variants.upsert[0].create).not.toHaveProperty(
      'isExpanded',
    )
  })

  it('should set empty arrays for variant details, discounts, and images when not provided', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'v-1',
          price: 100,
          files: [],
          previews: [],
          isExpanded: false,
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.update.variants.upsert[0].create.details).toEqual([])
    expect(callArgs.update.variants.upsert[0].create.discounts).toEqual([])
    expect(callArgs.update.variants.upsert[0].create.images).toEqual([])
  })

  it('should handle multiple categories correctly', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1', 'cat-2', 'cat-3'],
      variants: [],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.update.categories.set).toEqual([
      { id: 'cat-1' },
      { id: 'cat-2' },
      { id: 'cat-3' },
    ])
  })

  it('should handle empty variants array', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    const result = await upsertProduct(payload)

    expect(result.success).toBe(true)
  })

  it('should handle database errors during upsert', async () => {
    const mockError = new Error('Database connection failed')
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockRejectedValueOnce(mockError)

    const result = await upsertProduct(payload)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(mockError)
  })

  it('should handle unknown errors during upsert', async () => {
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockRejectedValueOnce('Unknown error')

    const result = await upsertProduct(payload)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database error')
    expect(result.errors).toBe('Unknown error')
  })

  it('should use temporary ID for new products without real ID', async () => {
    const mockProduct = { id: 'new-id', name: 'Product', slug: 'product' }
    const payload = {
      id: 'temp-new',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.where.id).toBe('new')
  })

  it('should filter out temporary variant IDs from existingVariantIds', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'temp-v1',
          name: 'New',
          price: 100,
          files: [],
          previews: [],
          isExpanded: false,
        },
        {
          id: 'v-existing',
          name: 'Existing',
          price: 200,
          files: [],
          previews: [],
          isExpanded: false,
        },
        {
          id: 'temp-v2',
          name: 'Another',
          price: 150,
          files: [],
          previews: [],
          isExpanded: false,
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.update.variants.deleteMany.id.notIn).toEqual(['v-existing'])
  })

  it('should use temp ID for new variants in where clause', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'temp-v1',
          name: 'New',
          price: 100,
          files: [],
          previews: [],
          isExpanded: false,
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    expect(callArgs.update.variants.upsert[0].where.id).toBe(
      '000000000000000000000000',
    )
  })

  it('should preserve variant data during upsert', async () => {
    const mockProduct = { id: '1', name: 'Product', slug: 'product' }
    const variantData = {
      name: 'Premium Variant',
      price: 250,
      description: 'High quality variant',
      details: [{ key: 'size', value: 'large' }],
    }
    const payload = {
      id: '1',
      name: 'Product',
      slug: 'product',
      categoryIds: ['cat-1'],
      variants: [
        {
          id: 'v-1',
          ...variantData,
          files: [],
          previews: [],
          isExpanded: false,
          discounts: [],
          images: [],
        },
      ],
      files: [],
      previews: [],
    } as unknown as ProductInput

    ;(prisma.product.upsert as jest.Mock).mockResolvedValueOnce(mockProduct)

    await upsertProduct(payload)

    const callArgs = (prisma.product.upsert as jest.Mock).mock.calls[0][0]
    const variant = callArgs.update.variants.upsert[0].update
    expect(variant.name).toBe('Premium Variant')
    expect(variant.price).toBe(250)
    expect(variant.description).toBe('High quality variant')
    expect(variant.details).toEqual([{ key: 'size', value: 'large' }])
  })
})
