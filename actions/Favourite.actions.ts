'use server'

import { authOptions } from '@lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'
import { revalidatePath } from 'next/cache'

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

export async function getFavouritesWithProductsAction() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return []

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          variants: true,
          categories: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return favourites.map((f) => ({
    ...f.product,
    variants: f.product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
  }))
}
