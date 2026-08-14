'use server'

import { prisma } from 'prisma/prisma'
import {
  UserWithOrders,
  UserWithOrdersAddress,
  ActionResponse,
  User,
  NewsletterSubscriberSource,
} from '@lib/types/types'

import { registerSchema } from '@lib/form-validator'
import { hashPassword } from '@lib/auth/password'
import { auth } from '@/auth'
import { isAdminRole } from '@lib/auth/admin'
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

import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import { toClientMessage } from '@lib/errors'

export async function getAllCustomers(
  pagination?: PaginationInput,
): Promise<ActionResponse<PaginatedResult<UserWithOrders>>> {
  try {
    const session = await auth()
    if (!session?.user?.id || !isAdminRole(session.user.role)) {
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
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}

export async function getUserById(
  id: string,
): Promise<ActionResponse<UserWithOrdersAddress | null>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in first.',
        errors: null,
      }
    }
    if (!isAdminRole(session.user.role) && session.user.id !== id) {
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
    console.error('getUserById_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}

export async function updateNotes(
  id: string,
  notes: string,
): Promise<ActionResponse<User | null>> {
  try {
    const session = await auth()

    if (!isAdminRole(session?.user?.role)) {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }
    if (notes && notes.length > 10000) {
      return {
        success: false,
        message: 'Notes too long (max 10000 characters)',
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
    console.error('updateUser_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
})

const addressInputSchema = z.object({
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().max(100).nullish(),
})

const updateAddressesSchema = z.array(addressInputSchema).max(20)

export async function updateUser({
  id,
  data,
}: {
  id: string
  data: UserWithOrdersAddress
}): Promise<ActionResponse<User | null>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in first.',
        errors: null,
      }
    }

    if (!isAdminRole(session.user.role) && session.user.id !== id) {
      return {
        success: false,
        message: 'Unauthorized: You can only update your own profile.',
        errors: null,
      }
    }

    // Only allow whitelisted fields
    const safeFields = updateUserSchema.safeParse(data)
    if (!safeFields.success) {
      return {
        success: false,
        message: 'Invalid fields',
        errors: z.flattenError(safeFields.error),
      }
    }

    const { orders: _orders, addresses } = data

    // Validate client-supplied addresses before writing them.
    const addressesValidation = updateAddressesSchema.safeParse(addresses ?? [])
    if (!addressesValidation.success) {
      return {
        success: false,
        message: 'Invalid address fields',
        errors: z.flattenError(addressesValidation.error),
      }
    }
    const validatedAddresses = addressesValidation.data

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...safeFields.data,
        addresses: {
          deleteMany: {},
          create: validatedAddresses.map((addr) => ({
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
    console.error('updateNotes_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
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

  // Rate-limit registration per IP to prevent automated account creation.
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ??
    headersList.get('x-real-ip') ??
    'unknown'
  try {
    const rateResult = await checkRateLimit(getRateLimitKey(ip, 'register'), {
      windowMs: 60 * 1000,
      maxRequests: 5,
    })
    if (!rateResult.success) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      }
    }
  } catch {
    return {
      success: false,
      message: 'Registration temporarily unavailable.',
    }
  }

  try {
    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // Neutral response — do not confirm whether the email is registered.
      return {
        success: true,
        message: 'Registration successful. Please sign in.',
        data: null,
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
        Sentry.captureException(newsletterError)
      }
    }

    return {
      success: true,
      message: 'User registered successfully',
      data: null,
    }
  } catch (error) {
    console.error('Registration error:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: 'Internal server error',
      errors: toClientMessage(error, 'An unknown error occurred'),
    }
  }
}
