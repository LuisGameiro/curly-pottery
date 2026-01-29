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

export async function getAllOrders(): Promise<
  ActionResponse<OrderWithUser[] | null>
> {
  try {
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
    const order = await prisma.order.findUnique({
      where: { id },

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

export async function createOrder({
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
}: CreateOrder): Promise<ActionResponse<Order | null>> {
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of lineItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, product: { select: { name: true } } },
        })

        if (!variant) {
          throw new Error(`Variant not found for ID: ${item.variantId}`)
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${variant.product.name}. Available: ${variant.stock}`,
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
          email,
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
          ...(userId && {
            user: { connect: { id: userId } },
          }),
        },
      })

      if (userId) {
        await tx.user.update({
          where: { id: userId },
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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to create order',
      errors: error,
    }
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<ActionResponse<Order | null>> {
  try {
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
