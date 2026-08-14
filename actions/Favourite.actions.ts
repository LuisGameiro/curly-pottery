'use server'

import { auth } from '@/auth'
import { prisma } from 'prisma/prisma'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import {
  PaginationInput,
  FAVOURITES_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'
import { Prisma } from 'prisma/generated/prisma/client'
import { ActionResponse } from '@lib/types/types'
import * as Sentry from '@sentry/nextjs'

export async function getFavouritesAction(): Promise<ActionResponse<string[]>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required',
        errors: null,
      }
    }

    const favourites = await prisma.favourite.findMany({
      where: {
        userId: session.user.id,
        product: { hide: false },
      },
      select: { productId: true },
    })

    return {
      success: true,
      message: 'Fetched favourites successfully',
      data: favourites.map((f) => f.productId),
    }
  } catch (error) {
    console.error('getFavouritesAction_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: 'Failed to fetch favourites',
      errors: error,
    }
  }
}

export async function addFavouriteAction(
  productId: string,
): Promise<ActionResponse<null>> {
  if (!productId || typeof productId !== 'string') {
    return { success: false, message: 'Invalid product ID', errors: null }
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required',
        errors: null,
      }
    }

    const rateResult = await checkRateLimit(
      getRateLimitKey(session.user.id, 'favourite-sync'),
      { windowMs: 60 * 1000, maxRequests: 30 },
    )
    if (!rateResult.success) {
      return {
        success: false,
        message: 'Too many requests. Please slow down.',
        errors: null,
      }
    }

    // Only visible products can be favourited.
    const product = await prisma.product.findFirst({
      where: { id: productId, hide: false },
      select: { id: true },
    })
    if (!product) {
      return { success: false, message: 'Product not found.', errors: null }
    }

    await prisma.favourite.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/user/favourites')
    revalidatePath('/')

    return { success: true, message: 'Added to favourites', data: null }
  } catch (error) {
    console.error('addFavouriteAction_ERROR:', error)
    Sentry.captureException(error)
    return { success: false, message: 'Failed to add favourite', errors: error }
  }
}

export async function removeFavouriteAction(
  productId: string,
): Promise<ActionResponse<null>> {
  if (!productId || typeof productId !== 'string') {
    return { success: false, message: 'Invalid product ID', errors: null }
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required',
        errors: null,
      }
    }

    // Rate-limit parity with addFavouriteAction.
    const rateResult = await checkRateLimit(
      getRateLimitKey(session.user.id, 'favourite-sync'),
      { windowMs: 60 * 1000, maxRequests: 30 },
    )
    if (!rateResult.success) {
      return {
        success: false,
        message: 'Too many requests. Please slow down.',
        errors: null,
      }
    }

    await prisma.favourite.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/user/favourites')
    revalidatePath('/')

    return { success: true, message: 'Removed from favourites', data: null }
  } catch (error) {
    console.error('removeFavouriteAction_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: 'Failed to remove favourite',
      errors: error,
    }
  }
}

export async function getFavouritesWithProductsAction(
  pagination?: PaginationInput,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { items: [], nextCursor: null, hasMore: false, total: 0 }
    }

    const take = pagination?.take ?? FAVOURITES_PAGE_SIZE
    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const where = {
      userId: session.user.id,
      product: { hide: false },
    }

    const [favourites, total] = await Promise.all([
      prisma.favourite.findMany({
        where,
        include: {
          product: {
            include: {
              variants: true,
              categories: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.favourite.count({ where }),
    ])

    const hasMore = favourites.length > take
    const items = favourites.slice(0, take).map(formatFavouriteProduct)
    const nextCursor = hasMore ? encodeCursor(items.at(-1)!.id) : null

    return { items, nextCursor, hasMore, total }
  } catch (error) {
    console.error('getFavouritesWithProductsAction_ERROR:', error)
    Sentry.captureException(error)
    return { items: [], nextCursor: null, hasMore: false, total: 0 }
  }
}

function formatFavouriteProduct(
  f: Prisma.FavouriteGetPayload<{
    include: {
      product: { include: { variants: true; categories: true } }
    }
  }>,
) {
  return {
    ...f.product,
    id: f.product.id,
    variants: f.product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  }
}
