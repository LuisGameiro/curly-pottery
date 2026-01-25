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
    const order = await prisma.order.create({
      data: {
        lineItems,
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
        shippingPrice: shippingPrice,
        subtotalPrice: Number(subtotalPrice) || 0,
        totalPrice: Number(totalPrice) || 0,
        shippingMethod: shippingMethod,
        ...(userId && {
          user: {
            connect: { id: userId },
          },
        }),
      },
    })

    await prisma.user.update({
      where: { id: userId || '' },
      data: {
        cart: {},
      },
    })

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    }
  } catch (error) {
    console.error('createOrder', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
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
