'use server'

import { authOptions } from '@lib/auth/authOptions'
import { CartLineItem, Cart } from '@lib/types/types'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'
import { calculateDiscount } from '@lib/calculate-price'

export async function getCartFromDbAction(): Promise<Cart | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cart: true,
    },
  })

  if (!user?.cart) return null

  // Convert Decimals to numbers for frontend compatibility
  return {
    ...user.cart,
    subtotalPrice: Number(user.cart.subtotalPrice),
    totalPrice: Number(user.cart.totalPrice),
    shippingPrice: Number(user.cart.shippingPrice),
    taxes: Number(user.cart.taxes),
    lineItems: (user.cart.lineItems as unknown as CartLineItem[]).map(
      (item) => ({
        ...item,
        price: Number(item.price),
      }),
    ),
  } as unknown as Cart
}

export async function syncCartAction(items: CartLineItem[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  // Securely validate items against the database to prevent quantity/price manipulation
  const validatedItems: CartLineItem[] = []

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    })

    if (variant) {
      // Prevent exceeding stock limit (solves the Quantity Bug)
      const maxQuantity = Math.min(item.quantity, variant.stock)

      if (maxQuantity > 0) {
        validatedItems.push({
          ...item,
          price: Number(variant.price), // Force server price (solves price manipulation)
          quantity: maxQuantity,
          stock: variant.stock,
        })
      }
    }
  }

  await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: { lineItems: validatedItems },
    create: {
      lineItems: validatedItems,
      user: { connect: { id: session.user.id } },
    },
  })
}

export async function deleteCart(cartId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please sign in.')
  }

  await prisma.cart.delete({
    where: {
      id: cartId,
      userId: session.user.id,
    },
  })
}

export async function updateCartPrice(
  _subtotalPrice: number,
  _totalPrice: number,
  taxes: number,
  shippingPrice: number,
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please sign in before checkout.')
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  })

  if (!cart) {
    throw new Error('Cart not found')
  }

  const items = (cart.lineItems || []) as CartLineItem[]
  const trueSubtotal = items.reduce((total, item) => {
    const { finalPrice } = calculateDiscount(item.price, item.discounts || [])
    return total + finalPrice * item.quantity
  }, 0)

  await prisma.cart.update({
    where: { userId: session.user.id },
    data: {
      subtotalPrice: trueSubtotal,
      totalPrice: trueSubtotal + taxes + shippingPrice,
      taxes,
      shippingPrice,
    },
  })
}
