'use server'

import { prisma } from 'prisma/prisma'
import { Prisma } from '../prisma/generated/prisma/client'
import {
  Order,
  OrderStatus,
  OrderWithUser,
  ActionResponse,
  CreateOrder,
  CartLineItem,
  CurrencyCode,
} from '@lib/types/types'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { AppError, DatabaseError, NetworkError, formatError } from '@lib/errors'
import { withFetch } from '@lib/errors-utils'
import {
  PaginationInput,
  PaginatedResult,
  ADMIN_PAGE_SIZE,
  USER_ORDERS_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'

import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

const isAdmin = (role: string | null | undefined) =>
  role?.toUpperCase() === 'ADMIN'

export async function getAllOrders(
  pagination?: PaginationInput,
): Promise<ActionResponse<PaginatedResult<OrderWithUser> | null>> {
  try {
    const session = await auth()

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const take = pagination?.take ?? ADMIN_PAGE_SIZE
    const search = pagination?.search?.trim()

    const where: Prisma.OrderWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ]
    }

    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: { user: true },
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.order.count({ where }),
    ])

    const hasMore = orders.length > take
    const items = orders.slice(0, take) as unknown as OrderWithUser[]
    const nextCursor = hasMore ? encodeCursor(items.at(-1)!.id) : null

    return {
      success: true,
      message: 'Fetched all orders successfully',
      data: { items, nextCursor, hasMore, total },
    }
  } catch (error) {
    console.error('getAllOrders_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getOrdersById(
  id: string,
  pagination?: PaginationInput,
): Promise<ActionResponse<PaginatedResult<OrderWithUser> | null>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in first.',
        errors: null,
      }
    }

    if (!isAdmin(session.user.role) && session.user.id !== id) {
      return {
        success: false,
        message: 'Unauthorized: You can only access your own orders.',
        errors: null,
      }
    }

    const take = pagination?.take ?? USER_ORDERS_PAGE_SIZE
    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const where: Prisma.OrderWhereInput = { userId: id }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: { user: true },
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.order.count({ where }),
    ])

    const hasMore = orders.length > take
    const items = orders.slice(0, take) as unknown as OrderWithUser[]
    const nextCursor = hasMore ? encodeCursor(items.at(-1)!.id) : null

    return {
      success: true,
      message: 'Fetched order successfully',
      data: { items, nextCursor, hasMore, total },
    }
  } catch (error) {
    console.error('getOrderById_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getOrderById(
  id: string,
): Promise<ActionResponse<OrderWithUser | null>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in first.',
        errors: null,
      }
    }

    const order = await prisma.order.findFirst({
      where: isAdmin(session.user.role)
        ? { id }
        : {
            id,
            userId: session.user.id,
          },

      include: {
        user: true,
      },
    })

    return {
      success: true,
      message: 'Fetched order successfully',
      data: order,
    }
  } catch (error) {
    console.error('getOrderById_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

const createOrderSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address: z.object({
    address: z.string().min(1).max(500),
    postalCode: z.string().min(1).max(20),
    city: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    company: z.string().max(200).optional(),
  }),
  billingAddress: z
    .object({
      address: z.string().min(1).max(500),
      postalCode: z.string().min(1).max(20),
      city: z.string().min(1).max(100),
      country: z.string().min(1).max(100),
      company: z.string().max(200).optional(),
    })
    .optional(),
  shippingMethod: z.string().min(1).max(100),
  currency: z.nativeEnum(CurrencyCode).default('GBP'),
})

export async function createOrder(
  checkoutId: string,
  {
    userId,
    address,
    billingAddress,
    firstName,
    lastName,
    phone,
    email,
    lineItems,
    discounts,
    subtotalPrice,
    totalPrice,
    taxes,
    currency,
    shippingPrice,
    shippingMethod,
  }: CreateOrder,
): Promise<ActionResponse<Order | null>> {
  try {
    // Validate inputs to prevent arbitrary field injection
    const inputValidation = createOrderSchema.safeParse({
      email,
      phone,
      firstName,
      lastName,
      address,
      billingAddress,
      shippingMethod,
    })
    if (!inputValidation.success) {
      return {
        success: false,
        message: 'Invalid order fields',
        errors: z.flattenError(inputValidation.error),
      }
    }
    const v = inputValidation.data

    const session = await auth()
    const sessionUserId = session?.user?.id ?? null

    if (userId && (!sessionUserId || sessionUserId !== userId)) {
      return {
        success: false,
        message: 'Unauthorized: Invalid user context for order creation.',
        errors: null,
      }
    }

    const resolvedUserId = sessionUserId || userId || null
    const resolvedEmail = session?.user?.email || v.email

    if (!resolvedEmail) {
      return {
        success: false,
        message: 'Email is required to create an order.',
        errors: new DatabaseError('Email missing', 'createOrder'),
      }
    }

    // Load validated data from cart to prevent payload tampering
    let finalLineItems = lineItems
    let finalSubtotalPrice = Number(subtotalPrice) || 0
    let finalTotalPrice = Number(totalPrice) || 0
    let finalTaxes = taxes || 0
    let finalShippingPrice = shippingPrice || 0
    let finalCurrency = currency || 'GBP'

    // For guest users, still validate variant existence and server prices
    if (!resolvedUserId && finalLineItems.length > 0) {
      const variantIds = finalLineItems.map((item) => item.variantId)
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, price: true, stock: true },
      })
      const variantMap = new Map(variants.map((v) => [v.id, v]))
      
      const validatedItems: CartLineItem[] = []
      for (const item of finalLineItems) {
        const variant = variantMap.get(item.variantId)
        if (!variant) {
          return {
            success: false,
            message: `Variant ${item.variantId} not found.`,
            errors: new DatabaseError('Variant not found', 'createOrder'),
          }
        }
        if (variant.stock < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for ${item.name}. Available: ${variant.stock}`,
            errors: new AppError('Insufficient stock', 'INSUFFICIENT_STOCK', 409),
          }
        }
        validatedItems.push({
          ...item,
          price: Number(variant.price), // force server price
          quantity: Math.min(item.quantity, variant.stock),
          stock: variant.stock,
        })
      }
      finalLineItems = validatedItems
      // Recalculate totals from validated items
      finalSubtotalPrice = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      finalTotalPrice = finalSubtotalPrice + finalTaxes + finalShippingPrice
    }

    if (resolvedUserId) {
      const cart = await prisma.cart.findUnique({
        where: { userId: resolvedUserId },
      })
      if (cart) {
        finalLineItems = cart.lineItems as unknown as CartLineItem[]
        finalSubtotalPrice = Number(cart.subtotalPrice)
        finalTotalPrice = Number(cart.totalPrice)
        finalTaxes = Number(cart.taxes)
        finalShippingPrice = Number(cart.shippingPrice)
        finalCurrency = cart.currency
      }
    }

    const fetchResult = await withFetch<{ status: string; amount: number }>(
      `https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUMUP_API}`,
        },
        timeout: 10000,
      },
    )

    if (!fetchResult.success) {
      return {
        success: false,
        message: `Payment verification failed: ${fetchResult.message}`,
        errors: fetchResult.errors,
      }
    }

    if (fetchResult.data?.status !== 'PAID') {
      return {
        success: false,
        message: 'Payment not completed. Please complete payment first.',
        errors: new NetworkError('Payment not completed'),
      }
    }

    // Strict validation to ensure the paid amount matches the database cart total
    if (fetchResult.data?.amount !== finalTotalPrice) {
      return {
        success: false,
        message:
          'Payment amount mismatch. Order creation aborted to prevent tampering.',
        errors: new Error('Payment mismatch'),
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the Order first to get the ID
      const newOrder = await tx.order.create({
        data: {
          lineItems: finalLineItems,
          lastName: v.lastName,
          firstName: v.firstName,
          email: resolvedEmail,
          phone: v.phone,
          discounts: discounts || [],
          currency: finalCurrency,
          shippingAddress: v.address || {},
          billingAddress: v.address || {},
          status: 'PENDING',
          taxes: new Prisma.Decimal(finalTaxes),
          shippingPrice: new Prisma.Decimal(finalShippingPrice),
          subtotalPrice: new Prisma.Decimal(finalSubtotalPrice),
          totalPrice: new Prisma.Decimal(finalTotalPrice),
          shippingMethod: v.shippingMethod,
          ...(resolvedUserId && {
            user: { connect: { id: resolvedUserId } },
          }),
        },
      })

      // 2. Process each line item for stock and tracking
      for (const item of finalLineItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, product: { select: { name: true } } },
        })

        if (!variant) {
          throw new DatabaseError(
            `Variant not found: ${item.variantId}`,
            'createOrder',
          )
        }

        if (variant.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${variant.product.name}. Requested: ${item.quantity}, Available: ${variant.stock}`,
            'INSUFFICIENT_STOCK',
            409,
          )
        }

        // Decrement stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            quantity: -item.quantity, // Sale is a reduction
            type: 'SALE',
            orderId: newOrder.id,
            userId: resolvedUserId,
            note: `Order #${newOrder.id.slice(-6).toUpperCase()}`,
          },
        })
      }

      if (resolvedUserId) {
        await tx.user.update({
          where: { id: resolvedUserId },
          data: { cart: {} },
        })
      }

      return newOrder
    })

    revalidatePath('/admin/orders')
    revalidatePath('/user/orders')

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    }
  } catch (error) {
    console.error('createOrder_ERROR:', error)
    Sentry.captureException(error)

    if (error instanceof AppError) {
      return { success: false, message: error.message, errors: error }
    }

    return {
      success: false,
      message: formatError(error),
      errors: new DatabaseError('Failed to create order', 'createOrder'),
    }
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<ActionResponse<Order | null>> {
  try {
    const session = await auth()

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const orderStatusSchema = z.nativeEnum(OrderStatus)
    const status = orderStatusSchema.parse(newStatus.toUpperCase())

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath('/admin/orders')
    return {
      success: true,
      message: 'Updated order status successfully',
      data: order,
    }
  } catch (error) {
    console.error('updateOrderStatus_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
