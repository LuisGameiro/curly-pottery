'use server'

import { authOptions } from '@lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'
import { revalidatePath } from 'next/cache'
import {
  PaginationInput,
  FAVOURITES_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'
import { Prisma } from 'prisma/generated/prisma/client'

export async function getFavouritesAction(): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) return []

    const favourites = await prisma.favourite.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    })

    return favourites.map((f) => f.productId)
  } catch (error) {
    console.error('getFavouritesAction_ERROR:', error)
    return []
  }
}

export async function addFavouriteAction(productId: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) return

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
  } catch (error) {
    console.error('addFavouriteAction_ERROR:', error)
  }
}

export async function removeFavouriteAction(productId: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error('[REMOVE_FAVOURITE] No session found')
      return
    }

    await prisma.favourite.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/user/favourites')
    revalidatePath('/')
  } catch (error) {
    console.error('removeFavouriteAction_ERROR:', error)
  }
}

export async function getFavouritesWithProductsAction(
  pagination?: PaginationInput,
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { items: [], nextCursor: null, hasMore: false, total: 0 }
    }

    const take = pagination?.take ?? FAVOURITES_PAGE_SIZE
    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const where = { userId: session.user.id }

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
