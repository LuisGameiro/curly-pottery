import { getDashboardStats } from './dashboard.actions'
import { prisma } from 'prisma/prisma'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

describe('getDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return dashboard stats successfully', async () => {
    const mockVariants = [
      { stock: 10, availableForSale: true },
      { stock: 3, availableForSale: true },
      { stock: 0, availableForSale: false },
    ]

    ;(prisma.category.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.product.count as jest.Mock)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(15)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(100)
    ;(prisma.order.count as jest.Mock).mockResolvedValue(8)
    ;(prisma.productVariant.findMany as jest.Mock).mockResolvedValue(
      mockVariants,
    )

    const result = await getDashboardStats()

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      totalCategories: 5,
      totalProducts: 20,
      totalCustomers: 100,
      pendingOrders: 8,
      productsWithStock: 15,
      productsOutOfStock: 5,
      totalInventoryUnits: 13,
      lowStockVariants: 1,
    })
  })

  it('should handle database errors', async () => {
    const error = new Error('Database connection failed')
    ;(prisma.category.count as jest.Mock).mockRejectedValue(error)

    const result = await getDashboardStats()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(error)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.category.count as jest.Mock).mockRejectedValue('Unknown error')

    const result = await getDashboardStats()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })

  it('should calculate low stock variants correctly', async () => {
    const mockVariants = [
      { stock: 1, availableForSale: true },
      { stock: 5, availableForSale: true },
      { stock: 10, availableForSale: true },
    ]

    ;(prisma.category.count as jest.Mock).mockResolvedValue(1)
    ;(prisma.product.count as jest.Mock)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(5)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(10)
    ;(prisma.order.count as jest.Mock).mockResolvedValue(2)
    ;(prisma.productVariant.findMany as jest.Mock).mockResolvedValue(
      mockVariants,
    )

    const result = await getDashboardStats()

    expect(result.data?.lowStockVariants).toBe(2)
  })
})
