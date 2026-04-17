'use server'

import { authOptions } from '@lib/auth/authOptions'
import { ActionResponse } from '@lib/types/types'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'

export async function createSumUpCheckout(): Promise<
  ActionResponse<string | null>
> {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId || !userEmail) {
      return {
        success: false,
        message: 'Unauthorized: Please sign in before checkout.',
        errors: null,
      }
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    })

    if (!cart) throw new Error('Cart not found')

    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUMUP_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: `ORDER-${cart.id}-${Date.now()}`,
        amount: cart.totalPrice,
        currency: cart.currency,
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        pay_to_email: userEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'SumUp API error')
    }

    return {
      success: true,
      message: 'Fecthed Category successfully',
      data: data.id,
    }
  } catch (error) {
    console.error('getCategoryById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
