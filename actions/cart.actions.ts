'use server'

import { auth } from '@/auth'
import { CartLineItem, Cart } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { calculateDiscount } from '@lib/calculate-price'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import * as Sentry from '@sentry/nextjs'

export async function getCartFromDbAction(): Promise<Cart | null> {
  try {
    const session = await auth()

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
  } catch (error) {
    console.error('getCartFromDbAction_ERROR:', error)
    Sentry.captureException(error)
    return null
  }
}

export async function syncCartAction(items: CartLineItem[]) {
  try {
    const session = await auth()
    if (!session?.user) return

    const rateResult = await checkRateLimit(
      getRateLimitKey(session.user.id, 'cart-sync'),
      { windowMs: 60 * 1000, maxRequests: 30 },
    )
    if (!rateResult.success) {
      return { errors: { message: 'Too many requests. Please slow down.' } }
    }

    // Securely validate items against the database to prevent quantity/price manipulation
    const validatedItems: CartLineItem[] = []

    const variantIds = items.map((item) => item.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    })
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    for (const item of items) {
      const variant = variantMap.get(item.variantId)

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

    revalidatePath('/cart')
  } catch (error) {
    console.error('syncCartAction_ERROR:', error)
    Sentry.captureException(error)
  }
}

export async function deleteCart(cartId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized: Please sign in.' }
    }

    await prisma.cart.delete({
      where: {
        id: cartId,
        userId: session.user.id,
      },
    })

    revalidatePath('/cart')
    return { success: true, message: 'Cart deleted successfully.' }
  } catch (error) {
    console.error('deleteCart_ERROR:', error)
    Sentry.captureException(error)
    return { success: false, message: 'Failed to delete cart.' }
  }
}

export async function updateCartPrice(
  taxes: number,
  shippingPrice: number,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in before checkout.',
      }
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return { success: false, message: 'Cart not found.' }
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

    revalidatePath('/cart')
    return { success: true, message: 'Cart price updated.' }
  } catch (error) {
    console.error('updateCartPrice_ERROR:', error)
    Sentry.captureException(error)
    return { success: false, message: 'Failed to update cart price.' }
  }
}
