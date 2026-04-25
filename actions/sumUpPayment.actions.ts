'use server'

import { authOptions } from '@lib/auth/authOptions'
import { ActionResponse } from '@lib/types/types'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'
import { NetworkError, DatabaseError, formatError } from '@lib/errors'
import { withFetch } from '@lib/errors-utils'

interface SumUpCheckoutResponse {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
}

export async function createSumUpCheckout(): Promise<
  ActionResponse<string | null>
> {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  if (!userId || !userEmail) {
    return {
      success: false,
      message: 'Unauthorized: Please sign in before checkout.',
      errors: new DatabaseError('Unauthorized access', 'createSumUpCheckout'),
    }
  }

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

  const checkoutRef = `ORDER-${cart.id}-${Date.now()}`

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
        amount: cart.totalPrice,
        currency: cart.currency,
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        pay_to_email: userEmail,
      }),
      timeout: 15000,
    }
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
