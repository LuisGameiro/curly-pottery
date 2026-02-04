import { CreateOrder } from '@lib/types/types'
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersById,
} from './order.actions'
import { prisma } from 'prisma/prisma'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

describe('getAllOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch all orders successfully', async () => {
    const mockOrders = [
      {
        id: '1',
        userId: 'user1',
        status: 'PENDING',
        createdAt: new Date(),
        user: { id: 'user1', name: 'John Doe' },
      },
      {
        id: '2',
        userId: 'user2',
        status: 'COMPLETED',
        createdAt: new Date(),
        user: { id: 'user2', name: 'Jane Doe' },
      },
    ]

    ;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)

    const result = await getAllOrders()

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched all orders successfully')
    expect(result.data).toEqual(mockOrders)
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  })

  it('should return empty array when no orders exist', async () => {
    ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])

    const result = await getAllOrders()

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('should handle error and return failure response', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.order.findMany as jest.Mock).mockRejectedValue(mockError)

    const result = await getAllOrders()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.order.findMany as jest.Mock).mockRejectedValue('Unknown error')

    const result = await getAllOrders()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('getOrdersById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch orders by user id successfully', async () => {
    const userId = 'user1'
    const mockOrders = [
      {
        id: '1',
        userId: 'user1',
        status: 'PENDING',
        createdAt: new Date(),
        user: { id: 'user1', name: 'John Doe' },
      },
      {
        id: '2',
        userId: 'user1',
        status: 'COMPLETED',
        createdAt: new Date(),
        user: { id: 'user1', name: 'John Doe' },
      },
    ]

    ;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)

    const result = await getOrdersById(userId)

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched order successfully')
    expect(result.data).toEqual(mockOrders)
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  })

  it('should return empty array when user has no orders', async () => {
    const userId = 'user-no-orders'
    ;(prisma.order.findMany as jest.Mock).mockResolvedValue([])

    const result = await getOrdersById(userId)

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('should handle database error', async () => {
    const userId = 'user1'
    const mockError = new Error('Database query failed')
    ;(prisma.order.findMany as jest.Mock).mockRejectedValue(mockError)

    const result = await getOrdersById(userId)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database query failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    const userId = 'user1'
    ;(prisma.order.findMany as jest.Mock).mockRejectedValue('Unexpected error')

    const result = await getOrdersById(userId)

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('getOrderById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch order by id successfully', async () => {
    const orderId = '1'
    const mockOrder = {
      id: '1',
      userId: 'user1',
      status: 'PENDING',
      createdAt: new Date(),
      user: { id: 'user1', name: 'John Doe' },
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const result = await getOrderById(orderId)

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched order successfully')
    expect(result.data).toEqual(mockOrder)
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: orderId },
      include: { user: true },
    })
  })

  it('should return null when order does not exist', async () => {
    const orderId = 'non-existent-id'
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getOrderById(orderId)

    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it('should handle database error', async () => {
    const orderId = '1'
    const mockError = new Error('Database connection failed')
    ;(prisma.order.findUnique as jest.Mock).mockRejectedValue(mockError)

    const result = await getOrderById(orderId)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    const orderId = '1'
    ;(prisma.order.findUnique as jest.Mock).mockRejectedValue(
      'Unexpected error',
    )

    const result = await getOrderById(orderId)

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create order successfully with all fields', async () => {
    const mockOrder = {
      id: '1',
      userId: 'user1',
      status: 'PENDING',
      createdAt: new Date(),
    }

    const mockTx = {
      productVariant: {
        findUnique: jest.fn().mockResolvedValue({
          stock: 10,
          product: { name: 'Vase' },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      order: {
        create: jest.fn().mockResolvedValue(mockOrder),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    }

    ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
      callback(mockTx),
    )

    const result = await createOrder('checkoutId123', {
      userId: 'user1',
      address: { street: '123 Main St' },
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      lineItems: [{ variantId: 'var1', quantity: 2 }],
      discounts: [],
      subtotalPrice: 100,
      totalPrice: 120,
      taxes: 20,
      currency: 'GBP',
      shippingPrice: 10,
      shippingMethod: 'standard',
    } as unknown as CreateOrder)

    expect(result.success).toBe(true)
    expect(result.message).toBe('Order created successfully')
    expect(result.data).toEqual(mockOrder)
  })

  it('should create order without userId', async () => {
    const mockOrder = {
      id: '2',
      userId: null,
      status: 'PENDING',
      createdAt: new Date(),
    }

    const mockTx = {
      productVariant: {
        findUnique: jest.fn().mockResolvedValue({
          stock: 5,
          product: { name: 'Bowl' },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      order: {
        create: jest.fn().mockResolvedValue(mockOrder),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    }

    ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
      callback(mockTx),
    )

    const result = await createOrder('checkoutId123', {
      userId: '',
      address: {},
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '0987654321',
      email: 'jane@example.com',
      lineItems: [{ variantId: 'var2', quantity: 1 }],
      discounts: [],
      subtotalPrice: 50,
      totalPrice: 60,
      taxes: 10,
      currency: 'GBP',
      shippingPrice: 5,
      shippingMethod: 'express',
    } as unknown as CreateOrder)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockOrder)
  })

  it('should throw error when variant not found', async () => {
    const mockTx = {
      productVariant: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    }

    ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
      callback(mockTx),
    )

    const result = await createOrder('checkoutId123', {
      userId: 'user1',
      address: {},
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      lineItems: [{ variantId: 'invalid-var', quantity: 1 }],
      discounts: [],
      subtotalPrice: 100,
      totalPrice: 120,
      taxes: 20,
      currency: 'GBP',
      shippingPrice: 10,
      shippingMethod: 'standard',
    } as unknown as CreateOrder)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Variant not found')
  })

  it('should throw error when insufficient stock', async () => {
    const mockTx = {
      productVariant: {
        findUnique: jest.fn().mockResolvedValue({
          stock: 2,
          product: { name: 'Plate' },
        }),
      },
    }

    ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
      callback(mockTx),
    )

    const result = await createOrder('checkoutId123', {
      userId: 'user1',
      address: {},
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      lineItems: [{ variantId: 'var1', quantity: 5 }],
      discounts: [],
      subtotalPrice: 100,
      totalPrice: 120,
      taxes: 20,
      currency: 'GBP',
      shippingPrice: 10,
      shippingMethod: 'standard',
    } as unknown as CreateOrder)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Insufficient stock')
  })

  it('should handle transaction error', async () => {
    const mockError = new Error('Transaction failed')
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(mockError)

    const result = await createOrder('checkoutId123', {
      userId: 'user1',
      address: {},
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      lineItems: [{ variantId: 'var1', quantity: 1 }],
      discounts: [],
      subtotalPrice: 100,
      totalPrice: 120,
      taxes: 20,
      currency: 'GBP',
      shippingPrice: 10,
      shippingMethod: 'standard',
    } as unknown as CreateOrder)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Transaction failed')
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.$transaction as jest.Mock).mockRejectedValue('Unknown error')

    const result = await createOrder('checkoutId123', {
      userId: 'user1',
      address: {},
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john@example.com',
      lineItems: [{ variantId: 'var1', quantity: 1 }],
      discounts: [],
      subtotalPrice: 100,
      totalPrice: 120,
      taxes: 20,
      currency: 'GBP',
      shippingPrice: 10,
      shippingMethod: 'standard',
    } as unknown as CreateOrder)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to create order')
  })
})

describe('updateOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('next/cache', () => ({
      revalidatePath: jest.fn(),
    }))
  })

  it('should update order status successfully', async () => {
    const { updateOrderStatus } = await import('./order.actions')
    const { revalidatePath } = await import('next/cache')

    const mockOrder = {
      id: '1',
      userId: 'user1',
      status: 'COMPLETED',
      createdAt: new Date(),
    }

    ;(prisma.order.update as jest.Mock).mockResolvedValue(mockOrder)

    const result = await updateOrderStatus('1', 'completed')

    expect(result.success).toBe(true)
    expect(result.message).toBe('Updated order status successfully')
    expect(result.data).toEqual(mockOrder)
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: 'COMPLETED' },
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/orders')
  })

  it('should convert status to uppercase', async () => {
    const { updateOrderStatus } = await import('./order.actions')
    const mockOrder = { id: '2', status: 'PENDING' }

    ;(prisma.order.update as jest.Mock).mockResolvedValue(mockOrder)

    await updateOrderStatus('2', 'pending')

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: '2' },
      data: { status: 'PENDING' },
    })
  })

  it('should handle database error', async () => {
    const { updateOrderStatus } = await import('./order.actions')
    const mockError = new Error('Update failed')

    ;(prisma.order.update as jest.Mock).mockRejectedValue(mockError)

    const result = await updateOrderStatus('1', 'shipped')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Update failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    const { updateOrderStatus } = await import('./order.actions')

    ;(prisma.order.update as jest.Mock).mockRejectedValue('Unknown error')

    const result = await updateOrderStatus('1', 'cancelled')

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})
