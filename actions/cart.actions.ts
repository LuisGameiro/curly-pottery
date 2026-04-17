'use server'

import { authOptions } from '@lib/auth/authOptions'
import { CartLineItem, Cart } from '@lib/types/types'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'

export async function getCartFromDbAction(): Promise<Cart | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cart: true,
    },
  })

  return user?.cart ? (user.cart as Cart) : null
}

export async function syncCartAction(items: CartLineItem[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: { lineItems: items },
    create: {
      lineItems: items,
      user: { connect: { id: session.user.id } },
    },
  })
}

export async function deleteCart(cartId: string) {
  await prisma.cart.delete({
    where: { id: cartId },
  })
}

export async function updateCartPrice(
  subtotalPrice: number,
  totalPrice: number,
  taxes: number,
  shippingPrice: number,
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please sign in before checkout.')
  }

  await prisma.cart.update({
    where: { userId: session.user.id },
    data: {
      subtotalPrice,
      totalPrice: totalPrice + taxes + shippingPrice,
      taxes,
      shippingPrice,
    },
  })
}
