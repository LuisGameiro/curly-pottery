'use server'

import { prisma } from 'prisma/prisma'
import {
  UserWithOrders,
  UserWithOrdersAddress,
  ActionResponse,
  Address,
  User,
  NewsletterSubscriberSource,
} from '@lib/types/types'
import { cache } from 'react'
import { registerSchema } from '@lib/form-validator'
import { hashPassword } from '@lib/auth/password'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'
import { subscribeEmailToNewsletter } from '@lib/newsletter/service'
import { revalidatePath } from 'next/cache'
import {
  PaginationInput,
  PaginatedResult,
  ADMIN_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'
import { Prisma } from 'prisma/generated/prisma/client'

export async function getAllCustomers(
  pagination?: PaginationInput,
): Promise<ActionResponse<PaginatedResult<UserWithOrders>>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const take = pagination?.take ?? ADMIN_PAGE_SIZE
    const search = pagination?.search?.trim()

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: { orders: true },
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.user.count({ where }),
    ])

    const hasMore = users.length > take
    const items = users.slice(0, take) as unknown as UserWithOrders[]
    const nextCursor = hasMore ? encodeCursor(items.at(-1)!.id) : null

    return {
      success: true,
      message: 'Fetched all users successfully',
      data: { items, nextCursor, hasMore, total },
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
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return {
          success: false,
          message: 'Unauthorized: Please sign in first.',
          errors: null,
        }
      }
      if (session.user.role !== 'ADMIN' && session.user.id !== id) {
        return {
          success: false,
          message: 'Unauthorized: You can only access your own profile.',
          errors: null,
        }
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: true,
          addresses: true,
        },
      })
      return {
        success: true,
        message: 'Fetched user successfully',
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
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }
    const user = await prisma.user.update({
      where: { id },
      data: { notes },
    })
    revalidatePath('/admin/customers')
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

export async function updateUser({
  id,
  data,
}: {
  id: string
  data: UserWithOrdersAddress
}): Promise<ActionResponse<User | null>> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in first.',
        errors: null,
      }
    }

    if (session.user.role !== 'ADMIN' && session.user.id !== id) {
      return {
        success: false,
        message: 'Unauthorized: You can only update your own profile.',
        errors: null,
      }
    }

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
    revalidatePath('/admin/customers')
    revalidatePath('/user')
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    }
  } catch (error) {
    console.error('updateUser_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function registerUser(
  formData: FormData,
): Promise<ActionResponse<null>> {
  const rawData = Object.fromEntries(formData.entries())

  const validation = registerSchema.safeParse({
    ...rawData,
    acceptsMarketing: rawData.acceptsMarketing === 'on',
  })

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: validation.error.message,
    }
  }

  try {
    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
        errors: 'User already exists',
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        phone,
        acceptsMarketing,
        emailVerified: new Date(),
        role: 'USER',
      },
    })

    if (acceptsMarketing) {
      try {
        await subscribeEmailToNewsletter({
          email,
          firstName,
          lastName,
          source: NewsletterSubscriberSource.REGISTER,
          userId: user.id,
        })
      } catch (newsletterError) {
        console.error('Newsletter sync error:', newsletterError)
      }
    }

    return {
      success: true,
      message: 'User registered successfully',
      data: null,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: 'Internal server error',
      errors:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}
