'use server'

import { auth } from '@/auth'
import { CartLineItem, Cart, CurrencyCode, Discount } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { calculateDiscount } from '@lib/calculate-price'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import * as Sentry from '@sentry/nextjs'

export async function getCartFromDbAction(): Promise<Cart | null> {
  try {
    const session = await auth()

    if (!session?.user?.id) return null

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        lineItems: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    })

    if (!cart) return null

    // Map CartLineItem[] → client-side CartLineItem[] with display data from JOIN
    const lineItems: CartLineItem[] = cart.lineItems.map((li) => ({
      id: li.variant.product.id,
      variantId: li.variantId,
      slug: li.variant.product.slug,
      sku: li.variant.sku,
      name: li.variant.product.name,
      images: li.variant.product.images[0] || '',
      quantity: li.quantity,
      stock: li.variant.stock,
      price: Number(li.price),
      currency: li.currency as CurrencyCode,
      colorName: li.variant.colorName,
      sizeName: li.variant.sizeName,
      discounts: (li.variant.discounts ?? []) as Discount[],
    }))

    return {
      ...cart,
      subtotalPrice: Number(cart.subtotalPrice),
      totalPrice: Number(cart.totalPrice),
      shippingPrice: Number(cart.shippingPrice),
      taxes: Number(cart.taxes),
      lineItems,
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

    // Delete existing line items and recreate (inside a transaction)
    await prisma.$transaction(async (tx) => {
      // First get or create the cart
      const cart = await tx.cart.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          user: { connect: { id: session.user.id } },
        },
      })

      // Delete existing line items
      await tx.cartLineItem.deleteMany({
        where: { cartId: cart.id },
      })

      // Create new line items
      if (validatedItems.length > 0) {
        await tx.cartLineItem.createMany({
          data: validatedItems.map((item) => ({
            cartId: cart.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency || 'GBP',
          })),
        })
      }
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

export async function updateCartPrice(taxes: number, shippingPrice: number) {
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

    const lineItemRows = await prisma.cartLineItem.findMany({
      where: { cartId: cart.id },
    })
    const items: CartLineItem[] = lineItemRows.map((li) => ({
      ...li,
      id: '',
      variantId: li.variantId,
      quantity: li.quantity,
      price: Number(li.price),
      currency: li.currency as CurrencyCode,
      slug: '',
      sku: '',
      name: '',
      images: '',
      stock: 0,
      colorName: '',
      sizeName: '',
      discounts: [],
    }))
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
