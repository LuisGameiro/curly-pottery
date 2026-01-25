'use server'

import { prisma } from 'prisma/prisma'
import {
  UserWithOrders,
  UserWithOrdersAddress,
  ActionResponse,
  Address,
  User,
} from '@lib/types/types'
import { cache } from 'react'

export async function getAllCustomers(): Promise<
  ActionResponse<UserWithOrders[]>
> {
  try {
    const user = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orders: true,
      },
    })

    return {
      success: true,
      message: 'Fecthed all user successfully',
      data: user,
    }
  } catch (error) {
    console.error('getAllCustomers_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export const getUserById = cache(
  async (id: string): Promise<ActionResponse<UserWithOrdersAddress | null>> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: true,
          addresses: true,
        },
      })
      return {
        success: true,
        message: 'Fecthed user successfully',
        data: user,
      }
    } catch (error) {
      console.error('getUserById:', error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'A database error occurred',
        errors: error,
      }
    }
  },
)

export async function updateNotes(
  id: string,
  notes: string,
): Promise<ActionResponse<User | null>> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { notes },
    })
    return {
      success: true,
      message: 'User note updated successfully',
      data: user,
    }
  } catch (error) {
    console.error('updateNotes_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function updateUser(
  id: string,
  data: UserWithOrdersAddress,
): Promise<ActionResponse<User | null>> {
  try {
    const { orders: _orders, addresses, ...updateData } = data
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        addresses: {
          deleteMany: {},
          create: addresses.map((addr: Address) => ({
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country || 'United Kingdom',
          })),
        },
      },
    })
    return {
      success: true,
      message: 'User note updated successfully',
      data: user,
    }
  } catch (error) {
    console.error('updateNotes_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
