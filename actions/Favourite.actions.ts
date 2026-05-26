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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return []

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  })

  return favourites.map((f) => f.productId)
}

export async function addFavouriteAction(productId: string): Promise<void> {
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
}

export async function removeFavouriteAction(productId: string): Promise<void> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    console.error('[REMOVE_FAVOURITE] No session found')
    return
  }

  console.log(
    `[REMOVE_FAVOURITE] User ${session.user.id} removing product ${productId}`,
  )

  const result = await prisma.favourite.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  })

  console.log(`[REMOVE_FAVOURITE] Deleted ${result.count} records`)

  revalidatePath('/user/favourites')
  revalidatePath('/')
}

export async function getFavouritesWithProductsAction(
  pagination?: PaginationInput,
) {
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
