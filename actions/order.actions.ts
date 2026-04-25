'use server'

import { prisma } from 'prisma/prisma'
import {
  Order,
  OrderStatus,
  OrderWithUser,
  ActionResponse,
  CreateOrder,
} from '@lib/types/types'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import {
  AppError,
  DatabaseError,
  NetworkError,
  formatError,
} from '@lib/errors'
import { withFetch } from '@lib/errors-utils'

const isAdmin = (role: string | null | undefined) =>
  role?.toUpperCase() === 'ADMIN'

export async function getAllOrders(): Promise<
  ActionResponse<OrderWithUser[] | null>
> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const order = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    })

    return {
      success: true,
      message: 'Fetched all orders successfully',
      data: order,
    }
  } catch (error) {
    console.error('getAllOrders_ERROR:', error)
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
): Promise<ActionResponse<OrderWithUser[] | null>> {
  try {
    const session = await getServerSession(authOptions)

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

    const order = await prisma.order.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: 'desc',
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
    const session = await getServerSession(authOptions)

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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function createOrder(
  checkoutId: string,
  {
    userId,
    address,
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
    const session = await getServerSession(authOptions)
    const sessionUserId = session?.user?.id ?? null

    if (userId && (!sessionUserId || sessionUserId !== userId)) {
      return {
        success: false,
        message: 'Unauthorized: Invalid user context for order creation.',
        errors: null,
      }
    }

const resolvedUserId = sessionUserId || userId || null
  const resolvedEmail = session?.user?.email || email

  if (!resolvedEmail) {
    return {
      success: false,
      message: 'Email is required to create an order.',
      errors: new DatabaseError('Email missing', 'createOrder'),
    }
  }

  const fetchResult = await withFetch<{ status: string }>(
    `https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API}`,
      },
      timeout: 10000,
    }
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

  const order = await prisma.$transaction(async (tx) => {
    for (const item of lineItems) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, product: { select: { name: true } } },
      })

      if (!variant) {
        throw new DatabaseError(`Variant not found: ${item.variantId}`, 'createOrder')
      }

      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${variant.product.name}. Requested: ${item.quantity}, Available: ${variant.stock}`,
          'INSUFFICIENT_STOCK',
          409
        )
      }

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }

    const newOrder = await tx.order.create({
        data: {
          lineItems: lineItems,
          lastName,
          firstName,
          email: resolvedEmail,
          phone,
          discounts: discounts || [],
          currency: currency || 'GBP',
          shippingAddress: address || {},
          billingAddress: address || {},
          status: 'PENDING',
          taxes,
          shippingPrice,
          subtotalPrice: Number(subtotalPrice) || 0,
          totalPrice: Number(totalPrice) || 0,
          shippingMethod,
          ...(resolvedUserId && {
            user: { connect: { id: resolvedUserId } },
          }),
        },
      })

      if (resolvedUserId) {
        await tx.user.update({
          where: { id: resolvedUserId },
          data: { cart: {} },
        })
      }

      return newOrder
    })

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    }
  } catch (error) {
    console.error('createOrder_ERROR:', error)

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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const status = newStatus.toUpperCase() as OrderStatus

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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
