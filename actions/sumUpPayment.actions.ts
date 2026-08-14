'use server'

import { auth } from '@/auth'
import { ActionResponse, CartLineItem, CurrencyCode } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { AppError, DatabaseError } from '@lib/errors'
import { withFetch } from '@lib/errors-utils'

interface SumUpCheckoutResponse {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
}

/** Client-provided cart data used for guest checkout. Registered users are
 *  charged from their database cart instead, so this input is ignored for them. */
interface SumUpCheckoutInput {
  email?: string
  lineItems?: CartLineItem[]
  taxes?: number
  shippingPrice?: number
  currency?: CurrencyCode
}

export async function createSumUpCheckout(
  input: SumUpCheckoutInput = {},
): Promise<ActionResponse<string | null>> {
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  if (!process.env.SUMUP_API || !process.env.SUMUP_MERCHANT_CODE) {
    return {
      success: false,
      message: 'Server configuration error: Payment gateway not configured.',
      errors: new DatabaseError(
        'Missing SumUp configuration',
        'createSumUpCheckout',
      ),
    }
  }

  let amount = 0
  let currency: string = input.currency || CurrencyCode.GBP
  let payToEmail = process.env.SUMUP_MERCHANT_EMAIL || input.email || ''

  if (userId && userEmail) {
    // Registered users: charge the database cart.
    const cart = await prisma.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found. Please add items to your cart.',
        errors: new DatabaseError('Cart not found', 'createSumUpCheckout'),
      }
    }

    amount = Number(cart.totalPrice)
    currency = cart.currency
    payToEmail = process.env.SUMUP_MERCHANT_EMAIL || userEmail
  } else {
    // Guests: validate the client cart against the database (mirrors
    // createOrder) so the charged amount can't be tampered with.
    if (!input.email) {
      return {
        success: false,
        message: 'Email is required to checkout.',
        errors: new DatabaseError('Email missing', 'createSumUpCheckout'),
      }
    }

    if (!input.lineItems?.length) {
      return {
        success: false,
        message: 'Your cart is empty.',
        errors: new DatabaseError('Empty cart', 'createSumUpCheckout'),
      }
    }

    const variantIds = input.lineItems.map((item) => item.variantId)
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true, stock: true },
    })
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    for (const item of input.lineItems) {
      const variant = variantMap.get(item.variantId)
      if (!variant) {
        return {
          success: false,
          message: `Variant ${item.variantId} not found.`,
          errors: new DatabaseError('Variant not found', 'createSumUpCheckout'),
        }
      }
      if (variant.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${variant.stock}`,
          errors: new AppError('Insufficient stock', 'INSUFFICIENT_STOCK', 409),
        }
      }
    }

    // Recompute totals from server prices — createOrder verifies the same
    // amount when the payment completes.
    const subtotal = input.lineItems.reduce(
      (sum, item) =>
        sum + Number(variantMap.get(item.variantId)!.price) * item.quantity,
      0,
    )
    amount =
      subtotal + (Number(input.taxes) || 0) + (Number(input.shippingPrice) || 0)
    payToEmail = process.env.SUMUP_MERCHANT_EMAIL || input.email
  }

  const checkoutRef = `ORDER-${userId || 'guest'}-${Date.now()}`

  const fetchResult = await withFetch<SumUpCheckoutResponse>(
    'https://api.sumup.com/v0.1/checkouts',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: checkoutRef,
        amount,
        currency,
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        pay_to_email: payToEmail,
      }),
      timeout: 15000,
    },
  )

  if (!fetchResult.success) {
    return {
      success: false,
      message: fetchResult.message,
      errors: fetchResult.errors,
    }
  }

  return {
    success: true,
    message: 'Checkout created',
    data: fetchResult.data?.id ?? null,
  }
}
